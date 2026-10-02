import 'dotenv/config';
import { pool } from './ConnexionBd.js';

async function ajouterColonneSiAbsente(table, colonne, definition) {
	const [rows] = await pool.execute(
		`SELECT COUNT(*) AS total FROM information_schema.COLUMNS
		 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
		[table, colonne]
	);
	if (!rows[0].total) await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);
}

try {
	await ajouterColonneSiAbsente(
		'examen', 'Statut_Examen',
		'`Statut_Examen` ENUM(\'brouillon\', \'confirme\') NOT NULL DEFAULT \'brouillon\''
	);
	await ajouterColonneSiAbsente(
		'examen', 'Type_Examen',
		'`Type_Examen` ENUM(\'normal\', \'rattrapage\') NOT NULL DEFAULT \'normal\''
	);
	await pool.query(`CREATE TABLE IF NOT EXISTS passage (
		Matricule_Etudiant VARCHAR(50) NOT NULL,
		Id_Examen INT NOT NULL,
		Debut_Passage DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY (Matricule_Etudiant, Id_Examen),
		CONSTRAINT passage_etudiant_fk FOREIGN KEY (Matricule_Etudiant)
			REFERENCES etudiant (Matricule_Etudiant) ON DELETE CASCADE ON UPDATE CASCADE,
		CONSTRAINT passage_examen_fk FOREIGN KEY (Id_Examen)
			REFERENCES examen (Id_Examen) ON DELETE CASCADE ON UPDATE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
	await pool.query(`CREATE TABLE IF NOT EXISTS demande (
		Id_Demande INT NOT NULL AUTO_INCREMENT,
		Role_Demandeur ENUM('etudiant', 'professeur') NOT NULL,
		Id_Demandeur VARCHAR(50) NOT NULL,
		Type_Demande ENUM('modification', 'suppression') NOT NULL,
		Donnees JSON DEFAULT NULL,
		Statut ENUM('en_attente', 'acceptee', 'refusee') NOT NULL DEFAULT 'en_attente',
		Date_Demande DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		Date_Traitement DATETIME DEFAULT NULL,
		Traite_Par INT DEFAULT NULL,
		PRIMARY KEY (Id_Demande),
		KEY demande_statut_idx (Statut, Date_Demande)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
	console.log('Migration examens/demandes terminée');
} finally {
	await pool.end();
}