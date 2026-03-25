# Next Step — Roadmap

> Last updated: 2026-03-23

---

## Version 0.1.0 — MVP Fonctionnel
**Status:** In progress

Next Step est une plateforme de gestion de candidatures pour chercheurs d'emploi. La version 0.1.0 couvre le cycle complet de suivi des candidatures : découverte d'offres → postulation → suivi du pipeline → gestion des entretiens. L'interface est disponible en 4 langues (FR, EN, FI, SV), responsive desktop, avec authentification JWT sécurisée et déploiement sur Vercel.

Progress:
- ✅ Applications — CRUD complet, 11 statuts, filtres, tri, preview, skeleton loading
- ✅ Jobs — CRUD complet, recherche plein texte, filtres (industrie, entreprise, localisation, contrat, langue, dates), preview
- ✅ Companies — CRUD, compteur d'offres associées, filtres (secteur, localisation)
- ✅ Calendar — création / édition / suppression, preview contextuelle (5 contextes), sync date → job/application
- ✅ Auth — register / login JWT, guards de route, support gestionnaire de mots de passe
- ✅ Settings — profil, suppression de compte, auto-logout
- ✅ Notifications — store/service/UI fonctionnels, dismiss all, rappels configurables (toggle + jours)
- ✅ Reminders — popup au login, acquittement par événement, logique auto/manuelle
- ✅ Token sécurisé — access token mémoire Pinia + refresh token cookie httpOnly, rotation, révocation DB, silent refresh
- ✅ User event tracking — table user_events, trackEvent fire-and-forget, X-Session-Id header
- ✅ API metrics in-memory — latence, taux d'erreur par route
- ✅ Admin dashboard — KPI users/applications/jobs, funnel, feature adoption, API health, churn, feedback
- ✅ User feedback — formulaire NavBar (6 sujets, anonymous par défaut), panel admin
- ✅ Locations autocomplete — Photon OSM API (backend), fallback statique, MSW handler, Companies + Jobs forms
- ✅ GDPR / Privacy — page `/privacy`, lien footer, consentement au register, i18n 4 langues
- ✅ Transitions UI — fade-in pages et contenu, skeleton calendar
- 📋 Confirmation email à l'inscription

---

## Phase 1 — Core Functionality (0.2.0)
**Status:** In progress

Finalisation et polish de la version MVP : solidifier les fonctionnalités existantes, combler les manques côté Settings (option migration), améliorer l'expérience mobile (page "non supporté"), et offrir les premières statistiques utilisateur visibles sur la page d'accueil.

Progress:
- ✅ Notifications et rappels selon les settings (toggle, jours configurables, popup login)
- ✅ Filtres adaptés aux colonnes visibles (location Jobs + Companies)
- ✅ Transitions et polish UI
- 📋 Confirmation email à l'inscription
- 📋 Statistiques globales à la page d'accueil (user-facing)
- 📋 Settings: option migration (export données)
- 📋 Page mobile non supporté

---

## Phase 2 — IA Integration (0.3.0)
**Status:** Planned

Introduction de l'IA comme différenciateur central : génération assistée de CV et lettres de motivation, et chatbot de conseil personnalisé. L'IA accompagne l'utilisateur sans remplacer sa voix — elle part de ses descriptions pour construire des documents authentiques et adaptés à chaque offre.

Progress:
- 📋 Documents module (DB + backend + frontend scaffold)
- 📋 Création de CV assistée par IA
- 📋 Edition / preview / export PDF du CV
- 📋 Génération de lettre de motivation (flow Q&A par offre)
- 📋 Edition / preview / export PDF de la lettre
- 📋 Chatbot IA de conseil et accompagnement

---

## Phase 3 — Profilage & Matching (0.4.0)
**Status:** Planned

L'IA analyse le profil de compétences de l'utilisateur (soft & hard skills) et le compare aux offres d'emploi pour donner un taux de compatibilité. L'utilisateur peut adapter son CV et ses candidatures en conséquence.

Progress:
- 📋 Taux de compatibilité offre / profil (dépend Phase 2)
- 📋 Profil de compétences soft & hard skills

---

## Phase 4 — Community & Ecosystem (0.5.0)
**Status:** Planned

Création d'un écosystème autour de la plateforme : ressources et articles de blog générés par IA, forum d'entraide entre chercheurs d'emploi, et partenariats avec entreprises et recruteurs pour du contenu exclusif.

Progress:
- 📋 Espace blog et ressources (IA-generated)
- 📋 Forum de discussion
- 📋 Partenariats entreprises / recruteurs

---

## Phase 5 — Recruiter Interface (0.6.0)
**Status:** Planned

Interface dédiée aux recruteurs pour accéder au pipeline de candidats, gérer les offres et interagir avec les candidats directement depuis la plateforme. Détails à affiner.

Progress:
- 📋 À définir

---

## Phase 6 — Suivi Période d'Essai (0.7.0)
**Status:** Planned

Module de suivi post-embauche : objectifs à 30/60/90 jours, journal de bord, feedbacks périodiques. Accompagne l'utilisateur au-delà de la signature du contrat. Détails à affiner.

Progress:
- 📋 À définir

---

## Phase 7 — Développement Personnel (0.8.0)
**Status:** Planned

Outils de développement de compétences : recommandations de formations, suivi des progrès, ressources personnalisées selon le profil et les objectifs de l'utilisateur. Détails à affiner.

Progress:
- 📋 À définir

---

## Phase 8 — Mobile App (0.9.0)
**Status:** Planned

Application mobile native (iOS / Android) ou PWA offrant l'essentiel des fonctionnalités : suivi des candidatures, notifications push, accès rapide au calendrier. Détails à affiner.

Progress:
- 📋 À définir

---

## Idées hors phases
- Intégration LinkedIn — import offres et candidatures
- Intégration Google Calendar — sync événements
- Gamification — badges et récompenses pour utilisateurs actifs
- Analyse de CV — optimisation par rapport aux offres
- Mentorat — connexion avec des professionnels expérimentés
- Plateformes de formation — cours et ressources de développement de compétences
- Préparation aux entretiens — simulations et conseils personnalisés
