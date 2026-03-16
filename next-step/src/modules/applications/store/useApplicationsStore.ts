import { defineStore } from 'pinia'
import type { Application } from '../types'
import {
  fetchApplications,
  createApplication,
  updateApplication,
  updateApplicationCalendarSync,
  deleteApplication,
} from '../services/applications.service'

export const useApplicationsStore = defineStore('applications', {
  state: () => ({
    rows: [] as Application[],
    isLoading: false,
    hasLoaded: false,
    loadError: false,
  }),
  actions: {
    async loadApplications(params?: {
      q?: string
      sortKey?: keyof Application
      sortDir?: 'asc' | 'desc'
    }) {
      this.isLoading = true
      this.loadError = false
      try {
        this.rows = await fetchApplications(params)
        this.hasLoaded = true
      } catch (err) {
        console.error('[useApplicationsStore] loadApplications failed', err)
        this.loadError = true
        this.hasLoaded = true
      } finally {
        this.isLoading = false
      }
    },
    async createApplication(payload: Application) {
      this.isLoading = true
      try {
        const created = await createApplication(payload)
        this.rows = [...this.rows, created]
        return created
      } finally {
        this.isLoading = false
      }
    },
    async updateApplication(payload: Application) {
      this.isLoading = true
      try {
        const updated = await updateApplication(payload)
        this.rows = this.rows.map((row) => (row.id === updated.id ? updated : row))
        return updated
      } finally {
        this.isLoading = false
      }
    },
    async updateCalendarSync(
      id: number,
      payload: { applied_in_calendar?: boolean; deadline_in_calendar?: boolean },
    ) {
      const updated = await updateApplicationCalendarSync(id, payload)
      this.rows = this.rows.map((row) => (row.id === updated.id ? updated : row))
      return updated
    },
    async deleteApplication(id: number) {
      this.isLoading = true
      try {
        await deleteApplication(id)
        this.rows = this.rows.filter((row) => row.id !== id)
      } finally {
        this.isLoading = false
      }
    },
  },
})
