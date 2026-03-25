# Next Step — Tasks

> Last updated: 2026-03-23

---

## 🔄 In progress

_(aucune tâche en cours)_

---

## 📋 Todo

### 🔴 Bugs — production

- **Bug: settings reminder** — comportement inattendu dans la section rappels de Settings

- **Bug: Companies — colonne "jobs availables" affiche "In progress"** — affiche le texte brut au lieu du nombre

- **Bug: création de job ne crée pas de notification**

- **Bug: notifications et event panel ne se rechargent pas** — le panel affiche un état stale à chaque ouverture

- **Bug: calendar panel n'affiche pas en finnois** — problème de rendu ou clé i18n manquante sur la locale FI

- **Bug: page privacy inaccessible** — le lien depuis la page login/register ne fonctionne pas ou route absente

- **Bug: Settings — onglets ouverts au montage** — tous les onglets devraient être fermés au `onMounted`

### 🔴 High priority

- **Confirmation email à l'inscription**
  - 📋 DB: table `email_confirmations` — token, user_id, expires_at, confirmed_at (migration Knex)
  - 📋 Backend: route POST `/api/auth/confirm/:token`
  - 📋 Backend: envoi email au register (nodemailer ou service tiers)
  - 📋 Frontend: page `/confirm/:token` avec feedback visuel (succès / expiré / invalide)
  - 📋 Frontend: bouton "Renvoyer l'email" si token expiré

### 🟡 Normal

- **i18n: notifications, tabs et feedback non localisés**
  - 📋 Frontend: localiser les messages de notifications (4 langues)
  - 📋 Frontend: localiser les titres des tabs de navigation du browser
  - 📋 Frontend: localiser le module feedback (formulaire + statuts)

- **Modal beta disclaimer au premier login**
  - 📋 Frontend: détecter le premier login (flag localStorage)
  - 📋 Frontend: SharedModal avec message beta + avertissement conservation des données

- **Différenciation deadline job vs deadline application** — améliorer le label ou la couleur pour distinguer les deux types de deadline

- **Language selector — ne pas déplacer les onglets** — fix layout/animation dans la navbar quand le sélecteur s'ouvre

- **Settings: préférence de langue**
  - 📋 Backend: champ `preferred_language` dans table users (migration)
  - 📋 Backend: GET/PUT `/api/settings` — exposer et modifier ce champ
  - 📋 Frontend: sélecteur dans Settings > Profil, synchronisé avec i18n au login

- **Preview trop petit** — augmenter la largeur ou hauteur des panels preview (dialogs)

- **Flotteur derrière les modals** — z-index : le menu flottant (ActionsMenu ou similaire) passe derrière les modals

- **Transitions pour afficher les modals** — ajouter une animation d'entrée/sortie sur les SharedModal et dialogs

- **Page mobile non supporté**
  - 📋 Frontend: détecter viewport < 768px
  - 📋 Frontend: afficher une page dédiée "Application non disponible sur mobile"

- **Statistiques globales à la page d'accueil (user)**
  - 📋 Backend: route GET `/api/stats` — agrégats par user (candidatures en cours, entretiens à venir, taux de réponse)
  - 📋 Frontend: section stats sur la page d'accueil (cards KPI)

- **Archiver les événements passés** — option pour archiver ou supprimer automatiquement les événements calendrier passés

- **Archiver les jobs et applications passés/rejetés** — archivage manuel ou automatique des offres et candidatures avec statut terminal

- **Statistiques propres à l'user** — KPI personnalisés visibles dans le profil ou le dashboard (taux de réponse, entretiens obtenus…)

- **Import liste de compagnies partagée** — permettre d'importer un annuaire de compagnies partagé entre utilisateurs

- **Settings: option migration**
  - 📋 Backend: route GET `/api/export` — export JSON ou CSV de toutes les données user
  - 📋 Frontend: bouton "Exporter mes données" dans Settings > Compte

- **Sauvegarde locale des changements de statut**
  - 📋 Frontend: persister les changements de statut en localStorage avant sync API (évite reload visuel)

### 🟢 Low priority

- **Tooltips sous les icônes** — ajouter des tooltips sur les boutons icon-only de la navbar et des tables

- **Vérifier les HINTS** — audit des placeholders et textes d'aide dans les formulaires

- **Faire un point accessibilité** — audit a11y : contraste, aria-labels, navigation clavier

- **Page d'accueil — plus d'explications** — enrichir le contenu de `/` pour mieux présenter la valeur de l'app

---

## 📋 Todo — Phase 2: IA Integration

### 🔴 High priority

- **Documents: DB schema & migrations**
  - 📋 DB: table `documents` (id, user_id, type: cv|cover_letter, job_id nullable, title, content, raw_input, created_at, updated_at)
  - 📋 DB: migration Knex
  - 📋 Backend: seed de données de test

- **Documents: Backend CRUD routes**
  - 📋 Backend: GET `/api/documents` (list by user)
  - 📋 Backend: POST `/api/documents` (create)
  - 📋 Backend: GET `/api/documents/:id`
  - 📋 Backend: PUT `/api/documents/:id`
  - 📋 Backend: DELETE `/api/documents/:id`
  - 📋 Backend: POST `/api/documents/generate` (IA generation endpoint)

- **Documents: AI service integration**
  - 📋 Backend: intégrer Claude API (Anthropic SDK)
  - 📋 Service: `generateCV(userNarrative)` — prompt structuré pour générer un CV
  - 📋 Service: `generateCoverLetter(jobContext, userAnswers)` — prompt pour lettre de motivation
  - 📋 Service: gestion des erreurs et fallback

### 🟡 Normal

- **CV creation wizard**
  - 📋 Frontend: formulaire step-by-step (user décrit son parcours expérience par expérience)
  - 📋 Frontend: appel API generate → affichage du CV généré
  - 📋 Frontend: store `useDocumentsStore` (CRUD + état de génération)
  - 📋 Frontend: intégration dans module Documents

- **CV edit / preview / PDF export**
  - 📋 Frontend: éditeur de texte avec mise à jour IA en temps réel (debounce)
  - 📋 Frontend: preview stylée du CV (template HTML/CSS)
  - 📋 Frontend: export PDF (html2pdf.js ou Puppeteer backend)

- **Cover letter generation wizard**
  - 📋 Frontend: flow Q&A lié à une offre d'emploi spécifique
  - 📋 Frontend: appel API generate → affichage de la lettre générée
  - 📋 Frontend: association document ↔ candidature

- **Cover letter edit / preview / PDF export**
  - 📋 Frontend: éditeur direct du texte de la lettre
  - 📋 Frontend: preview stylée de la lettre
  - 📋 Frontend: export PDF

### 🟢 Low priority

- **AI chatbot**
  - 📋 Backend: POST `/api/chat` avec historique de conversation (session ou DB)
  - 📋 Frontend: interface chat (panel flottant ou sidebar)
  - 📋 Service: maintenir le contexte conversationnel par utilisateur
  - 📋 Frontend: suggestions de questions fréquentes

---

## 🗂 Suggested order

1. **Bug: Settings — onglets ouverts au montage** — atomic, 1 fichier, fix immédiat
2. **Bug: page privacy inaccessible** — bloque les utilisateurs, quick fix routing
3. **Bug: Companies — colonne "jobs availables"** — visible en prod, correction UI simple
4. **Bug: notifications et event panel ne se rechargent pas** — UX dégradée à chaque ouverture
5. **Bug: création de job ne crée pas de notification** — feature gap backend simple
6. **Bug: calendar panel n'affiche pas en finnois** — i18n manquant, ciblé
7. **Bug: settings reminder** — investigation nécessaire avant fix
8. **i18n: notifications, tabs et feedback** — groupe naturel, atomic par section
9. **Language selector — ne pas déplacer les onglets** — quick CSS fix
10. **Flotteur derrière les modals** — z-index, atomic
11. **Transitions pour afficher les modals** — polish UI, atomic
12. **Modal beta disclaimer au premier login** — UX important avant croissance users
13. **Différenciation deadline job vs application** — améliore la lisibilité, simple
14. **Preview trop petit** — polish, simple resize
15. **Page mobile non supporté** — une seule page, évite bugs mobiles
16. **Confirmation email à l'inscription** — fondation auth, multi-layer
17. **Settings: préférence de langue** — DB + backend + frontend
18. **Statistiques globales à la page d'accueil** — améliore valeur perçue
19. **Archiver les événements passés** — UX calendrier, pas de dépendances
20. **Archiver les jobs et applications passés/rejetés** — UX jobs, pas de dépendances
21. **Statistiques propres à l'user** — dépend des stats backend
22. **Settings: option migration** — RGPD, low risk
23. **Sauvegarde locale des changements de statut** — optimisation UX
24. **Import liste de compagnies partagée** — feature avancée, dépendances à définir
25. **Tooltips sous les icônes** — polish, low priority
26. **Vérifier les HINTS** — audit, low priority
27. **Page d'accueil — plus d'explications** — contenu marketing, low priority
28. **Faire un point accessibilité** — audit complet, planifier en sprint dédié
29. **Documents: DB schema & migrations** — fondation Phase 2
30. **Documents: Backend CRUD routes** — dépend du schéma DB
31. **Documents: AI service integration** — cœur de la Phase 2
32. **CV creation wizard** — dépend du service IA
33. **CV edit / preview / PDF export** — complète le workflow CV
34. **Cover letter generation wizard** — parallélisable avec CV
35. **Cover letter edit / preview / PDF export** — complète les lettres
36. **AI chatbot** — risque le plus élevé, feature complémentaire
