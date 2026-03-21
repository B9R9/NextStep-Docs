# Next Step — Tasks

## In progress
- Notifications et rappels selon les settings event

## Todo
- Confirmation email à l'inscription
- Filtres adaptés aux colonnes visibles
- Page mobile non supporté




## Done
- Scroll fixé dans les main views
- Company view — affiche 0 jobs disponibles
- Scroll bloqué quand dialog ouverte
- Application status column redesignée
- Création event calendrier pour applications
- Autofill gestionnaire de mots de passe
- Preview event avec édition et suppression
- Skeleton loading
- Suppression de compte
- Reset timezone
- Auto-logout après inactivité
- Colonne type retirée du tableau applications
- Champ type retiré du form applications
- Preview application nettoyée
- Texte "Leave empty" retiré du form
- Application: boutton reset n apparaît que si un filtre est actif
- Application Preview: si pas de deadline, ne pas afficher la ligne
- Application: Form quand on si Applied statuts est applied, sinon saved
- Application: Quand je clike sur Edit depuis le menu, le form s ouvre correctemnt. Quand je clicke sur save, le form se ferme et la prevew est visible. On ne devrait pas voir la preview que si elle a etait ouverte par luser
- notificcations: de succes ou de chjec en bas de lecrat appariasent eet se deplace de maniere diagonale
- ajout dismiss all dans les notifications
- preview message format
- calendar: Ajuster les messages et couleurs suivant le contexte
- calendar: certains events ne peuvent pas etre preview
- calendar: changer une date via edit event chnage aussi la date de l application event ou job event associé
- Token via https et non localstorage: access token en mémoire Pinia, refresh token en cookie httpOnly SameSite=None, rotation, révocation en DB, silent refresh Axios
- Auth: fix login ne redirige pas (store non alimenté après login)
- Auth: fix refresh page déconnecte (accessToken non set avant appel /auth/me)
- Auth: cookie secure/sameSite conditionnel dev/prod
- User event tracking + API metrics in-memory (user_events table, trackEvent, apiMetrics)
- Admin analytics dashboard (KPI cards, funnel, feature adoption, API health, churn, feedback)
- Ajouter dans la nav bar un icon pour ouvrir un form et envoyer un message à l'équipe (feedback, bug report, demande de fonctionnalité)
- Ajouter statistiques global de l app à la page d'accueil pour user de niveau 1
- Roadmap section dans Settings — timeline des phases produit visible par tous les users
- trouver un moyen pour les villes et premplie
- Settings: option migration
- Settings: toggle notifications
- Settings: choix rappels (même jour / 1j / 2j / 5j / 1 semaine avant)
- Modal ont besoin detre redimensionner 
- Transitions fade in/out plus smooth