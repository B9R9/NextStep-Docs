import { db } from '../db/knex'
import type { Request } from 'express'

interface TrackOptions {
  userId: number
  event: string
  category: string
  metadata?: Record<string, unknown>
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
    console.error('[track] failed to log event', opts.event, err)
  }
}

export function getSessionId(req: Request): string | undefined {
  const val = req.headers['x-session-id']
  return typeof val === 'string' ? val : undefined
}
