import { http, HttpResponse } from 'msw'
import type { CalendarEvent } from '@/modules/calendar/types'

let calendarDb: CalendarEvent[] = [
  {
    id: 1,
    type: 'deadline',
    date: '2026-02-25',
    applicationId: 10,
    jobId: 10,
    position: 'Growth Analyst',
    company: 'Lumen Labs',
  },
  {
    id: 2,
    type: 'deadline',
    date: '2026-03-20',
    applicationId: 3,
    jobId: 3,
    position: 'Design System Lead',
    company: 'Studio Ardoise',
  },
  {
    id: 3,
    type: 'deadline',
    date: '2026-03-30',
    applicationId: 7,
    jobId: 7,
    position: 'Marketing Ops',
    company: 'Brightline',
  },
  {
    id: 4,
    type: 'published',
    date: '2026-02-18',
    jobId: 1,
    position: 'Software Engineer',
    company: 'Tech Corp',
  },
  {
    id: 5,
    type: 'published',
    date: '2026-02-21',
    jobId: 2,
    position: 'Product Designer',
    company: 'Lumen Labs',
  },
  {
    id: 6,
    type: 'published',
    date: '2026-03-02',
    jobId: 5,
    position: 'UX Writer',
    company: 'Orion Studio',
  },
  {
    id: 7,
    type: 'event',
    date: '2026-03-05',
    position: '',
    company: '',
    title: 'Portfolio review',
    description: 'Block 90 minutes to update case studies.',
  },
]

const sortEvents = (rows: CalendarEvent[], key: keyof CalendarEvent, dir: 'asc' | 'desc') => {
  const sorted = [...rows]
  sorted.sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return dir === 'asc' ? aVal - bVal : bVal - aVal
    }
    return dir === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })
  return sorted
}

const matchesSearch = (event: CalendarEvent, query: string) => {
  const q = query.toLowerCase()
  return Object.values(event).some((value) => String(value).toLowerCase().includes(q))
}

export const calendarHandlers = [
  http.get('/api/calendar/events', ({ request }) => {
    const url = new URL(request.url)
    const sortKey = url.searchParams.get('sortKey') as keyof CalendarEvent | null
    const sortDir = (url.searchParams.get('sortDir') as 'asc' | 'desc' | null) || 'asc'
    const q = url.searchParams.get('q')

    let rows = calendarDb
    if (q) {
      rows = rows.filter((row) => matchesSearch(row, q))
    }
    if (sortKey) {
      rows = sortEvents(rows, sortKey, sortDir)
    }
    return HttpResponse.json(rows)
  }),
  http.post('/api/calendar/events', async ({ request }) => {
    const data = (await request.json()) as Partial<CalendarEvent>
    const nextId = Math.max(0, ...calendarDb.map((row) => row.id)) + 1
    const created: CalendarEvent = {
      id: nextId,
      type: data.type ?? 'published',
      date: data.date ?? '',
      jobId: data.jobId ?? null,
      applicationId: data.applicationId ?? null,
      position: data.position ?? '',
      company: data.company ?? '',
      title: data.title ?? '',
      description: data.description ?? '',
    }
    calendarDb = [...calendarDb, created]
    return HttpResponse.json(created, { status: 201 })
  }),
  http.put('/api/calendar/events/:id', async ({ params, request }) => {
    const id = Number(params.id)
    const data = (await request.json()) as Partial<CalendarEvent>
    const index = calendarDb.findIndex((row) => row.id === id)
    if (index === -1) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    const updated = { ...calendarDb[index], ...data, id }
    calendarDb = calendarDb.map((row, idx) => (idx === index ? updated : row))
    return HttpResponse.json(updated)
  }),
  http.delete('/api/calendar/events/:id', ({ params }) => {
    const id = Number(params.id)
    calendarDb = calendarDb.filter((row) => row.id !== id)
    return HttpResponse.json({ success: true })
  }),
]
