# admin

Dashboard d'analytics interne, accessible uniquement aux super admins. Agrège les KPIs utilisateurs, les métriques API, les données de churn et les feedbacks reçus.

## Accès

- Route `/admin` protégée par `requiresAdmin: true` dans le router
- Guard : appel à `checkAdminAccess()` → `GET /admin/me` (403 si non admin)
- Flag `authStore.isAdmin` positionné après login et restauration de session
- Icône `admin_panel_settings` visible dans la NavBar uniquement si `isAdmin === true`

## Structure

```
modules/admin/
├── components/
│   ├── AdminKpiCards.vue         # 8 cartes KPI (users, apps, jobs, conversion…)
│   ├── AdminFunnelChart.vue      # Barre horizontale par statut de candidature
│   ├── AdminFeatureAdoption.vue  # Taux d'utilisation de chaque module (%)
│   ├── AdminApiHealth.vue        # Tableau des métriques par route API
│   ├── AdminChurnPanel.vue       # Suppressions de compte, lifecycle, raisons
│   └── AdminFeedbackPanel.vue    # Feedbacks utilisateurs avec gestion de statut
├── pages/
│   └── AdminDashboard.vue        # Page principale, orchestre tous les panels
├── services/admin.service.ts     # Appels API admin
├── store/useAdminStore.ts        # Chargement parallèle de toutes les données
└── routes.ts                     # Route /admin avec meta.requiresAdmin
```

## Store (`useAdminStore`)

| État | Type | Description |
|---|---|---|
| `overview` | `AdminOverview \| null` | KPIs globaux |
| `apiStats` | `AdminApiStats \| null` | Métriques in-memory par route |
| `churn` | `AdminChurn \| null` | Données de churn 30j |
| `feedback` | `AdminFeedback \| null` | Feedbacks avec statuts |
| `isLoading` | `boolean` | Chargement en cours |
| `error` | `string \| null` | Erreur de chargement |

| Action | Description |
|---|---|
| `loadAll()` | Charge overview, apiStats, churn et feedback en parallèle (`Promise.all`) |

## Service (`admin.service.ts`)

| Fonction | Endpoint | Description |
|---|---|---|
| `checkAdminAccess()` | `GET /admin/me` | Vérifie l'accès (throw si 403) |
| `fetchOverview()` | `GET /admin/stats/overview` | KPIs utilisateurs, applications, engagement, conversion |
| `fetchApiStats()` | `GET /admin/stats/api` | Métriques in-memory par route |
| `fetchUsers(page, limit)` | `GET /admin/stats/users` | Liste paginée des utilisateurs |
| `fetchChurn()` | `GET /admin/stats/churn` | Taux de suppression et analyse lifecycle |
| `fetchEvents(params)` | `GET /admin/stats/events` | Événements bruts ou groupés |
| `fetchFeedback(page, limit, status?)` | `GET /admin/stats/feedback` | Feedbacks avec filtrage par statut |
| `updateFeedbackStatus(id, payload)` | `PATCH /admin/feedback/:id` | Change le statut et/ou le ticket number |

## AdminFeedbackPanel

Panel de gestion des feedbacks utilisateurs avec workflow de triage.

### Statuts

| Statut | Couleur | Description |
|---|---|---|
| `new` | Bleu (primary) | Feedback non traité |
| `in_progress` | Orange (warning) | Feedback en cours de traitement |
| `archived` | Gris (muted) | Traitement terminé |

### Fonctionnement

- **Tabs de filtrage** : All / New / In progress / Archived avec compteurs live
- **Actions contextuelles par statut** :
  - `new` → Start (→ in_progress) · Archive
  - `in_progress` → Archive + champ ticket number éditable
  - `archived` → Restore (→ new)
- **Ticket number** : champ inline disponible en `in_progress`, sauvegarde par Enter ou bouton Save
- **Mise à jour optimiste** : les rows locales sont mises à jour immédiatement sans attendre le reload complet
- **Sync** : `@reload` émis vers `AdminDashboard` pour rafraîchir les compteurs par statut

### Types

```typescript
type FeedbackStatus = 'new' | 'in_progress' | 'archived'

type AdminFeedbackRow = {
  id: number
  subject: string          // feedback | bug | feature_request | question | performance | other
  message: string
  is_anonymous: boolean
  email: string | null
  status: FeedbackStatus
  ticket_number: string | null
  created_at: string
  updated_at: string
}

type AdminFeedback = {
  total: number
  page: number
  limit: number
  anonymousCount: number
  bySubject: Record<string, number>
  byStatus: Record<string, number>
  rows: AdminFeedbackRow[]
}
```
