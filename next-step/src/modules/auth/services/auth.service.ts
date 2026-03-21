import { http } from '@/shared/api/http'

export type AuthUser = {
  id: number
  email: string
  name: string
}

type AuthResponse = {
  user: AuthUser
  accessToken: string
}

export const login = async (payload: { email: string; password: string }) => {
  const { data } = await http.post<AuthResponse>('/auth/login', payload)
  return data
}

export const register = async (payload: { name: string; email: string; password: string }) => {
  const { data } = await http.post<AuthResponse>('/auth/register', payload)
  return data
}

export const refresh = async () => {
  const { data } = await http.post<{ accessToken: string }>('/auth/refresh')
  return data.accessToken
}

export const logout = async () => {
  await http.post('/auth/logout')
}

export const me = async () => {
  const { data } = await http.get<AuthUser>('/auth/me')
  return data
}

export const updateMe = async (payload: { name?: string; email?: string }) => {
  const { data } = await http.patch<AuthUser>('/auth/me', payload)
  return data
}

export const updatePassword = async (payload: { currentPassword: string; newPassword: string }) => {
  const { data } = await http.patch<{ success: boolean }>('/auth/password', payload)
  return data
}

export const deleteMe = async (password: string) => {
  const { data } = await http.delete<{ success: boolean }>('/auth/me', { data: { password } })
  return data
}
