export type Notification = {
  id: number
  title: string
  description: string
  createdAt: string
  type?: 'deadline' | 'published' | 'event' | 'system'
}
