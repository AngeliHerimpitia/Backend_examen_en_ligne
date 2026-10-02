import { Router } from 'express';
import { ConnexionBd } from '../../ConnexionBd/ConnexionBd.js';
import { Proffesseur } from '../../Model/Proffesseur.js';
import { ProffesseurRepository } from '../../Repository/ProffesseurRepository.js';
import { exiger } from '../../middleware/auth.js';
import { notifierSansBloquer } from '../../services/Mailer.js';
import { convertirModele } from '../serialisation.js';
import { asyncRoute, ErreurHttp, valider } from '../http.js';
import { schemas } from '../validation.js';

const router = Router();
const connexionBd = new ConnexionBd();
const professeurs = new ProffesseurRepository();

router.get('/', exiger('admin'), asyncRoute(async (req, res) => res.json(convertirModele(await professeurs.TousProfesseurs()))));
router.get('/inscrits', exiger('admin'), asyncRoute(async (req, res) => res.json(convertirModele(await professeurs.ProfesseursInscrits()))));
router.get('/non-inscrits', exiger('admin'), asyncRoute(async (req, res) => res.json(convertirModele(await professeurs.ProfesseursNonInscrits()))));
router.get('/rechercher', exiger('admin'), asyncRoute(async (req, res) => res.json(convertirModele(await professeurs.rechercher(req.query.q || '')))));

router.post('/', valider(schemas.professeur), asyncRoute(async (req, res) => {
	const professeur = new Proffesseur(req.body.matricule, req.body.email, req.body.motDePasse, req.body.nom, false);
	res.status(201).json({ cree: await professeurs.inscrire(professeur) });
}));

router.put('/:matricule', exiger('admin'), valider(schemas.profilProfesseur), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const [rows] = await pool.execute('SELECT email_Professeur FROM proffesseur WHERE Matricule_Professeur = ?', [req.params.matricule]);
	if (!rows.length) throw new ErreurHttp(404, 'Professeur introuvable');
	const modifie = await professeurs.modifier(req.params.matricule, req.body);
	if (modifie) notifierSansBloquer(req.body.email || rows[0].email_Professeur, 'Compte modifié', 'Les informations de votre compte professeur ont été modifiées.');
	res.json({ modifie });
}));

router.patch('/:matricule/valider', exiger('admin'), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const [rows] = await pool.execute('SELECT email_Professeur FROM proffesseur WHERE Matricule_Professeur = ?', [req.params.matricule]);
	if (!rows.length) throw new ErreurHttp(404, 'Professeur introuvable');
	const valide = await professeurs.validerInscription(req.params.matricule);
	if (valide) {
		notifierSansBloquer(rows[0].email_Professeur, 'Inscription acceptée', 'Votre inscription professeur a été acceptée.');
	} else {
		console.warn('Notification inscription ignorée : aucune modification effectuée.');
	}
	res.json({ valide });
}));

router.patch('/:matricule/refuser', exiger('admin'), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const [rows] = await pool.execute('SELECT email_Professeur, Status_Inscription FROM proffesseur WHERE Matricule_Professeur = ?', [req.params.matricule]);
	if (!rows.length) throw new ErreurHttp(404, 'Professeur introuvable');
	if (rows[0].Status_Inscription) throw new ErreurHttp(409, 'L’inscription est déjà validée');
	const supprime = await professeurs.supprimer(req.params.matricule);
	if (supprime) notifierSansBloquer(rows[0].email_Professeur, 'Inscription refusée', 'Votre inscription professeur a été refusée.');
	res.json({ refusee: supprime });
}));

router.delete('/:matricule', exiger('admin'), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const [rows] = await pool.execute('SELECT email_Professeur FROM proffesseur WHERE Matricule_Professeur = ?', [req.params.matricule]);
	if (!rows.length) throw new ErreurHttp(404, 'Professeur introuvable');
	const supprime = await professeurs.supprimer(req.params.matricule);
	if (supprime) notifierSansBloquer(rows[0].email_Professeur, 'Compte supprimé', 'Votre compte professeur a été supprimé.');
	res.json({ supprime });
}));

export default router;