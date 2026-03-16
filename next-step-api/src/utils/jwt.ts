import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET || 'change-me'

export const signToken = (payload: Record<string, unknown>) =>
  jwt.sign(payload, secret, { expiresIn: '7d' })

export const verifyToken = (token: string) =>
  jwt.verify(token, secret) as { id: number; email: string }
