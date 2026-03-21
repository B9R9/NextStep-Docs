import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { useAuthStore } from '@/modules/auth/store/useAuthStore'
import { refresh, me } from '@/modules/auth/services/auth.service'
import { checkAdminAccess } from '@/modules/admin/services/admin.service'
import { useRemindersStore } from '@/modules/reminders/store/useRemindersStore'

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Attempt to restore session from refresh token cookie on first navigation
let sessionRestored = false

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!sessionRestored) {
    sessionRestored = true
    if (!authStore.isLoggedIn) {
      try {
        const accessToken = await refresh()
        authStore.setAccessToken(accessToken) // set before calling me() so the interceptor sends the Bearer
        const user = await me()
        authStore.setSession(accessToken, user)
        try {
          await checkAdminAccess()
          authStore.setAdmin(true)
        } catch {
          authStore.setAdmin(false)
        }
        useRemindersStore().checkAndShowPopup()
      } catch {
        // No valid refresh token — user is not authenticated, that's fine
      }
    }
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth === true)

  if (requiresAuth && !authStore.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin) {
    try {
      await checkAdminAccess()
    } catch {
      return { path: '/applications' }
    }
  }

  if (to.path === '/login' && authStore.isLoggedIn) {
    return { path: '/applications' }
  }
})
