import { defineStore } from 'pinia'
import type { CalendarEvent } from '../types'
import {
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../services/calendar.service'

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    rows: [] as CalendarEvent[],
    isLoading: false,
    hasLoaded: false,
  }),
  actions: {
    async loadEvents(params?: {
      q?: string
      sortKey?: keyof CalendarEvent
      sortDir?: 'asc' | 'desc'
    }) {
      this.isLoading = true
      try {
        this.rows = await fetchCalendarEvents(params)
        this.hasLoaded = true
      } finally {
        this.isLoading = false
      }
    },
    async createEvent(payload: CalendarEvent) {
      this.isLoading = true
      try {
        const created = await createCalendarEvent(payload)
        this.rows = [...this.rows, created]
        return created
      } finally {
        this.isLoading = false
      }
    },
    async updateEvent(payload: CalendarEvent) {
      this.isLoading = true
      try {
        const updated = await updateCalendarEvent(payload)
        this.rows = this.rows.map((row) => (row.id === updated.id ? updated : row))
        return updated
      } finally {
        this.isLoading = false
      }
    },
    async deleteEvent(id: number) {
      this.isLoading = true
      try {
        await deleteCalendarEvent(id)
        this.rows = this.rows.filter((row) => row.id !== id)
      } finally {
        this.isLoading = false
      }
    },
  },
})
