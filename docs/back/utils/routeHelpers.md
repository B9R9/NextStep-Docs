# routeHelpers.ts

Utilitaires partagés importés par les 4 fichiers de routes resource (applications, jobs, companies, calendar). Évite la duplication de logique entre routes.

## Fonctions

### `normalizeDate(value: unknown): string | null`

Normalise une valeur en chaîne de date ou retourne `null`.

- Si `value` n'est pas une string → `null`
- Si la string est vide après trim → `null`
- Sinon → la string trimmée

Usage : normaliser `applied`, `deadline`, `published_at` avant écriture en DB.

---

### `normalizeNumericId(value: unknown): number | null`

Convertit une valeur en entier positif ou retourne `null`.

- `null`, `undefined`, `''` → `null`
- Valeur numérique finie ≥ 0 → `number`
- Sinon → `null`

Usage : normaliser `company_id`, `job_id`, et autres FK nullable qui peuvent arriver en string depuis le body.

---

### `getCompanyName(companyId: number | null): Promise<string>`

Récupère le nom d'une entreprise depuis la DB. Retourne `''` si `companyId` est `null` ou si l'entreprise n'existe pas.

Usage : enrichir les notifications avec le nom de l'entreprise dans jobs et applications.

---

### `createNotification(userId, title, description, type?): Promise<void>`

Insère une notification in-app dans la table `notifications`. Fire-and-forget — les erreurs sont silencieuses (la table peut ne pas exister lors des migrations).

| Paramètre | Type | Défaut |
|---|---|---|
| `userId` | `number` | — |
| `title` | `string` | — |
| `description` | `string` | — |
| `type` | `'system' \| 'event'` | `'system'` |

Usage : appelé après chaque mutation CRUD dans jobs, applications, companies, calendar pour générer une notification utilisateur.

---

## Fichiers utilisant ces helpers

| Fichier | Helpers utilisés |
|---|---|
| `routes/applications.ts` | `normalizeDate`, `normalizeNumericId`, `getCompanyName`, `createNotification` |
| `routes/jobs.ts` | `normalizeDate`, `normalizeNumericId`, `getCompanyName`, `createNotification` |
| `routes/companies.ts` | `createNotification` |
| `routes/calendar.ts` | `normalizeDate`, `createNotification` |
