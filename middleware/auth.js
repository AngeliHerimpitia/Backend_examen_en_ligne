import jwt from 'jsonwebtoken';

export const exiger = (...roles) => (req, res, next) => {
	try {
		const token = (req.headers.authorization || '').split(' ')[1];
		if (!token || !process.env.JWT_SECRET) {
			return res.status(401).json({ erreur: 'Non authentifié' });
		}
		req.user = jwt.verify(token, process.env.JWT_SECRET);
		if (roles.length && !roles.includes(req.user.role)) {
			return res.status(403).json({ erreur: 'Accès refusé' });
		}
		next();
	} catch {
		res.status(401).json({ erreur: 'Non authentifié' });
	}
};