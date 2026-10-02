import { z } from 'zod';

const email = z.string().trim().email();
const motDePasse = z.string().min(8).max(72);
const id = z.coerce.number().int().positive();

export const schemas = {
	etudiant: z.object({
		matricule: z.string().trim().min(1).max(50),
		nom: z.string().trim().min(1).max(100),
		email,
		motDePasse,
		idNiveau: id.nullable().optional()
	}),
	professeur: z.object({
		matricule: z.string().trim().min(1).max(50),
		nom: z.string().trim().min(1).max(100),
		email,
		motDePasse
	}),
	admin: z.object({ nom: z.string().trim().min(1).max(100), motDePasse }),
	adminModification: z.object({
		nom: z.string().trim().min(1).max(100).optional(),
		motDePasse: motDePasse.optional()
	}).refine((valeur) => Object.keys(valeur).length > 0, {
		message: 'Aucune modification valide'
	}),
	examen: z.object({
		debut: z.coerce.date(),
		fin: z.coerce.date(),
		idMatiere: id,
		idNiveau: id,
		type: z.enum(['normal', 'rattrapage']).default('normal')
	}).refine((valeur) => valeur.fin > valeur.debut, {
		message: 'La fin doit être postérieure au début', path: ['fin']
	}),
	question: z.object({
		ennonce: z.string().trim().min(1).max(10000),
		bareme: z.coerce.number().positive().max(20),
		idExamen: id
	}),
	reponse: z.object({
		contenu: z.string().trim().min(1).max(10000),
		estVraie: z.boolean(),
		idQuestion: id
	}),
	soumission: z.object({
		choix: z.record(z.string().regex(/^\d+$/), id).default({})
	}),
	demande: z.object({
		type: z.enum(['modification', 'suppression']),
		donnees: z.object({
			nom: z.string().trim().min(1).max(100).optional(),
			email: email.optional(),
			idNiveau: id.nullable().optional()
		}).optional()
	}).refine((valeur) => valeur.type === 'suppression' || Boolean(valeur.donnees && Object.keys(valeur.donnees).length), {
		message: 'Les champs à modifier sont requis', path: ['donnees']
	}),
	profil: z.object({
		nom: z.string().trim().min(1).max(100).optional(),
		email: email.optional(),
		motDePasse: motDePasse.optional(),
		idNiveau: id.nullable().optional()
	}).refine((valeur) => Object.keys(valeur).length > 0, { message: 'Aucun champ à modifier' }),
	profilProfesseur: z.object({
		nom: z.string().trim().min(1).max(100).optional(),
		email: email.optional(),
		motDePasse: motDePasse.optional()
	}).refine((valeur) => Object.keys(valeur).length > 0, { message: 'Aucun champ à modifier' }),
	libelle: z.object({ libelle: z.string().trim().min(1).max(100) }),
	matiereCreation: z.object({
		libelle: z.string().trim().min(1).max(100),
		idNiveau: id.nullable().optional()
	}),
	matiere: z.object({
		libelle: z.string().trim().min(1).max(100).optional(),
		idNiveau: id.nullable().optional()
	}).refine((valeur) => Object.keys(valeur).length > 0, { message: 'Aucun champ à modifier' })
};