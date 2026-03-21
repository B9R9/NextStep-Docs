# auth

Authentification : login, inscription, gestion du double token JWT et suppression de compte.

## Structure

```
modules/auth/
├── components/
│   ├── LoginForm.vue           # Connexion email + mot de passe
│   ├── CreateAccountForm.vue   # Formulaire d'inscription
│   └── ForgotPasswordForm.vue  # Réinitialisation de mot de passe (UI)
├── pages/
│   └── LoginPage.vue           # Page hôte (onglets login / inscription)
├── services/auth.service.ts    # Appels API
├── store/useAuthStore.ts       # Store Pinia (accessToken, user, isAdmin)
└── routes.ts
```

## Fonctions du service

| Fonction | Description |
|---|---|
| `login(email, password)` | POST `/auth/login` → retourne `{ user, accessToken }` |
| `register(data)` | POST `/auth/register` → retourne `{ user, accessToken }` |
| `refresh()` | POST `/auth/refresh` → retourne un nouvel `accessToken` depuis le cookie |
| `me()` | GET `/auth/me` → retourne l'utilisateur courant |
| `logout()` | POST `/auth/logout` → révoque le refresh token, supprime le cookie |
| `deleteMe(password)` | DELETE `/auth/me` → supprime le compte |

## Store (`useAuthStore`)

| État | Type | Description |
|---|---|---|
| `accessToken` | `string \| null` | Token JWT 15 min, en mémoire uniquement |
| `user` | `AuthUser \| null` | Données de l'utilisateur connecté |
| `isAdmin` | `boolean` | Accès au dashboard admin |

| Getter | Description |
|---|---|
| `isLoggedIn` | `true` si `accessToken` est non nul |

| Action | Description |
|---|---|
| `setSession(token, user)` | Positionne token + user simultanément |
| `setAccessToken(token)` | Positionne uniquement le token (utilisé lors du refresh) |
| `setAdmin(value)` | Positionne le flag admin |
| `clearSession()` | Réinitialise tout (logout) |

## Stratégie double token

1. **Login / Register** → l'API retourne `{ user, accessToken }` + pose un cookie `httpOnly` contenant le refresh token
2. **Chaque requête** → l'intercepteur Axios attache `Authorization: Bearer <accessToken>` depuis le store Pinia
3. **Réponse 401** → silent refresh : appel `/auth/refresh` avec le cookie, file d'attente pour éviter les appels parallèles, retry de la requête originale
4. **Refresh échoué** → `clearSession()` + redirection `/login`
5. **Rechargement de page (F5)** → le guard `router.beforeEach` tente un refresh avant la première navigation pour restaurer la session

## Guards du router

| Meta | Comportement |
|---|---|
| `requiresAuth: true` | Redirige vers `/login?redirect=...` si non connecté |
| `requiresAdmin: true` | Appelle `checkAdminAccess()` → redirige vers `/applications` si 403 |

## Compatibilité gestionnaire de mots de passe

Les formulaires utilisent du HTML sémantique : `<form>`, `type="submit"`, attributs `name` et `autocomplete` sur tous les champs.

## Notes

- L'`accessToken` n'est **jamais** stocké dans `localStorage` ni dans un cookie — uniquement en mémoire Pinia
- Le cookie refresh token est `httpOnly` (inaccessible à JavaScript)
- `isAdmin` est peuplé après login et après restauration de session (appel silencieux à `/admin/me`)
