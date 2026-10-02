import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });

const smtp = process.env.SMTP_HOST
	? {
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT || 587),
		secure: process.env.SMTP_SECURE === 'true',
		auth: process.env.SMTP_USER ? {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD
		} : undefined
	}
	: process.env.SMTP_SERVICE
		? { service: process.env.SMTP_SERVICE, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } }
		: null;

const transporteur = smtp ? nodemailer.createTransport(smtp) : null;

export async function envoyerMail(to, subject, text) {
	if (!transporteur || !process.env.MAIL_FROM) return false;
	await transporteur.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
	return true;
}

export function notifierSansBloquer(to, subject, text) {
	if (!to) {
		console.warn('Notification email ignorée : adresse destinataire absente.');
		return;
	}
	void envoyerMail(to, subject, text).then((envoye) => {
		if (envoye) {
			console.info(`Email envoyé : ${subject}`);
		} else {
			console.error('Email non envoyé : configuration SMTP ou MAIL_FROM manquante.');
		}
	}).catch((erreur) => {
		console.error('Échec envoi mail:', {
			code: erreur.code,
			responseCode: erreur.responseCode,
			command: erreur.command,
			message: erreur.message
		});
	});
}