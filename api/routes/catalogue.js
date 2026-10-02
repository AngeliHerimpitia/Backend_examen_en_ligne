import { Router } from 'express';
import { ConnexionBd } from '../../ConnexionBd/ConnexionBd.js';
import { Matiere } from '../../Model/Matiere.js';
import { Niveau } from '../../Model/Niveau.js';
import { Res_Admin } from '../../Model/Res_admin.js';
import { MatiereRepository } from '../../Repository/MatiereRepository.js';
import { NiveauRepository } from '../../Repository/NiveauRepository.js';
import { ResAdminRepository } from '../../Repository/ResAdminRepository.js';
import { exiger } from '../../middleware/auth.js';
import { convertirModele } from '../serialisation.js';
import { asyncRoute, ErreurHttp, valider } from '../http.js';
import { schemas } from '../validation.js';

const router = Router();
const connexionBd = new ConnexionBd();
const matieres = new MatiereRepository();
const niveaux = new NiveauRepository();
const admins = new ResAdminRepository();

router.get('/niveaux', asyncRoute(async (req, res) => res.json(convertirModele(await niveaux.tous()))));
router.post('/niveaux', exiger('admin'), valider(schemas.libelle), asyncRoute(async (req, res) => {
	res.status(201).json({ cree: await niveaux.ajouter(new Niveau(null, req.body.libelle)) });
}));
router.put('/niveaux/:id', exiger('admin'), valider(schemas.libelle), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const [rows] = await pool.execute('SELECT 1 FROM niveau WHERE ID_Niveau = ?', [req.params.id]);
	if (!rows.length) throw new ErreurHttp(404, 'Niveau introuvable');
	await niveaux.modifier(req.params.id, req.body.libelle);
	res.json({ modifie: true });
}));
router.delete('/niveaux/:id', exiger('admin'), asyncRoute(async (req, res) => {
	const supprime = await niveaux.supprimer(req.params.id);
	if (!supprime) throw new ErreurHttp(404, 'Niveau introuvable');
	res.json({ supprime });
}));

router.get('/matieres', exiger('admin', 'professeur', 'etudiant'), asyncRoute(async (req, res) => res.json(convertirModele(await matieres.toutes()))));
router.post('/matieres', exiger('admin'), valider(schemas.matiereCreation), asyncRoute(async (req, res) => {
	if (req.body.idNiveau !== undefined && req.body.idNiveau !== null) {
		const pool = await connexionBd.connect();
		const [rows] = await pool.execute('SELECT 1 FROM niveau WHERE ID_Niveau = ?', [req.body.idNiveau]);
		if (!rows.length) throw new ErreurHttp(400, 'Niveau introuvable');
	}
	res.status(201).json({ cree: await matieres.ajouter(new Matiere(null, req.body.libelle, req.body.idNiveau ?? null)) });
}));
router.put('/matieres/:id', exiger('admin'), valider(schemas.matiere), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const [rows] = await pool.execute('SELECT 1 FROM matiere WHERE ID_Matiere = ?', [req.params.id]);
	if (!rows.length) throw new ErreurHttp(404, 'Matière introuvable');
	if (req.body.idNiveau !== undefined && req.body.idNiveau !== null) {
		const [niveaux] = await pool.execute('SELECT 1 FROM niveau WHERE ID_Niveau = ?', [req.body.idNiveau]);
		if (!niveaux.length) throw new ErreurHttp(400, 'Niveau introuvable');
	}
	await matieres.modifier(req.params.id, req.body);
	res.json({ modifie: true });
}));
router.delete('/matieres/:id', exiger('admin'), asyncRoute(async (req, res) => {
	const supprime = await matieres.supprimer(req.params.id);
	if (!supprime) throw new ErreurHttp(404, 'Matière introuvable');
	res.json({ supprime });
}));

router.get('/admins', exiger('admin'), asyncRoute(async (req, res) => res.json(convertirModele(await admins.TousResAdmin()))));
router.post('/admins', exiger('admin'), valider(schemas.admin), asyncRoute(async (req, res) => {
	res.status(201).json({ cree: await admins.ajouter(new Res_Admin(null, req.body.nom, req.body.motDePasse)) });
}));
router.put('/admins/:nom', exiger('admin'), valider(schemas.adminModification), asyncRoute(async (req, res) => {
	const pool = await connexionBd.connect();
	const [rows] = await pool.execute('SELECT Id_Admin FROM res_admin WHERE Nom_Admin = ?', [req.params.nom]);
	if (!rows.length) throw new ErreurHttp(404, 'Administrateur introuvable');
	if (rows.length > 1) throw new ErreurHttp(409, 'Nom administrateur ambigu');
	await admins.modifier(rows[0].Id_Admin, req.body);
	res.json({ modifie: true });
}));

export default router;