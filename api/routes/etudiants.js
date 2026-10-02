import { Router } from 'express';
import { ConnexionBd } from '../../ConnexionBd/ConnexionBd.js';
import { Etudiant } from '../../Model/Etudiant.js';
import { EtudiantRepository } from '../../Repository/EtudiantRepository.js';
import { exiger } from '../../middleware/auth.js';
import { notifierSansBloquer } from '../../services/Mailer.js';
import { convertirModele } from '../serialisation.js';
import { asyncRoute, ErreurHttp, valider } from '../http.js';
import { schemas } from '../validation.js';

const router = Router();
const connexionBd = new ConnexionBd();
const etudiants = new EtudiantRepository();

router.get('/', exiger('admin'), asyncRoute(async (req, res) => res.json(convertirModele(await etudiants.TousEtudiants()))));
router.get('/inscrits', exiger('admin'), asyncRoute(async (req, res) => res.json(convertirModele(await etudiants.EtudiantsInscrits()))));
router.get('/non-inscrits', exiger('admin'), asyncRoute(async (req, res) => res.json(convertirModele(await etudiants.EtudiantsNonInscrits()))));
router.get('/rechercher', exiger('admin'), asyncRoute(async (req, res) => res.json(convertirModele(await etudiants.rechercher(req.query.q || '')))));

router.post('/', valider(schemas.etudiant), asyncRoute(async (req, res) => {
	const etudiant = new Etudiant(req.body.matricule, req.body.nom, req.body.email,
		req.body.motDePasse, false, req.body.idNiveau);
	res.status(201).json({ cree: await etudiants.inscrire(etudiant) });
}));

router.put('/:matricule', exiger('admin'), valider(schemas.profil), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const [rows] = await pool.execute('SELECT email_Etudiant FROM etudiant WHERE Matricule_Etudiant = ?', [req.params.matricule]);
	if (!rows.length) throw new ErreurHttp(404, 'Étudiant introuvable');
	const modifie = await etudiants.modifier(req.params.matricule, req.body);
	if (modifie) notifierSansBloquer(req.body.email || rows[0].email_Etudiant, 'Compte modifié', 'Les informations de votre compte étudiant ont été modifiées.');
	res.json({ modifie });
}));

router.patch('/:matricule/valider', exiger('admin'), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const [rows] = await pool.execute('SELECT email_Etudiant FROM etudiant WHERE Matricule_Etudiant = ?', [req.params.matricule]);
	if (!rows.length) throw new ErreurHttp(404, 'Étudiant introuvable');
	const valide = await etudiants.validerInscription(req.params.matricule);
	if (valide) {
		notifierSansBloquer(rows[0].email_Etudiant, 'Inscription acceptée', 'Votre inscription étudiant a été acceptée.');
	} else {
		console.warn('Notification inscription ignorée : aucune modification effectuée.');
	}
	res.json({ valide });
}));

router.patch('/:matricule/refuser', exiger('admin'), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const [rows] = await pool.execute('SELECT email_Etudiant, Statuts_Inscription FROM etudiant WHERE Matricule_Etudiant = ?', [req.params.matricule]);
	if (!rows.length) throw new ErreurHttp(404, 'Étudiant introuvable');
	if (rows[0].Statuts_Inscription) throw new ErreurHttp(409, 'L’inscription est déjà validée');
	const supprime = await etudiants.supprimer(req.params.matricule);
	if (supprime) notifierSansBloquer(rows[0].email_Etudiant, 'Inscription refusée', 'Votre inscription étudiant a été refusée.');
	res.json({ refusee: supprime });
}));

router.delete('/:matricule', exiger('admin'), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const [rows] = await pool.execute('SELECT email_Etudiant FROM etudiant WHERE Matricule_Etudiant = ?', [req.params.matricule]);
	if (!rows.length) throw new ErreurHttp(404, 'Étudiant introuvable');
	const supprime = await etudiants.supprimer(req.params.matricule);
	if (supprime) notifierSansBloquer(rows[0].email_Etudiant, 'Compte supprimé', 'Votre compte étudiant a été supprimé.');
	res.json({ supprime });
}));

export default router;