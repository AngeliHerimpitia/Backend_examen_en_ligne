import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from './ConnexionBd.js';

const comptes = [
	{ table: 'etudiant', identifiant: 'Matricule_Etudiant', motDePasse: 'Mdp_etudiant' },
	{ table: 'proffesseur', identifiant: 'Matricule_Professeur', motDePasse: 'Mdp_Proffesseur' },
	{ table: 'res_admin', identifiant: 'Id_Admin', motDePasse: 'Mdp_Admin' }
];

try {
	for (const compte of comptes) {
		const [rows] = await pool.query(
			`SELECT \`${compte.identifiant}\`, \`${compte.motDePasse}\` FROM \`${compte.table}\``
		);
		let migres = 0;
		for (const row of rows) {
			const motDePasse = row[compte.motDePasse];
			if (/^\$2[aby]\$/.test(motDePasse)) continue;
			const hash = await bcrypt.hash(motDePasse, 10);
			await pool.execute(
				`UPDATE \`${compte.table}\` SET \`${compte.motDePasse}\` = ? WHERE \`${compte.identifiant}\` = ?`,
				[hash, row[compte.identifiant]]
			);
			migres += 1;
		}
		console.log(`${compte.table}: ${migres} mot(s) de passe migré(s)`);
	}
} finally {
	await pool.end();
}