# jobs

Gestion des offres d'emploi. Liées aux entreprises et auto-synchronisées avec le calendrier.

## Structure

```
modules/jobs/
├── components/
│   ├── JobsMainView.vue         # Tableau, filtres, actions CRUD
│   ├── JobsFormDialog.vue       # Dialog de création/édition
│   ├── JobsFormView.vue         # Champs du formulaire
│   ├── JobsPreviewDialog.vue    # Dialog de preview
│   ├── JobsPreviewView.vue      # Contenu de la preview
│   ├── JobsEmptyState.vue
│   ├── JobsSearchEmptyState.vue
│   └── JobsTableSkeleton.vue
├── services/jobs.service.ts
├── store/useJobsStore.ts
├── types.ts
└── routes.ts
```

## Type

```typescript
type Job = {
  id: number
  company_id: number | null
  company_name?: string         // dénormalisé (JOIN côté API)
  position: string
  industry: string
  work_mode: string             // 'onsite' | 'remote' | 'hybrid'
  location: string
  contract: string              // 'full_time' | 'part_time' | 'internship' | 'freelance' | 'apprenticeship'
  level: string                 // 'junior' | 'mid' | 'senior' | 'lead'
  published_at: string          // date ISO
  deadline_at: string           // date ISO
  link: string
  languages: string[]
  description: string
  requirements: string
}
```

## Store (`useJobsStore`)

| Action | Description |
|---|---|
| `loadJobs()` | Charge toutes les offres |
| `createJob(payload)` | POST nouvelle offre |
| `updateJob(payload)` | PUT offre mise à jour |
| `deleteJob(id)` | DELETE offre |

## Endpoints API (service)

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/jobs` | Liste (supporte `q`, `sortKey`, `sortDir`) |
| POST | `/jobs` | Création |
| PUT | `/jobs/:id` | Mise à jour |
| DELETE | `/jobs/:id` | Suppression |

## Sync calendrier

- `published_at` → événement calendrier de type `published`
- `deadline_at` → événement calendrier de type `deadline`
- Les deux sont créés automatiquement au POST et synchronisés (upsert/delete) au PUT

## Notes

- Les dates restent au format ISO `YYYY-MM-DD` tout au long du flux
- `company_name` est retourné par l'API via un JOIN (lecture seule côté frontend)
- Sélectionner un job dans le formulaire d'application pré-remplit position, entreprise, dates et statut
