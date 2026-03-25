# auth.ts — Auth Routes

**Path:** `next-step-api/src/routes/auth.ts`
**Router:** `authRoutes` — mounted at `/auth`
**Auth:** Required only on `/me`, `/password`, `/logout` (via `authMiddleware`)

---

## Overview

Gère l'inscription, la connexion, le double token JWT (access + refresh), la gestion du profil et la suppression de compte. Le refresh token est stocké haché en DB (`refresh_tokens`) avec rotation à chaque appel.

---

## Endpoints

### POST /auth/register
Crée un compte et ouvre une session.

**Payload:** `{ email: string, password: string (min 6), name: string (min 1) }`
**Response:** `{ user: { id, email, name }, accessToken: string }`
**Cookie:** pose `refresh_token` httpOnly
**Errors:** `400` payload invalide · `409` email déjà utilisé

---

### POST /auth/login
Authentifie un utilisateur existant.

**Payload:** `{ email: string, password: string }`
**Response:** `{ user: { id, email, name, preferred_language }, accessToken: string }`
**Cookie:** pose `refresh_token` httpOnly
**Errors:** `400` payload invalide · `401` email introuvable ou mot de passe incorrect

---

### POST /auth/refresh
Échange le refresh token cookie contre un nouvel access token (rotation).

**Auth:** cookie `refresh_token`
**Response:** `{ accessToken: string }`
**Sécurité:**
- Vérifie l'en-tête `Origin` contre `CORS_ORIGIN` (protection CSRF)
- Le token est comparé à son hash en DB (`refresh_tokens.token_hash`)
- L'ancien token est révoqué et un nouveau est émis
- Si le token est déjà révoqué → **tous** les tokens de l'utilisateur sont révoqués (détection de réutilisation)

**Errors:** `401` token absent / invalide / réutilisé · `403` origin non autorisée

---

### POST /auth/logout
Révoque le refresh token et supprime le cookie.

**Auth:** cookie `refresh_token` (optionnel — no-op si absent)
**Response:** `{ success: true }`

---

### GET /auth/me *(auth required)*
Retourne le profil de l'utilisateur courant.

**Response:** `{ id, email, name, preferred_language: string | null }`
**Errors:** `401` non authentifié

---

### PATCH /auth/me *(auth required)*
Met à jour le profil. Au moins un champ requis.

**Payload:** `{ name?: string (min 1), email?: string, preferred_language?: 'en' | 'fr' | 'fi' | 'sv' }`
**Response:** `{ id, email, name, preferred_language }`
**Errors:** `400` payload invalide · `401` non authentifié · `404` utilisateur introuvable · `409` email déjà utilisé

---

### PATCH /auth/password *(auth required)*
Change le mot de passe après vérification de l'ancien.

**Payload:** `{ currentPassword: string, newPassword: string (min 6) }`
**Response:** `{ success: true }`
**Errors:** `400` payload invalide · `401` mot de passe incorrect · `404` utilisateur introuvable

---

### DELETE /auth/me *(auth required)*
Supprime le compte et toutes les données associées.

**Payload:** `{ password: string }`
**Response:** `{ success: true }`
**Errors:** `400` payload invalide · `401` mot de passe incorrect · `404` utilisateur introuvable

---

## Token architecture

```
Login / Register
  └─ signAccessToken()  → { id, email }  15 min  (retourné au client)
  └─ signRefreshToken() → { id, email }  7 jours (cookie httpOnly)
  └─ hash(refreshToken) → refresh_tokens table (token_hash, user_id, expires_at)

Refresh
  └─ vérification hash DB → rotation (revoke ancien + issue nouveau)
  └─ token déjà révoqué → révocation totale (token reuse attack)

Cookie options
  └─ httpOnly: true
  └─ secure: NODE_ENV === 'production'
  └─ sameSite: production → 'none' | dev → 'lax'
  └─ maxAge: 7 jours
```

## Dependencies
- `db('users')`, `db('refresh_tokens')` — tables Knex
- `signAccessToken`, `signRefreshToken`, `verifyRefreshToken`, `hashToken` — `utils/jwt`
- `authMiddleware` — `middleware/auth`
- `trackEvent`, `getSessionId` — `utils/track`
- `bcryptjs` — hash du mot de passe
- `zod` — validation des payloads
