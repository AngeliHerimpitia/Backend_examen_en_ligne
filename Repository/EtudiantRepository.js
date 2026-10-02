import { ConnexionBd } from '../ConnexionBd/ConnexionBd.js';
import bcrypt from 'bcrypt';

export class EtudiantRepository {
	#ConnexionBd = new ConnexionBd();

	async #lister(condition = '', parametres = []) {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.execute(
			`SELECT e.Matricule_Etudiant, e.Nom_Etudiant, e.email_Etudiant,
				e.Statuts_Inscription, e.ID_Niveau, n.Libelle_Niveau AS niveau
			 FROM etudiant e
			 LEFT JOIN niveau n ON e.ID_Niveau = n.ID_Niveau
			 ${condition}`,
			parametres
		);
		return rows.map((row) => ({
			matricule: row.Matricule_Etudiant,
			nom: row.Nom_Etudiant,
			email: row.email_Etudiant,
			inscrit: Boolean(row.Statuts_Inscription),
			idNiveau: row.ID_Niveau,
			niveau: row.niveau
		}));
	}

	async TousEtudiants() {
		return this.#lister();
	}

	async EtudiantsInscrits() {
		return this.#lister('WHERE e.Statuts_Inscription = TRUE');
	}

	async EtudiantsNonInscrits() {
		return this.#lister('WHERE e.Statuts_Inscription = FALSE');
	}

	async inscrire(etudiant) {
		const connexion = await this.#ConnexionBd.connect();
		const motDePasse = await bcrypt.hash(etudiant.getMdp_Etudiant(), 10);
		const [resultat] = await connexion.execute(
			`INSERT INTO etudiant
				(Matricule_Etudiant, Nom_Etudiant, email_Etudiant, Mdp_etudiant, ID_Niveau)
			 VALUES (?, ?, ?, ?, ?)`,
			[
				etudiant.getMatricule_Etudiant(),
				etudiant.getNom_Etudiant(),
				etudiant.getEmail_Etudiant(),
				motDePasse,
				etudiant.getID_Niveau()
			]
		);
		return resultat.affectedRows > 0;
	}

	async validerInscription(matricule) {
		const connexion = await this.#ConnexionBd.connect();
		const [resultat] = await connexion.execute(
			'UPDATE etudiant SET Statuts_Inscription = TRUE WHERE Matricule_Etudiant = ?',
			[matricule]
		);
		return resultat.affectedRows > 0;
	}

	async rechercher(recherche) {
		return this.#lister(
			'WHERE e.Matricule_Etudiant = ? OR e.Nom_Etudiant LIKE ?',
			[recherche, `%${recherche}%`]
		);
	}

	async supprimer(matricule) {
		const connexion = await this.#ConnexionBd.connect();
		const [resultat] = await connexion.execute(
			'DELETE FROM etudiant WHERE Matricule_Etudiant = ?',
			[matricule]
		);
		return resultat.affectedRows > 0;
	}

	async modifier(matricule, champs) {
		const connexion = await this.#ConnexionBd.connect();
		const colonnes = { nom: 'Nom_Etudiant', email: 'email_Etudiant', idNiveau: 'ID_Niveau' };
		const modifications = Object.entries(colonnes)
			.filter(([cle]) => Object.hasOwn(champs, cle));
		const parametres = modifications.map(([cle]) => champs[cle]);
		if (champs.motDePasse) {
			const motDePasse = await bcrypt.hash(champs.motDePasse, 10);
			modifications.push(['motDePasse', 'Mdp_etudiant']);
			parametres.push(motDePasse);
		}
		if (!modifications.length) return false;
		const affectations = modifications.map(([, colonne]) => `\`${colonne}\` = ?`).join(', ');
		const [resultat] = await connexion.execute(
			`UPDATE etudiant SET ${affectations} WHERE Matricule_Etudiant = ?`,
			[...parametres, matricule]
		);
		return resultat.affectedRows > 0;
	}
}

