import { Examen } from '../Model/Examen.js';
import { ConnexionBd } from '../ConnexionBd/ConnexionBd.js';

export class ExamenRepository {
	#ConnexionBd = new ConnexionBd();

	#convertir(row) {
		return new Examen(
			row.Id_Examen,
			row.Heure_Debut,
			row.Heure_Fin,
			undefined,
			row.ID_Matiere,
			row.ID_Niveau,
			row.Matricule_Professeur
		);
	}

	async tous() {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.query(
			`SELECT ex.Id_Examen AS id, ex.Heure_Debut AS debut, ex.Heure_Fin AS fin,
				ex.ID_Matiere AS idMatiere, m.Libelle_Matiere AS matiere,
				ex.ID_Niveau AS idNiveau, n.Libelle_Niveau AS niveau,
				ex.Matricule_Professeur AS matriculeProfesseur, p.Nom_Professeur AS professeur,
				ex.Statut_Examen AS statut, ex.Type_Examen AS type
			 FROM examen ex
			 JOIN matiere m ON ex.ID_Matiere = m.ID_Matiere
			 JOIN niveau n ON ex.ID_Niveau = n.ID_Niveau
			 JOIN proffesseur p ON ex.Matricule_Professeur = p.Matricule_Professeur
			 ORDER BY ex.Heure_Debut DESC`
		);
		return rows;
	}

	async ajouter(examen, type = 'normal') {
		const connexion = await this.#ConnexionBd.connect();
		const [resultat] = await connexion.execute(
			`INSERT INTO examen
				(Heure_Debut, Heure_Fin, ID_Matiere, ID_Niveau, Matricule_Professeur, Type_Examen)
			 VALUES (?, ?, ?, ?, ?, ?)`,
			[
				examen.getHeure_Debut(),
				examen.getHeure_Fin(),
				examen.getId_Matiere(),
				examen.getId_Niveau(),
				examen.getMatricule_Professeur(),
				type
			]
		);
		return { id: resultat.insertId };
	}

	async prochain() {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.query(
			`SELECT * FROM examen
			 WHERE Heure_Debut >= NOW() AND Statut_Examen = 'confirme'
			 ORDER BY Heure_Debut ASC LIMIT 1`
		);
		return rows.length > 0 ? this.#convertir(rows[0]) : null;
	}

	async parNiveau(idNiveau) {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.execute(
			'SELECT * FROM examen WHERE ID_Niveau = ?',
			[idNiveau]
		);
		return rows.map((row) => this.#convertir(row));
	}

	async parNiveauEtPeriode(idNiveau, dateDebut, dateFin) {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.execute(
			`SELECT * FROM examen
			 WHERE ID_Niveau = ? AND Heure_Debut BETWEEN ? AND ?`,
			[idNiveau, dateDebut, dateFin]
		);
		return rows.map((row) => this.#convertir(row));
	}

	async pourEtudiant(matriculeEtudiant) {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.execute(
			`SELECT ex.Id_Examen AS id, ex.Heure_Debut AS debut, ex.Heure_Fin AS fin,
				ex.ID_Matiere AS idMatiere, m.Libelle_Matiere AS matiere,
				ex.ID_Niveau AS idNiveau, ex.Matricule_Professeur AS matriculeProfesseur
			 FROM examen ex
			 JOIN etudiant e ON ex.ID_Niveau = e.ID_Niveau
			 JOIN matiere m ON ex.ID_Matiere = m.ID_Matiere
			 WHERE e.Matricule_Etudiant = ? AND ex.Statut_Examen = 'confirme'
			   AND ex.Heure_Fin >= NOW()
			   AND ex.Id_Examen NOT IN (
				   SELECT Id_Examen FROM assiste_
				   WHERE Matricule_Etudiant = ?
			   )`,
			[matriculeEtudiant, matriculeEtudiant]
		);
		return rows;
	}

	async parProfesseur(matriculeProfesseur) {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.execute(
			`SELECT ex.Id_Examen AS id, ex.Heure_Debut AS debut, ex.Heure_Fin AS fin,
				ex.ID_Matiere AS idMatiere, m.Libelle_Matiere AS matiere,
				ex.ID_Niveau AS idNiveau, n.Libelle_Niveau AS niveau,
				ex.Statut_Examen AS statut, ex.Type_Examen AS type
			 FROM examen ex
			 JOIN matiere m ON ex.ID_Matiere = m.ID_Matiere
			 JOIN niveau n ON ex.ID_Niveau = n.ID_Niveau
			 WHERE ex.Matricule_Professeur = ?
			 ORDER BY ex.Heure_Debut DESC`,
			[matriculeProfesseur]
		);
		return rows;
	}
}
