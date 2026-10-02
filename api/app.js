import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AssisteRepository } from '../Repository/AssisteRepository.js';
import { AuthRepository } from '../Repository/AuthRepository.js';
import { exiger } from '../middleware/auth.js';
import examenRouter, { evaluationsRouter } from './routes/examens.js';
import demandeRouter from './routes/demandes.js';
import etudiantRouter from './routes/etudiants.js';
import professeurRouter from './routes/professeurs.js';
import catalogueRouter from './routes/catalogue.js';
import { convertirModele } from './serialisation.js';
import { asyncRoute, ErreurHttp, gestionErreur } from './http.js';

export const app = express();
const auth = new AuthRepository();
const assiste = new AssisteRepository();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	message: { erreur: 'Trop de tentatives, réessayez plus tard' }
}));

const loginEmail = z.object({
	email: z.string().trim().email(),
	motDePasse: z.string().min(1).max(72)
});
const loginAdmin = z.object({
	nom: z.string().trim().min(1),
	motDePasse: z.string().min(1).max(72)
});

async function authentifier(action, role, res) {
	const utilisateur = await action;
	if (!utilisateur) throw new ErreurHttp(401, 'Identifiants invalides');
	if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET manquant');
	const id = role === 'etudiant'
		? utilisateur.getMatricule_Etudiant()
		: role === 'professeur'
			? utilisateur.getMatricule_Professeur()
			: utilisateur.getId_Admin();
	const token = jwt.sign({ role, id }, process.env.JWT_SECRET, { expiresIn: '8h' });
	res.json({ token, utilisateur: convertirModele(utilisateur) });
}

app.get('/api', (req, res) => res.json({ message: 'API examen en ligne opérationnelle' }));
app.post('/api/auth/etudiant', asyncRoute(async (req, res) => {
	const { email, motDePasse } = loginEmail.parse(req.body);
	await authentifier(auth.authentifierEtudiant(email, motDePasse), 'etudiant', res);
}));
app.post('/api/auth/professeur', asyncRoute(async (req, res) => {
	const { email, motDePasse } = loginEmail.parse(req.body);
	await authentifier(auth.authentifierProfesseur(email, motDePasse), 'professeur', res);
}));
app.post('/api/auth/admin', asyncRoute(async (req, res) => {
	const { nom, motDePasse } = loginAdmin.parse(req.body);
	await authentifier(auth.authentifierAdmin(nom, motDePasse), 'admin', res);
}));
app.get('/api/moi', exiger('etudiant', 'professeur', 'admin'), asyncRoute(async (req, res) => {
	const profil = await auth.profil(req.user.role, req.user.id);
	if (!profil) throw new ErreurHttp(404, 'Profil introuvable');
	res.json(convertirModele(profil));
}));

app.use('/api/etudiants', etudiantRouter);
app.use('/api/professeurs', professeurRouter);
app.use('/api/demandes', demandeRouter);
app.use('/api', catalogueRouter);
app.use('/api/examens', examenRouter);
app.use('/api', evaluationsRouter);

app.get('/api/participations', exiger('admin'), asyncRoute(async (req, res) => {
	res.json(convertirModele(await assiste.tous()));
}));

app.use((req, res, next) => next(new ErreurHttp(404, 'Route introuvable')));
app.use(gestionErreur);

export default app;