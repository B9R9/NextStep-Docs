import { defineStore } from 'pinia'
import type { AuthUser } from '../services/auth.service'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    user: null as AuthUser | null,
    isAdmin: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken,
  },

  actions: {
    setSession(accessToken: string, user: AuthUser) {
      this.accessToken = accessToken
      this.user = user
    },

    setAccessToken(accessToken: string) {
      this.accessToken = accessToken
    },

    setAdmin(value: boolean) {
      this.isAdmin = value
    },

    clearSession() {
      this.accessToken = null
      this.user = null
      this.isAdmin = false
    },
  },
})
