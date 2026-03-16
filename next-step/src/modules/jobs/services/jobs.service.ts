import type { Job } from '../types'
import { http } from '@/shared/api/http'

type SortDir = 'asc' | 'desc'

type FetchParams = {
  q?: string
  sortKey?: keyof Job
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

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

const normalizeJob = (row: Job): Job => ({
  ...row,
  id: Number(row.id),
  company_id: toNullableNumber((row as Job & { company_id?: unknown }).company_id),
})

export const fetchJobs = async (params: FetchParams = {}) => {
  const { data } = await http.get<Job[]>(`/jobs${buildQuery(params)}`)
  return data.map(normalizeJob)
}

export const createJob = async (payload: Job) => {
  const { id: _id, ...body } = payload
  const { data } = await http.post<Job>('/jobs', body)
  return normalizeJob(data)
}

export const updateJob = async (payload: Job) => {
  const { id, ...body } = payload
  const { data } = await http.put<Job>(`/jobs/${id}`, body)
  return normalizeJob(data)
}


export const deleteJob = async (id: number) => {
  const { data } = await http.delete<{ success: boolean }>(`/jobs/${id}`)
  return data
}
