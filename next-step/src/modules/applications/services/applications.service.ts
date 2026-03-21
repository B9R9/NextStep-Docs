import type { Application } from '../types'
import { http } from '@/shared/api/http'
import { buildQuery, toNullableNumber } from '@/shared/utils/serviceHelpers'

type SortDir = 'asc' | 'desc'

type FetchParams = {
  q?: string
  sortKey?: keyof Application
  sortDir?: SortDir
}

const normalizeApplication = (row: Application): Application => ({
  ...row,
  id: Number(row.id),
  company_id: toNullableNumber((row as Application & { company_id?: unknown }).company_id),
  jobId: toNullableNumber((row as Application & { jobId?: unknown }).jobId),
  applied: row.applied || '',
  deadline: row.deadline || '',
})

export const fetchApplications = async (params: FetchParams = {}) => {
  const { data } = await http.get<Application[]>(`/applications${buildQuery(params)}`)
  return data.map(normalizeApplication)
}

export const createApplication = async (payload: Application) => {
  const { id: _id, ...body } = payload
  const { data } = await http.post<Application>('/applications', body)
  return normalizeApplication(data)
}

export const updateApplication = async (payload: Application) => {
  const { id, ...body } = payload
  const { data } = await http.put<Application>(`/applications/${id}`, body)
  return normalizeApplication(data)
}

export const updateApplicationCalendarSync = async (
  id: number,
  payload: { applied_in_calendar?: boolean; deadline_in_calendar?: boolean },
) => {
  try {
    const { data } = await http.put<Application>(`/applications/${id}/calendar-sync`, payload)
    return normalizeApplication(data)
  } catch {
    const { data } = await http.patch<Application>(`/applications/${id}/calendar-sync`, payload)
    return normalizeApplication(data)
  }
}

export const deleteApplication = async (id: number) => {
  const { data } = await http.delete<{ success: boolean }>(`/applications/${id}`)
  return data
}
