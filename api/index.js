import { app } from './app.js';

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log(`Serveur API à l'écoute sur http://localhost:${port}`);
});