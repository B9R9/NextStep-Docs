import { Router } from 'express'
import type { Request, Response } from 'express'
import { db } from '../db/knex'

export const feedbackRoutes = Router()

const VALID_SUBJECTS = ['feedback', 'bug', 'feature_request', 'question', 'performance', 'other'] as const

// ── POST /feedback ─────────────────────────────────────────────────────────────
feedbackRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const { subject, message, is_anonymous = true } = req.body as {
      subject: string
      message: string
      is_anonymous?: boolean
    }

    if (!subject || !VALID_SUBJECTS.includes(subject as any)) {
      return res.status(400).json({ message: 'Invalid subject' })
    }
    if (!message || typeof message !== 'string' || message.trim().length < 20) {
      return res.status(400).json({ message: 'Message too short (min 20 characters)' })
    }
    if (message.trim().length > 2000) {
      return res.status(400).json({ message: 'Message too long (max 2000 chars)' })
    }

    const user = (req as any).user as { id: number; email: string } | undefined
    const userId = user?.id ?? null
    const email = is_anonymous ? null : (user?.email ?? null)

    await db('user_feedback').insert({
      user_id: userId,
      subject,
      message: message.trim(),
      is_anonymous: Boolean(is_anonymous),
      email,
    })

    return res.status(201).json({ ok: true })
  } catch (err) {
    console.error('[feedback.post] failed', err)
    return res.status(500).json({ message: 'Failed to submit feedback' })
  }
})
