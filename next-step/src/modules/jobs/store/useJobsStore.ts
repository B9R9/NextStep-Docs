import { defineStore } from 'pinia'
import type { Job } from '../types'
import { createJob, deleteJob, fetchJobs, updateJob } from '../services/jobs.service'

export const companiesById: Record<number, string> = {
  1: 'TechCorp',
  2: 'Nimble Labs',
  3: 'Sable & Co',
  4: 'Everbeam',
  5: 'Lumen Labs',
}

export const useJobsStore = defineStore('jobs', {
  state: () => ({
    rows: [] as Job[],
    isLoading: false,
    hasLoaded: false,
    loadError: false,
  }),
  actions: {
    async loadJobs(params?: { q?: string; sortKey?: keyof Job; sortDir?: 'asc' | 'desc' }) {
      this.isLoading = true
      this.loadError = false
      try {
        this.rows = await fetchJobs(params)
        this.hasLoaded = true
      } catch (err) {
        console.error('[useJobsStore] loadJobs failed', err)
        this.loadError = true
        this.hasLoaded = true
      } finally {
        this.isLoading = false
      }
    },
    async createJob(payload: Job) {
      this.isLoading = true
      try {
        const created = await createJob(payload)
        this.rows = [...this.rows, created]
        return created
      } finally {
        this.isLoading = false
      }
    },
    async updateJob(payload: Job) {
      this.isLoading = true
      try {
        const updated = await updateJob(payload)
        this.rows = this.rows.map((row) =>
          Number(row.id) === Number(updated.id) ? updated : row,
        )
        return updated
      } finally {
        this.isLoading = false
      }
    },
    async deleteJob(id: number) {
      this.isLoading = true
      try {
        await deleteJob(id)
        this.rows = this.rows.filter((row) => Number(row.id) !== Number(id))
      } finally {
        this.isLoading = false
      }
    },
  },
})
