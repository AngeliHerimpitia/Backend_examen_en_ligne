import { ConnexionBd } from '../ConnexionBd/ConnexionBd.js';

const connexion = new ConnexionBd();
let actif = false;

async function ajouterZerosAbsents() {
	try {
		const pool = await connexion.connect();
		await pool.query(`INSERT IGNORE INTO assiste_ (Matricule_Etudiant, Id_Examen, Resultat)
			SELECT e.Matricule_Etudiant, ex.Id_Examen, 0
			FROM examen ex
			JOIN etudiant e ON e.ID_Niveau = ex.ID_Niveau
			WHERE ex.Heure_Fin < NOW()
			  AND ex.Statut_Examen = 'confirme'
			  AND e.Statuts_Inscription = TRUE`);
	} catch (erreur) {
		console.error('Échec calcul absences:', erreur.code || erreur.name || 'Erreur inconnue');
	}
}

export function demarrerCalculAbsences() {
	if (actif) return;
	actif = true;
	void ajouterZerosAbsents();
	setInterval(ajouterZerosAbsents, 60_000);
}