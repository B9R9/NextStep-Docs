# Next-Step -- ROADMAP

## CURRENT VERSION: 0.1.0 — MVP Fonctionnel

Next Step est une plateforme de gestion de candidatures pour chercheurs d'emploi. La version 0.1.0 couvre le cycle complet de suivi des candidatures : découverte d'offres → postulation → suivi du pipeline → gestion des entretiens.

L'interface est disponible en 4 langues (FR, EN, FI, SV), responsive desktop, avec authentification JWT et déploiement sur Vercel.

### Ce qui est construit :

**Applications**
- CRUD complet avec 11 statuts (saved → offer_received, rejections, withdrawn…)
- Tableau filtrable et triable (statut, date, entreprise, poste)
- Formulaire avec autofill depuis une offre d'emploi liée
- Preview avec détail complet
- Skeleton loading, empty states

**Jobs (offres d'emploi)**
- CRUD complet avec recherche plein texte
- Filtres par statut, entreprise, localisation
- Preview avec détail et lien vers candidature associée

**Companies**
- CRUD complet
- Vue détaillée avec compteur d'offres associées

**Calendar**
- Création / édition / suppression d'événements
- Types d'événements : entretien, deadline, relance, autre
- Panneau calendrier mensuel avec navigation

**Notifications**
- Store, service et panneau UI fonctionnels
- Notifications liées aux changements de statut des candidatures
- Rappels selon les préférences (en cours d'implémentation)

**Settings**
- Édition du profil (nom, email, langue)
- Suppression de compte avec confirmation
- Auto-logout après inactivité configurable

**Auth**
- Register / Login avec JWT stocké en localStorage
- Support gestionnaire de mots de passe (autocomplete)
- Guards de route

## PHASE 1: CORE FUNCTIONALITY (0.2.0)
Description de ce qu apporte cette phase

## PHASE 2: IA INTEGRATION (0.3.0)
Creation de CV et lettre de motivation avec assistance IA, taux de compatibilite avec les offres d emploi. Assistance et conseils personnalisés via chatbot IA.

### Features:
- [ ] Creation de CV avec assistance IA
L´user decrit avec ses mots sont parcours jobs par jobs. L´IA genere un CV a partir de cette description. L´user peut ensuite editer le CV et le telecharger en PDF.
- [ ] Edit/delete/preview CV
L´user peut editer son CV en modifiant la description de son parcours. L´IA met a jour le CV en temps reel. L´user peut aussi supprimer le CV ou le preview avant de le telecharger. L´user peut aussi directement modifier le texte du CV.
- [ ] Generation de lettre de motivation
L' user repond au question de l iA pour creer une lettre de motivation personnalisee pour un job specifique
- [ ] Edit/delete/preview lettre de motivation
L´user peut editer sa lettre de motivation en modifiant les reponses aupres de l´IA. L´IA met a jour la lettre de motivation en temps reel. L´user peut aussi supprimer la lettre de motivation ou la preview avant de la telecharger.
Il peut aussi directement modifier le texte.
- [ ] Chat bot pour assistance et conseils
L´user peut poser des questions a l´IA sur la recherche d emploi, la redaction de CV et lettre de motivation, les entretiens, etc. L´IA repond des conseils personnalises en fonction du profil de l´user et de sa situation. L´IA peut aussi proposer des ressources utiles (articles, videos, etc.) pour aider l´user dans sa recherche d emploi.

## PHASE 3: Monetization (0.4.0)
Mise en place d' un modele de monetaisation base sur un abonment offrant plus d espace de stockage.

### Features:
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

## PHASE 4: Profilage User for matching
Description de ce qu apporte cette phase

### Features:
- [ ] Taux de compatibilite avec les offres d emploi
L´IA analyse le CV de l´user et le compare avec les offres d emploi pour donner un taux de compatibilite. L´user peut ainsi savoir quelles offres correspondent le mieux a son profil et adapter son CV en consequence.
- [ ] Creation d un profil de competences soft et hard skills

## PHASE 5: Community & Ecosystem
Description de ce qu apporte cette phase

### Features:
- [ ] Espace de blogs et de ressources
L´IA genere des articles de blog et des ressources utiles pour les chercheurs d emploi (conseils pour les entretiens, tendances du marche de l emploi, etc.). L´user peut acceder a ces ressources depuis l´application et les partager avec d´autres utilisateurs.
- [ ] Forum de discussion
L´application intègre un forum de discussion où les utilisateurs peuvent échanger des conseils, partager leurs expériences, poser des questions et créer une communauté d'entraide autour de la recherche d'emploi.
- [ ] Partenariats avec des entreprises et des recruteurs
L´application établit des partenariats avec des entreprises et des recruteurs pour offrir des opportunités d'emploi exclusives aux utilisateurs de la plateforme pour du contenu de qualite

## PHASE 6: Recruiter interface
Description de ce qu apporte cette phase

### Features:
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

## Phase 7: Suivi periode d'essai
Description de ce qu apporte cette phase

### Features:
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

## PHASE 8: Developpement personel
Description de ce qu apporte cette phase

### Features:
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

## PHASE 9: Mobile App
Description de ce qu apporte cette phase

### Features:
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

## HORS PHASE: Idées a developer
- Intégration avec LinkedIn pour importer les offres d'emploi et les candidatures
- Intégration avec Google Calendar pour synchroniser les événements liés aux candidatures
- Gamification de la recherche d'emploi avec des badges et des récompenses pour les utilisateurs actifs
- Outils d'analyse de CV pour aider les utilisateurs à optimiser leur CV en fonction des offres d'emploi
- Fonctionnalité de mentorat pour connecter les chercheurs d'emploi avec des professionnels expérimentés dans leur domaine
- Intégration avec des plateformes de formation en ligne pour offrir des cours et des ressources de développement de compétences aux utilisateurs
- Outils de préparation aux entretiens avec des simulations d'entretiens et des conseils personnalisés basés sur le profil de l'utilisateur
