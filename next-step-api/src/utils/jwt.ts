import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'

const accessSecret = process.env.JWT_SECRET || 'change-me'
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'change-me-refresh'

export const signAccessToken = (payload: { id: number; email: string }) =>
  jwt.sign(payload, accessSecret, { expiresIn: '15m' })

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, accessSecret) as { id: number; email: string }

export const signRefreshToken = (payload: { id: number; email: string }) =>
  jwt.sign(payload, refreshSecret, { expiresIn: '7d' })

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, refreshSecret) as { id: number; email: string }

export const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex')

// Keep legacy alias used nowhere else but avoids breaking imports if any
export const signToken = signAccessToken
export const verifyToken = verifyAccessToken
