import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '../db/knex'
import { signToken } from '../utils/jwt'
import { authMiddleware } from '../middleware/auth'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const updateMeSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
  })
  .refine((payload) => payload.name !== undefined || payload.email !== undefined, {
    message: 'At least one field is required',
  })

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

export const authRoutes = Router()

authRoutes.post('/register', async (req, res) => {
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
  const token = signToken({ id: user.id, email: user.email })
  return res.json({ user, token })
})

authRoutes.post('/login', async (req, res) => {
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
  const token = signToken({ id: user.id, email: user.email })
  return res.json({
    user: { id: user.id, email: user.email, name: user.name },
    token,
  })
})

authRoutes.get('/me', authMiddleware, async (req, res) => {
  const userId = (req as any).user?.id
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  const user = await db('users').where({ id: userId }).first()
  return res.json({ id: user.id, email: user.email, name: user.name })
})

authRoutes.patch('/me', authMiddleware, async (req, res) => {
  const userId = (req as any).user?.id
  if (!userId) {
    console.warn('[auth.patchMe] unauthorized')
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const parsed = updateMeSchema.safeParse(req.body)
  if (!parsed.success) {
    console.warn(`[auth.patchMe] invalid payload user=${userId}`)
    return res.status(400).json({ message: 'Invalid payload' })
  }

  const payload: { name?: string; email?: string } = {}
  if (parsed.data.name !== undefined) {
    payload.name = parsed.data.name.trim()
  }
  if (parsed.data.email !== undefined) {
    payload.email = parsed.data.email.trim().toLowerCase()
  }

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
    .returning(['id', 'email', 'name'])

  if (!updated) {
    console.warn(`[auth.patchMe] user not found user=${userId}`)
    return res.status(404).json({ message: 'User not found' })
  }

  console.info(`[auth.patchMe] success user=${updated.id}`)
  return res.json(updated)
})

authRoutes.patch('/password', authMiddleware, async (req, res) => {
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
  if (!user) {
    console.warn(`[auth.patchPassword] user not found user=${userId}`)
    return res.status(404).json({ message: 'User not found' })
  }

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

authRoutes.delete('/me', authMiddleware, async (req, res) => {
  const userId = (req as any).user?.id
  if (!userId) {
    console.warn('[auth.deleteMe] unauthorized')
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { password } = req.body as { password?: string }
  if (!password) {
    return res.status(400).json({ message: 'Password required' })
  }

  const user = await db('users').where({ id: userId }).first()
  if (!user) {
    console.warn(`[auth.deleteMe] user not found user=${userId}`)
    return res.status(404).json({ message: 'User not found' })
  }

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) {
    console.warn(`[auth.deleteMe] wrong password user=${userId}`)
    return res.status(401).json({ message: 'Invalid password' })
  }

  await db('users').where({ id: userId }).del()
  console.info(`[auth.deleteMe] success user=${userId}`)
  return res.json({ success: true })
})
