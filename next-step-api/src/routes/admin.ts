import { Router } from 'express'
import type { Request, Response } from 'express'
import { db } from '../db/knex'
import { getMetrics } from '../utils/apiMetrics'

export const adminRoutes = Router()

// ── GET /admin/me ─────────────────────────────────────────────────────────────
adminRoutes.get('/me', (_req: Request, res: Response) => {
  return res.json({ ok: true })
})

// ── GET /admin/stats/overview ─────────────────────────────────────────────────
adminRoutes.get('/stats/overview', async (_req: Request, res: Response) => {
  try {
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 86400000)
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    const monthAgo = new Date(now.getTime() - 30 * 86400000)

    // ── Users ──────────────────────────────────────────────────────────────────
    const [{ count: totalUsers }] = await db('users').count('* as count')
    const [{ count: registeredToday }] = await db('users').where('created_at', '>=', dayAgo).count('* as count')
    const [{ count: registeredThisWeek }] = await db('users').where('created_at', '>=', weekAgo).count('* as count')
    const [{ count: registeredThisMonth }] = await db('users').where('created_at', '>=', monthAgo).count('* as count')

    const activeUserIds = db.unionAll([
      db('applications').select('user_id').where('updated_at', '>=', weekAgo),
      db('jobs').select('user_id').where('updated_at', '>=', weekAgo),
      db('companies').select('user_id').where('updated_at', '>=', weekAgo),
      db('calendar_events').select('user_id').where('updated_at', '>=', weekAgo),
    ], true) as any
    const activeWeekRows = await db.from(activeUserIds.as('a')).countDistinct('user_id as count') as { count: string }[]
    const activeThisWeek = activeWeekRows[0]?.count ?? 0

    const activeUserIdsMonth = db.unionAll([
      db('applications').select('user_id').where('updated_at', '>=', monthAgo),
      db('jobs').select('user_id').where('updated_at', '>=', monthAgo),
      db('companies').select('user_id').where('updated_at', '>=', monthAgo),
      db('calendar_events').select('user_id').where('updated_at', '>=', monthAgo),
    ], true) as any
    const activeMonthRows = await db.from(activeUserIdsMonth.as('b')).countDistinct('user_id as count') as { count: string }[]
    const activeThisMonth = activeMonthRows[0]?.count ?? 0

    // Churned: registered > 30 days ago and no activity in last 30 days
    const activeIds30d = db.unionAll([
      db('applications').select('user_id').where('updated_at', '>=', monthAgo),
      db('jobs').select('user_id').where('updated_at', '>=', monthAgo),
      db('companies').select('user_id').where('updated_at', '>=', monthAgo),
      db('calendar_events').select('user_id').where('updated_at', '>=', monthAgo),
    ], true)
    const activeIds30dDistinct = db.from(activeIds30d.as('c')).select('user_id')
    const [{ count: churned30d }] = await db('users')
      .where('created_at', '<', monthAgo)
      .whereNotIn('id', activeIds30dDistinct)
      .count('* as count')

    // ── Applications ──────────────────────────────────────────────────────────
    const [{ count: totalApps }] = await db('applications').count('* as count')
    const [{ count: appsThisWeek }] = await db('applications').where('created_at', '>=', weekAgo).count('* as count')
    const [{ count: appsWithCV }] = await db('applications').where('hasCV', true).count('* as count')
    const [{ count: appsWithCL }] = await db('applications').where('hasCL', true).count('* as count')

    const byStatusRaw = await db('applications').select('status').count('* as count').groupBy('status')
    const byStatus: Record<string, number> = {}
    for (const row of byStatusRaw) byStatus[row.status as string] = Number(row.count)

    const avgPerUserApps = Number(totalUsers) > 0
      ? parseFloat((Number(totalApps) / Number(totalUsers)).toFixed(1))
      : 0

    // ── Jobs ──────────────────────────────────────────────────────────────────
    const [{ count: totalJobs }] = await db('jobs').count('* as count')
    const [{ count: jobsThisWeek }] = await db('jobs').where('created_at', '>=', weekAgo).count('* as count')
    const avgPerUserJobs = Number(totalUsers) > 0
      ? parseFloat((Number(totalJobs) / Number(totalUsers)).toFixed(1))
      : 0

    // ── Companies ─────────────────────────────────────────────────────────────
    const [{ count: totalCompanies }] = await db('companies').count('* as count')
    const topIndustriesRaw = await db('companies')
      .select('industry')
      .count('* as count')
      .groupBy('industry')
      .orderBy('count', 'desc')
      .limit(5)
    const topIndustries = topIndustriesRaw.map((r) => ({ industry: r.industry, count: Number(r.count) }))

    // ── Engagement ────────────────────────────────────────────────────────────
    const [{ count: usersWithApplications }] = await db('applications').countDistinct('user_id as count')
    const [{ count: usersWithJobs }] = await db('jobs').countDistinct('user_id as count')
    const [{ count: usersWithCalendarEvents }] = await db('calendar_events').countDistinct('user_id as count')
    const [{ count: usersNeverUsedCompanies }] = await db('users')
      .whereNotIn('id', db('companies').distinct('user_id'))
      .count('* as count')
    const [{ count: usersNeverUsedCalendar }] = await db('users')
      .whereNotIn('id', db('calendar_events').distinct('user_id'))
      .count('* as count')

    const activeUsers = Number(activeThisMonth)
    const avgApplicationsPerActiveUser = activeUsers > 0
      ? parseFloat((Number(totalApps) / activeUsers).toFixed(1))
      : 0

    // Median applications per user (approximate via sorted buckets)
    const appCountsRaw = await db('applications')
      .select('user_id')
      .count('* as c')
      .groupBy('user_id')
      .orderBy('c')
    const appCounts = appCountsRaw.map((r) => Number(r.c))
    const medianApplicationsPerUser = appCounts.length > 0
      ? appCounts[Math.floor(appCounts.length / 2)]
      : 0

    // ── Conversion ────────────────────────────────────────────────────────────
    const [{ count: usersWithApp }] = await db('applications').countDistinct('user_id as count')
    const regToFirstApp = Number(totalUsers) > 0
      ? parseFloat((Number(usersWithApp) / Number(totalUsers)).toFixed(2))
      : 0
    const interviewCount = (byStatus['interview'] || 0) + (byStatus['final_round'] || 0)
    const appliedCount = byStatus['applied'] || 0
    const offerCount = byStatus['offer_received'] || 0
    const appToInterview = appliedCount > 0 ? parseFloat((interviewCount / appliedCount).toFixed(2)) : 0
    const interviewToOffer = interviewCount > 0 ? parseFloat((offerCount / interviewCount).toFixed(2)) : 0

    return res.json({
      users: {
        total: Number(totalUsers),
        registeredToday: Number(registeredToday),
        registeredThisWeek: Number(registeredThisWeek),
        registeredThisMonth: Number(registeredThisMonth),
        activeThisWeek: Number(activeThisWeek),
        activeThisMonth: Number(activeThisMonth),
        churned30d: Number(churned30d),
      },
      applications: {
        total: Number(totalApps),
        avgPerUser: avgPerUserApps,
        byStatus,
        withCV: Number(appsWithCV),
        withCL: Number(appsWithCL),
        createdThisWeek: Number(appsThisWeek),
      },
      jobs: {
        total: Number(totalJobs),
        createdThisWeek: Number(jobsThisWeek),
        avgPerUser: avgPerUserJobs,
      },
      companies: {
        total: Number(totalCompanies),
        topIndustries,
      },
      engagement: {
        usersWithApplications: Number(usersWithApplications),
        usersWithJobs: Number(usersWithJobs),
        usersWithCalendarEvents: Number(usersWithCalendarEvents),
        usersNeverUsedCompanies: Number(usersNeverUsedCompanies),
        usersNeverUsedCalendar: Number(usersNeverUsedCalendar),
        avgApplicationsPerActiveUser,
        medianApplicationsPerUser,
      },
      conversion: {
        registeredToFirstApplication: regToFirstApp,
        applicationToInterview: appToInterview,
        interviewToOffer: interviewToOffer,
      },
    })
  } catch (err) {
    console.error('[admin.overview] failed', err)
    return res.status(500).json({ message: 'Failed to compute stats' })
  }
})

// ── GET /admin/stats/api ──────────────────────────────────────────────────────
adminRoutes.get('/stats/api', (_req: Request, res: Response) => {
  return res.json(getMetrics())
})

// ── GET /admin/stats/events ───────────────────────────────────────────────────
adminRoutes.get('/stats/events', async (req: Request, res: Response) => {
  try {
    const { event, category, from, to, group_by } = req.query as Record<string, string>

    let query = db('user_events').select(
      'id', 'user_id', 'event', 'category', 'metadata', 'session_id', 'created_at'
    )
    if (event) query = query.where('event', event)
    if (category) query = query.where('category', category)
    if (from) query = query.where('created_at', '>=', new Date(from))
    if (to) query = query.where('created_at', '<=', new Date(to))

    if (group_by) {
      const dateTrunc = group_by === 'month'
        ? db.raw("DATE_TRUNC('month', created_at) as period")
        : group_by === 'week'
          ? db.raw("DATE_TRUNC('week', created_at) as period")
          : db.raw("DATE_TRUNC('day', created_at) as period")

      let groupQuery = db('user_events')
        .select(dateTrunc, 'event')
        .count('* as count')
        .groupBy('period', 'event')
        .orderBy('period', 'asc')
      if (event) groupQuery = groupQuery.where('event', event)
      if (category) groupQuery = groupQuery.where('category', category)
      if (from) groupQuery = groupQuery.where('created_at', '>=', new Date(from))
      if (to) groupQuery = groupQuery.where('created_at', '<=', new Date(to))

      const rows = await groupQuery
      return res.json(rows.map((r) => ({ ...r, count: Number(r.count) })))
    }

    const rows = await query.orderBy('created_at', 'desc').limit(500)
    return res.json(rows)
  } catch (err) {
    console.error('[admin.events] failed', err)
    return res.status(500).json({ message: 'Failed to fetch events' })
  }
})

// ── GET /admin/stats/users ────────────────────────────────────────────────────
adminRoutes.get('/stats/users', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Number(req.query.limit) || 50)
    const offset = (page - 1) * limit

    const users = await db('users')
      .select('id', 'email', 'name', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)

    const [{ count: total }] = await db('users').count('* as count')

    const userIds = users.map((u) => u.id)
    const appCounts = await db('applications')
      .select('user_id')
      .count('* as count')
      .whereIn('user_id', userIds)
      .groupBy('user_id')
    const jobCounts = await db('jobs')
      .select('user_id')
      .count('* as count')
      .whereIn('user_id', userIds)
      .groupBy('user_id')

    const appMap: Record<number, number> = {}
    for (const r of appCounts) appMap[Number(r.user_id)] = Number(r.count)
    const jobMap: Record<number, number> = {}
    for (const r of jobCounts) jobMap[Number(r.user_id)] = Number(r.count)

    return res.json({
      total: Number(total),
      page,
      limit,
      users: users.map((u) => ({
        ...u,
        applications: appMap[u.id] || 0,
        jobs: jobMap[u.id] || 0,
      })),
    })
  } catch (err) {
    console.error('[admin.users] failed', err)
    return res.status(500).json({ message: 'Failed to fetch users' })
  }
})

// ── GET /admin/stats/feedback ─────────────────────────────────────────────────
adminRoutes.get('/stats/feedback', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Number(req.query.limit) || 50)
    const offset = (page - 1) * limit

    const [{ count: total }] = await db('user_feedback').count('* as count')

    const bySubjectRaw = await db('user_feedback').select('subject').count('* as count').groupBy('subject')
    const bySubject: Record<string, number> = {}
    for (const row of bySubjectRaw) bySubject[row.subject as string] = Number(row.count)

    const [{ count: anonymousCount }] = await db('user_feedback').where('is_anonymous', true).count('* as count')

    const rows = await db('user_feedback')
      .select('id', 'subject', 'message', 'is_anonymous', 'email', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)

    return res.json({
      total: Number(total),
      page,
      limit,
      anonymousCount: Number(anonymousCount),
      bySubject,
      rows,
    })
  } catch (err) {
    console.error('[admin.feedback] failed', err)
    return res.status(500).json({ message: 'Failed to fetch feedback' })
  }
})

// ── GET /admin/stats/churn ────────────────────────────────────────────────────
adminRoutes.get('/stats/churn', async (_req: Request, res: Response) => {
  try {
    const monthAgo = new Date(Date.now() - 30 * 86400000)

    const deletionEvents = await db('user_events')
      .where('event', 'auth.account_deleted')
      .where('created_at', '>=', monthAgo)
      .select('metadata', 'created_at')

    const deletionsThisMonth = deletionEvents.length
    const [{ count: totalUsers }] = await db('users').count('* as count')
    const deletionRate30d = Number(totalUsers) > 0
      ? parseFloat((deletionsThisMonth / Number(totalUsers)).toFixed(3))
      : 0

    const lifecycle: Record<string, number> = { '0-2d': 0, '3-7d': 0, '8-30d': 0, '31-90d': 0, '90d+': 0 }
    const reasons: Record<string, number> = {}
    let totalAppAtDeletion = 0
    let totalJobAtDeletion = 0

    for (const ev of deletionEvents) {
      const meta = typeof ev.metadata === 'string' ? JSON.parse(ev.metadata) : ev.metadata || {}
      const days = meta.days_since_register || 0
      if (days <= 2) lifecycle['0-2d']++
      else if (days <= 7) lifecycle['3-7d']++
      else if (days <= 30) lifecycle['8-30d']++
      else if (days <= 90) lifecycle['31-90d']++
      else lifecycle['90d+']++

      const reason = meta.reason || 'no_reason_given'
      reasons[reason] = (reasons[reason] || 0) + 1
      totalAppAtDeletion += meta.total_applications || 0
      totalJobAtDeletion += meta.total_jobs || 0
    }

    return res.json({
      deletionsThisMonth,
      deletionRate30d,
      lifecycleDistribution: lifecycle,
      reasons,
      avgApplicationsAtDeletion: deletionsThisMonth > 0
        ? parseFloat((totalAppAtDeletion / deletionsThisMonth).toFixed(1))
        : 0,
      avgJobsAtDeletion: deletionsThisMonth > 0
        ? parseFloat((totalJobAtDeletion / deletionsThisMonth).toFixed(1))
        : 0,
    })
  } catch (err) {
    console.error('[admin.churn] failed', err)
    return res.status(500).json({ message: 'Failed to fetch churn' })
  }
})
