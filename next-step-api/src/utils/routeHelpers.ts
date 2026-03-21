import { db } from '../db/knex'

export const normalizeDate = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export const normalizeNumericId = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const numeric = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null
}

export const getCompanyName = async (companyId: number | null): Promise<string> => {
  if (companyId == null) return ''
  const company = await db('companies').where({ id: companyId }).first()
  return company?.name || ''
}

export const createNotification = async (
  userId: number,
  title: string,
  description: string,
  type: 'system' | 'event' = 'system'
): Promise<void> => {
  try {
    await db('notifications').insert({
      user_id: userId,
      title,
      description,
      createdAt: new Date().toISOString().slice(0, 10),
      type,
    })
  } catch {
    // Notifications table may not exist during migrations — non-critical
  }
}
