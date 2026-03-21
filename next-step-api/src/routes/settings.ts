import { Router } from 'express'
import { db } from '../db/knex'

export const settingsRoutes = Router()

settingsRoutes.get('/reminders', async (req, res) => {
  const userId = (req as any).user.id
  const user = await db('users').where({ id: userId }).select('reminders_enabled', 'reminder_days').first()
  if (!user) return res.status(404).json({ error: 'User not found' })

  const reminderDays: number[] = user.reminder_days ? JSON.parse(user.reminder_days) : []

  return res.json({
    reminders_enabled: Boolean(user.reminders_enabled),
    reminder_days: reminderDays,
  })
})

settingsRoutes.put('/reminders', async (req, res) => {
  const userId = (req as any).user.id
  const { reminders_enabled, reminder_days } = req.body

  if (typeof reminders_enabled !== 'boolean') {
    return res.status(400).json({ error: 'reminders_enabled must be a boolean' })
  }
  if (
    !Array.isArray(reminder_days) ||
    !reminder_days.every((d) => Number.isInteger(d) && d >= 0 && d <= 365)
  ) {
    return res.status(400).json({ error: 'reminder_days must be an array of integers (0–365)' })
  }

  const dedupedSorted = [...new Set<number>(reminder_days)].sort((a, b) => a - b)

  await db('users').where({ id: userId }).update({
    reminders_enabled: reminders_enabled ? 1 : 0,
    reminder_days: JSON.stringify(dedupedSorted),
  })

  return res.json({ reminders_enabled, reminder_days: dedupedSorted })
})
