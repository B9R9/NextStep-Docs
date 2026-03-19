# Next Step — Tasks

> Last updated: 2026-03-18

---

## 🔄 In progress

- **Notifications et rappels selon les settings**
  - 🔄 Déclencher les rappels selon le timing choisi dans Settings (même jour / 1j / 2j / 5j / 1 semaine avant)
  - 🔄 Lier les rappels aux deadlines et entretiens du calendrier

---

## 📋 Todo

### 🔴 High priority

- **Confirmation email à l'inscription**
  - 📋 Backend: générer et stocker un token de confirmation (migration DB)
  - 📋 Backend: route POST `/api/auth/confirm/:token`
  - 📋 Backend: envoi email (nodemailer ou service tiers)
  - 📋 Frontend: page de confirmation avec feedback visuel
  - 📋 Frontend: resend email si expiré

- **Settings: toggle notifications**
  - 📋 DB: champ `notifications_enabled` dans `users`
  - 📋 Backend: GET/PUT `/api/settings/notifications`
  - 📋 Frontend: toggle dans Settings > Notifications

- **Settings: choix rappels**
  - 📋 DB: champ `reminder_timing` (enum ou JSON) dans `users`
  - 📋 Backend: GET/PUT `/api/settings/reminders`
  - 📋 Frontend: multi-select dans Settings (même jour / 1j / 2j / 5j / 1 semaine)
  - 📋 Scheduler: lire le timing et déclencher les rappels

### 🟡 Normal

- **Page mobile non supporté**
  - 📋 Frontend: détecter viewport < 768px
  - 📋 Frontend: afficher une page dédiée "Application non disponible sur mobile"

- **Settings: option migration**
  - 📋 Backend: export des données utilisateur (JSON ou CSV)
  - 📋 Frontend: bouton "Exporter mes données" dans Settings > Compte

- **Sauvegarde locale des changements de statut**
  - 📋 Frontend: persister les changements de statut en localStorage avant sync API (éviter reload visuel)

- **Bouton reset visible seulement si filtre actif**
  - 📋 Frontend: conditionner l'affichage du bouton reset sur `hasActiveFilters`

- **Filtres adaptés aux colonnes visibles**
  - 📋 Frontend: masquer les options de filtre des colonnes cachées

### 🟢 Low priority

- **Transitions fade in/out plus smooth**
  - 📋 Frontend: ajouter transitions CSS sur les changements de vue et dialog open/close

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

1. **Settings: toggle notifications** — quick win, débloque les rappels (Settings DB déjà en place)
2. **Settings: choix rappels** — complète le système de notifications en cours
3. **Bouton reset visible seulement si filtre actif** — atomic, 30 min, améliore l'UX immédiatement
4. **Filtres adaptés aux colonnes visibles** — atomic, cohérent avec la tâche précédente
5. **Sauvegarde locale des changements de statut** — améliore la fluidité perçue, pas de dépendances
6. **Page mobile non supporté** — quick win, évite les bugs d'affichage sur mobile
7. **Transitions fade in/out** — polish final, aucune dépendance
8. **Confirmation email à l'inscription** — fondation Auth manquante, débloque la confiance utilisateur
9. **Settings: option migration** — RGPD, low risk, pas de dépendances
10. **Documents: DB schema & migrations** — fondation Phase 2, débloque tout le reste
11. **Documents: Backend CRUD routes** — dépend du schéma DB
12. **Documents: AI service integration** — dépend des routes backend, cœur de la Phase 2
13. **CV creation wizard** — dépend du service IA
14. **CV edit / preview / PDF export** — complète le workflow CV
15. **Cover letter generation wizard** — dépend du service IA, parallélisable avec CV
16. **Cover letter edit / preview / PDF export** — complète le workflow lettres
17. **AI chatbot** — feature complémentaire, pas de dépendances critiques, risque le plus élevé
