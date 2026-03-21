import { Router } from 'express'
import { db } from '../db/knex'
import { trackEvent, getSessionId } from '../utils/track'
import { createNotification } from '../utils/routeHelpers'

export const calendarRoutes = Router()

const allowedSortKeys = new Set([
  'type',
  'date',
  'jobId',
  'applicationId',
  'position',
  'company',
  'title',
])

const pickCalendarPayload = (payload: Record<string, unknown>) => ({
  type:
    payload.type === 'deadline' || payload.type === 'published' || payload.type === 'event'
      ? payload.type
      : 'event',
  date: typeof payload.date === 'string' ? payload.date : (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })(),
  jobId: typeof payload.jobId === 'number' ? payload.jobId : null,
  applicationId: typeof payload.applicationId === 'number' ? payload.applicationId : null,
  position: typeof payload.position === 'string' ? payload.position : '',
  company: typeof payload.company === 'string' ? payload.company : '',
  title: typeof payload.title === 'string' ? payload.title : '',
  description: typeof payload.description === 'string' ? payload.description : '',
})


calendarRoutes.get('/events', async (req, res) => {
  const { q, sortKey, sortDir } = req.query as {
      q?: string
      sortKey?: string
      sortDir?: 'asc' | 'desc'
  }

  const query = db('calendar_events').where({ user_id: (req as any).user.id })

  if (q) {
    query.andWhere((builder) => {
      builder
        .whereILike('title', `%${q}%`)
        .orWhereILike('description', `%${q}%`)
        .orWhereILike('type', `%${q}%`)
    })
  }

  if (sortKey && allowedSortKeys.has(sortKey)) {
    query.orderBy(sortKey, sortDir || 'asc')
  }

  const rows = await query
  return res.json(rows)
})

calendarRoutes.get('/events/:id', async (req, res) => {
  const { id } = req.params as { id: string }
  const userId = Number((req as any).user.id)
  const event = await db('calendar_events').where({ id, user_id: userId }).first()
  if (!event) {
    return res.status(404).json({ message: 'Not found' })
  }
  return res.json(event)
})

export const createCalendarEvent = async (
  userId: number,
  data: {
    type?: 'published' | 'deadline' | 'event'
    date?: string
    jobId?: number | null
    applicationId?: number | null
    position?: string
    company?: string
    title?: string
    description?: string
  }
) => {
  const payload = pickCalendarPayload(data as Record<string, unknown>)
  const [created] = await db('calendar_events')
    .insert({ ...payload, user_id: userId })
    .returning('*')
  return created
}

calendarRoutes.post('/events', async (req, res) => {
  const userId = Number((req as any).user.id)
  const created = await createCalendarEvent(userId, req.body as Record<string, unknown>)
  trackEvent({ userId, event: 'calendar_event.created', category: 'calendar', metadata: { type: created.type }, sessionId: getSessionId(req), ip: req.ip, userAgent: req.headers['user-agent'] })
  return res.json(created)
})

calendarRoutes.put('/events/:id', async (req, res) => {
  const { id } = req.params as { id: string }
  const userId = Number((req as any).user.id)
  const payload = pickCalendarPayload(req.body as Record<string, unknown>)
  const [updated] = await db('calendar_events')
    .where({ id, user_id: userId })
    .update(payload)
    .returning('*')

  if (!updated) {
    return res.status(404).json({ message: 'Not found' })
  }

  await createNotification(
    userId,
    'Calendar event updated',
    `Event "${updated.title || updated.type}" was updated.`,
    'event'
  )

  trackEvent({ userId, event: 'calendar_event.updated', category: 'calendar', sessionId: getSessionId(req), ip: req.ip, userAgent: req.headers['user-agent'] })
  return res.json(updated)
})

calendarRoutes.delete('/events/:id', async (req, res) => {
  const { id } = req.params as { id: string }
  const userId = Number((req as any).user.id)
  const existing = await db('calendar_events').where({ id, user_id: userId }).first()
  if (!existing) {
    return res.status(404).json({ message: 'Not found' })
  }

  await db('calendar_events').where({ id, user_id: userId }).del()
  trackEvent({ userId, event: 'calendar_event.deleted', category: 'calendar', sessionId: getSessionId(req), ip: req.ip, userAgent: req.headers['user-agent'] })

  await createNotification(
    userId,
    'Calendar event deleted',
    `Event "${existing.title || existing.type}" was deleted.`,
    'event'
  )

  return res.json({ success: true })
})
