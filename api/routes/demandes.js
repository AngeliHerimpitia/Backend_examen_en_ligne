import { Router } from 'express';
import { ConnexionBd } from '../../ConnexionBd/ConnexionBd.js';
import { exiger } from '../../middleware/auth.js';
import { notifierSansBloquer } from '../../services/Mailer.js';
import { asyncRoute, ErreurHttp, valider } from '../http.js';
import { schemas } from '../validation.js';

const router = Router();
const connexionBd = new ConnexionBd();

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

router.post('/', exiger('etudiant', 'professeur'), valider(schemas.demande), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const [resultat] = await pool.execute(
		`INSERT INTO demande (Role_Demandeur, Id_Demandeur, Type_Demande, Donnees)
		 VALUES (?, ?, ?, ?)`,
		[req.user.role, req.user.id, req.body.type, req.body.donnees ? JSON.stringify(req.body.donnees) : null]
	);
	res.status(201).json({ id: resultat.insertId, statut: 'en_attente' });
}));

router.get('/', exiger('admin'), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const [rows] = await pool.query(
		`SELECT Id_Demande AS id, Role_Demandeur AS role, Id_Demandeur AS demandeur,
			Type_Demande AS type, Donnees AS donnees, Statut AS statut, Date_Demande AS date
		 FROM demande ORDER BY Date_Demande DESC`
	);
	res.json(rows);
}));

router.delete('/:id', exiger('admin'), asyncRoute(async (req, res) => {
	const id = Number(req.params.id);
	if (!Number.isSafeInteger(id) || id < 1) throw new ErreurHttp(400, 'Identifiant de demande invalide');
	const pool = await connexionBd.connect();
	const [resultat] = await pool.execute('DELETE FROM demande WHERE Id_Demande = ?', [id]);
	if (!resultat.affectedRows) throw new ErreurHttp(404, 'Demande introuvable');
	res.json({ supprime: true });
}));

router.patch('/:id/accepter', exiger('admin'), asyncRoute(async (req, res) => {
	const demande = await transaction(async (connexion) => {
		const [rows] = await connexion.execute(
			'SELECT * FROM demande WHERE Id_Demande = ? FOR UPDATE', [req.params.id]
		);
		const ligne = rows[0];
		if (!ligne) throw new ErreurHttp(404, 'Demande introuvable');
		if (ligne.Statut !== 'en_attente') throw new ErreurHttp(409, 'Demande déjà traitée');
		const etudiant = ligne.Role_Demandeur === 'etudiant';
		const table = etudiant ? 'etudiant' : 'proffesseur';
		const identifiant = etudiant ? 'Matricule_Etudiant' : 'Matricule_Professeur';
		const colonneEmail = etudiant ? 'email_Etudiant' : 'email_Professeur';
		const [comptes] = await connexion.execute(
			`SELECT \`${colonneEmail}\` AS email FROM \`${table}\` WHERE \`${identifiant}\` = ?`,
			[ligne.Id_Demandeur]
		);
		const email = comptes[0]?.email;
		if (ligne.Type_Demande === 'suppression') {
			await connexion.execute(`DELETE FROM \`${table}\` WHERE \`${identifiant}\` = ?`, [ligne.Id_Demandeur]);
		} else {
			const donnees = typeof ligne.Donnees === 'string' ? JSON.parse(ligne.Donnees) : ligne.Donnees;
			const champs = etudiant
				? { nom: 'Nom_Etudiant', email: 'email_Etudiant', idNiveau: 'ID_Niveau' }
				: { nom: 'Nom_Professeur', email: 'email_Professeur' };
			const selections = Object.entries(champs).filter(([cle]) => Object.hasOwn(donnees, cle));
			if (!selections.length) throw new ErreurHttp(400, 'Aucune modification valide');
			const clause = selections.map(([, colonne]) => `\`${colonne}\` = ?`).join(', ');
			await connexion.execute(
				`UPDATE \`${table}\` SET ${clause} WHERE \`${identifiant}\` = ?`,
				[...selections.map(([cle]) => donnees[cle]), ligne.Id_Demandeur]
			);
		}
		await connexion.execute(
			`UPDATE demande SET Statut = 'acceptee', Date_Traitement = NOW(), Traite_Par = ?
			 WHERE Id_Demande = ?`,
			[req.user.id, req.params.id]
		);
		return { email, type: ligne.Type_Demande };
	});
	if (demande.email) {
		notifierSansBloquer(demande.email, 'Demande acceptée',
			demande.type === 'suppression' ? 'Votre demande de suppression de compte a été acceptée.' : 'Votre demande de modification de profil a été acceptée.');
	} else {
		console.warn('Notification demande ignorée : adresse email du demandeur introuvable.');
	}
	res.json({ id: Number(req.params.id), statut: 'acceptee' });
}));

router.patch('/:id/refuser', exiger('admin'), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const [rows] = await pool.execute(
		`SELECT d.Role_Demandeur AS role, d.Id_Demandeur AS demandeur,
			d.Type_Demande AS type, e.email_Etudiant, p.email_Professeur
		 FROM demande d
		 LEFT JOIN etudiant e ON d.Role_Demandeur = 'etudiant' AND d.Id_Demandeur = e.Matricule_Etudiant
		 LEFT JOIN proffesseur p ON d.Role_Demandeur = 'professeur' AND d.Id_Demandeur = p.Matricule_Professeur
		 WHERE d.Id_Demande = ? AND d.Statut = 'en_attente'`,
		[req.params.id]
	);
	if (!rows.length) throw new ErreurHttp(404, 'Demande introuvable ou déjà traitée');
	const [resultat] = await pool.execute(
		`UPDATE demande SET Statut = 'refusee', Date_Traitement = NOW(), Traite_Par = ?
		 WHERE Id_Demande = ? AND Statut = 'en_attente'`,
		[req.user.id, req.params.id]
	);
	if (!resultat.affectedRows) throw new ErreurHttp(409, 'Demande déjà traitée');
	const ligne = rows[0];
	const email = ligne.role === 'etudiant' ? ligne.email_Etudiant : ligne.email_Professeur;
	notifierSansBloquer(email, 'Demande refusée', 'Votre demande de modification ou de suppression de profil a été refusée.');
	res.json({ id: Number(req.params.id), statut: 'refusee' });
}));

export default router;