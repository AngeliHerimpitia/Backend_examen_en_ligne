import 'dotenv/config';
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME || 'examen_en_ligne',
	port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
	waitForConnections: true,
	connectionLimit: 10,
	ssl: {
		rejectUnauthorized: false
	}
});

export class ConnexionBd {
	async connect() {
		return pool;
	}
}
