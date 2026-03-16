export type CalendarEventType = 'deadline' | 'published' | 'event'

export type CalendarEvent = {
  id: number
  type: CalendarEventType
  date: string
  jobId?: number | null
  applicationId?: number | null
  position: string
  company: string
  title?: string
  description?: string
}
