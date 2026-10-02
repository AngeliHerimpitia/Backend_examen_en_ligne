import { Niveau } from '../Model/Niveau.js';
import { ConnexionBd } from '../ConnexionBd/ConnexionBd.js';

export class NiveauRepository {
	#ConnexionBd = new ConnexionBd();

	async tous() {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.query('SELECT * FROM niveau');
		return rows.map((row) => new Niveau(row.ID_Niveau, row.Libelle_Niveau));
	}

	async ajouter(niveau) {
		const connexion = await this.#ConnexionBd.connect();
		const [resultat] = await connexion.execute(
			'INSERT INTO niveau (Libelle_Niveau) VALUES (?)',
			[niveau.getLibelle_Niveau()]
		);
		return resultat.affectedRows > 0;
	}

	async supprimer(idNiveau) {
		const connexion = await this.#ConnexionBd.connect();
		const [resultat] = await connexion.execute(
			'DELETE FROM niveau WHERE ID_Niveau = ?',
			[idNiveau]
		);
		return resultat.affectedRows > 0;
	}

	async modifier(idNiveau, libelle) {
		const connexion = await this.#ConnexionBd.connect();
		const [resultat] = await connexion.execute(
			'UPDATE niveau SET Libelle_Niveau = ? WHERE ID_Niveau = ?',
			[libelle, idNiveau]
		);
		return resultat.affectedRows > 0;
	}
}
