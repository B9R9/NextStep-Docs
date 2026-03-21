import type { Company } from '../types'
import { http } from '@/shared/api/http'
import { buildQuery } from '@/shared/utils/serviceHelpers'

type SortDir = 'asc' | 'desc'

type FetchParams = {
  q?: string
  industry?: string
  sortKey?: keyof Company
  sortDir?: SortDir
}

export const fetchCompanies = async (params: FetchParams = {}) => {
  const { data } = await http.get<Company[]>(`/companies${buildQuery(params)}`)
  return data
}

export const createCompany = async (payload: Company) => {
  const { id: _id, ...body } = payload
  const { data } = await http.post<Company>('/companies', body)
  return data
}

export const updateCompany = async (payload: Company) => {
  const { id, ...body } = payload
  const { data } = await http.put<Company>(`/companies/${id}`, body)
  return data
}

export const deleteCompany = async (id: number) => {
  const { data } = await http.delete<{ success: boolean }>(`/companies/${id}`)
  return data
}
