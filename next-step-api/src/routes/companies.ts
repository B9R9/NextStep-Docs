import { Router } from 'express'
import { db } from '../db/knex'
import { trackEvent, getSessionId } from '../utils/track'
import { createNotification } from '../utils/routeHelpers'

export const companiesRoutes = Router()

const allowedSortKeys = new Set([
  'name',
  'industry',
  'size',
  'location',
  'available_jobs',
  'total_applications',
])

const pickCompanyPayload = (payload: Record<string, unknown>) => ({
  name: typeof payload.name === 'string' ? payload.name : '',
  industry: typeof payload.industry === 'string' ? payload.industry : '',
  size: typeof payload.size === 'string' ? payload.size : '',
  location: typeof payload.location === 'string' ? payload.location : '',
  website: typeof payload.website === 'string' ? payload.website : '',
  career_page: typeof payload.career_page === 'string' ? payload.career_page : '',
  contactName: typeof payload.contactName === 'string' ? payload.contactName : '',
  contactEmail: typeof payload.contactEmail === 'string' ? payload.contactEmail : '',
  contactPhone: typeof payload.contactPhone === 'string' ? payload.contactPhone : '',
  socialMedia: typeof payload.socialMedia === 'string' ? payload.socialMedia : '',
  comments: typeof payload.comments === 'string' ? payload.comments : '',
  available_jobs: typeof payload.available_jobs === 'string' ? payload.available_jobs : 'In progress',
  total_applications:
    typeof payload.total_applications === 'number' ? payload.total_applications : 0,
})


companiesRoutes.get('/', async (req, res) => {
  const { q, industry, location, sortKey, sortDir } = req.query as {
    q?: string
    industry?: string
    location?: string
    sortKey?: string
    sortDir?: 'asc' | 'desc'
  }

  const userId = Number((req as any).user.id)
  const query = db('companies')
    .select(
      'companies.*',
      db.raw(`COALESCE((
        SELECT COUNT(*)::text
        FROM jobs
        WHERE jobs.user_id = companies.user_id
          AND jobs.company_id = companies.id
      ), '0') as available_jobs`),
    )
    .where('companies.user_id', userId)

  if (q) {
    query.andWhere((builder) => {
      builder
        .whereILike('companies.name', `%${q}%`)
        .orWhereILike('companies.industry', `%${q}%`)
        .orWhereILike('companies.location', `%${q}%`)
    })
  }

  if (industry) {
    query.andWhere('companies.industry', industry)
  }

  if (location) {
    query.andWhereILike('companies.location', `%${location}%`)
  }

  if (sortKey && allowedSortKeys.has(sortKey)) {
    if (sortKey === 'available_jobs') {
      query.orderByRaw(`CAST(available_jobs AS int) ${sortDir || 'asc'}`)
    } else {
      query.orderBy(`companies.${sortKey}`, sortDir || 'asc')
    }
  }

  const rows = await query
  return res.json(rows)
})

companiesRoutes.post('/', async (req, res) => {
  const userId = Number((req as any).user.id)
  const payload = pickCompanyPayload(req.body as Record<string, unknown>)
  const insertData = {
    user_id: userId,
    name: payload.name,
    industry: payload.industry,
    size: payload.size,
    location: payload.location,
    website: payload.website,
    career_page: payload.career_page,
    contactName: payload.contactName,
    contactEmail: payload.contactEmail,
    contactPhone: payload.contactPhone,
    socialMedia: payload.socialMedia,
    comments: payload.comments,
    available_jobs: payload.available_jobs,
    total_applications: payload.total_applications,
  }
  const [created] = await db('companies')
    .insert(insertData)
    .returning('*')

  await createNotification(
    userId,
    'Company created',
    `Company "${created.name || 'Untitled'}" was created.`,
    'event'
  )

  trackEvent({ userId, event: 'company.created', category: 'companies', metadata: { industry: created.industry }, sessionId: getSessionId(req), ip: req.ip, userAgent: req.headers['user-agent'] })
  return res.json(created)
})

companiesRoutes.put('/:id', async (req, res) => {
  const { id } = req.params as { id: string }
  const userId = Number((req as any).user.id)
  const payload = pickCompanyPayload(req.body as Record<string, unknown>)
  const [updated] = await db('companies')
    .where({ id, user_id: userId })
    .update(payload)
    .returning('*')

  if (!updated) {
    return res.status(404).json({ message: 'Not found' })
  }

  await createNotification(
    userId,
    'Company updated',
    `Company "${updated.name || 'Untitled'}" was updated.`,
    'event'
  )

  trackEvent({ userId, event: 'company.updated', category: 'companies', sessionId: getSessionId(req), ip: req.ip, userAgent: req.headers['user-agent'] })
  return res.json(updated)
})

companiesRoutes.delete('/:id', async (req, res) => {
  const { id } = req.params as { id: string }
  const userId = Number((req as any).user.id)
  const existing = await db('companies')
    .where({ id, user_id: userId })
    .first()

  if (!existing) {
    return res.status(404).json({ message: 'Not found' })
  }

  await db('companies').where({ id, user_id: userId }).del()
  trackEvent({ userId, event: 'company.deleted', category: 'companies', sessionId: getSessionId(req), ip: req.ip, userAgent: req.headers['user-agent'] })

  await createNotification(
    userId,
    'Company deleted',
    `Company "${existing.name || 'Untitled'}" was deleted.`,
    'event'
  )

  return res.json({ success: true })
})
