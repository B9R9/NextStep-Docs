import { defineStore } from 'pinia'
import type { Company } from '../types'
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../services/companies.service'

export const useCompaniesStore = defineStore('companies', {
  state: () => ({
    rows: [] as Company[],
    isLoading: false,
    hasLoaded: false,
  }),
  actions: {
    async loadCompanies(params?: {
      q?: string
      industry?: string
      sortKey?: keyof Company
      sortDir?: 'asc' | 'desc'
    }) {
      this.isLoading = true
      try {
        this.rows = await fetchCompanies(params)
        this.hasLoaded = true
      } finally {
        this.isLoading = false
      }
    },
    async createCompany(payload: Company) {
      this.isLoading = true
      try {
        const created = await createCompany(payload)
        this.rows = [...this.rows, created]
        return created
      } finally {
        this.isLoading = false
      }
    },
    async updateCompany(payload: Company) {
      this.isLoading = true
      try {
        const updated = await updateCompany(payload)
        this.rows = this.rows.map((row) => (row.id === updated.id ? updated : row))
        return updated
      } finally {
        this.isLoading = false
      }
    },
    async deleteCompany(id: number) {
      this.isLoading = true
      try {
        await deleteCompany(id)
        this.rows = this.rows.filter((row) => row.id !== id)
      } finally {
        this.isLoading = false
      }
    },
  },
})
