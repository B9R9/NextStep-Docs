import { http, HttpResponse } from 'msw'
import type { Notification } from '@/modules/notifications/types'

let notificationsDb: Notification[] = [
  {
    id: 1,
    title: 'Deadline in 2 days',
    description: 'Growth Analyst at Lumen Labs ends soon.',
    createdAt: '2026-02-08',
    type: 'deadline',
  },
  {
    id: 2,
    title: 'Published',
    description: 'Product Designer at Lumen Labs is live.',
    createdAt: '2026-02-09',
    type: 'published',
  },
  {
    id: 3,
    title: 'Portfolio review',
    description: 'Reminder: review your portfolio updates.',
    createdAt: '2026-02-10',
    type: 'event',
  },
]

export const notificationsHandlers = [
  http.get('/api/notifications', () => {
    return HttpResponse.json(notificationsDb)
  }),
  http.put('/api/notifications/:id/dismiss', ({ params }) => {
    const id = Number(params.id)
    notificationsDb = notificationsDb.filter((row) => row.id !== id)
    return HttpResponse.json({ success: true })
  }),
]
