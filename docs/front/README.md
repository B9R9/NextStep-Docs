# Frontend — NextStep

Application Vue 3 en single-page. Organisée en modules fonctionnels sous `src/modules/`.

## Stack

- **Vue 3** — Composition API · `<script setup>` · TypeScript
- **Pinia** — gestion d'état
- **Vite** — build
- **Tailwind CSS** — styling utilitaire
- **Vue I18n** — traductions (en / fr / fi / sv)
- **Axios** — client HTTP (instance partagée dans `src/shared/api/http.ts`)

## Structure (`src/`)

```
src/
├── app/         # Point d'entrée, router, i18n, store global
├── layouts/     # MainLayout (NavBar + router-view)
├── modules/     # Modules fonctionnels (voir ci-dessous)
├── pages/       # Pages génériques (Home, NotFound)
└── shared/      # Composants, composables, utils, client API
```

## Modules

| Module | Description | Doc |
|---|---|---|
| applications | Suivi des candidatures sur un funnel en 11 statuts | [→](modules/applications.md) |
| jobs | Gestion des offres d'emploi | [→](modules/jobs.md) |
| companies | Répertoire d'entreprises | [→](modules/companies.md) |
| calendar | Événements calendrier liés aux offres et candidatures | [→](modules/calendar.md) |
| notifications | Panneau de notifications in-app | [→](modules/notifications.md) |
| auth | Login, inscription, gestion du compte | [→](modules/auth.md) |
| settings | Profil utilisateur et suppression de compte | [→](modules/settings.md) |

## Shared

### `src/shared/api/http.ts`
Instance Axios avec :
- `baseURL` : `VITE_API_BASE_URL` ou `/api`
- Intercepteur requête : attache `Authorization: Bearer <token>` depuis `localStorage`
- Intercepteur réponse : sur 401 → supprime le token et redirige vers `/login`

### `src/shared/components/`

| Composant | Description |
|---|---|
| `NavBar.vue` | Barre de navigation avec liens, sélecteur de langue, notifications, login/logout |
| `SharedSelect.vue` | Dropdown mono-sélection avec clear |
| `SharedMultiSelect.vue` | Dropdown multi-sélection |
| `SharedDateFilter.vue` | Filtre before/after par date |
| `SharedModal.vue` | Modal générique avec scroll lock |
| `ActionsMenu.vue` | Menu contextuel (edit / view / delete) |
| `IconButton.vue` | Bouton icône |
| `SortButton.vue` | Bouton de tri de colonne |
| `LanguageSelector.vue` | Sélecteur de locale i18n |

### `src/shared/composables/`

| Composable | Description |
|---|---|
| `useScrollLock(getter)` | Bloque le scroll de `body` quand un dialog est ouvert |

### `src/shared/utils/date.ts`
Helpers de formatage (`formatDateDDMMYYYY`, `toISODate`).

## Routing

Défini dans `src/app/router/`. Toutes les routes sous `MainLayout` nécessitent `meta.requiresAuth: true`. Les utilisateurs non authentifiés sont redirigés vers `/login?redirect=...`.
