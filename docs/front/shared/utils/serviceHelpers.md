# serviceHelpers.ts

Utilitaires partagés importés par les 4 services Axios (applications, jobs, companies, calendar). Centralise la logique commune de construction de requêtes et de normalisation.

## Fonctions

### `buildQuery(params): string`

Construit une query string à partir d'un objet de paramètres. Ignore les valeurs `undefined` et les chaînes vides.

```typescript
buildQuery({ q: 'google', sortKey: 'position', sortDir: 'asc' })
// → '?q=google&sortKey=position&sortDir=asc'

buildQuery({})
// → ''
```

Utilise `URLSearchParams` en interne. Retourne `''` si aucun paramètre valide.

Usage : tous les appels GET avec filtres/tri dans les services resource.

---

### `toNullableNumber(value: unknown): number | null`

Convertit une valeur en nombre ou retourne `null` si la valeur est absente ou invalide.

- `null`, `undefined`, `''` → `null`
- Valeur convertible en nombre fini → `number`
- Sinon → `null`

Usage : normaliser `company_id`, `jobId` dans les réponses API (SQLite peut retourner des strings).

---

## Services utilisant ces helpers

| Service | Helpers utilisés |
|---|---|
| `applications.service.ts` | `buildQuery`, `toNullableNumber` |
| `jobs.service.ts` | `buildQuery`, `toNullableNumber` |
| `calendar.service.ts` | `buildQuery` |
| `companies.service.ts` | `buildQuery` |
