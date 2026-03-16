# auth

Authentification : login, inscription, gestion du token JWT et suppression de compte.

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
└── routes.ts
```

## Fonctions du service

| Fonction | Description |
|---|---|
| `login(email, password)` | POST `/auth/login` → stocke le JWT dans `localStorage` |
| `register(data)` | POST `/auth/register` |
| `deleteMe(password)` | DELETE `/auth/me` avec confirmation par mot de passe |
| `clearAuthToken()` | Supprime `auth_token` de `localStorage` |

## Flux du token

1. Login → l'API retourne un JWT → stocké dans `localStorage` sous la clé `auth_token`
2. Chaque requête → l'intercepteur Axios attache `Authorization: Bearer <token>`
3. Réponse 401 → l'intercepteur supprime le token + redirige vers `/login?redirect=...`
4. Guard du router → vérifie `localStorage.auth_token` avant chaque navigation

## Compatibilité gestionnaire de mots de passe

Les formulaires utilisent du HTML sémantique : `<form>`, `type="submit"`, attributs `name` et `autocomplete` sur tous les champs.

## Notes

- Toutes les routes sous `MainLayout` exigent l'auth (`meta.requiresAuth: true`)
- Les utilisateurs déjà connectés accédant à `/login` sont redirigés vers `/applications`
