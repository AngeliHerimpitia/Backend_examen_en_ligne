import { Assiste } from '../Model/Assiste.js';
import { ConnexionBd } from '../ConnexionBd/ConnexionBd.js';

export class AssisteRepository {
	#ConnexionBd = new ConnexionBd();

	#convertir(row) {
		return new Assiste(
			row.Matricule_Etudiant,
			row.Id_Examen,
			row.Resultat
		);
	}

	async tous() {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.query('SELECT * FROM assiste_');
		return rows.map((row) => this.#convertir(row));
	}

	async ajouterResultat(assiste) {
		const connexion = await this.#ConnexionBd.connect();
		const [resultat] = await connexion.execute(
			`INSERT INTO assiste_ (Matricule_Etudiant, Id_Examen, Resultat)
			 VALUES (?, ?, ?)`,
			[
				assiste.getMatricule_Etudiant(),
				assiste.getId_Examen(),
				assiste.getResultat()
			]
		);
		return resultat.affectedRows > 0;
	}

	async Tousresultats() {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.query(
			`SELECT e.Matricule_Etudiant AS matriculeEtudiant,
				e.Nom_Etudiant AS nomEtudiant, m.ID_Matiere AS idMatiere,
				m.Libelle_Matiere AS matiere, n.Libelle_Niveau AS classe,
				ex.Id_Examen AS idExamen, a.Resultat AS resultat
			 FROM assiste_ a
			 JOIN etudiant e ON a.Matricule_Etudiant = e.Matricule_Etudiant
			 JOIN examen ex ON a.Id_Examen = ex.Id_Examen
			 JOIN matiere m ON ex.ID_Matiere = m.ID_Matiere
			 JOIN niveau n ON ex.ID_Niveau = n.ID_Niveau`
		);
		return rows;
	}

	async resultatsParMatiere(idMatiere) {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.execute(
			`SELECT e.Matricule_Etudiant AS matriculeEtudiant,
				e.Nom_Etudiant AS nomEtudiant, m.ID_Matiere AS idMatiere,
				m.Libelle_Matiere AS matiere, n.Libelle_Niveau AS classe,
				ex.Id_Examen AS idExamen, a.Resultat AS resultat
			 FROM assiste_ a
			 JOIN etudiant e ON a.Matricule_Etudiant = e.Matricule_Etudiant
			 JOIN examen ex ON a.Id_Examen = ex.Id_Examen
			 JOIN matiere m ON ex.ID_Matiere = m.ID_Matiere
			 JOIN niveau n ON ex.ID_Niveau = n.ID_Niveau
			 WHERE m.ID_Matiere = ?`,
			[idMatiere]
		);
		return rows;
	}

	async resultatsParNiveau(idNiveau) {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.execute(
			`SELECT e.Matricule_Etudiant AS matriculeEtudiant,
				e.Nom_Etudiant AS nomEtudiant, m.ID_Matiere AS idMatiere,
				m.Libelle_Matiere AS matiere, n.Libelle_Niveau AS classe,
				ex.Id_Examen AS idExamen, a.Resultat AS resultat
			 FROM assiste_ a
			 JOIN etudiant e ON a.Matricule_Etudiant = e.Matricule_Etudiant
			 JOIN examen ex ON a.Id_Examen = ex.Id_Examen
			 JOIN matiere m ON ex.ID_Matiere = m.ID_Matiere
			 JOIN niveau n ON ex.ID_Niveau = n.ID_Niveau
			 WHERE n.ID_Niveau = ?`,
			[idNiveau]
		);
		return rows;
	}

	async resultatsEtudiant(matriculeEtudiant) {
		const connexion = await this.#ConnexionBd.connect();
		const [rows] = await connexion.execute(
			`SELECT e.Matricule_Etudiant AS matriculeEtudiant,
				e.Nom_Etudiant AS nomEtudiant, m.ID_Matiere AS idMatiere,
				m.Libelle_Matiere AS matiere, n.Libelle_Niveau AS classe,
				ex.Id_Examen AS idExamen, a.Resultat AS resultat
			 FROM assiste_ a
			 JOIN etudiant e ON a.Matricule_Etudiant = e.Matricule_Etudiant
			 JOIN examen ex ON a.Id_Examen = ex.Id_Examen
			 JOIN matiere m ON ex.ID_Matiere = m.ID_Matiere
			 JOIN niveau n ON ex.ID_Niveau = n.ID_Niveau
			 WHERE a.Matricule_Etudiant = ?`,
			[matriculeEtudiant]
		);
		return rows;
	}
}
