import { Proffesseur } from '../Model/Proffesseur.js';
import { ConnexionBd } from '../ConnexionBd/ConnexionBd.js';
import bcrypt from 'bcrypt';

export class ProffesseurRepository {
	#ConnexionBd = new ConnexionBd();

	#convertir(row) {
		return new Proffesseur(
			row.Matricule_Professeur,
			row.email_Professeur,
			row.Mdp_Proffesseur,
			row.Nom_Professeur,
			Boolean(row.Status_Inscription)
		);
	}

	async TousProfesseurs() {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.query('SELECT * FROM proffesseur');
		return rows.map((row) => this.#convertir(row));
	}
	async TousIdProfesseurs () {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.query('SELECT Matricule_Professeur FROM proffesseur');
		return rows;
	}
	async ProfesseursInscrits() {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.query(
			'SELECT * FROM proffesseur WHERE Status_Inscription = TRUE'
		);
		return rows.map((row) => this.#convertir(row));
	}

	async ProfesseursNonInscrits() {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.query(
			'SELECT * FROM proffesseur WHERE Status_Inscription = FALSE'
		);
		return rows.map((row) => this.#convertir(row));
	}

	async inscrire(professeur) {
		const connexion = await this.#ConnexionBd.connect();
		const motDePasse = await bcrypt.hash(professeur.getMdp_Professeur(), 10);
		const [resultat] = await connexion.execute(
			`INSERT INTO proffesseur
				(Matricule_Professeur, email_Professeur, Mdp_Proffesseur, Nom_Professeur)
			 VALUES (?, ?, ?, ?)`,
			[
				professeur.getMatricule_Professeur(),
				professeur.getEmail_Professeur(),
				motDePasse,
				professeur.getNom_Professeur()
			]
		);
		return resultat.affectedRows > 0;
	}

	async validerInscription(matricule) {
		const connexion = await this.#ConnexionBd.connect();
		const [resultat] = await connexion.execute(
			'UPDATE proffesseur SET Status_Inscription = TRUE WHERE Matricule_Professeur = ?',
			[matricule]
		);
		return resultat.affectedRows > 0;
	}

	async rechercher(recherche) {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.execute(
			`SELECT * FROM proffesseur
			 WHERE Matricule_Professeur = ? OR Nom_Professeur LIKE ?`,
			[recherche, `%${recherche}%`]
		);
		return rows.map((row) => this.#convertir(row));
	}

	async supprimer(matricule) {
		const connexion = await this.#ConnexionBd.connect();
		const [resultat] = await connexion.execute(
			'DELETE FROM proffesseur WHERE Matricule_Professeur = ?',
			[matricule]
		);
		return resultat.affectedRows > 0;
	}

	async modifier(matricule, champs) {
		const connexion = await this.#ConnexionBd.connect();
		const colonnes = { nom: 'Nom_Professeur', email: 'email_Professeur' };
		const modifications = Object.entries(colonnes)
			.filter(([cle]) => Object.hasOwn(champs, cle));
		const parametres = modifications.map(([cle]) => champs[cle]);
		if (champs.motDePasse) {
			const motDePasse = await bcrypt.hash(champs.motDePasse, 10);
			modifications.push(['motDePasse', 'Mdp_Proffesseur']);
			parametres.push(motDePasse);
		}
		if (!modifications.length) return false;
		const affectations = modifications.map(([, colonne]) => `\`${colonne}\` = ?`).join(', ');
		const [resultat] = await connexion.execute(
			`UPDATE proffesseur SET ${affectations} WHERE Matricule_Professeur = ?`,
			[...parametres, matricule]
		);
		return resultat.affectedRows > 0;
	}
}
