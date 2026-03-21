import type { ReminderSettings, ReminderEvent } from '../types'
import { http } from '@/shared/api/http'

export const fetchReminderSettings = async (): Promise<ReminderSettings> => {
  const { data } = await http.get<ReminderSettings>('/settings/reminders')
  return data
}

export const updateReminderSettings = async (payload: ReminderSettings): Promise<ReminderSettings> => {
  const { data } = await http.put<ReminderSettings>('/settings/reminders', payload)
  return data
}

export const fetchTodayReminders = async (): Promise<ReminderEvent[]> => {
  const { data } = await http.get<ReminderEvent[]>('/reminders/today')
  return data
}
