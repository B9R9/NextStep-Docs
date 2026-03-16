# Frontend -> Proposition de schema SQL (migrations)

## Objectif
Proposer un schema de base de donnees aligne sur les types utilises dans le front (`companies`, `jobs`, `applications`, `calendar`, `notifications`) et les routes API actuelles.

## Convention de nommage a conserver (pour matcher le front actuel)
- Colonnes en `snake_case` deja presentes dans le front: `career_page`, `available_jobs`, `total_applications`, `company_id`, `work_mode`, `published_at`, `deadline_at`.
- Colonnes en `camelCase` utilisees telles quelles dans le front: `contactName`, `contactEmail`, `contactPhone`, `socialMedia`, `hasCV`, `hasCL`, `jobId`, `applicationId`, `createdAt`.

## Tables proposees

### 1) `users`
Utilisee par les routes auth.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `bigIncrements` | PK |
| `email` | `string(255)` | `not null`, `unique` |
| `password_hash` | `string(255)` | `not null` |
| `name` | `string(255)` | `not null` |
| `created_at` | `timestamp` | `default now()` |
| `updated_at` | `timestamp` | `default now()` |

Indexes: `unique(email)`.

### 2) `companies`
Alignee sur `src/modules/companies/types.ts`.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `bigIncrements` | PK |
| `user_id` | `bigInteger` | `not null`, FK -> `users.id`, `onDelete cascade` |
| `name` | `string(255)` | `not null`, `default ''` |
| `industry` | `string(120)` | `not null`, `default ''` |
| `size` | `string(50)` | `not null`, `default ''` |
| `location` | `string(255)` | `not null`, `default ''` |
| `website` | `text` | `not null`, `default ''` |
| `career_page` | `text` | `not null`, `default ''` |
| `contactName` | `string(255)` | `not null`, `default ''` |
| `contactEmail` | `string(255)` | `not null`, `default ''` |
| `contactPhone` | `string(80)` | `not null`, `default ''` |
| `socialMedia` | `text` | `not null`, `default ''` |
| `comments` | `text` | `not null`, `default ''` |
| `available_jobs` | `string(80)` | `not null`, `default 'In progress'` |
| `total_applications` | `integer` | `not null`, `default 0` |
| `created_at` | `timestamp` | `default now()` |
| `updated_at` | `timestamp` | `default now()` |

Indexes: `(user_id)`, `(user_id, name)`.

### 3) `jobs`
Alignee sur `src/modules/jobs/types.ts`.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `bigIncrements` | PK |
| `user_id` | `bigInteger` | `not null`, FK -> `users.id`, `onDelete cascade` |
| `company_id` | `bigInteger` | nullable, FK -> `companies.id`, `onDelete set null` |
| `position` | `string(255)` | `not null`, `default ''` |
| `industry` | `string(120)` | `not null`, `default ''` |
| `work_mode` | `string(30)` | `not null`, `default 'onsite'` |
| `location` | `string(255)` | `not null`, `default ''` |
| `contract` | `string(30)` | `not null`, `default 'full_time'` |
| `level` | `string(30)` | `not null`, `default 'mid'` |
| `published_at` | `date` | nullable |
| `deadline_at` | `date` | nullable |
| `link` | `text` | `not null`, `default ''` |
| `languages` | `text[]` | `not null`, `default '{}'` |
| `description` | `text` | `not null`, `default ''` |
| `requirements` | `text` | `not null`, `default ''` |
| `created_at` | `timestamp` | `default now()` |
| `updated_at` | `timestamp` | `default now()` |

Indexes: `(user_id)`, `(user_id, company_id)`.

### 4) `applications`
Alignee sur `src/modules/applications/types.ts`.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `bigIncrements` | PK |
| `user_id` | `bigInteger` | `not null`, FK -> `users.id`, `onDelete cascade` |
| `jobId` | `bigInteger` | nullable, FK -> `jobs.id`, `onDelete set null` |
| `type` | `string(50)` | `not null`, `default 'CDI'` |
| `position` | `string(255)` | `not null`, `default ''` |
| `company_id` | `bigInteger` | nullable, FK -> `companies.id`, `onDelete set null` |
| `status` | `string(50)` | `not null`, `default 'to_apply'` |
| `applied` | `date` | nullable |
| `deadline` | `date` | nullable |
| `hasCV` | `boolean` | `not null`, `default false` |
| `hasCL` | `boolean` | `not null`, `default false` |
| `created_at` | `timestamp` | `default now()` |
| `updated_at` | `timestamp` | `default now()` |

Notes:
- Retour API recommande en ISO (`YYYY-MM-DD`) pour rester compatible avec les inputs `type="date"` du front.

Indexes: `(user_id)`, `(user_id, status)`, `(jobId)`, `(company_id)`.

### 5) `calendar_events`
Alignee sur `src/modules/calendar/types.ts`.

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `bigIncrements` | PK |
| `user_id` | `bigInteger` | `not null`, FK -> `users.id`, `onDelete cascade` |
| `type` | `string(20)` | `not null` (`deadline`, `published`, `event`) |
| `date` | `date` | `not null` |
| `source_type` | `string(20)` | `not null` (`application`, `job`, `task`, `manual`) |
| `source_id` | `bigInteger` | nullable (id de la source selon `source_type`) |
| `jobId` | `bigInteger` | nullable, FK -> `jobs.id`, `onDelete set null` |
| `applicationId` | `bigInteger` | nullable, FK -> `applications.id`, `onDelete set null` |
| `title` | `string(255)` | nullable |
| `description` | `text` | nullable |
| `created_at` | `timestamp` | `default now()` |
| `updated_at` | `timestamp` | `default now()` |

Notes:
- `company` / `position` retires: ces infos viennent de la source (`applications` / `jobs` / `tasks`) via jointure.
- `jobId` / `applicationId` peuvent etre gardes temporairement pour compat front actuel, mais cible recommandee: `source_type` + `source_id`.

Indexes: `(user_id)`, `(user_id, date)`, `(source_type, source_id)`, `(jobId)`, `(applicationId)`.

### 6) `notifications`
Alignee sur `src/modules/notifications/types.ts` + endpoints front (`GET /api/notifications`, `PUT /api/notifications/:id/dismiss`).

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | `bigIncrements` | PK |
| `user_id` | `bigInteger` | `not null`, FK -> `users.id`, `onDelete cascade` |
| `title` | `string(255)` | `not null` |
| `description` | `text` | `not null` |
| `createdAt` | `date` | `not null` |
| `type` | `string(20)` | nullable (`deadline`, `published`, `event`, `system`) |
| `dismissed` | `boolean` | `not null`, `default false` |

Indexes: `(user_id)`, `(user_id, dismissed)`, `(user_id, createdAt)`.

## Ordre recommande des migrations
1. `users`
2. `companies`
3. `jobs`
4. `applications`
5. `calendar_events`
6. `notifications`

## Ecart API actuel a noter
- Les routes backend existent pour `companies`, `jobs`, `applications`, `calendar`, `auth`.
- Les routes `notifications` ne sont pas encore implementees cote API, alors que le front les appelle.
