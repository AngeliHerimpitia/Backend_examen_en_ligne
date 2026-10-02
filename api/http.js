export class ErreurHttp extends Error {
	constructor(status, message) {
		super(message);
		this.status = status;
	}
}

export const asyncRoute = (handler) => (req, res, next) => {
	Promise.resolve(handler(req, res, next)).catch(next);
};

export const valider = (schema) => (req, res, next) => {
	const resultat = schema.safeParse(req.body);
	if (!resultat.success) {
		return next(new ErreurHttp(400, resultat.error.issues.map((issue) => issue.message).join('; ')));
	}
	req.body = resultat.data;
	next();
};

// Codes réseau/MySQL les plus fréquents en développement, avec un message qui dit
// tout de suite quoi vérifier au lieu d'un "Erreur serveur" générique.
const ERREURS_CONNEXION_BD = {
	ECONNREFUSED: 'Connexion refusée par MySQL : le serveur MySQL est-il démarré (XAMPP/WAMP/service) ?',
	ENOTFOUND: "Hôte MySQL introuvable : vérifie DB_HOST dans .env.",
	ER_ACCESS_DENIED_ERROR: 'Accès MySQL refusé : vérifie DB_USER et DB_PASSWORD dans .env.',
	ER_BAD_DB_ERROR: "Base de données introuvable : vérifie DB_NAME dans .env et que la base existe.",
	PROTOCOL_CONNECTION_LOST: 'Connexion MySQL perdue en cours de route (le serveur a peut-être redémarré ou coupé la connexion).',
	ETIMEDOUT: 'Connexion à MySQL expirée (délai dépassé) : le serveur MySQL est-il accessible sur DB_HOST/DB_PORT ?'
};

export function gestionErreur(erreur, req, res, next) {
	if (res.headersSent) return next(erreur);

	if (erreur.name === 'ZodError') {
		return res.status(400).json({
			erreur: erreur.issues.map((issue) => issue.message).join('; ')
		});
	}
	if (erreur.code === 'ER_DUP_ENTRY') {
		return res.status(409).json({ erreur: 'Déjà existant' });
	}
	if (erreur.code === 'ER_ROW_IS_REFERENCED_2') {
		return res.status(409).json({ erreur: 'Élément utilisé ailleurs' });
	}
	if (erreur.code === 'ER_NO_REFERENCED_ROW_2') {
		return res.status(400).json({ erreur: 'Référence invalide' });
	}

	const messageBd = ERREURS_CONNEXION_BD[erreur.code];
	if (messageBd) {
		console.error(` Erreur base de données [${erreur.code}] sur ${req.method} ${req.originalUrl} :`, messageBd);
		return res.status(503).json({ erreur: messageBd, code: erreur.code });
	}

	const status = erreur.status || 500;
	if (status === 500) {
		console.error(` Erreur serveur [${erreur.code || erreur.name || 'inconnue'}] sur ${req.method} ${req.originalUrl} :`, erreur.message);
	}
	return res.status(status).json({ erreur: status === 500 ? 'Erreur serveur' : erreur.message });
}