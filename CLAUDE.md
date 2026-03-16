# Next Step — Project Context

## What this project is
Next Step is a SaaS career platform for job seekers. It covers the full cycle:
job discovery → AI-coached application → document management → recruiter pipeline → trial period tracking.

**Core differentiator**: the AI coaches and challenges users to create personalized CVs and cover letters
rather than auto-generating generic content.

## Stack

**Frontend** (`next-step/`)
- Vue 3 with `<script setup>` + TypeScript
- Pinia for state management
- Vite as build tool
- Tailwind CSS for styling
- Vue I18n — 4 languages: `en`, `fr`, `fi`, `sv`
- Axios for HTTP

**Backend** (`next-step-api/`)
- Express + Knex + SQLite
- JWT auth via `localStorage` key `auth_token`
- REST API

## Frontend structure

```
src/
├── modules/
│   ├── applications/     # Job application tracking (main feature)
│   ├── jobs/             # Job offers discovery
│   ├── companies/        # Company management
│   ├── calendar/         # Interview scheduling
│   ├── notifications/    # User notifications
│   ├── auth/             # Login, register, JWT
│   └── settings/         # User preferences
├── shared/
│   ├── components/       # Reusable UI components (ActionsMenu, SortButton, SharedMultiSelect, SharedDateFilter...)
│   ├── composables/      # Shared logic
│   └── utils/            # Helpers (date formatting, etc.)
└── router/               # Vue Router config + guards
```

## Stores (Pinia)
- `useApplicationsStore` — CRUD + filtering for job applications
- `useJobsStore` — job offers
- `useCompaniesStore` — company data
- `useCalendarStore` — calendar events
- `useNotificationsStore` — notifications

## Services (Axios)
- `applications.service` — `/api/applications`
- `jobs.service` — `/api/jobs`
- `companies.service` — `/api/companies`
- `calendar.service` — `/api/calendar`
- `auth.service` — `/api/auth`
- `notifications.service` — `/api/notifications`

## Conventions
- All components use `<script setup lang="ts">`
- Pinia stores use async actions + computed getters
- i18n keys follow pattern: `module.section.key` (ex: `applications.status.interview`)
- Dates displayed as DD/MM/YYYY, stored as ISO strings
- CSS variables for colors: `--color-primary`, `--color-success`, `--color-danger`, `--color-warning`, `--color-border`, `--color-surface-2`, `*-soft` variants
- Auth token stored in `localStorage` as `auth_token`

## Application statuses
`saved` → `applied` → `screening` → `technical_assessment` → `interview` → `final_round` → `offer_received`
Dead ends: `rejected`, `no_response`, `withdrawn`, `offer_declined`

## Documentation repo
All generated documentation is pushed to `B9R9/NextStep-Docs` in `/docs/front/` and `/docs/back/`.

## Current development state
- MVP functional, refactoring phase
- No unit tests yet
- Target markets: Finland, Sweden, Denmark, France
- Business model: Free / Pro (~€12/mo) / Recruiter (~€49/mo)
