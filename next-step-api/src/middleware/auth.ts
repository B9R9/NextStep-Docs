import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../utils/jwt'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = header.slice(7)
  try {
    const payload = verifyToken(token)
    ;(req as any).user = payload
    return next()
  } catch {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}
