import { defineStore } from 'pinia'
import type { AdminOverview, AdminApiStats, AdminChurn, AdminFeedback } from '../services/admin.service'
import { fetchOverview, fetchApiStats, fetchChurn, fetchFeedback } from '../services/admin.service'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    overview: null as AdminOverview | null,
    apiStats: null as AdminApiStats | null,
    churn: null as AdminChurn | null,
    feedback: null as AdminFeedback | null,
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    async loadAll() {
      this.isLoading = true
      this.error = null
      try {
        const [overview, apiStats, churn, feedback] = await Promise.all([
          fetchOverview(),
          fetchApiStats(),
          fetchChurn(),
          fetchFeedback(),
        ])
        this.overview = overview
        this.apiStats = apiStats
        this.churn = churn
        this.feedback = feedback
      } catch (err) {
        this.error = 'Failed to load admin data'
        console.error('[adminStore.loadAll]', err)
      } finally {
        this.isLoading = false
      }
    },
  },
})
