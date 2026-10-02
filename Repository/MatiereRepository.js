import { ConnexionBd } from '../ConnexionBd/ConnexionBd.js';

export class MatiereRepository {
	#ConnexionBd = new ConnexionBd();

	async toutes() {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.query(
			`SELECT m.ID_Matiere AS id, m.Libelle_Matiere AS libelle,
				m.ID_Niveau AS idNiveau, n.Libelle_Niveau AS niveau
			 FROM matiere m
			 LEFT JOIN niveau n ON m.ID_Niveau = n.ID_Niveau`
		);
		return rows;
	}

	async ajouter(matiere) {
		const connexion = await this.#ConnexionBd.connect();
		const [resultat] = await connexion.execute(
			'INSERT INTO matiere (Libelle_Matiere, ID_Niveau) VALUES (?, ?)',
			[matiere.getLibelle_Matiere(), matiere.getID_Niveau()]
		);
		return resultat.affectedRows > 0;
	}

	async supprimer(idMatiere) {
		const connexion = await this.#ConnexionBd.connect();
		const [resultat] = await connexion.execute(
			'DELETE FROM matiere WHERE ID_Matiere = ?',
			[idMatiere]
		);
		return resultat.affectedRows > 0;
	}

	async modifier(idMatiere, champs) {
		const connexion = await this.#ConnexionBd.connect();
		const colonnes = { libelle: 'Libelle_Matiere', idNiveau: 'ID_Niveau' };
		const modifications = Object.entries(colonnes)
			.filter(([cle]) => Object.hasOwn(champs, cle));
		if (!modifications.length) return false;
		const affectations = modifications.map(([, colonne]) => `\`${colonne}\` = ?`).join(', ');
		const parametres = modifications.map(([cle]) => champs[cle]);
		const [resultat] = await connexion.execute(
			`UPDATE matiere SET ${affectations} WHERE ID_Matiere = ?`,
			[...parametres, idMatiere]
		);
		return resultat.affectedRows > 0;
	}
}
