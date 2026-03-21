# feedback

Module de collecte de feedback utilisateur. Accessible à tous les utilisateurs connectés via une icône dans la NavBar. Les feedbacks reçus sont consultables et triables dans le dashboard admin.

## Accès

Icône `feedback` dans la NavBar, visible pour tous les utilisateurs connectés (entre l'icône Admin et l'icône Agenda).

## Structure

```
modules/feedback/
└── services/feedback.service.ts   # submitFeedback()
```

Le formulaire est rendu via `FeedbackModal.vue` (composant partagé dans `src/shared/components/`).

## Service (`feedback.service.ts`)

| Fonction | Endpoint | Description |
|---|---|---|
| `submitFeedback(payload)` | `POST /feedback` | Envoie un feedback |

```typescript
type FeedbackSubject = 'feedback' | 'bug' | 'feature_request' | 'question' | 'performance' | 'other'

interface SubmitFeedbackPayload {
  subject: FeedbackSubject
  message: string       // min 20 chars, max 2000 chars
  is_anonymous: boolean
}
```

## FeedbackModal (`shared/components/FeedbackModal.vue`)

Modal fullscreen accessible depuis la NavBar.

### Champs

| Champ | Type | Défaut | Description |
|---|---|---|---|
| Subject | Select | `feedback` | Catégorie du feedback |
| Message | Textarea | — | Corps du message (20–2000 chars) |
| Anonyme | Toggle | `true` | Si désactivé, l'email de l'utilisateur est transmis |

### Sujets disponibles

| Valeur | Label |
|---|---|
| `feedback` | General feedback |
| `bug` | Bug report |
| `feature_request` | Feature request |
| `question` | Question |
| `performance` | Performance issue |
| `other` | Other |

### Compteur de caractères

- Affiché en bas à droite : `X/2000`
- Message d'aide en bas à gauche : `"X more characters needed"` en orange si en dessous du minimum (20)
- Le bouton Submit est désactivé tant que le minimum n'est pas atteint
- Compteur de droite passe en orange sous les 100 caractères restants

### États

- **Formulaire** : saisie normale
- **Envoi** : bouton en état `Sending…`, désactivé
- **Succès** : icône check + message de confirmation + bouton Close
- **Erreur** : message en rouge, formulaire réactivé

### Anonymat

- `is_anonymous: true` (défaut) → le `user_id` est stocké mais l'email n'est pas transmis
- `is_anonymous: false` → l'email de l'utilisateur connecté est stocké avec le feedback
