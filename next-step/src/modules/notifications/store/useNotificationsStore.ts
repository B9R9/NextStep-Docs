import { defineStore } from 'pinia'
import type { Notification } from '../types'
import { fetchNotifications, dismissNotification, dismissAllNotifications } from '../services/notifications.service'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    rows: [] as Notification[],
    isLoading: false,
    hasLoaded: false,
  }),
  getters: {
    unreadCount: (state) => state.rows.length,
  },
  actions: {
    async loadNotifications() {
      this.isLoading = true
      try {
        this.rows = await fetchNotifications()
        this.hasLoaded = true
      } finally {
        this.isLoading = false
      }
    },
    async dismiss(id: number) {
      this.isLoading = true
      try {
        await dismissNotification(id)
        this.rows = this.rows.filter((row) => row.id !== id)
      } finally {
        this.isLoading = false
      }
    },
    async dismissAll() {
      const ids = this.rows.map((row) => row.id)
      this.isLoading = true
      try {
        await dismissAllNotifications(ids)
        this.rows = []
      } finally {
        this.isLoading = false
      }
    },
  },
})
