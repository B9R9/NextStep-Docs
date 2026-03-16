# NextStep

Plateforme de gestion de carrière pour les chercheurs d'emploi. Permet de suivre les offres, les candidatures, les entreprises et l'activité via un calendrier.

## Architecture

| Couche | Technologie |
|---|---|
| Frontend | Vue 3 · TypeScript · Pinia · Vite · Tailwind CSS · Vue I18n |
| Backend | Express · Knex · SQLite · JWT |
| i18n | en / fr / fi / sv |

## Documentation

- [Frontend →](docs/front/README.md)
- [Backend →](docs/back/README.md)

## Démarrage

### Frontend
```bash
cd next-step
npm install
npm run dev
```

### Backend
```bash
cd next-step-api
npm install
npm run dev
```

### Variables d'environnement (API)

| Variable | Défaut | Description |
|---|---|---|
| `PORT` | `3001` | Port HTTP |
| `CORS_ORIGIN` | `*` | Origine CORS autorisée |
| `JWT_SECRET` | — | Secret pour la signature JWT |
| `DATABASE_URL` | — | Chemin du fichier SQLite |
| `FAKE_JOBS` | `false` | Store de jobs en mémoire (dev) |
