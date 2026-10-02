import bcrypt from 'bcrypt';
import { ConnexionBd } from '../ConnexionBd/ConnexionBd.js';
import { Etudiant } from '../Model/Etudiant.js';
import { Proffesseur } from '../Model/Proffesseur.js';
import { Res_Admin } from '../Model/Res_admin.js';

export class AuthRepository {
	#ConnexionBd = new ConnexionBd();

	async authentifierEtudiant(email, motDePasse) {
		const row = await this.#trouver(
			'SELECT * FROM etudiant WHERE email_Etudiant = ? AND Statuts_Inscription = TRUE',
			[email]
		);
		if (!row || !await bcrypt.compare(motDePasse, row.Mdp_etudiant)) return null;
		return new Etudiant(row.Matricule_Etudiant, row.Nom_Etudiant, row.email_Etudiant,
			row.Mdp_etudiant, Boolean(row.Statuts_Inscription), row.ID_Niveau);
	}

	async authentifierProfesseur(email, motDePasse) {
		const row = await this.#trouver(
			'SELECT * FROM proffesseur WHERE email_Professeur = ? AND Status_Inscription = TRUE',
			[email]
		);
		if (!row || !await bcrypt.compare(motDePasse, row.Mdp_Proffesseur)) return null;
		return new Proffesseur(row.Matricule_Professeur, row.email_Professeur,
			row.Mdp_Proffesseur, row.Nom_Professeur, Boolean(row.Status_Inscription));
	}

	async authentifierAdmin(nom, motDePasse) {
		const row = await this.#trouver(
			'SELECT * FROM res_admin WHERE Nom_Admin = ?',
			[nom]
		);
		if (!row || !await bcrypt.compare(motDePasse, row.Mdp_Admin)) return null;
		return new Res_Admin(row.Id_Admin, row.Nom_Admin, row.Mdp_Admin);
	}

	async profil(role, id) {
		const requetes = {
			etudiant: ['SELECT * FROM etudiant WHERE Matricule_Etudiant = ?', (row) => new Etudiant(
				row.Matricule_Etudiant, row.Nom_Etudiant, row.email_Etudiant, row.Mdp_etudiant,
				Boolean(row.Statuts_Inscription), row.ID_Niveau
			)],
			professeur: ['SELECT * FROM proffesseur WHERE Matricule_Professeur = ?', (row) => new Proffesseur(
				row.Matricule_Professeur, row.email_Professeur, row.Mdp_Proffesseur,
				row.Nom_Professeur, Boolean(row.Status_Inscription)
			)],
			admin: ['SELECT * FROM res_admin WHERE Id_Admin = ?', (row) => new Res_Admin(
				row.Id_Admin, row.Nom_Admin, row.Mdp_Admin
			)]
		};
		const requete = requetes[role];
		if (!requete) return null;
		const row = await this.#trouver(requete[0], [id]);
		return row ? requete[1](row) : null;
	}

	async #trouver(requete, parametres) {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.execute(requete, parametres);
		return rows[0] || null;
	}
}