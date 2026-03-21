export type ReminderSettings = {
  reminders_enabled: boolean
  reminder_days: number[]
}

export type ReminderEvent = {
  id: number
  type: 'deadline' | 'published' | 'event'
  date: string
  position: string
  company: string
  title: string
  days_until: number
}
