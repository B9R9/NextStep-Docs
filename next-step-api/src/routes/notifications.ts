import { Router } from 'express'
import { db } from '../db/knex'

export const notificationsRoutes = Router()

notificationsRoutes.get('/', async (req, res) => {
  const userId = (req as any).user.id
  try {
    const rows = await db('notifications')
      .where({ user_id: userId, dismissed: false })
      .orderBy('createdAt', 'desc')
    return res.json(rows)
  } catch {
    // The table may not exist yet during migration bootstrap.
    return res.json([])
  }
})

notificationsRoutes.put('/:id/dismiss', async (req, res) => {
  const userId = (req as any).user.id
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid notification id' })
  }

  try {
    const updatedCount = await db('notifications')
      .where({ id, user_id: userId })
      .update({ dismissed: true })

    if (!updatedCount) {
      return res.status(404).json({ message: 'Not found' })
    }
    return res.json({ success: true })
  } catch {
    return res.json({ success: true })
  }
})
