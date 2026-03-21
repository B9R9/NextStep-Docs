import { http } from '@/shared/api/http'

export type AdminOverview = {
  users: {
    total: number
    registeredToday: number
    registeredThisWeek: number
    registeredThisMonth: number
    activeThisWeek: number
    activeThisMonth: number
    churned30d: number
  }
  applications: {
    total: number
    avgPerUser: number
    byStatus: Record<string, number>
    withCV: number
    withCL: number
    createdThisWeek: number
  }
  jobs: { total: number; createdThisWeek: number; avgPerUser: number }
  companies: { total: number; topIndustries: { industry: string; count: number }[] }
  engagement: {
    usersWithApplications: number
    usersWithJobs: number
    usersWithCalendarEvents: number
    usersNeverUsedCompanies: number
    usersNeverUsedCalendar: number
    avgApplicationsPerActiveUser: number
    medianApplicationsPerUser: number
  }
  conversion: {
    registeredToFirstApplication: number
    applicationToInterview: number
    interviewToOffer: number
  }
}

export type AdminApiStats = {
  since: string
  routes: {
    route: string
    count: number
    errors4xx: number
    errors5xx: number
    avgMs: number
    maxMs: number
    errorRate: number
  }[]
}

export type AdminUser = {
  id: number
  email: string
  name: string
  created_at: string
  applications: number
  jobs: number
}

export type AdminChurn = {
  deletionsThisMonth: number
  deletionRate30d: number
  lifecycleDistribution: Record<string, number>
  reasons: Record<string, number>
  avgApplicationsAtDeletion: number
  avgJobsAtDeletion: number
}

export type FeedbackStatus = 'new' | 'in_progress' | 'archived'

export type AdminFeedbackRow = {
  id: number
  subject: string
  message: string
  is_anonymous: boolean
  email: string | null
  status: FeedbackStatus
  ticket_number: string | null
  created_at: string
  updated_at: string
}

export type AdminFeedback = {
  total: number
  page: number
  limit: number
  anonymousCount: number
  bySubject: Record<string, number>
  byStatus: Record<string, number>
  rows: AdminFeedbackRow[]
}

export const checkAdminAccess = async () => {
  await http.get('/admin/me')
}

export const fetchOverview = async (): Promise<AdminOverview> => {
  const { data } = await http.get('/admin/stats/overview')
  return data
}

export const fetchApiStats = async (): Promise<AdminApiStats> => {
  const { data } = await http.get('/admin/stats/api')
  return data
}

export const fetchUsers = async (page = 1, limit = 50) => {
  const { data } = await http.get('/admin/stats/users', { params: { page, limit } })
  return data as { total: number; page: number; limit: number; users: AdminUser[] }
}

export const fetchChurn = async (): Promise<AdminChurn> => {
  const { data } = await http.get('/admin/stats/churn')
  return data
}

export const fetchEvents = async (params?: Record<string, string>) => {
  const { data } = await http.get('/admin/stats/events', { params })
  return data
}

export const fetchFeedback = async (page = 1, limit = 50, status?: string): Promise<AdminFeedback> => {
  const { data } = await http.get('/admin/stats/feedback', { params: { page, limit, status } })
  return data
}

export const updateFeedbackStatus = async (
  id: number,
  payload: { status?: string; ticket_number?: string }
): Promise<AdminFeedbackRow> => {
  const { data } = await http.patch(`/admin/feedback/${id}`, payload)
  return data
}
