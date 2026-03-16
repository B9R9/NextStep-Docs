import type { CalendarEvent } from '../types'
import { http } from '@/shared/api/http'

type SortDir = 'asc' | 'desc'

type FetchParams = {
  q?: string
  sortKey?: keyof CalendarEvent
  sortDir?: SortDir
}

const buildQuery = (params: FetchParams = {}) => {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.sortKey) search.set('sortKey', params.sortKey)
  if (params.sortDir) search.set('sortDir', params.sortDir)
  const query = search.toString()
  return query ? `?${query}` : ''
}

export const fetchCalendarEvents = async (params: FetchParams = {}) => {
  const { data } = await http.get<CalendarEvent[]>(`/calendar/events${buildQuery(params)}`)
  return data
}

export const createCalendarEvent = async (payload: CalendarEvent) => {
  const { id: _id, ...body } = payload
  const { data } = await http.post<CalendarEvent>('/calendar/events', body)
  return data
}

export const updateCalendarEvent = async (payload: CalendarEvent) => {
  const { id, ...body } = payload
  const { data } = await http.put<CalendarEvent>(`/calendar/events/${id}`, body)
  return data
}

export const deleteCalendarEvent = async (id: number) => {
  const { data } = await http.delete<{ success: boolean }>(`/calendar/events/${id}`)
  return data
}
