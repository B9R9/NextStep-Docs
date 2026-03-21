import type { NextFunction, Request, Response } from 'express'

const adminEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userEmail = (req as any).user?.email?.toLowerCase()
  if (!userEmail || !adminEmails.includes(userEmail)) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  return next()
}
