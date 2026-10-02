import { Reponse } from '../Model/Reponse.js';
import { ConnexionBd } from '../ConnexionBd/ConnexionBd.js';

export class ReponseRepository {
	#ConnexionBd = new ConnexionBd();

	#convertir(row) {
		return new Reponse(
			row.ID_Reponse,
			row.Contenue_reponse,
			Boolean(row['EstVrais_']),
			row.ID_Question
		);
	}

	async toutes() {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.query('SELECT * FROM reponse');
		return rows.map((row) => this.#convertir(row));
	}

	async parQuestion(idQuestion) {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.execute(
			'SELECT * FROM reponse WHERE ID_Question = ?',
			[idQuestion]
		);
		return rows.map((row) => this.#convertir(row));
	}

	async ajouter(reponse) {
		const connexion = await this.#ConnexionBd.connect();
		const [resultat] = await connexion.execute(
			`INSERT INTO reponse
				(Contenue_reponse, \`EstVrais_\`, ID_Question)
			 VALUES (?, ?, ?)`,
			[
				reponse.getContenue_Reponse(),
				reponse.getEst_Vrais(),
				reponse.getID_Question()
			]
		);
		return resultat.affectedRows > 0;
	}
}
