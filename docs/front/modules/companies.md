# companies

Répertoire d'entreprises. Les entreprises sont liées aux offres et aux candidatures.

## Structure

```
modules/companies/
├── components/
│   ├── CompaniesMainView.vue          # Tableau, filtres, actions CRUD
│   ├── CompaniesFormDialog.vue        # Dialog de création/édition
│   ├── CompaniesFormView.vue          # Champs du formulaire
│   ├── CompaniesPreviewDialog.vue     # Dialog de preview
│   ├── CompaniesPreviewView.vue       # Contenu de la preview
│   ├── CompaniesEmptyState.vue
│   ├── CompaniesSearchEmptyState.vue
│   └── CompaniesTableSkeleton.vue
├── services/companies.service.ts
├── store/useCompaniesStore.ts
├── store/useSectorsStore.ts
├── types.ts
└── routes.ts
```

## Type

```typescript
type Company = {
  id: number
  name: string
  industry: string
  size: string
  location: string
  website: string
  career_page: string
  contactName: string
  contactEmail: string
  contactPhone: string
  socialMedia: string
  comments: string
  available_jobs: string      // nombre de jobs liés (calculé côté API)
  total_applications: number
}
```

## Store (`useCompaniesStore`)

| Action | Description |
|---|---|
| `loadCompanies()` | Charge toutes les entreprises |
| `createCompany(payload)` | POST nouvelle entreprise |
| `updateCompany(payload)` | PUT entreprise mise à jour |
| `deleteCompany(id)` | DELETE entreprise |

## Endpoints API (service)

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/companies` | Liste (supporte `q`, `industry`, `sortKey`, `sortDir`) |
| POST | `/companies` | Création |
| PUT | `/companies/:id` | Mise à jour |
| DELETE | `/companies/:id` | Suppression |

## Notes

- `available_jobs` est un comptage live calculé par l'API depuis la table `jobs`
- Les entreprises peuvent être créées directement depuis le formulaire de candidature (sans quitter le dialog)
