# settings

Profil utilisateur, langue préférée, mot de passe, rappels et gestion du compte.

## Structure

```
modules/settings/
├── components/
│   └── SettingsMainView.vue    # Formulaire profil + langue + password + suppression
└── routes.ts
```

## Fonctionnalités

### Profil
Champs éditables : nom, email, langue préférée.

`PATCH /auth/me` accepte `{ name?, email?, preferred_language? }`. La réponse inclut `preferred_language` ; si elle est définie, `i18n.global.locale.value` est mis à jour immédiatement.

### Langue préférée

Un `<select>` lié à `profile.preferred_language` propose les 4 locales (`en`, `fr`, `fi`, `sv`). À la sauvegarde :
1. La valeur est envoyée dans `PATCH /auth/me`
2. `i18n.global.locale.value` est mis à jour (effet immédiat)
3. La locale de session dans `localStorage['session_locale']` est mise à jour

### Langue de session vs langue préférée

| Événement | Comportement |
|---|---|
| Login | `preferred_language` de la DB est appliqué et écrit dans `localStorage['session_locale']` |
| Refresh (F5) | `i18n` lit `localStorage['session_locale']` au démarrage — la langue de session est préservée |
| Sélecteur navbar | Change `i18n.locale` + écrit dans `localStorage['session_locale']` |
| Sauvegarde Settings | Change `i18n.locale` + écrit dans `localStorage['session_locale']` |

### Mot de passe
Validation client : champs requis + confirmation identique. Appel `PATCH /auth/password`.

### Suppression de compte
1. L'utilisateur clique sur "Supprimer le compte"
2. Un dialog `SharedModal` s'ouvre et demande confirmation par mot de passe
3. Envoi `DELETE /auth/me` avec vérification bcrypt côté serveur
4. Succès → session effacée + redirection `/login`
5. 401 → `settings.account.deleteDialog.wrongPassword`
6. Autre erreur → `settings.account.deleteDialog.error`

### Rappels
`SettingsRemindersSection` est embarqué directement dans la vue.

## State local (SettingsMainView)

| Ref | Type | Description |
|---|---|---|
| `openAccountSection` | `'profile' \| 'password' \| null` | Accordéon exclusif, ouvert sur `'profile'` par défaut |
| `profile` | `{ name, email, preferred_language }` | Formulaire profil |
| `isSavingProfile` | `boolean` | Désactive le bouton pendant l'appel API |
| `saveMessage` | `string` | Feedback inline sous le bouton |
| `passwordForm` | `{ currentPassword, newPassword, confirmPassword }` | Formulaire mot de passe |
| `isDeleteDialogOpen` | `boolean` | Contrôle la `SharedModal` de suppression |

## Notes

- Utilise `SharedModal` pour le dialog de confirmation (pas de `window.confirm()`)
- `i18n` est importé directement depuis `@/app/i18n` pour muter `locale.value` hors composant
