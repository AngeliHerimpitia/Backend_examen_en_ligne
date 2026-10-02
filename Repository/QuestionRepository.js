import { Question } from '../Model/Question.js';
import { ConnexionBd } from '../ConnexionBd/ConnexionBd.js';

export class QuestionRepository {
	#ConnexionBd = new ConnexionBd();

	async toutes() {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.query('SELECT * FROM question');
		return rows.map((row) => new Question(
			row.ID_Question,
			row.Ennoncé_question,
			row['Barème_20_'],
			undefined,
			row.Id_Examen
		));
	}

	async parExamen(idExamen) {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.execute(
			'SELECT * FROM question WHERE Id_Examen = ?',
			[idExamen]
		);
		return rows.map((row) => new Question(
			row.ID_Question,
			row.Ennoncé_question,
			row['Barème_20_'],
			undefined,
			row.Id_Examen
		));
	}

	async ajouter(question) {
		const connexion = await this.#ConnexionBd.connect();
		const [resultat] = await connexion.execute(
			`INSERT INTO question
				(Ennoncé_question, \`Barème_20_\`, Id_Examen)
			 VALUES (?, ?, ?)`,
			[
				question.getEnnoncé_Question(),
				question.getBarème_20(),
				question.getId_Examen()
			]
		);
		return { id: resultat.insertId };
	}
}
