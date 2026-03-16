import { http } from '@/shared/api/http'

export type AuthUser = {
  id: number
  email: string
  name: string
}

type AuthResponse = {
  user: AuthUser
  token: string
}

const AUTH_TOKEN_KEY = 'auth_token'

export const setAuthToken = (token: string) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY)

export const login = async (payload: { email: string; password: string }) => {
  const { data } = await http.post<AuthResponse>('/auth/login', payload)
  setAuthToken(data.token)
  return data
}

export const register = async (payload: { name: string; email: string; password: string }) => {
  const { data } = await http.post<AuthResponse>('/auth/register', payload)
  setAuthToken(data.token)
  return data
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
  clearAuthToken()
  return data
}
