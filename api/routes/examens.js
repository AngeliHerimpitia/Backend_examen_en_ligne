import { Router } from 'express';
import { ConnexionBd } from '../../ConnexionBd/ConnexionBd.js';
import { AssisteRepository } from '../../Repository/AssisteRepository.js';
import { ExamenRepository } from '../../Repository/ExamenRepository.js';
import { QuestionRepository } from '../../Repository/QuestionRepository.js';
import { ReponseRepository } from '../../Repository/ReponseRepository.js';
import { EtudiantRepository } from '../../Repository/EtudiantRepository.js';
import { exiger } from '../../middleware/auth.js';
import { asyncRoute, ErreurHttp, valider } from '../http.js';
import { schemas } from '../validation.js';
import { notifierSansBloquer } from '../../services/Mailer.js';

const router = Router();
const evaluationsRouter = Router();
const connexionBd = new ConnexionBd();
const examens = new ExamenRepository();
const questions = new QuestionRepository();
const reponses = new ReponseRepository();
const assiste = new AssisteRepository();
const etudiants = new EtudiantRepository();

async function transaction(handler) {
	const pool = await connexionBd.connect();
	const connexion = await pool.getConnection();
	try {
		await connexion.beginTransaction();
		const resultat = await handler(connexion);
		await connexion.commit();
		return resultat;
	} catch (erreur) {
		await connexion.rollback();
		throw erreur;
	} finally {
		connexion.release();
	}
}

async function chargerExamenPassable(connexion, idExamen, matricule) {
	const [rows] = await connexion.query(
		`SELECT ex.Id_Examen, ex.ID_Niveau, ex.Statut_Examen, e.Statuts_Inscription AS inscrit,
			(ex.Heure_Debut <= NOW() AND NOW() <= ex.Heure_Fin) AS dansFenetre,
			e.ID_Niveau AS niveauEtudiant
		 FROM examen ex
		 JOIN etudiant e ON e.Matricule_Etudiant = ?
		 WHERE ex.Id_Examen = ?`,
		[matricule, idExamen]
	);
	const examen = rows[0];
	if (!examen) throw new ErreurHttp(404, 'Examen introuvable');
	if (!examen.inscrit) throw new ErreurHttp(403, 'Inscription étudiant inactive');
	if (examen.Statut_Examen !== 'confirme') throw new ErreurHttp(403, 'Examen non confirmé');
	if (Number(examen.ID_Niveau) !== Number(examen.niveauEtudiant)) {
		throw new ErreurHttp(403, 'Cet examen ne concerne pas votre classe');
	}
	if (!examen.dansFenetre) throw new ErreurHttp(403, 'Hors de la période de passage');
	return examen;
}

router.get('/', exiger('admin', 'professeur', 'etudiant'), asyncRoute(async (req, res) => {
	res.json(req.user.role === 'etudiant'
		? await examens.pourEtudiant(req.user.id)
		: await examens.tous());
}));

router.get('/prochain', exiger('admin', 'professeur', 'etudiant'), asyncRoute(async (req, res) => {
	res.json(await examens.prochain());
}));

evaluationsRouter.get('/questions', exiger('admin', 'professeur'), asyncRoute(async (req, res) => {
	res.json(await questions.toutes());
}));

evaluationsRouter.get('/reponses', exiger('admin', 'professeur'), asyncRoute(async (req, res) => {
	res.json(await reponses.toutes());
}));

router.get('/niveau/:id/periode', exiger('admin', 'professeur', 'etudiant'), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const filtreStatut = req.user.role === 'etudiant' ? " AND ex.Statut_Examen = 'confirme'" : '';
	const [rows] = await pool.execute(
		`SELECT ex.Id_Examen AS id, ex.Heure_Debut AS debut, ex.Heure_Fin AS fin,
			ex.Statut_Examen AS statut, ex.Type_Examen AS type, m.Libelle_Matiere AS matiere,
			n.Libelle_Niveau AS niveau
		 FROM examen ex JOIN matiere m ON ex.ID_Matiere = m.ID_Matiere
		 JOIN niveau n ON ex.ID_Niveau = n.ID_Niveau
		 WHERE ex.ID_Niveau = ? AND ex.Heure_Debut BETWEEN ? AND ?${filtreStatut} ORDER BY ex.Heure_Debut`,
		[req.params.id, req.query.debut, req.query.fin]
	);
	res.json(rows);
}));

router.get('/niveau/:id', exiger('admin', 'professeur', 'etudiant'), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const filtreStatut = req.user.role === 'etudiant' ? " AND ex.Statut_Examen = 'confirme'" : '';
	const [rows] = await pool.execute(
		`SELECT ex.Id_Examen AS id, ex.Heure_Debut AS debut, ex.Heure_Fin AS fin,
			ex.Statut_Examen AS statut, ex.Type_Examen AS type, m.Libelle_Matiere AS matiere,
			n.Libelle_Niveau AS niveau
		 FROM examen ex JOIN matiere m ON ex.ID_Matiere = m.ID_Matiere
		 JOIN niveau n ON ex.ID_Niveau = n.ID_Niveau WHERE ex.ID_Niveau = ?${filtreStatut}`,
		[req.params.id]
	);
	res.json(rows);
}));

router.get('/etudiant', exiger('etudiant'), asyncRoute(async (req, res) => {
	res.json(await examens.pourEtudiant(req.user.id));
}));

router.get('/professeur/:matricule', exiger('professeur'), asyncRoute(async (req, res) => {
	if (req.params.matricule !== req.user.id) throw new ErreurHttp(403, 'Accès refusé');
	res.json(await examens.parProfesseur(req.user.id));
}));

router.post('/', exiger('professeur'), valider(schemas.examen), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const [matieres] = await pool.execute(
		'SELECT ID_Niveau FROM matiere WHERE ID_Matiere = ?', [req.body.idMatiere]
	);
	if (!matieres.length || Number(matieres[0].ID_Niveau) !== req.body.idNiveau) {
		throw new ErreurHttp(400, 'La matière ne correspond pas à la classe');
	}
	const [niveaux] = await pool.execute(
		'SELECT COUNT(*) AS total FROM matiere WHERE ID_Niveau = ?', [req.body.idNiveau]
	);
	if (!niveaux[0].total) throw new ErreurHttp(400, 'Cette classe ne possède aucune matière');
	const examen = {
		getHeure_Debut: () => req.body.debut,
		getHeure_Fin: () => req.body.fin,
		getId_Matiere: () => req.body.idMatiere,
		getId_Niveau: () => req.body.idNiveau,
		getMatricule_Professeur: () => req.user.id
	};
	res.status(201).json(await examens.ajouter(examen, req.body.type));
}));

router.patch('/:id/confirmer', exiger('professeur', 'admin'), asyncRoute(async (req, res) => {
	const confirmation = await transaction(async (connexion) => {
		const [exams] = await connexion.execute(
			'SELECT Id_Examen, Matricule_Professeur, ID_Niveau, ID_Matiere FROM examen WHERE Id_Examen = ? FOR UPDATE',
			[req.params.id]
		);
		const examen = exams[0];
		if (!examen) throw new ErreurHttp(404, 'Examen introuvable');
		if (req.user.role === 'professeur' && examen.Matricule_Professeur !== req.user.id) {
			throw new ErreurHttp(403, 'Cet examen ne vous appartient pas');
		}
		const [matieres] = await connexion.execute(
			'SELECT COUNT(*) AS total FROM matiere WHERE ID_Niveau = ?', [examen.ID_Niveau]
		);
		const [matiereExamen] = await connexion.execute(
			'SELECT 1 FROM matiere WHERE ID_Matiere = ? AND ID_Niveau = ?',
			[examen.ID_Matiere, examen.ID_Niveau]
		);
		const [somme] = await connexion.execute(
			'SELECT COALESCE(SUM(`Barème_20_`), 0) AS total FROM question WHERE Id_Examen = ?',
			[req.params.id]
		);
		const [sansBonneReponse] = await connexion.execute(
			`SELECT COUNT(*) AS total FROM question q WHERE q.Id_Examen = ?
			 AND NOT EXISTS (SELECT 1 FROM reponse r WHERE r.ID_Question = q.ID_Question AND r.\`EstVrais_\` = TRUE)`,
			[req.params.id]
		);
		if (!matieres[0].total) throw new ErreurHttp(400, 'Cette classe ne possède aucune matière');
		if (!matiereExamen.length) throw new ErreurHttp(400, 'La matière ne correspond pas à la classe');
		if (Number(somme[0].total) !== 20) throw new ErreurHttp(400, 'La somme des barèmes doit être égale à 20');
		if (Number(sansBonneReponse[0].total)) throw new ErreurHttp(400, 'Chaque question doit avoir une réponse correcte');
		const [updated] = await connexion.execute(
			`UPDATE examen SET Statut_Examen = 'confirme'
			 WHERE Id_Examen = ? AND Statut_Examen = 'brouillon'`, [req.params.id]
		);
		if (!updated.affectedRows) throw new ErreurHttp(409, 'Examen déjà confirmé');
		const [eleves] = await connexion.execute(
			'SELECT email_Etudiant FROM etudiant WHERE ID_Niveau = ? AND Statuts_Inscription = TRUE',
			[examen.ID_Niveau]
		);
		return { eleves };
	});
	for (const eleve of confirmation.eleves) {
		notifierSansBloquer(eleve.email_Etudiant, 'Vous avez une évaluation',
			`Un examen vient d’être confirmé pour votre classe (examen ${req.params.id}).`);
	}
	res.json({ id: Number(req.params.id), statut: 'confirme' });
}));

router.get('/:id/passage', exiger('etudiant'), asyncRoute(async (req, res) => {
	let resultat;
	try {
		resultat = await transaction(async (connexion) => {
		await chargerExamenPassable(connexion, req.params.id, req.user.id);
		await connexion.execute(
			'INSERT INTO passage (Matricule_Etudiant, Id_Examen) VALUES (?, ?)',
			[req.user.id, req.params.id]
		);
		const [rows] = await connexion.query(
			`SELECT q.ID_Question AS idQuestion, q.Ennoncé_question AS ennonce,
				q.\`Barème_20_\` AS bareme, r.ID_Reponse AS idReponse,
				r.Contenue_reponse AS contenu
			 FROM question q LEFT JOIN reponse r ON r.ID_Question = q.ID_Question
			 WHERE q.Id_Examen = ? ORDER BY q.ID_Question, r.ID_Reponse`,
			[req.params.id]
		);
		const map = new Map();
		for (const row of rows) {
			if (!map.has(row.idQuestion)) {
				map.set(row.idQuestion, { id: row.idQuestion, ennonce: row.ennonce, bareme: row.bareme, reponses: [] });
			}
			if (row.idReponse !== null) map.get(row.idQuestion).reponses.push({ id: row.idReponse, contenu: row.contenu });
		}
			return [...map.values()];
		});
	} catch (erreur) {
		if (erreur.code === 'ER_DUP_ENTRY') throw new ErreurHttp(403, 'Examen déjà commencé');
		throw erreur;
	}
	res.json({ idExamen: Number(req.params.id), questions: resultat });
}));

router.post('/:id/soumettre', exiger('etudiant'), valider(schemas.soumission), asyncRoute(async (req, res) => {
	const note = await transaction(async (connexion) => {
		await chargerExamenPassable(connexion, req.params.id, req.user.id);
		const [[passage]] = await connexion.execute(
			'SELECT 1 AS commence FROM passage WHERE Matricule_Etudiant = ? AND Id_Examen = ?',
			[req.user.id, req.params.id]
		);
		if (!passage) throw new ErreurHttp(403, 'Vous devez commencer l’examen avant de le soumettre');
		const [[resultat]] = await connexion.execute(
			'SELECT 1 AS soumis FROM assiste_ WHERE Matricule_Etudiant = ? AND Id_Examen = ?',
			[req.user.id, req.params.id]
		);
		if (resultat) throw new ErreurHttp(403, 'Examen déjà soumis');

		const choix = Object.entries(req.body.choix).map(([idQuestion, idReponse]) => [
			Number(idQuestion), idReponse
		]);
		const idsReponses = [...new Set(choix.map(([, idReponse]) => idReponse))];
		if (idsReponses.length) {
			const [reponsesChoisies] = await connexion.query(
				`SELECT r.ID_Reponse, r.ID_Question FROM reponse r
				 JOIN question q ON r.ID_Question = q.ID_Question
				 WHERE q.Id_Examen = ? AND r.ID_Reponse IN (?)`,
				[req.params.id, idsReponses]
			);
			if (reponsesChoisies.length !== choix.length || choix.some(([idQuestion, idReponse]) =>
				!reponsesChoisies.some((row) => Number(row.ID_Question) === idQuestion && Number(row.ID_Reponse) === idReponse))) {
				throw new ErreurHttp(400, 'Choix invalide pour cet examen');
			}
		}

		let note = 0;
		if (idsReponses.length) {
			const [[ligneNote]] = await connexion.query(
				`SELECT COALESCE(SUM(q.\`Barème_20_\`), 0) AS note
				 FROM reponse r JOIN question q ON r.ID_Question = q.ID_Question
				 WHERE q.Id_Examen = ? AND r.\`EstVrais_\` = TRUE AND r.ID_Reponse IN (?)`,
				[req.params.id, idsReponses]
			);
			note = Number(ligneNote.note);
		}
		await connexion.execute(
			'INSERT INTO assiste_ (Matricule_Etudiant, Id_Examen, Resultat) VALUES (?, ?, ?)',
			[req.user.id, req.params.id, note]
		);
		return note;
	});
	res.json({ idExamen: Number(req.params.id), resultat: note });
}));

router.get('/:id/questions', exiger('admin', 'professeur'), asyncRoute(async (req, res) => {
	if (req.user.role === 'professeur') {
		const pool = await connexionBd.connect();
		const [owned] = await pool.execute(
			'SELECT 1 FROM examen WHERE Id_Examen = ? AND Matricule_Professeur = ?',
			[req.params.id, req.user.id]
		);
		if (!owned.length) throw new ErreurHttp(403, 'Cet examen ne vous appartient pas');
	}
	res.json(await questions.parExamen(req.params.id));
}));

router.get('/:id/questions-corrigees', exiger('professeur', 'admin'), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	if (req.user.role === 'professeur') {
		const [owned] = await pool.execute(
			'SELECT 1 FROM examen WHERE Id_Examen = ? AND Matricule_Professeur = ?',
			[req.params.id, req.user.id]
		);
		if (!owned.length) throw new ErreurHttp(403, 'Cet examen ne vous appartient pas');
	}
	const [rows] = await pool.execute(
		`SELECT q.ID_Question AS idQuestion, q.Ennoncé_question AS ennonce,
			q.\`Barème_20_\` AS bareme, r.ID_Reponse AS idReponse,
			r.Contenue_reponse AS contenu, r.\`EstVrais_\` AS estVraie
		 FROM question q LEFT JOIN reponse r ON r.ID_Question = q.ID_Question
		 WHERE q.Id_Examen = ? ORDER BY q.ID_Question, r.ID_Reponse`,
		[req.params.id]
	);
	const map = new Map();
	for (const row of rows) {
		if (!map.has(row.idQuestion)) {
			map.set(row.idQuestion, { id: row.idQuestion, ennonce: row.ennonce, bareme: row.bareme, reponses: [] });
		}
		if (row.idReponse !== null) map.get(row.idQuestion).reponses.push({
			id: row.idReponse, contenu: row.contenu, estVraie: Boolean(row.estVraie)
		});
	}
	res.json([...map.values()]);
}));

evaluationsRouter.get('/questions/:id/reponses', exiger('etudiant', 'professeur', 'admin'), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	let requete = `SELECT r.ID_Reponse AS id, r.Contenue_reponse AS contenu,
		r.ID_Question AS idQuestion${req.user.role === 'etudiant' ? '' : ', r.\`EstVrais_\` AS estVraie'}
	 FROM reponse r JOIN question q ON r.ID_Question = q.ID_Question`;
	let parametres = [req.params.id];
	if (req.user.role === 'etudiant') {
		requete += ` JOIN passage p ON p.Id_Examen = q.Id_Examen
			AND p.Matricule_Etudiant = ? WHERE r.ID_Question = ?`;
		parametres = [req.user.id, req.params.id];
	} else if (req.user.role === 'professeur') {
		requete += ` JOIN examen ex ON ex.Id_Examen = q.Id_Examen
			WHERE r.ID_Question = ? AND ex.Matricule_Professeur = ?`;
		parametres.push(req.user.id);
	} else {
		requete += ' WHERE r.ID_Question = ?';
	}
	const [rows] = await pool.execute(requete, parametres);
	res.json(rows.map((row) => req.user.role === 'etudiant'
		? row
		: { ...row, estVraie: Boolean(row.estVraie) }));
}));

evaluationsRouter.post('/questions', exiger('professeur'), valider(schemas.question), asyncRoute(async (req, res) => {
	const question = await transaction(async (connexion) => {
		const [owned] = await connexion.execute(
			`SELECT 1 FROM examen WHERE Id_Examen = ? AND Matricule_Professeur = ?
			 AND Statut_Examen = 'brouillon' FOR UPDATE`,
			[req.body.idExamen, req.user.id]
		);
		if (!owned.length) throw new ErreurHttp(403, 'Examen introuvable ou non modifiable');
		const [resultat] = await connexion.execute(
			'INSERT INTO question (Ennoncé_question, `Barème_20_`, Id_Examen) VALUES (?, ?, ?)',
			[req.body.ennonce, req.body.bareme, req.body.idExamen]
		);
		return { id: resultat.insertId };
	});
	res.status(201).json(question);
}));

evaluationsRouter.post('/reponses', exiger('professeur'), valider(schemas.reponse), asyncRoute(async (req, res) => {
	const reponse = await transaction(async (connexion) => {
		const [owned] = await connexion.execute(
			`SELECT ex.Id_Examen FROM question q JOIN examen ex ON q.Id_Examen = ex.Id_Examen
			 WHERE q.ID_Question = ? AND ex.Matricule_Professeur = ?
			 AND ex.Statut_Examen = 'brouillon' FOR UPDATE`,
			[req.body.idQuestion, req.user.id]
		);
		if (!owned.length) throw new ErreurHttp(403, 'Question introuvable ou non modifiable');
		const [resultat] = await connexion.execute(
			'INSERT INTO reponse (Contenue_reponse, `EstVrais_`, ID_Question) VALUES (?, ?, ?)',
			[req.body.contenu, req.body.estVraie, req.body.idQuestion]
		);
		return { id: resultat.insertId };
	});
	res.status(201).json(reponse);
}));

evaluationsRouter.post('/resultats', exiger('etudiant'), (req, res) => res.status(403).json({
	erreur: 'La note est calculée uniquement lors de la soumission de l’examen'
}));

evaluationsRouter.get('/resultats', exiger('admin'), asyncRoute(async (req, res) => {
	res.json(await assiste.Tousresultats());
}));

evaluationsRouter.get('/resultats/matiere/:id', exiger('admin'), asyncRoute(async (req, res) => {
	res.json(await assiste.resultatsParMatiere(req.params.id));
}));

evaluationsRouter.get('/resultats/niveau/:id', exiger('admin'), asyncRoute(async (req, res) => {
	res.json(await assiste.resultatsParNiveau(req.params.id));
}));

evaluationsRouter.get('/moi/resultats', exiger('etudiant'), asyncRoute(async (req, res) => {
	res.json(await assiste.resultatsEtudiant(req.user.id));
}));

evaluationsRouter.get('/resultats/etudiant/:matricule', exiger('admin'), asyncRoute(async (req, res) => {
	res.json(await assiste.resultatsEtudiant(req.params.matricule));
}));

export { evaluationsRouter };
export default router;