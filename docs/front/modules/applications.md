# applications

Suivi des candidatures à travers un funnel en 11 statuts, avec sync automatique du calendrier.

## Structure

```
modules/applications/
├── components/
│   ├── ApplicationsMainView.vue      # Tableau, filtres, actions CRUD
│   ├── ApplicationsFormDialog.vue    # Dialog de création/édition (conteneur)
│   ├── ApplicationsFormView.vue      # Champs du formulaire (grille 2 colonnes)
│   ├── ApplicationsPreviewDialog.vue # Dialog de preview en lecture seule
│   ├── ApplicationsPreviewView.vue   # Contenu de la preview
│   ├── ApplicationsEmptyState.vue    # État vide
│   └── ApplicationsTableSkeleton.vue # Skeleton de chargement
├── services/applications.service.ts  # Appels Axios
├── store/useApplicationsStore.ts     # Store Pinia
├── types.ts                          # Type Application
└── routes.ts                         # Définition de route Vue Router
```

## Type

```typescript
type Application = {
  id: number
  type: string
  position: string
  company_id: number | null
  status: string          // voir funnel ci-dessous
  applied: string         // date ISO ou ''
  deadline: string        // date ISO ou ''
  hasCV: boolean
  hasCL: boolean
  jobId?: number | null   // offre liée
}
```

## Funnel de statuts

| Statut | Label | Couleur |
|---|---|---|
| `saved` | Sauvegardé | neutral |
| `applied` | Candidature envoyée | primary |
| `screening` | Présélection | primary |
| `technical_assessment` | Test technique | primary |
| `interview` | Entretien | success |
| `final_round` | Tour final | success |
| `offer_received` | Offre reçue | success |
| `rejected` | Refusé | danger |
| `no_response` | Sans réponse | neutral |
| `withdrawn` | Retiré | neutral |
| `offer_declined` | Offre déclinée | warning |

## Store (`useApplicationsStore`)

| Action | Description |
|---|---|
| `loadApplications()` | Charge toutes les candidatures depuis l'API |
| `createApplication(payload)` | POST nouvelle candidature |
| `updateApplication(payload)` | PUT candidature mise à jour |
| `deleteApplication(id)` | DELETE candidature |

## Endpoints API (service)

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/applications` | Liste (supporte `q`, `sortKey`, `sortDir`) |
| POST | `/applications` | Création |
| PUT | `/applications/:id` | Mise à jour |
| DELETE | `/applications/:id` | Suppression |

## Sync calendrier

La création ou mise à jour d'une candidature upsert automatiquement les événements calendrier (`event` pour la date de candidature, `deadline` pour la date limite). La suppression retire les événements liés. `calendarStore.loadEvents()` est appelé après chaque mutation.

## Layout du formulaire (ApplicationsFormView)

- **Colonne gauche** : Sélection d'offre existante · Entreprise + bouton ajout · Have you applied? · Date
- **Colonne droite** : Position · Documents (CV / CL)
- Sélectionner une offre pré-remplit position, entreprise et dates
- Désélectionner une offre vide uniquement `jobId` sans réinitialiser les autres champs
