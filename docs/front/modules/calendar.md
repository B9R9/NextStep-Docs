# calendar

Vue calendrier et gestion des événements. Les événements sont liés aux offres et/ou aux candidatures.

## Structure

```
modules/calendar/
├── components/
│   ├── CalendarMainView.vue      # Calendrier complet avec grille d'événements
│   ├── CalendarPanel.vue         # Grille mensuelle réutilisable
│   ├── CalendarPanelSkeleton.vue # Skeleton de chargement (7×6 cellules)
│   ├── CalendarEventForm.vue     # Formulaire de création/édition d'événement
│   └── CalendarModal.vue         # Modal de preview rapide (depuis la NavBar)
├── services/calendar.service.ts
├── store/useCalendarStore.ts
├── types.ts
└── routes.ts
```

## Types

```typescript
type CalendarEventType = 'deadline' | 'published' | 'event'

type CalendarEvent = {
  id: number
  type: CalendarEventType
  date: string                  // date ISO
  jobId?: number | null
  applicationId?: number | null
  position: string
  company: string
  title?: string
  description?: string
}
```

## Store (`useCalendarStore`)

| Action | Description |
|---|---|
| `loadEvents(params?)` | Charge tous les événements (supporte `q`, `sortKey`, `sortDir`) |
| `createEvent(payload)` | POST nouvel événement |
| `updateEvent(payload)` | PUT événement mis à jour |
| `deleteEvent(id)` | DELETE événement |

## Endpoints API (service)

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/calendar/events` | Liste des événements |
| GET | `/calendar/events/:id` | Récupérer un événement |
| POST | `/calendar/events` | Créer |
| PUT | `/calendar/events/:id` | Mettre à jour |
| DELETE | `/calendar/events/:id` | Supprimer |

## Types d'événements

| Type | Source | Badge |
|---|---|---|
| `published` | Auto-créé depuis `published_at` d'une offre | success |
| `deadline` | Auto-créé depuis `deadline_at` d'une offre ou `deadline` d'une candidature | danger |
| `event` | Créé manuellement | neutral |

## Loading state

Au premier chargement (`isLoading && !hasLoaded`), `CalendarMainView` affiche `CalendarPanelSkeleton` — une grille 7×6 cellules animée (`skeleton-pulse`). Quand les données arrivent, `CalendarPanel` prend sa place avec la classe `ns-fade-in`.

## Preview universelle

Tous les types d'événements ouvrent une preview modale unique. Si `jobId` est présent, un bouton "Voir l'offre" apparaît. Si `applicationId` est présent, un bouton "Voir la candidature" apparaît. Édition et suppression toujours disponibles.
