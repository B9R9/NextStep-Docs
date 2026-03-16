# notifications

Panneau de notifications in-app affiché dans la NavBar.

## Structure

```
modules/notifications/
├── components/
│   └── NotificationsPanel.vue     # Panneau dropdown avec liste de notifications
├── services/notifications.service.ts
├── store/useNotificationsStore.ts
└── types.ts
```

## Type

```typescript
type Notification = {
  id: number
  title: string
  description: string
  createdAt: string
  type?: 'deadline' | 'published' | 'event' | 'system'
}
```

## Store (`useNotificationsStore`)

| État | Description |
|---|---|
| `rows` | Liste des notifications |
| `isLoading` | Flag de chargement |
| `hasLoaded` | Indique si le premier chargement a eu lieu |
| `unreadCount` | Nombre de notifications non lues (badge dans la NavBar) |

| Action | Description |
|---|---|
| `loadNotifications()` | Charge toutes les notifications depuis l'API |
| `dismiss(id)` | Marque une notification comme lue |

## Endpoints API (service)

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/notifications` | Liste toutes les notifications |
| PUT | `/notifications/:id/dismiss` | Dismiss une notification |

## Comportement UI

- L'icône notifications dans la NavBar affiche un badge rouge si `unreadCount > 0`
- Le panneau s'ouvre au clic, se ferme en cliquant à l'extérieur
- Chargé au montage de la NavBar ; rechargé à l'ouverture du panneau si pas encore chargé

## Sources de notifications

Les notifications sont créées automatiquement côté backend lors de la création, mise à jour ou suppression d'une offre, d'une entreprise ou d'un événement calendrier.
