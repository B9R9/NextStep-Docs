# NextStep — Admin Analytics & User Tracking

## Spec Technique — v1.1

---

## 1. Vue d'ensemble

Mettre en place un système de statistiques admin pour le fondateur, permettant de comprendre l'utilisation de la plateforme, le comportement des utilisateurs, et d'identifier les leviers d'amélioration produit et de conversion.

**Architecture en 2 couches :**

- **Couche 1 — KPIs agrégés** : requêtes SQL directes sur les tables existantes (users, applications, jobs, companies, calendar_events). Zéro migration nécessaire pour démarrer.
- **Couche 2 — Event tracking** : nouvelle table `user_events` pour logger les actions détaillées et alimenter des analyses granulaires dans le temps.

---

## 2. Accès admin

### 2.1 Stratégie de protection

Pas besoin d'un système de rôles complet à ce stade. On utilise une approche simple et sécurisée :

**Option retenue : liste blanche d'emails en variable d'environnement.**

```env
ADMIN_EMAILS=baptiste@nextstep.app
```

**Middleware admin :**

```ts
// src/middleware/admin.ts
import type { NextFunction, Request, Response } from 'express'

const adminEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userEmail = (req as any).user?.email?.toLowerCase()
  if (!userEmail || !adminEmails.includes(userEmail)) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  return next()
}
```

**Montage dans index.ts :**

```ts
import { adminRoutes } from './routes/admin'
app.use('/admin', authMiddleware, adminMiddleware, adminRoutes)
```

**Évolution future :** quand le produit grandira, migrer vers une colonne `role` sur la table `users` (valeurs : `user`, `admin`, `superadmin`).

### 2.2 Route frontend

Ajouter une route `/admin` dans le router Vue, protégée par un guard qui vérifie le rôle côté API (appel `GET /admin/me` qui retourne 200 ou 403).

---

## 3. Couche 1 — KPIs agrégés (pas de migration)

Ces métriques sont calculées en temps réel par des requêtes SQL sur les tables existantes. Elles alimentent le dashboard admin via une seule route API.

### 3.1 Route API

```
GET /admin/stats/overview
```

**Réponse :**

```json
{
  "users": {
    "total": 342,
    "registeredToday": 5,
    "registeredThisWeek": 28,
    "registeredThisMonth": 89,
    "activeThisWeek": 156,
    "activeThisMonth": 243,
    "churned30d": 42
  },
  "applications": {
    "total": 4210,
    "avgPerUser": 12.3,
    "byStatus": {
      "saved": 890,
      "applied": 1240,
      "screening": 380,
      "interview": 290,
      "offer_received": 45,
      "rejected": 820,
      "no_response": 545
    },
    "withCV": 2890,
    "withCL": 1950,
    "createdThisWeek": 312
  },
  "jobs": {
    "total": 2100,
    "createdThisWeek": 145,
    "avgPerUser": 6.1
  },
  "companies": {
    "total": 890,
    "topIndustries": [
      { "industry": "tech", "count": 340 },
      { "industry": "finance", "count": 180 },
      { "industry": "healthcare", "count": 95 }
    ]
  },
  "engagement": {
    "usersWithApplications": 298,
    "usersWithJobs": 275,
    "usersWithCalendarEvents": 189,
    "usersNeverUsedCompanies": 44,
    "usersNeverUsedCalendar": 153,
    "avgApplicationsPerActiveUser": 15.2,
    "medianApplicationsPerUser": 8
  },
  "conversion": {
    "registeredToFirstApplication": 0.78,
    "applicationToInterview": 0.12,
    "interviewToOffer": 0.15
  },
  "locale": {
    "en": 142,
    "fr": 98,
    "fi": 78,
    "sv": 24
  }
}
```

### 3.2 Requêtes SQL clés (Knex)

```ts
// Utilisateurs actifs cette semaine = ceux qui ont créé/modifié quelque chose
const activeThisWeek = await db('users')
  .where('id', 'in',
    db.union([
      db('applications').select('user_id').where('updated_at', '>=', weekAgo),
      db('jobs').select('user_id').where('updated_at', '>=', weekAgo),
      db('companies').select('user_id').where('updated_at', '>=', weekAgo),
      db('calendar_events').select('user_id').where('updated_at', '>=', weekAgo),
    ])
  )
  .count('* as count')

// Distribution des statuts de candidatures
const byStatus = await db('applications')
  .select('status')
  .count('* as count')
  .groupBy('status')

// Taux de conversion inscription → première candidature
const usersWithApp = await db('applications')
  .countDistinct('user_id as count')
const totalUsers = await db('users').count('* as count')

// Features jamais touchées — users sans companies
const neverUsedCompanies = await db('users')
  .whereNotIn('id', db('companies').distinct('user_id'))
  .count('* as count')

// Features jamais touchées — users sans calendar events
const neverUsedCalendar = await db('users')
  .whereNotIn('id', db('calendar_events').distinct('user_id'))
  .count('* as count')
```

### 3.3 Catalogue complet des métriques

| Catégorie | Métrique | Source | Utilité produit |
|---|---|---|---|
| **Inscriptions** | Total users, par jour/semaine/mois | `users.created_at` | Croissance |
| **Rétention** | Actifs 7j / 30j / churned 30j | `*.updated_at` croisé | Sticky features |
| **Funnel candidature** | Distribution par statut | `applications.status` | Santé du pipeline utilisateur |
| **Adoption features** | % users avec CV, CL, calendar | `applications.hasCV/hasCL`, `calendar_events` | Features qui collent |
| **Features ignorées** | Users qui n'ont jamais touché companies, calendar, etc. | LEFT JOIN / NOT IN | Features mal découvertes |
| **Volume** | Applications/jobs/companies créés par période | `*.created_at` | Vélocité plateforme |
| **Top industries** | Industries les plus trackées | `companies.industry` | Segments marché |
| **Taux de conversion** | Inscription→app, app→interview, interview→offer | `applications.status` + `users` | Valeur perçue |
| **Engagement moyen** | Applications par user, médiane | `applications` GROUP BY | Profils d'usage |
| **Locale** | Répartition des langues utilisées | `user_events` (locale.changed) ou préférence user | Priorisation marchés |

---

## 4. Couche 2 — Event tracking

### 4.1 Migration : table `user_events`

```ts
// migrations/XXXXXX_create_user_events.js
exports.up = async function(knex) {
  await knex.schema.createTable('user_events', (table) => {
    table.bigIncrements('id').primary()
    table.bigInteger('user_id').notNullable()
    table.string('event', 80).notNullable()      // ex: 'application.created'
    table.string('category', 40).notNullable()    // ex: 'applications'
    table.json('metadata').nullable()              // détails libres (JSON)
    table.string('session_id', 36).nullable()      // UUID de session pour grouper les actions
    table.string('ip', 45).nullable()              // optionnel, RGPD-aware
    table.string('user_agent', 500).nullable()     // device tracking basique
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())

    table.foreign('user_id').references('users.id').onDelete('CASCADE')
    table.index(['user_id'])
    table.index(['event'])
    table.index(['category'])
    table.index(['created_at'])
    table.index(['user_id', 'created_at'])
    table.index(['session_id'])
  })
}
```

> **Note : `session_id`** — un UUID généré côté frontend au début de chaque session (stocké en `sessionStorage`), envoyé dans un header custom `X-Session-Id`. Permet de calculer la profondeur de session et la fréquence de retour sans cookies tiers.

### 4.2 Events à tracker

```
CATÉGORIE              EVENT                          METADATA
───────────────────────────────────────────────────────────────────────

auth                   auth.register                  { locale }
auth                   auth.login                     { locale }
auth                   auth.password_changed          {}
auth                   auth.account_deleted            { reason?, days_since_register, total_applications, total_jobs }

applications           application.created            { status, hasCV, hasCL, company_id }
applications           application.updated            { field, oldValue, newValue }
applications           application.status_changed     { from, to }
applications           application.deleted            { status }

jobs                   job.created                    { company_id, contract, industry }
jobs                   job.updated                    { fields_changed: [...] }
jobs                   job.deleted                    {}

companies              company.created                { industry }
companies              company.updated                { fields_changed: [...] }
companies              company.deleted                {}

calendar               calendar_event.created         { type }
calendar               calendar_event.updated         {}
calendar               calendar_event.deleted         {}

navigation             page.viewed                    { route, referrer, locale }
navigation             session.started                { device_type, locale, screen_width }

forms                  form.opened                    { form: 'application' | 'job' | 'company' | 'calendar_event' }
forms                  form.abandoned                 { form, time_spent_ms, fields_filled }
forms                  form.submitted                 { form, time_spent_ms }

locale                 locale.changed                 { from, to }

limits                 free_limit.approaching         { feature, current_count, limit, percent: 80 }
limits                 free_limit.hit                 { feature, current_count, limit }
```

### 4.3 Helper d'insertion

```ts
// src/utils/track.ts
import { db } from '../db/knex'

interface TrackOptions {
  userId: number
  event: string
  category: string
  metadata?: Record<string, any>
  sessionId?: string
  ip?: string
  userAgent?: string
}

export async function trackEvent(opts: TrackOptions): Promise<void> {
  try {
    await db('user_events').insert({
      user_id: opts.userId,
      event: opts.event,
      category: opts.category,
      metadata: opts.metadata ? JSON.stringify(opts.metadata) : null,
      session_id: opts.sessionId || null,
      ip: opts.ip || null,
      user_agent: opts.userAgent || null,
    })
  } catch (err) {
    // Fire-and-forget : ne jamais bloquer la requête principale
    console.error('[track] failed to log event', opts.event, err)
  }
}

// Helper pour extraire le session_id du header
export function getSessionId(req: any): string | undefined {
  return req.headers['x-session-id'] || undefined
}
```

### 4.4 Intégration dans les routes existantes

Exemple pour `applications.ts` :

```ts
import { trackEvent, getSessionId } from '../utils/track'

// Dans le handler POST /applications
const [created] = await db('applications').insert(payload).returning('*')

// Fire-and-forget tracking
trackEvent({
  userId,
  event: 'application.created',
  category: 'applications',
  metadata: { status: payload.status, hasCV: payload.hasCV, hasCL: payload.hasCL },
  sessionId: getSessionId(req),
  ip: req.ip,
  userAgent: req.headers['user-agent'],
})

return res.json(created)
```

Exemple pour `auth.ts` — suppression de compte avec contexte :

```ts
// Dans le handler DELETE /auth/me
const appCount = await db('applications').where({ user_id: userId }).count('* as c')
const jobCount = await db('jobs').where({ user_id: userId }).count('* as c')
const daysSinceRegister = Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000)

trackEvent({
  userId,
  event: 'auth.account_deleted',
  category: 'auth',
  metadata: {
    reason: req.body.reason || null,
    days_since_register: daysSinceRegister,
    total_applications: Number(appCount[0].c),
    total_jobs: Number(jobCount[0].c),
  },
})

await db('users').where({ id: userId }).del()
```

### 4.5 Session tracking côté frontend

```ts
// src/shared/utils/session.ts
const SESSION_KEY = 'ns_session_id'

export function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}
```

```ts
// src/shared/api/http.ts — ajouter dans l'intercepteur requête
import { getOrCreateSessionId } from '../utils/session'

http.interceptors.request.use((config) => {
  // ... existing token logic ...
  config.headers['X-Session-Id'] = getOrCreateSessionId()
  return config
})
```

### 4.6 Form tracking côté frontend

```ts
// src/shared/composables/useFormTracking.ts
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { trackFormEvent } from '../api/tracking.service'

export function useFormTracking(formName: string) {
  const openedAt = ref<number>(0)
  const fieldsFilled = ref<Set<string>>(new Set())

  function onFieldFilled(fieldName: string) {
    fieldsFilled.value.add(fieldName)
  }

  function trackOpened() {
    openedAt.value = Date.now()
    trackFormEvent('form.opened', { form: formName })
  }

  function trackSubmitted() {
    const timeSpent = Date.now() - openedAt.value
    trackFormEvent('form.submitted', { form: formName, time_spent_ms: timeSpent })
  }

  function trackAbandoned() {
    if (openedAt.value === 0) return
    const timeSpent = Date.now() - openedAt.value
    trackFormEvent('form.abandoned', {
      form: formName,
      time_spent_ms: timeSpent,
      fields_filled: fieldsFilled.value.size,
    })
  }

  onMounted(trackOpened)
  onBeforeUnmount(trackAbandoned)

  return { onFieldFilled, trackSubmitted, trackAbandoned }
}
```

### 4.7 Routes admin event tracking

```
GET /admin/stats/events
  ?event=application.created
  &category=applications
  &from=2026-01-01
  &to=2026-03-21
  &group_by=day|week|month

GET /admin/stats/events/timeline
  → séries temporelles pour graphiques

GET /admin/stats/users/:id/activity
  → historique complet d'un user spécifique
```

---

## 5. Métriques avancées (dérivées de la Couche 2)

Ces métriques nécessitent la Couche 2 (event tracking) pour être calculées. Elles sont exposées via des routes admin dédiées.

### 5.1 Activation & onboarding

| Métrique | Calcul | Route API | Utilité |
|---|---|---|---|
| **Time-to-first-value** | Délai entre `auth.register` et premier `application.created` pour le même `user_id` | `GET /admin/stats/activation` | Si médiane > 24h, l'onboarding a un problème. Cible : < 30 min. |
| **Taux d'activation** | % d'inscrits qui créent ≥ 1 application dans les 7 premiers jours | même route | Conversion inscription → utilisateur actif |
| **Activation par locale** | Même calcul ventilé par langue (metadata `locale` du `auth.register`) | même route | Identifier quel marché accroche le mieux |

```ts
// Requête : time-to-first-value
const ttfv = await db('user_events as register')
  .join('user_events as first_app', function() {
    this.on('register.user_id', '=', 'first_app.user_id')
      .andOn('first_app.event', '=', db.raw("'application.created'"))
  })
  .where('register.event', 'auth.register')
  .select(
    'register.user_id',
    db.raw("(strftime('%s', first_app.created_at) - strftime('%s', register.created_at)) as seconds_to_first_app")
  )
  .orderBy('first_app.created_at')
  .groupBy('register.user_id')
```

### 5.2 Profondeur de session & fréquence

| Métrique | Calcul | Route API | Utilité |
|---|---|---|---|
| **Profondeur de session** | Nombre d'events par `session_id` | `GET /admin/stats/sessions` | Un user qui se connecte et fait 1 action vs 15 = signal très différent |
| **Durée de session** | Diff entre premier et dernier event d'un même `session_id` | même route | Sessions courtes = friction ou pas de contenu |
| **Fréquence de retour** | Nombre de jours distincts avec ≥1 event, par user, sur les 30 derniers jours | `GET /admin/stats/retention` | Daily active vs weekly active vs monthly active |
| **Distribution des fréquences** | Histogramme : combien de users reviennent 1j, 2-3j, 4-7j, 8-14j, 15+j sur 30j | même route | Forme de la courbe engagement |

```json
// Exemple réponse GET /admin/stats/sessions
{
  "avgDepth": 8.3,
  "medianDepth": 6,
  "avgDurationMinutes": 12.4,
  "depthDistribution": {
    "1-2": 145,
    "3-5": 230,
    "6-10": 180,
    "11-20": 95,
    "21+": 32
  }
}
```

### 5.3 Rétention par cohortes

| Métrique | Calcul | Route API | Utilité |
|---|---|---|---|
| **Cohortes hebdomadaires** | Pour chaque semaine d'inscription, % encore actifs à J+7, J+14, J+30, J+60 | `GET /admin/stats/cohorts` | La VRAIE courbe de rétention — pas juste "actifs cette semaine" |
| **Cohortes par locale** | Même chose ventilé par langue d'inscription | même route, `?by=locale` | Quel marché retient le mieux |

```json
// Exemple réponse GET /admin/stats/cohorts
{
  "cohorts": [
    {
      "week": "2026-03-03",
      "registered": 45,
      "retainedDay7": 0.62,
      "retainedDay14": 0.44,
      "retainedDay30": 0.31,
      "retainedDay60": null
    },
    {
      "week": "2026-02-24",
      "registered": 38,
      "retainedDay7": 0.58,
      "retainedDay14": 0.39,
      "retainedDay30": 0.28,
      "retainedDay60": null
    }
  ]
}
```

### 5.4 Complétion de formulaires

| Métrique | Calcul | Route API | Utilité |
|---|---|---|---|
| **Taux de complétion** | `form.submitted` / `form.opened` par type de form | `GET /admin/stats/forms` | Si 40% abandonnent le form application, il est trop long |
| **Temps moyen de complétion** | Moyenne de `time_spent_ms` des `form.submitted` | même route | Benchmark : si > 5 min pour une candidature, simplifier |
| **Champs remplis avant abandon** | Distribution de `fields_filled` sur les `form.abandoned` | même route | Identifier LE champ qui fait décrocher |

```json
// Exemple réponse GET /admin/stats/forms
{
  "application": {
    "opened": 520,
    "submitted": 380,
    "abandoned": 140,
    "completionRate": 0.73,
    "avgTimeToSubmitMs": 142000,
    "abandonedAvgFieldsFilled": 2.3
  },
  "job": {
    "opened": 310,
    "submitted": 245,
    "abandoned": 65,
    "completionRate": 0.79,
    "avgTimeToSubmitMs": 198000,
    "abandonedAvgFieldsFilled": 3.1
  }
}
```

### 5.5 Conversion & signaux Free→Pro

| Métrique | Calcul | Route API | Utilité |
|---|---|---|---|
| **Storage investment score** | Par user : nb applications + nb CV attachés + nb CL attachés | `GET /admin/stats/conversion` | Plus le score est haut, plus le user a de raisons d'upgrader Pro. Suivre la distribution. |
| **Proximité des limites Free** | Users à 80%+ d'une limite Free tier | même route | Anticiper les nudges AVANT le mur, pas après |
| **Limites atteintes** | Count de `free_limit.hit` par feature | même route | Quelle feature fait le plus buter |
| **Conversion post-limit** | % des users ayant hit une limite qui upgradent dans les 7j suivants | même route (quand billing implémenté) | Efficacité du hard block |

```json
// Exemple réponse GET /admin/stats/conversion
{
  "storageInvestment": {
    "distribution": {
      "0-5": 89,
      "6-15": 134,
      "16-30": 78,
      "31-50": 45,
      "51+": 12
    },
    "avgScore": 14.2,
    "medianScore": 11
  },
  "freeLimits": {
    "approaching80pct": {
      "active_applications": 23,
      "saved_jobs": 15,
      "cv_versions": 8
    },
    "limitHits": {
      "active_applications": 67,
      "saved_jobs": 34,
      "ai_cover_letters": 22,
      "cv_versions": 18
    }
  }
}
```

### 5.6 Suppressions de compte

| Métrique | Calcul | Route API | Utilité |
|---|---|---|---|
| **Taux de suppression** | Comptes supprimés / total inscrits, par période | `GET /admin/stats/churn` | Santé globale |
| **Lifecycle à la suppression** | Distribution de `days_since_register` dans les events `auth.account_deleted` | même route | Suppression à J+2 = onboarding raté. À J+90 = valeur disparue. |
| **Raison de suppression** | Agrégation du champ `reason` (optionnel) | même route | Feedback qualitatif gratuit |
| **Profil à la suppression** | Moyenne de `total_applications` et `total_jobs` des users qui delete | même route | Users "vides" qui partent vs users investis = problèmes différents |

```json
// Exemple réponse GET /admin/stats/churn
{
  "deletionsThisMonth": 12,
  "deletionRate30d": 0.035,
  "lifecycleDistribution": {
    "0-2d": 4,
    "3-7d": 3,
    "8-30d": 3,
    "31-90d": 2,
    "90d+": 0
  },
  "reasons": {
    "found_a_job": 3,
    "not_useful": 2,
    "too_complex": 1,
    "no_reason_given": 6
  },
  "avgApplicationsAtDeletion": 4.2,
  "avgJobsAtDeletion": 2.8
}
```

---

## 6. Santé technique (Couche 1 — logs existants)

Ces métriques exploitent le logging déjà en place dans `index.ts` (status code, `durationMs`, route). Deux approches possibles :

### Option A — Agrégation du middleware existant (recommandé pour démarrer)

Stocker un compteur en mémoire dans le middleware de logging existant, exposé via une route admin.

```ts
// src/utils/apiMetrics.ts
interface RouteMetric {
  count: number
  errors4xx: number
  errors5xx: number
  totalMs: number
  maxMs: number
}

const metrics: Record<string, RouteMetric> = {}

export function recordRequest(method: string, path: string, status: number, durationMs: number) {
  // Normaliser le path : /applications/123 → /applications/:id
  const normalized = `${method} ${path.replace(/\/\d+/g, '/:id')}`
  if (!metrics[normalized]) {
    metrics[normalized] = { count: 0, errors4xx: 0, errors5xx: 0, totalMs: 0, maxMs: 0 }
  }
  const m = metrics[normalized]
  m.count++
  m.totalMs += durationMs
  if (durationMs > m.maxMs) m.maxMs = durationMs
  if (status >= 400 && status < 500) m.errors4xx++
  if (status >= 500) m.errors5xx++
}

export function getMetrics() { return metrics }
export function resetMetrics() { Object.keys(metrics).forEach(k => delete metrics[k]) }
```

### Option B — Table `api_metrics_daily` (si besoin d'historique)

```ts
// Migration future si nécessaire
table.string('route', 120).notNullable()
table.date('date').notNullable()
table.integer('request_count').defaultTo(0)
table.integer('error_4xx_count').defaultTo(0)
table.integer('error_5xx_count').defaultTo(0)
table.integer('avg_response_ms').defaultTo(0)
table.integer('max_response_ms').defaultTo(0)
```

### 6.1 Métriques techniques

| Métrique | Source | Route API | Utilité |
|---|---|---|---|
| **Taux d'erreur par route** | Compteurs 4xx/5xx | `GET /admin/stats/api` | Route cassée = users qui souffrent en silence |
| **Temps de réponse moyen** | `durationMs` du middleware | même route | Détecter les requêtes lentes avant que ça devienne un problème |
| **Temps de réponse max** | Max de `durationMs` par route | même route | Worst case scenario |
| **Routes les plus appelées** | Count par route normalisée | même route | Savoir où concentrer l'optimisation |

```json
// Exemple réponse GET /admin/stats/api
{
  "since": "2026-03-21T00:00:00Z",
  "routes": [
    {
      "route": "GET /applications",
      "count": 1240,
      "errors4xx": 12,
      "errors5xx": 0,
      "avgMs": 45,
      "maxMs": 320,
      "errorRate": 0.0097
    },
    {
      "route": "POST /applications",
      "count": 380,
      "errors4xx": 8,
      "errors5xx": 2,
      "avgMs": 89,
      "maxMs": 1200,
      "errorRate": 0.026
    }
  ]
}
```

---

## 7. Routes admin complètes

```
Prefix: /admin (authMiddleware + adminMiddleware)

── Accès ──
GET  /admin/me                        → vérifie l'accès admin (200 ou 403)

── Couche 1 : KPIs agrégés ──
GET  /admin/stats/overview            → KPIs globaux (users, volumes, conversion, locale)
GET  /admin/stats/users               → liste paginée des users + métriques par user
GET  /admin/stats/users/:id           → détail d'un user (activité, volumes, investment score)
GET  /admin/stats/growth              → courbes inscription/activation/rétention
GET  /admin/stats/funnel              → funnel candidature détaillé
GET  /admin/stats/features            → adoption des features (CV, CL, calendar, companies)

── Couche 2 : Event tracking ──
GET  /admin/stats/events              → event log filtrable (category, event, date range, group_by)
GET  /admin/stats/events/timeline     → séries temporelles pour graphiques

── Métriques avancées (Couche 2 requise) ──
GET  /admin/stats/activation          → time-to-first-value, taux activation, par locale
GET  /admin/stats/sessions            → profondeur, durée, distribution
GET  /admin/stats/cohorts             → rétention par cohorte d'inscription (?by=locale)
GET  /admin/stats/forms               → complétion formulaires par type
GET  /admin/stats/conversion          → storage investment, proximité limites Free, limit hits
GET  /admin/stats/churn               → suppressions, lifecycle, raisons, profil à la suppression

── Santé technique ──
GET  /admin/stats/api                 → erreurs par route, temps de réponse, volume
```

---

## 8. Dashboard frontend (vue admin)

### 8.1 Structure suggérée

```
src/modules/admin/
├── routes.ts
├── pages/
│   └── AdminDashboard.vue
├── components/
│   ├── AdminKpiCards.vue              ← cartes chiffres clés (total users, actifs, apps, etc.)
│   ├── AdminGrowthChart.vue           ← courbe inscriptions/actifs dans le temps
│   ├── AdminFunnelChart.vue           ← funnel par statut de candidature
│   ├── AdminFeatureAdoption.vue       ← barres adoption features + features ignorées
│   ├── AdminLocaleBreakdown.vue       ← répartition par langue
│   ├── AdminActivationMetrics.vue     ← time-to-first-value + taux activation
│   ├── AdminSessionStats.vue          ← profondeur & durée de session
│   ├── AdminCohortTable.vue           ← tableau rétention par cohorte
│   ├── AdminFormCompletion.vue        ← taux de complétion des forms
│   ├── AdminConversionSignals.vue     ← storage investment + free limits
│   ├── AdminChurnAnalysis.vue         ← suppressions + lifecycle + raisons
│   ├── AdminApiHealth.vue             ← erreurs par route + temps de réponse
│   ├── AdminUsersTable.vue            ← liste users paginée
│   └── AdminEventLog.vue             ← log d'events filtrable
├── stores/
│   └── admin.store.ts
└── services/
    └── admin.service.ts
```

### 8.2 Guard de route

```ts
// src/modules/admin/routes.ts
export const adminRoutes = [
  {
    path: '/admin',
    component: () => import('./pages/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]
```

```ts
// Dans le router guard
if (to.meta.requiresAdmin) {
  try {
    await axios.get('/admin/me')
  } catch {
    return next({ name: 'home' })
  }
}
```

---

## 9. Plan d'implémentation

### Phase 1 — Accès admin + KPIs (1-2 jours)

1. Créer `src/middleware/admin.ts`
2. Ajouter `ADMIN_EMAILS` dans `.env`
3. Créer `src/utils/apiMetrics.ts` (compteurs en mémoire)
4. Intégrer `recordRequest()` dans le middleware de logging existant dans `index.ts`
5. Créer `src/routes/admin.ts` avec :
   - `GET /admin/me`
   - `GET /admin/stats/overview` (KPIs agrégés)
   - `GET /admin/stats/api` (santé technique)
6. Frontend : module admin basique avec les KPI cards + locale breakdown + api health

### Phase 2 — Event tracking (1-2 jours)

1. Migration `user_events`
2. Créer `src/utils/track.ts`
3. Intégrer `trackEvent()` dans les routes backend : auth, applications, jobs, companies, calendar
4. Ajouter `session_id` dans le frontend (intercepteur Axios + sessionStorage)
5. Routes : `GET /admin/stats/events`, `GET /admin/stats/events/timeline`

### Phase 3 — Métriques avancées (2-3 jours)

1. Routes activation, sessions, cohorts, forms, conversion, churn
2. Composable frontend `useFormTracking` + intégration dans les 4 formulaires (application, job, company, calendar_event)
3. Tracking `locale.changed` dans le `LanguageSelector.vue`

### Phase 4 — Dashboard riche (2-3 jours)

1. Composants graphiques (Chart.js via vue-chartjs)
2. Courbes de croissance, funnel, adoption, cohortes
3. Table users paginée avec investment score
4. Event log filtrable
5. API health dashboard

### Phase 5 — Navigation & limits tracking (optionnel)

1. Middleware Vue Router pour logger `page.viewed`
2. Appel `POST /api/events/page` (route authentifiée, pas admin)
3. Tracking `free_limit.approaching` (à 80%) et `free_limit.hit` (à 100%)
4. Ajouter champ `reason` optionnel dans le flow de suppression de compte (`DeleteAccountDialog`)

---

## 10. Considérations RGPD

Puisque tu cibles la Finlande, la Suède, le Danemark et la France — tous sous RGPD :

- **IP** : stocker uniquement si nécessaire, ou hasher. Prévoir un champ optionnel et une purge automatique après 90 jours.
- **User agent** : acceptable pour analytics agrégées (device type), mais pas de fingerprinting.
- **Session ID** : UUID aléatoire en `sessionStorage`, pas un cookie persistant. Aucun tracking cross-session, aucun tracking cross-site. Conforme RGPD.
- **Droit à l'effacement** : le `ON DELETE CASCADE` sur `user_id` dans `user_events` gère déjà la suppression quand un user delete son compte.
- **Consentement** : comme il s'agit d'analytics internes (pas de tiers), le legitimate interest est applicable. Mentionner dans la privacy policy que des analytics internes sont collectées.
- **Rétention** : prévoir un job de purge des events > 12 mois si le volume grossit.
- **Raison de suppression** : champ libre optionnel — ne jamais le rendre obligatoire (droit de ne pas justifier).

---

## 11. Volumétrie et performance

Avec SQLite, les requêtes agrégées restent rapides jusqu'à ~100K events. Au-delà :

- Ajouter un cache en mémoire (5 min TTL) sur `/admin/stats/overview` et les routes de métriques avancées
- Les index sur `user_events` (created_at, event, category, session_id, user_id+created_at) couvrent les requêtes principales
- Les métriques API (`apiMetrics.ts`) sont en mémoire pure — coût zéro en DB. Reset quotidien optionnel avec sauvegarde dans `api_metrics_daily`.
- Si > 500K events/mois → envisager une table de pré-agrégation `daily_stats` remplie par un cron quotidien
- Les requêtes de cohortes sont les plus coûteuses — les cacher agressivement (TTL 15 min)
- Migration vers PostgreSQL quand le trafic le justifie (le passage est simple avec Knex)
