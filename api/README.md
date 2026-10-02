# API

## Installation

Copier `.env.example` vers `.env`, puis renseigner `DB_*` et un `JWT_SECRET` aléatoire.
Après import du dump SQL, lancer les migrations :

```sh
npm run migrer-mots-de-passe
npm run migrer-examens
npm start
```

Configurer `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` et `MAIL_FROM` pour activer les notifications. Sans SMTP configuré, l’API continue de fonctionner et les envois sont ignorés.

## Passage d’examen

Un professeur crée l’examen en brouillon, ajoute les questions et les réponses, puis appelle `PATCH /api/examens/:id/confirmer`. La confirmation exige un barème total de 20, une matière liée à la classe et au moins une réponse correcte pour chaque question.

L’étudiant ouvre `GET /api/examens/:id/passage`, puis soumet `{ "choix": { "idQuestion": idReponse } }` à `POST /api/examens/:id/soumettre`. Le serveur calcule et enregistre la note. Les notes par client via `POST /api/resultats` sont refusées.

Les accès protégés requièrent `Authorization: Bearer <token>`. Le jeton étudiant détermine le matricule côté serveur ; aucun matricule étudiant n’est accepté pour démarrer ou soumettre un examen.