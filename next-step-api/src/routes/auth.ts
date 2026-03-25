import { Router } from 'express'
import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '../db/knex'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/jwt'
import { authMiddleware } from '../middleware/auth'
import { trackEvent, getSessionId } from '../utils/track'

const REFRESH_COOKIE = 'refresh_token'
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const isProd = process.env.NODE_ENV === 'production'

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: REFRESH_TTL_MS,
  path: '/',
}

async function issueTokens(res: Response, user: { id: number; email: string }) {
  const accessToken = signAccessToken({ id: user.id, email: user.email })
  const refreshToken = signRefreshToken({ id: user.id, email: user.email })
  const tokenHash = hashToken(refreshToken)
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS)

  await db('refresh_tokens').insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  })

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions)
  return accessToken
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const VALID_LOCALES = ['en', 'fr', 'fi', 'sv'] as const

const updateMeSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    preferred_language: z.enum(VALID_LOCALES).optional(),
  })
  .refine(
    (payload) =>
      payload.name !== undefined ||
      payload.email !== undefined ||
      payload.preferred_language !== undefined,
    { message: 'At least one field is required' },
  )

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

export const authRoutes = Router()

authRoutes.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    console.warn('[auth.register] invalid payload')
    return res.status(400).json({ message: 'Invalid payload' })
  }

  const { password, name } = parsed.data
  const email = parsed.data.email.trim().toLowerCase()
  const existing = await db('users').where({ email }).first()
  if (existing) {
    console.warn(`[auth.register] email already in use email=${email}`)
    return res.status(409).json({ message: 'Email already in use' })
  }

  const password_hash = await bcrypt.hash(password, 10)
  const [user] = await db('users')
    .insert({ email, password_hash, name })
    .returning(['id', 'email', 'name'])

  console.info(`[auth.register] success user=${user.id} email=${user.email}`)
  const accessToken = await issueTokens(res, user)
  trackEvent({ userId: user.id, event: 'auth.register', category: 'auth', metadata: { locale: req.headers['accept-language']?.slice(0, 2) }, sessionId: getSessionId(req), ip: req.ip, userAgent: req.headers['user-agent'] })
  return res.json({ user, accessToken })
})

authRoutes.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    console.warn('[auth.login] invalid payload')
    return res.status(400).json({ message: 'Invalid payload' })
  }

  const password = parsed.data.password
  const email = parsed.data.email.trim().toLowerCase()
  const user = await db('users').where({ email }).first()
  if (!user) {
    console.warn(`[auth.login] invalid credentials email=${email}`)
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) {
    console.warn(`[auth.login] invalid credentials email=${email}`)
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  console.info(`[auth.login] success user=${user.id} email=${user.email}`)
  const accessToken = await issueTokens(res, user)
  trackEvent({ userId: user.id, event: 'auth.login', category: 'auth', sessionId: getSessionId(req), ip: req.ip, userAgent: req.headers['user-agent'] })
  return res.json({
    user: { id: user.id, email: user.email, name: user.name },
    accessToken,
  })
})

authRoutes.post('/refresh', async (req: Request, res: Response) => {
  // Verify Origin to protect against CSRF (SameSite=None doesn't protect on its own)
  const origin = req.headers.origin
  const allowedOrigin = process.env.CORS_ORIGIN
  if (allowedOrigin && origin !== allowedOrigin) {
    console.warn(`[auth.refresh] origin mismatch origin=${origin}`)
    return res.status(403).json({ message: 'Forbidden' })
  }

  const refreshToken = req.cookies?.[REFRESH_COOKIE]
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token' })
  }

  let payload: { id: number; email: string }
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' })
  }

  const tokenHash = hashToken(refreshToken)
  const stored = await db('refresh_tokens')
    .where({ token_hash: tokenHash, user_id: payload.id })
    .whereNull('revoked_at')
    .where('expires_at', '>', new Date())
    .first()

  if (!stored) {
    // Possible token reuse — revoke all tokens for this user
    await db('refresh_tokens')
      .where({ user_id: payload.id })
      .update({ revoked_at: new Date() })
    console.warn(`[auth.refresh] token reuse detected user=${payload.id}`)
    res.clearCookie(REFRESH_COOKIE, { path: '/' })
    return res.status(401).json({ message: 'Token reuse detected' })
  }

  // Rotate: revoke old token
  await db('refresh_tokens').where({ id: stored.id }).update({ revoked_at: new Date() })

  const accessToken = await issueTokens(res, payload)
  console.info(`[auth.refresh] rotated user=${payload.id}`)
  return res.json({ accessToken })
})

authRoutes.post('/logout', async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE]
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken)
    await db('refresh_tokens')
      .where({ token_hash: tokenHash })
      .update({ revoked_at: new Date() })
  }
  res.clearCookie(REFRESH_COOKIE, { path: '/', secure: isProd, sameSite: isProd ? 'none' : 'lax' })
  return res.json({ success: true })
})

authRoutes.get('/me', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id
  if (!userId) return res.status(401).json({ message: 'Unauthorized' })
  const user = await db('users').where({ id: userId }).first()
  return res.json({ id: user.id, email: user.email, name: user.name, preferred_language: user.preferred_language ?? null })
})

authRoutes.patch('/me', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id
  if (!userId) {
    console.warn('[auth.patchMe] unauthorized')
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const parsed = updateMeSchema.safeParse(req.body)
  if (!parsed.success) {
    console.warn(`[auth.patchMe] invalid payload user=${userId}`, parsed.error.issues)
    return res.status(400).json({ message: 'Invalid payload' })
  }

  const payload: { name?: string; email?: string; preferred_language?: string } = {}
  if (parsed.data.name !== undefined) payload.name = parsed.data.name.trim()
  if (parsed.data.email !== undefined) payload.email = parsed.data.email.trim().toLowerCase()
  if (parsed.data.preferred_language !== undefined) payload.preferred_language = parsed.data.preferred_language
  console.info(`[auth.patchMe] payload user=${userId}`, payload)

  if (payload.email) {
    const existing = await db('users')
      .whereRaw('LOWER(email) = LOWER(?)', [payload.email])
      .whereNot({ id: userId })
      .first()
    if (existing) {
      console.warn(`[auth.patchMe] email already in use user=${userId} email=${payload.email}`)
      return res.status(409).json({ message: 'Email already in use' })
    }
  }

  const [updated] = await db('users')
    .where({ id: userId })
    .update(payload)
    .returning(['id', 'email', 'name', 'preferred_language'])

  if (!updated) {
    console.warn(`[auth.patchMe] user not found user=${userId}`)
    return res.status(404).json({ message: 'User not found' })
  }

  console.info(`[auth.patchMe] success user=${updated.id}`)
  return res.json(updated)
})

authRoutes.patch('/password', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id
  if (!userId) {
    console.warn('[auth.patchPassword] unauthorized')
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const parsed = updatePasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    console.warn(`[auth.patchPassword] invalid payload user=${userId}`)
    return res.status(400).json({ message: 'Invalid payload' })
  }

  const user = await db('users').where({ id: userId }).first()
  if (!user) return res.status(404).json({ message: 'User not found' })

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.password_hash)
  if (!ok) {
    console.warn(`[auth.patchPassword] wrong current password user=${userId}`)
    return res.status(401).json({ message: 'Invalid current password' })
  }

  const nextPasswordHash = await bcrypt.hash(parsed.data.newPassword, 10)
  await db('users').where({ id: userId }).update({ password_hash: nextPasswordHash })

  console.info(`[auth.patchPassword] success user=${userId}`)
  return res.json({ success: true })
})

authRoutes.delete('/me', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id
  if (!userId) {
    console.warn('[auth.deleteMe] unauthorized')
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { password } = req.body as { password?: string }
  if (!password) return res.status(400).json({ message: 'Password required' })

  const user = await db('users').where({ id: userId }).first()
  if (!user) return res.status(404).json({ message: 'User not found' })

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) {
    console.warn(`[auth.deleteMe] wrong password user=${userId}`)
    return res.status(401).json({ message: 'Invalid password' })
  }

  const [appCount] = await db('applications').where({ user_id: userId }).count('* as c')
  const [jobCount] = await db('jobs').where({ user_id: userId }).count('* as c')
  const daysSinceRegister = Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000)
  trackEvent({ userId, event: 'auth.account_deleted', category: 'auth', metadata: { reason: (req.body as any).reason || null, days_since_register: daysSinceRegister, total_applications: Number(appCount.c), total_jobs: Number(jobCount.c) }, sessionId: getSessionId(req), ip: req.ip, userAgent: req.headers['user-agent'] })

  // Cascade deletes refresh_tokens via FK
  await db('users').where({ id: userId }).del()
  res.clearCookie(REFRESH_COOKIE, { path: '/', secure: isProd, sameSite: isProd ? 'none' : 'lax' })
  console.info(`[auth.deleteMe] success user=${userId}`)
  return res.json({ success: true })
})
