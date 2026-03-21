# Backend — NextStep API

API REST Express avec Knex (SQLite/PostgreSQL). Toutes les routes sauf `/auth` et `/locations` nécessitent un access token JWT valide.

## Stack

- **Express** — serveur HTTP
- **Knex** — query builder SQL
- **JWT** — double token : access (15 min) + refresh (7j, httpOnly cookie)
- **bcrypt** — hashage des mots de passe
- **cookie-parser** — lecture du cookie refresh token

## Structure (`src/`)

```
src/
├── index.ts                  # Bootstrap : middleware, montage des routes, logging
├── db/knex.ts                # Instance Knex
├── middleware/
│   ├── auth.ts               # Vérifie l'access token JWT (attache req.user)
│   └── admin.ts              # Vérifie que req.user.email est dans ADMIN_EMAILS
├── utils/
│   ├── jwt.ts                # signAccessToken, signRefreshToken, hashToken
│   ├── track.ts              # trackEvent() fire-and-forget + getSessionId()
│   ├── apiMetrics.ts         # In-memory route metrics (recordRequest, getMetrics)
│   └── routeHelpers.ts       # normalizeDate, normalizeNumericId, getCompanyName, createNotification
└── routes/
    ├── auth.ts               # /auth (public)
    ├── jobs.ts               # /jobs
    ├── applications.ts       # /applications
    ├── companies.ts          # /companies
    ├── calendar.ts           # /calendar
    ├── notifications.ts      # /notifications
    ├── locations.ts          # /locations (public)
    ├── feedback.ts           # /feedback
    └── admin.ts              # /admin (admin only)
```

## Routes disponibles

| Préfixe | Auth | Description |
|---|---|---|
| `GET /` | Non | Info API |
| `GET /health` | Non | Version, uptime, timestamp |
| `/auth/*` | Non | Login, inscription, refresh, logout |
| `/locations/*` | Non | Données de référence (pays/villes) |
| `/jobs/*` | Oui | Offres d'emploi |
| `/applications/*` | Oui | Candidatures |
| `/companies/*` | Oui | Entreprises |
| `/calendar/*` | Oui | Événements calendrier |
| `/notifications/*` | Oui | Notifications in-app |
| `/feedback/*` | Oui | Feedback utilisateur |
| `/admin/*` | Oui + Admin | Dashboard analytics |

---

## `/auth`

| Méthode | Chemin | Description |
|---|---|---|
| POST | `/auth/register` | Créer un compte. Retourne `{ user, accessToken }`. Pose un cookie refresh token. |
| POST | `/auth/login` | S'authentifier. Retourne `{ user, accessToken }`. Pose un cookie refresh token. |
| POST | `/auth/refresh` | Renouvelle l'access token depuis le cookie refresh. Rotation du refresh token. |
| POST | `/auth/logout` | Révoque le refresh token en DB + supprime le cookie. |
| GET | `/auth/me` | Retourne l'utilisateur courant (depuis l'access token). |
| PUT | `/auth/me` | Mise à jour du profil (nom, email, langue, inactivity_timeout). |
| PUT | `/auth/me/password` | Changement de mot de passe. |
| DELETE | `/auth/me` | Suppression de compte. Exige `{ password }`. Trace un événement `auth.account_deleted`. |

### Stratégie double token

- **Access token** : JWT signé avec `JWT_SECRET`, expiration 15 min. Envoyé en header `Authorization: Bearer`.
- **Refresh token** : JWT signé avec `JWT_REFRESH_SECRET`, expiration 7j. Stocké en DB (`refresh_tokens`) haché en SHA-256. Envoyé via cookie `httpOnly`.
- **Rotation** : chaque appel `/auth/refresh` révoque l'ancien token et émet un nouveau.
- **Reuse detection** : si un token déjà révoqué est présenté, tous les tokens de l'utilisateur sont révoqués.
- **Cookie** : `SameSite=Lax` en dev (HTTP), `SameSite=None; Secure` en prod.

---

## `/jobs`

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/jobs` | Liste les offres. Supporte `q`, `sortKey`, `sortDir`. JOIN sur `companies`. |
| POST | `/jobs` | Crée une offre. Auto-crée les événements calendrier `published` et `deadline`. |
| PUT | `/jobs/:id` | Met à jour. Synchronise les événements calendrier (upsert/delete). |
| DELETE | `/jobs/:id` | Supprime. Met à jour `available_jobs` sur l'entreprise. |

---

## `/applications`

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/applications` | Liste les candidatures. Supporte `q`, `sortKey`, `sortDir`. |
| POST | `/applications` | Crée. Auto-sync événements calendrier. |
| PUT | `/applications/:id` | Met à jour. Sync calendrier. |
| DELETE | `/applications/:id` | Supprime et ses événements calendrier liés. |

---

## `/companies`

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/companies` | Liste. `available_jobs` via sous-requête. Supporte `q`, `industry`, `sortKey`, `sortDir`. |
| POST | `/companies` | Crée. |
| PUT | `/companies/:id` | Met à jour. |
| DELETE | `/companies/:id` | Supprime. |

---

## `/calendar`

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/calendar/events` | Liste les événements. Supporte `q`, `sortKey`, `sortDir`. |
| GET | `/calendar/events/:id` | Récupère un événement. |
| POST | `/calendar/events` | Crée manuellement. |
| PUT | `/calendar/events/:id` | Met à jour. Synchronise la date vers le job/application lié. |
| DELETE | `/calendar/events/:id` | Supprime. |

Types d'événement : `published` · `deadline` · `event` · `interview` · `reminder`

---

## `/notifications`

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/notifications` | Liste toutes les notifications. |
| PUT | `/notifications/:id/dismiss` | Marque comme lue. |

Notifications créées automatiquement par `createNotification()` depuis `routeHelpers.ts` lors des mutations jobs/companies/calendar.

---

## `/feedback`

| Méthode | Chemin | Description |
|---|---|---|
| POST | `/feedback` | Soumet un feedback. Body : `{ subject, message, is_anonymous }`. Min 20 chars. |

**Sujets valides** : `feedback` · `bug` · `feature_request` · `question` · `performance` · `other`

Le champ `user_id` est automatiquement renseigné depuis le token. Si `is_anonymous: true`, l'email n'est pas stocké.

---

## `/admin` (admin uniquement)

Requiert `authMiddleware` + `adminMiddleware` (email dans `ADMIN_EMAILS`).

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/admin/me` | Vérifie l'accès admin (200 = autorisé). |
| GET | `/admin/stats/overview` | KPIs globaux : users, applications, jobs, companies, engagement, conversion. |
| GET | `/admin/stats/api` | Métriques in-memory par route (count, avgMs, maxMs, errorRate). |
| GET | `/admin/stats/events` | Événements utilisateur bruts ou groupés. Filtres : `event`, `category`, `from`, `to`, `group_by`. |
| GET | `/admin/stats/users` | Liste paginée des utilisateurs avec leurs compteurs d'activité. |
| GET | `/admin/stats/feedback` | Feedbacks paginés avec `bySubject`, `byStatus`. Filtre `?status=`. |
| PATCH | `/admin/feedback/:id` | Modifie le statut (`new`/`in_progress`/`archived`) et/ou le `ticket_number`. |
| GET | `/admin/stats/churn` | Taux de suppression, distribution lifecycle, raisons. |

---

## Event tracking (`src/utils/track.ts`)

```ts
trackEvent({ userId, event, category, metadata?, sessionId?, ip?, userAgent? })
```

Fire-and-forget — les erreurs sont loguées mais ne font pas échouer la requête. Les événements sont stockés dans la table `user_events`.

**Header `X-Session-Id`** : UUID généré côté client (`sessionStorage`) pour mesurer la profondeur de session.

---

## Middleware auth (`src/middleware/auth.ts`)

Valide le header `Authorization: Bearer <token>` (access token). Attache `req.user = { id, email }`.

## Middleware admin (`src/middleware/admin.ts`)

Vérifie que `req.user.email` figure dans la liste `ADMIN_EMAILS` (env var, séparateur `,`).

---

## Variables d'environnement

| Variable | Défaut | Description |
|---|---|---|
| `PORT` | `3001` | Port HTTP |
| `CORS_ORIGIN` | `*` | Origine CORS autorisée |
| `JWT_SECRET` | — | Secret de l'access token |
| `JWT_REFRESH_SECRET` | — | Secret du refresh token |
| `ADMIN_EMAILS` | — | Emails admin séparés par virgule |
| `DATABASE_URL` | — | Chemin SQLite ou URL PostgreSQL |
| `NODE_ENV` | — | `production` active `Secure` sur le cookie |
