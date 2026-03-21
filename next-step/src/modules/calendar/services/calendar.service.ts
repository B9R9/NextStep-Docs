import type { CalendarEvent } from '../types'
import { http } from '@/shared/api/http'
import { buildQuery } from '@/shared/utils/serviceHelpers'

type SortDir = 'asc' | 'desc'

type FetchParams = {
  q?: string
  sortKey?: keyof CalendarEvent
  sortDir?: SortDir
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
