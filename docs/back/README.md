# Backend — NextStep API

API REST Express avec Knex (SQLite). Toutes les routes sauf `/auth` et `/locations` nécessitent un JWT valide.

## Stack

- **Express** — serveur HTTP
- **Knex** — query builder SQL (SQLite)
- **JWT** — authentification (`src/utils/jwt.ts`)
- **bcrypt** — hashage des mots de passe

## Structure (`src/`)

```
src/
├── index.ts             # Bootstrap : middleware, montage des routes, logging
├── db/knex.ts           # Instance Knex
├── middleware/auth.ts   # Middleware JWT (attache req.user)
├── utils/jwt.ts         # Helpers sign/verify
└── routes/
    ├── auth.ts           # /auth
    ├── jobs.ts           # /jobs
    ├── applications.ts   # /applications
    ├── companies.ts      # /companies
    ├── calendar.ts       # /calendar
    ├── notifications.ts  # /notifications
    └── locations.ts      # /locations (public)
```

## Routes disponibles

| Préfixe | Auth | Description |
|---|---|---|
| `GET /` | Non | Info API |
| `GET /health` | Non | Version, uptime, timestamp |
| `/auth/*` | Non | Login, inscription, compte |
| `/locations/*` | Non | Données de référence (pays/villes) |
| `/jobs/*` | Oui | Offres d'emploi |
| `/applications/*` | Oui | Candidatures |
| `/companies/*` | Oui | Entreprises |
| `/calendar/*` | Oui | Événements calendrier |
| `/notifications/*` | Oui | Notifications in-app |

---

## `/auth`

| Méthode | Chemin | Description |
|---|---|---|
| POST | `/auth/register` | Créer un compte. Retourne un JWT. |
| POST | `/auth/login` | S'authentifier. Retourne un JWT. |
| DELETE | `/auth/me` | Supprimer son compte. Exige `{ password }` dans le body, vérifié par bcrypt. |

---

## `/jobs`

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/jobs` | Liste les offres de l'utilisateur. Supporte `q`, `sortKey`, `sortDir`. JOIN sur `companies` pour `company_name`. |
| POST | `/jobs` | Crée une offre. Auto-crée les événements calendrier `published` et `deadline` si les dates sont présentes. Met à jour `available_jobs` sur l'entreprise liée. |
| PUT | `/jobs/:id` | Met à jour une offre. Synchronise les événements calendrier (upsert/delete selon la présence des dates). |
| DELETE | `/jobs/:id` | Supprime une offre. Met à jour `available_jobs`. |

---

## `/applications`

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/applications` | Liste les candidatures. Supporte `q`, `sortKey`, `sortDir`. |
| POST | `/applications` | Crée une candidature. Auto-sync des événements calendrier. |
| PUT | `/applications/:id` | Met à jour une candidature. Sync calendrier. |
| DELETE | `/applications/:id` | Supprime une candidature et ses événements calendrier liés. |

---

## `/companies`

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/companies` | Liste les entreprises. `available_jobs` est un comptage live via sous-requête. Supporte `q`, `industry`, `sortKey`, `sortDir`. |
| POST | `/companies` | Crée une entreprise. |
| PUT | `/companies/:id` | Met à jour une entreprise. |
| DELETE | `/companies/:id` | Supprime une entreprise. |

---

## `/calendar`

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/calendar/events` | Liste les événements. Supporte `q`, `sortKey`, `sortDir`. |
| GET | `/calendar/events/:id` | Récupère un événement. |
| POST | `/calendar/events` | Crée un événement manuellement. |
| PUT | `/calendar/events/:id` | Met à jour un événement. |
| DELETE | `/calendar/events/:id` | Supprime un événement. |

Types d'événement acceptés : `published` · `deadline` · `event`

---

## `/notifications`

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/notifications` | Liste toutes les notifications de l'utilisateur. |
| PUT | `/notifications/:id/dismiss` | Marque une notification comme lue. |

Les notifications sont créées automatiquement via un helper `createNotification()` interne lors des mutations sur jobs, companies et calendar.

---

## Middleware auth (`src/middleware/auth.ts`)

Valide le header `Authorization: Bearer <token>` sur chaque route protégée. Attache `req.user` avec le payload JWT décodé (dont `req.user.id`).

## Variables d'environnement

| Variable | Défaut | Description |
|---|---|---|
| `PORT` | `3001` | Port HTTP |
| `CORS_ORIGIN` | `*` | Origine CORS autorisée |
| `JWT_SECRET` | — | Secret de signature JWT |
| `DATABASE_URL` | — | Chemin du fichier SQLite |
| `FAKE_JOBS` | `false` | Store de jobs en mémoire (dev/test) |
