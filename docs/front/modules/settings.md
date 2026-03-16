# settings

Profil utilisateur et gestion du compte.

## Structure

```
modules/settings/
├── components/
│   └── SettingsMainView.vue    # Formulaire de profil + suppression de compte
└── routes.ts
```

## Fonctionnalités

### Profil
Champs éditables : nom, email, langue préférée.

### Suppression de compte
1. L'utilisateur clique sur "Supprimer le compte"
2. Un dialog `SharedModal` s'ouvre et demande la confirmation par mot de passe
3. Le mot de passe est envoyé à `DELETE /auth/me` avec vérification bcrypt côté serveur
4. Succès → token supprimé + redirection vers `/login`
5. 401 → affiche le message "mot de passe incorrect"
6. Autre erreur → affiche un message d'erreur générique

## Notes

- Utilise `SharedModal` pour le dialog de confirmation (pas de `window.confirm()`)
