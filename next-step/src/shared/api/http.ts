import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/modules/auth/store/useAuthStore'
import { getOrCreateSessionId } from '@/shared/utils/session'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10_000,
  withCredentials: true, // send cookies cross-origin (refresh_token cookie)
})

// ── Silent refresh state ──────────────────────────────────────────────────────
let isRefreshing = false
let refreshQueue: Array<(accessToken: string | null) => void> = []

function processQueue(accessToken: string | null) {
  refreshQueue.forEach((resolve) => resolve(accessToken))
  refreshQueue = []
}

// ── Request interceptor: attach access token from store ───────────────────────
http.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`
  }
  config.headers['X-Session-Id'] = getOrCreateSessionId()
  return config
})

// ── Response interceptor: silent refresh on 401 ───────────────────────────────
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Only attempt refresh once per request, and not on auth routes themselves
    const isAuthRoute = (originalRequest.url ?? '').includes('/auth/')
    if (error?.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push((accessToken) => {
            if (!accessToken) return reject(error)
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${accessToken}`,
            }
            originalRequest._retry = true
            resolve(http(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Dynamic import to avoid circular dependency at module init time
        const { refresh } = await import('@/modules/auth/services/auth.service')
        const authStore = useAuthStore()

        const newAccessToken = await refresh()
        authStore.setAccessToken(newAccessToken)
        processQueue(newAccessToken)

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        }
        return http(originalRequest)
      } catch {
        processQueue(null)
        const authStore = useAuthStore()
        authStore.clearSession()
        const current = window.location.pathname
        if (current !== '/login') {
          window.location.href = `/login?redirect=${encodeURIComponent(current)}`
        }
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
