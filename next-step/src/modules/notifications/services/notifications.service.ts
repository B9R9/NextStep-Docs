import type { Notification } from '../types'
import { http } from '@/shared/api/http'

export const fetchNotifications = async () => {
  const { data } = await http.get<Notification[]>('/notifications')
  return data
}

export const dismissNotification = async (id: number) => {
  const { data } = await http.put<{ success: boolean }>(`/notifications/${id}/dismiss`)
  return data
}

export const dismissAllNotifications = async (ids: number[]) => {
  await Promise.all(ids.map((id) => http.put(`/notifications/${id}/dismiss`)))
}
