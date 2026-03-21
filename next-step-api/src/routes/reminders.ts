import { Router } from 'express'
import { db } from '../db/knex'

export const remindersRoutes = Router()

const toDateStr = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

remindersRoutes.get('/today', async (req, res) => {
  const userId = (req as any).user.id

  const user = await db('users')
    .where({ id: userId })
    .select('reminders_enabled', 'reminder_days')
    .first()

  if (!user || !user.reminders_enabled) return res.json([])

  const days: number[] = user.reminder_days ? JSON.parse(user.reminder_days) : []
  if (days.length === 0) return res.json([])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDates = days.map((n) => {
    const d = new Date(today)
    d.setDate(d.getDate() + n)
    return toDateStr(d)
  })

  const events = await db('calendar_events')
    .where({ user_id: userId })
    .whereIn('date', targetDates)
    .orderBy('date', 'asc')

  const result = events.map((event: any) => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    const daysUntil = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return {
      id: event.id,
      type: event.type,
      date: event.date,
      position: event.position || '',
      company: event.company || '',
      title: event.title || event.position || '',
      days_until: daysUntil,
    }
  })

  return res.json(result)
})
