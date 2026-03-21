import { Router } from 'express'
import { db } from '../db/knex'
import { createCalendarEvent } from './calendar'
import { trackEvent, getSessionId } from '../utils/track'

export const jobsRoutes = Router()
const useFakeJobs = process.env.FAKE_JOBS === 'true'

const allowedSortKeys = new Set([
  'position',
  'industry',
  'work_mode',
  'location',
  'contract',
  'level',
  'published_at',
  'deadline_at',
  'company_id',
])

type JobRow = {
  id: number
  user_id: number
  company_id: number | null
  company_name?: string
  position: string
  industry: string
  work_mode: string
  location: string
  contract: string
  level: string
  published_at: string | null
  deadline_at: string | null
  link: string
  languages: string[]
  description: string
  requirements: string
}

let fakeJobs: JobRow[] = []

const jobSelectColumns = [
  'jobs.id',
  'jobs.user_id',
  'jobs.company_id',
  'jobs.position',
  'jobs.industry',
  'jobs.work_mode',
  'jobs.location',
  'jobs.contract',
  'jobs.level',
  'jobs.published_at',
  'jobs.deadline_at',
  'jobs.link',
  'jobs.languages',
  'jobs.description',
  'jobs.requirements',
  db.raw('companies.name as company_name'),
]

const fetchJobWithCompany = async (userId: number, id: number) => {
  return db('jobs')
    .leftJoin('companies', 'companies.id', 'jobs.company_id')
    .select(jobSelectColumns)
    .where('jobs.user_id', userId)
    .andWhere('jobs.id', id)
    .first()
}

const normalizeDate = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

const normalizeCompanyId = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const numeric = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null
}

const pickJobPayload = (payload: Record<string, unknown>) => ({
  company_id: normalizeCompanyId(payload.company_id),
  position: typeof payload.position === 'string' ? payload.position : '',
  industry: typeof payload.industry === 'string' ? payload.industry : '',
  work_mode: typeof payload.work_mode === 'string' ? payload.work_mode : '',
  location: typeof payload.location === 'string' ? payload.location : '',
  contract: typeof payload.contract === 'string' ? payload.contract : '',
  level: typeof payload.level === 'string' ? payload.level : '',
  published_at: normalizeDate(payload.published_at),
  deadline_at: normalizeDate(payload.deadline_at),
  link: typeof payload.link === 'string' ? payload.link : '',
  languages: Array.isArray(payload.languages) ? payload.languages : [],
  description: typeof payload.description === 'string' ? payload.description : '',
  requirements: typeof payload.requirements === 'string' ? payload.requirements : '',
})

const getCompanyName = async (companyId: number | null) => {
  if (companyId == null) return ''
  const company = await db('companies').where({ id: companyId }).first()
  return company?.name || ''
}

const withCompanyName = async (row: JobRow) => ({
  ...row,
  company_name: await getCompanyName(row.company_id),
})

const syncJobCalendarEvent = async ({
  userId,
  job,
  type,
  date,
  companyName,
}: {
  userId: number
  job: JobRow
  type: 'published' | 'deadline'
  date: string | null
  companyName: string
}) => {
  const existingEvents = await db('calendar_events')
    .where({ user_id: userId, jobId: job.id, type })
    .orderBy('id', 'asc')

  const shouldExist = Boolean(date)
  console.log('[syncJobCalendarEvent]', { type, date, jobId: job.id, shouldExist, existing: existingEvents.length })

  if (!shouldExist) {
    if (existingEvents.length) {
      await db('calendar_events').whereIn(
        'id',
        existingEvents.map((event: { id: number }) => event.id),
      ).del()
    }
    return
  }

  const payload = {
    user_id: userId,
    type,
    date,
    jobId: job.id,
    applicationId: null,
    position: job.position || '',
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
    await db('calendar_events').whereIn(
      'id',
      duplicates.map((event) => event.id),
    ).del()
  }
}

const syncJobCalendarEvents = async (userId: number, job: JobRow) => {
  const companyName = await getCompanyName(job.company_id)
  await syncJobCalendarEvent({
    userId,
    job,
    type: 'published',
    date: job.published_at,
    companyName,
  })
  await syncJobCalendarEvent({
    userId,
    job,
    type: 'deadline',
    date: job.deadline_at,
    companyName,
  })
}

const refreshCompanyAvailableJobs = async (userId: number, companyId: number | null) => {
  if (companyId == null) return

  const [{ count }] = await db('jobs')
    .where({ user_id: userId, company_id: companyId })
    .count<{ count: string }[]>('* as count')

  await db('companies')
    .where({ user_id: userId, id: companyId })
    .update({
      available_jobs: String(Number(count || 0)),
    })
}

const refreshCompaniesAvailableJobs = async (userId: number, companyIds: Array<number | null>) => {
  const unique = Array.from(
    new Set(companyIds.filter((companyId): companyId is number => typeof companyId === 'number' && companyId >= 0)),
  )
  await Promise.all(unique.map((companyId) => refreshCompanyAvailableJobs(userId, companyId)))
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

jobsRoutes.get('/', async (req, res) => {
  const { q, sortKey, sortDir } = req.query as {
      q?: string
      sortKey?: string
      sortDir?: 'asc' | 'desc'
  }

  if (useFakeJobs) {
    const userId = Number((req as any).user.id)
    let rows = fakeJobs.filter((row) => row.user_id === userId)

    if (q) {
      const query = q.toLowerCase()
      rows = rows.filter((row) =>
        [row.position, row.industry, row.location, String(row.company_id ?? '')].some((value) =>
          value.toLowerCase().includes(query)
        )
      )
    }

    if (sortKey) {
      rows = [...rows].sort((a: Record<string, any>, b: Record<string, any>) => {
        const left = a[sortKey]
        const right = b[sortKey]
        const direction = sortDir === 'desc' ? -1 : 1

        if (typeof left === 'number' && typeof right === 'number') {
          return (left - right) * direction
        }
        return String(left ?? '').localeCompare(String(right ?? '')) * direction
      })
    }

    const withCompany = await Promise.all(
      rows.map(async (row) => ({
        ...row,
        company_name: await getCompanyName(row.company_id),
      })),
    )
    return res.json(withCompany)
  }

  const query = db('jobs')
    .leftJoin('companies', 'companies.id', 'jobs.company_id')
    .select(jobSelectColumns)
    .where('jobs.user_id', (req as any).user.id)

  if (q) {
    query.andWhere((builder) => {
      builder
        .whereILike('jobs.position', `%${q}%`)
        .orWhereILike('jobs.industry', `%${q}%`)
        .orWhereILike('jobs.location', `%${q}%`)
        .orWhereILike('companies.name', `%${q}%`)
        .orWhereRaw('CAST(jobs.company_id AS TEXT) ILIKE ?', [`%${q}%`])
    })
  }

  if (sortKey && allowedSortKeys.has(sortKey)) {
    query.orderBy(`jobs.${sortKey}`, sortDir || 'asc')
  }

  const rows = await query
  return res.json(rows)
})

jobsRoutes.post('/', async (req, res) => {
  if (useFakeJobs) {
    const payload = pickJobPayload(req.body as Record<string, unknown>)
    const userId = Number((req as any).user.id)
    const nextId = Math.max(0, ...fakeJobs.map((row) => row.id)) + 1
    const created: JobRow = {
      id: nextId,
      user_id: userId,
      ...payload,
    }

    fakeJobs = [...fakeJobs, created]
    return res.json(await withCompanyName(created))
  }

  const userId = Number((req as any).user.id)
  const payload = pickJobPayload(req.body as Record<string, unknown>)
  const [created] = await db('jobs')
    .insert({ ...payload, user_id: userId })
    .returning('*')

  try {
    const companyName = await getCompanyName(payload.company_id)
    if (payload.published_at) {
      await createCalendarEvent(userId, {
        type: 'published',
        date: payload.published_at,
        jobId: Number(created.id),
        position: created.position || '',
        company: companyName,
      })
    }
    if (payload.deadline_at) {
      await createCalendarEvent(userId, {
        type: 'deadline',
        date: payload.deadline_at,
        jobId: Number(created.id),
        position: created.position || '',
        company: companyName,
      })
    }
  } catch (err) {
    console.error('[jobs.post] createCalendarEvent failed', err)
  }
  await refreshCompaniesAvailableJobs(userId, [payload.company_id])

  await createNotification(
    userId,
    'Job created',
    `Job "${created.position || 'Untitled'}" was created.`,
    'event'
  )

  trackEvent({ userId, event: 'job.created', category: 'jobs', metadata: { company_id: payload.company_id, contract: payload.contract, industry: payload.industry }, sessionId: getSessionId(req), ip: req.ip, userAgent: req.headers['user-agent'] })

  const createdWithCompany = await fetchJobWithCompany(userId, Number(created.id))
  return res.json(createdWithCompany ?? created)
})

jobsRoutes.put('/:id', async (req, res) => {
  const { id } = req.params as { id: string }
  if (useFakeJobs) {
    const numericId = Number(id)
    const userId = Number((req as any).user.id)
    const payload = pickJobPayload(req.body as Record<string, unknown>)
    const index = fakeJobs.findIndex((row) => row.id === numericId && row.user_id === userId)

    if (index === -1) {
      return res.status(404).json({ message: 'Not found' })
    }

    const updated = {
      ...fakeJobs[index],
      ...payload,
      id: numericId,
      user_id: userId,
    }
    fakeJobs = fakeJobs.map((row, rowIndex) => (rowIndex === index ? updated : row))
    return res.json(await withCompanyName(updated))
  }

  const userId = Number((req as any).user.id)
  const existing = await db('jobs').where({ id, user_id: userId }).first<JobRow>()
  if (!existing) {
    return res.status(404).json({ message: 'Not found' })
  }

  const payload = pickJobPayload(req.body as Record<string, unknown>)
  if (process.env.NODE_ENV !== 'production') {
    console.log('[jobs.put] company_id input/normalized', {
      id,
      input: (req.body as Record<string, unknown>)?.company_id,
      normalized: payload.company_id,
    })
  }
  const [updated] = await db('jobs')
    .where({ id, user_id: userId })
    .update(payload)
    .returning('*')

  if (!updated) {
    return res.status(404).json({ message: 'Not found' })
  }

  try {
    await syncJobCalendarEvents(userId, updated as JobRow)
  } catch (err) {
    console.error('[jobs.put] syncJobCalendarEvents failed', err)
  }
  await refreshCompaniesAvailableJobs(userId, [existing.company_id, payload.company_id])

  await createNotification(
    userId,
    'Job updated',
    `Job "${updated.position || 'Untitled'}" was updated.`,
    'event'
  )

  const updatedWithCompany = await fetchJobWithCompany(userId, Number(updated.id))
  trackEvent({ userId, event: 'job.updated', category: 'jobs', sessionId: getSessionId(req), ip: req.ip, userAgent: req.headers['user-agent'] })

  return res.json(updatedWithCompany ?? updated)
})

jobsRoutes.delete('/:id', async (req, res) => {
  const { id } = req.params as { id: string }
  if (useFakeJobs) {
    const numericId = Number(id)
    const userId = Number((req as any).user.id)
    const previousLength = fakeJobs.length
    fakeJobs = fakeJobs.filter((row) => !(row.id === numericId && row.user_id === userId))
    if (fakeJobs.length === previousLength) {
      return res.status(404).json({ message: 'Not found' })
    }
    return res.json({ success: true })
  }

  const userId = Number((req as any).user.id)
  const existing = await db('jobs').where({ id, user_id: userId }).first()
  if (!existing) {
    return res.status(404).json({ message: 'Not found' })
  }

  await db('jobs').where({ id, user_id: userId }).del()
  await refreshCompaniesAvailableJobs(userId, [existing.company_id])

  trackEvent({ userId, event: 'job.deleted', category: 'jobs', sessionId: getSessionId(req), ip: req.ip, userAgent: req.headers['user-agent'] })

  await createNotification(
    userId,
    'Job deleted',
    `Job "${existing.position || 'Untitled'}" was deleted.`,
    'event'
  )

  return res.json({ success: true })
})
