import type { Job } from '../types'
import { http } from '@/shared/api/http'
import { buildQuery, toNullableNumber } from '@/shared/utils/serviceHelpers'

type SortDir = 'asc' | 'desc'

type FetchParams = {
  q?: string
  sortKey?: keyof Job
  sortDir?: SortDir
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
