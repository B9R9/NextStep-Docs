import { Router } from 'express'
import { db } from '../db/knex'

export const applicationsRoutes = Router()

const allowedSortKeys = new Set([
  'type',
  'position',
  'company_id',
  'status',
  'applied',
  'deadline',
  'hasCV',
  'hasCL',
  'jobId',
])

type ApplicationRow = {
  id: number
  user_id: number
  jobId: number | null
  company_id: number | null
  type: string
  position: string
  status: string
  applied: string | null
  deadline: string | null
  hasCV: boolean
  hasCL: boolean
}

const normalizeDate = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

const normalizeNumericId = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const numeric = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null
}

const normalizeCompanyIdForUser = async (userId: number, companyId: number | null) => {
  if (companyId === null) return null
  const company = await db('companies').where({ id: companyId, user_id: userId }).first()
  return company ? companyId : null
}

const normalizeJobIdForUser = async (userId: number, jobId: number | null) => {
  if (jobId === null) return null
  const job = await db('jobs').where({ id: jobId, user_id: userId }).first()
  return job ? jobId : null
}

const pickApplicationPayload = async (userId: number, payload: Record<string, unknown>) => {
  const companyId = normalizeNumericId(payload.company_id)
  const jobId = normalizeNumericId(payload.jobId)

  return {
    type: typeof payload.type === 'string' ? payload.type : 'CDI',
    position: typeof payload.position === 'string' ? payload.position : '',
    company_id: await normalizeCompanyIdForUser(userId, companyId),
    status: typeof payload.status === 'string' ? payload.status : 'saved',
    applied: normalizeDate(payload.applied),
    deadline: normalizeDate(payload.deadline),
    hasCV: typeof payload.hasCV === 'boolean' ? payload.hasCV : false,
    hasCL: typeof payload.hasCL === 'boolean' ? payload.hasCL : false,
    jobId: await normalizeJobIdForUser(userId, jobId),
  }
}

const createNotification = async (
  userId: number,
  title: string,
  description: string,
  type: 'system' | 'event' = 'system'
) => {
  try {
    await db('notifications').insert({
      user_id: userId,
      title,
      description,
      createdAt: new Date().toISOString().slice(0, 10),
      type,
    })
  } catch (error) {
    console.warn('Notification insert skipped:', error)
  }
}

const getCompanyName = async (companyId: number | null) => {
  if (companyId == null) return ''
  const company = await db('companies').where({ id: companyId }).first()
  return company?.name || ''
}

const syncApplicationCalendarEvent = async ({
  userId,
  application,
  type,
  date,
  enabled,
  companyName,
}: {
  userId: number
  application: ApplicationRow
  type: 'event' | 'deadline'
  date: string | null
  enabled: boolean
  companyName: string
}) => {
  const existingEvents = await db('calendar_events')
    .where({
      user_id: userId,
      applicationId: application.id,
      type,
    })
    .orderBy('id', 'asc')

  const shouldExist = enabled && Boolean(date)

  if (!shouldExist) {
    if (existingEvents.length) {
      await db('calendar_events')
        .whereIn(
          'id',
          existingEvents.map((event: { id: number }) => event.id),
        )
        .del()
    }
    return
  }

  const payload = {
    user_id: userId,
    type,
    date,
    jobId: null,
    applicationId: application.id,
    position: application.position || '',
    company: companyName,
    title: '',
    description: '',
  }

  if (!existingEvents.length) {
    await db('calendar_events').insert(payload)
    return
  }

  const [first, ...duplicates] = existingEvents as Array<{ id: number }>
  await db('calendar_events').where({ id: first.id }).update(payload)
  if (duplicates.length) {
    await db('calendar_events')
      .whereIn(
        'id',
        duplicates.map((event) => event.id),
      )
      .del()
  }
}

applicationsRoutes.get('/', async (req, res) => {
  const { q, sortKey, sortDir } = req.query as {
      q?: string
      sortKey?: string
      sortDir?: 'asc' | 'desc'
  }

  const query = db('applications').where({ user_id: (req as any).user.id })

  if (q) {
    query.andWhere((builder) => {
      builder
        .whereILike('position', `%${q}%`)
        .orWhereILike('type', `%${q}%`)
        .orWhereRaw('CAST(company_id AS TEXT) ILIKE ?', [`%${q}%`])
    })
  }

  if (sortKey && allowedSortKeys.has(sortKey)) {
    query.orderBy(sortKey, sortDir || 'asc')
  } else {
    query.orderBy('id', 'desc')
  }

  const rows = await query
  return res.json(rows)
})

applicationsRoutes.post('/', async (req, res) => {
  try {
    const userId = Number((req as any).user.id)
    const payload = await pickApplicationPayload(userId, req.body as Record<string, unknown>)
    const [created] = await db('applications')
      .insert({ ...payload, user_id: userId })
      .returning('*')

    await createNotification(
      userId,
      'Application created',
      `Application "${created.position || 'Untitled'}" was created.`,
      'event'
    )

    const companyName = await getCompanyName(created.company_id)

    try {
      await syncApplicationCalendarEvent({
        userId,
        application: created as ApplicationRow,
        type: 'event',
        date: created.applied,
        enabled: true,
        companyName,
      })
      await syncApplicationCalendarEvent({
        userId,
        application: created as ApplicationRow,
        type: 'deadline',
        date: created.deadline,
        enabled: true,
        companyName,
      })
    } catch (err) {
      console.error('[applications.post] syncCalendarEvents failed', err)
    }

    return res.json(created)
  } catch (error) {
    console.error('[applications.post] failed', error)
    return res.status(500).json({ message: 'Could not create application' })
  }
})

applicationsRoutes.put('/:id', async (req, res) => {
  try {
    const { id } = req.params as { id: string }
    const userId = Number((req as any).user.id)
    const payload = await pickApplicationPayload(userId, req.body as Record<string, unknown>)
    const [updated] = await db('applications')
      .where({ id, user_id: userId })
      .update(payload)
      .returning('*')

    if (!updated) {
      return res.status(404).json({ message: 'Not found' })
    }

    await createNotification(
      userId,
      'Application updated',
      `Application "${updated.position || 'Untitled'}" was updated.`,
      'event'
    )

    try {
      const companyName = await getCompanyName(updated.company_id ?? null)
      await syncApplicationCalendarEvent({
        userId,
        application: updated as ApplicationRow,
        type: 'event',
        date: updated.applied,
        enabled: true,
        companyName,
      })
      await syncApplicationCalendarEvent({
        userId,
        application: updated as ApplicationRow,
        type: 'deadline',
        date: updated.deadline,
        enabled: true,
        companyName,
      })
    } catch (err) {
      console.error('[applications.put] syncCalendarEvents failed', err)
    }

    return res.json(updated)
  } catch (error) {
    console.error('[applications.put] failed', error)
    return res.status(500).json({ message: 'Could not update application' })
  }
})

const updateApplicationCalendarSyncHandler = async (req: any, res: any) => {
  try {
    const { id } = req.params as { id: string }
    const userId = Number((req as any).user.id)
    const numericId = Number(id)
    if (Number.isNaN(numericId)) {
      return res.status(400).json({ message: 'Invalid id' })
    }

    const body = req.body as {
      applied_in_calendar?: boolean
      deadline_in_calendar?: boolean
    }

    if (
      body.applied_in_calendar === undefined &&
      body.deadline_in_calendar === undefined
    ) {
      return res.status(400).json({ message: 'No calendar sync changes provided' })
    }

    const application = await db('applications')
      .where({ id: numericId, user_id: userId })
      .first()

    if (!application) {
      return res.status(404).json({ message: 'Not found' })
    }

    const companyName = await getCompanyName(application.company_id ?? null)
    const typedApplication = application as ApplicationRow

    if (body.applied_in_calendar !== undefined) {
      await syncApplicationCalendarEvent({
        userId,
        application: typedApplication,
        type: 'event',
        date: typedApplication.applied,
        enabled: body.applied_in_calendar === true,
        companyName,
      })
    }

    if (body.deadline_in_calendar !== undefined) {
      await syncApplicationCalendarEvent({
        userId,
        application: typedApplication,
        type: 'deadline',
        date: typedApplication.deadline,
        enabled: body.deadline_in_calendar === true,
        companyName,
      })
    }

    const updated = await db('applications')
      .where({ id: numericId, user_id: userId })
      .first()

    return res.json(updated)
  } catch (error) {
    console.error('[applications.calendar-sync] failed', error)
    return res.status(500).json({ message: 'Could not update application calendar sync' })
  }
}

applicationsRoutes.put('/:id/calendar-sync', updateApplicationCalendarSyncHandler)
applicationsRoutes.patch('/:id/calendar-sync', updateApplicationCalendarSyncHandler)

applicationsRoutes.delete('/:id', async (req, res) => {
  const { id } = req.params as { id: string }
  const userId = Number((req as any).user.id)
  const existing = await db('applications').where({ id, user_id: userId }).first()
  if (!existing) {
    return res.status(404).json({ message: 'Not found' })
  }

  await db('calendar_events').where({ user_id: userId, applicationId: Number(id) }).del()
  await db('applications').where({ id, user_id: userId }).del()

  await createNotification(
    userId,
    'Application deleted',
    `Application "${existing.position || 'Untitled'}" was deleted.`,
    'event'
  )

  return res.json({ success: true })
})
