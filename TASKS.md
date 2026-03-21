# Next Step — Tasks

> Last updated: 2026-03-21

---

## 🔄 In progress

_(aucune tâche en cours)_

---

## 📋 Todo

### 🔴 High priority

- **Confirmation email à l'inscription**
  - 📋 DB: table `email_confirmations` — token, user_id, expires_at, confirmed_at (migration Knex)
  - 📋 Backend: route POST `/api/auth/confirm/:token`
  - 📋 Backend: envoi email au register (nodemailer ou service tiers)
  - 📋 Frontend: page `/confirm/:token` avec feedback visuel (succès / expiré / invalide)
  - 📋 Frontend: bouton "Renvoyer l'email" si token expiré

### 🟡 Normal

- **Page mobile non supporté**
  - 📋 Frontend: détecter viewport < 768px
  - 📋 Frontend: afficher une page dédiée "Application non disponible sur mobile"

- **Statistiques globales à la page d'accueil (user)**
  - 📋 Backend: route GET `/api/stats` — agrégats par user (candidatures en cours, entretiens à venir, taux de réponse)
  - 📋 Frontend: section stats sur la page d'accueil (cards KPI)

- **Settings: option migration**
  - 📋 Backend: route GET `/api/export` — export JSON ou CSV de toutes les données user
  - 📋 Frontend: bouton "Exporter mes données" dans Settings > Compte

- **Sauvegarde locale des changements de statut**
  - 📋 Frontend: persister les changements de statut en localStorage avant sync API (évite reload visuel)

### 🟢 Low priority

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

1. **Page mobile non supporté** — quick win, une seule page, évite les bugs d'affichage sur mobile
2. **Statistiques globales à la page d'accueil** — améliore la valeur perçue dès l'accueil, pas de dépendances
3. **Sauvegarde locale des changements de statut** — améliore la fluidité perçue, atomic, pas de dépendances
4. **Confirmation email à l'inscription** — fondation Auth manquante, débloque confiance utilisateur, DB + backend + frontend
5. **Settings: option migration** — RGPD, low risk, pas de dépendances
6. **Documents: DB schema & migrations** — fondation Phase 2, débloque tout le reste
7. **Documents: Backend CRUD routes** — dépend du schéma DB
8. **Documents: AI service integration** — dépend des routes backend, cœur de la Phase 2
9. **CV creation wizard** — dépend du service IA
10. **CV edit / preview / PDF export** — complète le workflow CV
11. **Cover letter generation wizard** — dépend du service IA, parallélisable avec CV
12. **Cover letter edit / preview / PDF export** — complète le workflow lettres
13. **AI chatbot** — feature complémentaire, risque le plus élevé, pas de dépendances critiques
