import { Router } from 'express'
import { db } from '../db/knex'

export const remindersRoutes = Router()

const toDateStr = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const daysUntil = (eventDate: string, today: Date): number => {
  const d = new Date(eventDate)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const toReminderEvent = (event: any, today: Date) => ({
  id: event.id,
  type: event.type,
  date: event.date,
  position: event.position || '',
  company: event.company || '',
  title: event.title || event.position || '',
  days_until: daysUntil(event.date, today),
})

remindersRoutes.get('/today', async (req, res) => {
  const userId = (req as any).user.id

  const user = await db('users')
    .where({ id: userId })
    .select('reminders_enabled', 'reminder_days')
    .first()

  if (!user || !user.reminders_enabled) return res.json([])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const results: any[] = []

  // --- Auto-created events (jobId or applicationId set) → global reminder_days ---
  const globalDays: number[] = user.reminder_days ? JSON.parse(user.reminder_days) : []
  if (globalDays.length > 0) {
    const globalTargetDates = globalDays.map((n) => {
      const d = new Date(today)
      d.setDate(d.getDate() + n)
      return toDateStr(d)
    })

    const autoEvents = await db('calendar_events')
      .where({ user_id: userId })
      .where((builder: any) => {
        builder.whereNotNull('jobId').orWhereNotNull('applicationId')
      })
      .whereIn('date', globalTargetDates)
      .orderBy('date', 'asc')

    results.push(...autoEvents)
  }

  // --- Manual events (no jobId, no applicationId) → per-event reminder_days ---
  const manualEvents = await db('calendar_events')
    .where({ user_id: userId })
    .whereNull('jobId')
    .whereNull('applicationId')
    .whereNotNull('reminder_days')

  for (const event of manualEvents) {
    const days: number[] = JSON.parse(event.reminder_days)
    const n = daysUntil(event.date, today)
    if (n >= 0 && days.includes(n)) {
      results.push(event)
    }
  }

  // Deduplicate by id, sort by date
  const seen = new Set<number>()
  const unique = results
    .filter((e) => { if (seen.has(e.id)) return false; seen.add(e.id); return true })
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => toReminderEvent(e, today))

  return res.json(unique)
})
