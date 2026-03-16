# NextStep Doc Agent — Setup

## 1. Installer Ollama

```bash
# Télécharge et installe Ollama
brew install ollama

# Lance le serveur Ollama
ollama serve
```

## 2. Télécharger Codestral (dans un autre terminal)

```bash
# Codestral : modèle spécialisé code, ~9GB, idéal sur M2 Pro Max
ollama pull codestral

# Alternative plus légère (~4GB) si tu veux tester vite
ollama pull mistral
```

## 3. Placer le script

```bash
# Mets generate-docs.js à la racine de NextStep-Docs
cp generate-docs.js ~/Projects/NextStep-Docs/
cd ~/Projects/NextStep-Docs
```

## 4. Lancer le bootstrap (première fois)

```bash
# Remplace ghp_xxx par ton token GitHub (scope: repo)
GITHUB_TOKEN=ghp_xxx node generate-docs.js \
  --front ../next-step/src \
  --back  ../next-step-api/src

# Dry-run d'abord pour vérifier sans pousser
GITHUB_TOKEN=ghp_xxx node generate-docs.js \
  --front ../next-step/src \
  --back  ../next-step-api/src \
  --dry
```

## 5. Mettre à jour une feature spécifique

```bash
# Regénère seulement les stores
GITHUB_TOKEN=ghp_xxx node generate-docs.js \
  --front ../next-step/src \
  --only stores

# Regénère stores + services
GITHUB_TOKEN=ghp_xxx node generate-docs.js \
  --front ../next-step/src \
  --only stores,services
```

## 6. Workflow quotidien

Après une PR mergée :

```bash
# Dans NextStep-Docs/
GITHUB_TOKEN=ghp_xxx node generate-docs.js \
  --front ../next-step/src \
  --only components,stores
```

---

## Structure générée dans NextStep-Docs

```
NextStep-Docs/
├── README.md                        ← index auto-généré avec tous les liens
└── docs/
    ├── front/
    │   ├── stores/
    │   │   ├── jobs-store.md
    │   │   ├── companies-store.md
    │   │   └── ...
    │   ├── services/
    │   │   ├── jobServices.md
    │   │   └── ...
    │   ├── components/
    │   │   └── common/
    │   │       └── TranslatedMultiSelect.md
    │   └── pages/
    │       ├── dashboard/
    │       └── ...
    └── back/
        └── ...
```

## Options disponibles

| Option | Description | Défaut |
|--------|-------------|--------|
| `--front` | Chemin vers src/ frontend | `../next-step/src` |
| `--back` | Chemin vers src/ backend | `../next-step-api/src` |
| `--token` | GitHub token | `$GITHUB_TOKEN` |
| `--model` | Modèle Ollama | `codestral` |
| `--dry` | Dry run, pas de push | false |
| `--only` | Filtrer par dossier | tous |
