import { defineStore } from 'pinia'
import type { ReminderSettings, ReminderEvent } from '../types'
import { fetchReminderSettings, updateReminderSettings, fetchTodayReminders } from '../services/reminders.service'

export const useRemindersStore = defineStore('reminders', {
  state: () => ({
    settings: null as ReminderSettings | null,
    reminders: [] as ReminderEvent[],
    showPopup: false,
  }),
  actions: {
    async loadSettings() {
      try {
        this.settings = await fetchReminderSettings()
      } catch {
        this.settings = { reminders_enabled: false, reminder_days: [] }
      }
    },

    async saveSettings(payload: ReminderSettings) {
      this.settings = await updateReminderSettings(payload)
    },

    async checkAndShowPopup() {
      try {
        const events = await fetchTodayReminders()
        if (events.length > 0) {
          this.reminders = events
          this.showPopup = true
        }
      } catch {
        // Non-critical — silently ignore
      }
    },

    dismissOne(id: number) {
      this.reminders = this.reminders.filter((r) => r.id !== id)
      if (this.reminders.length === 0) this.showPopup = false
    },

    dismissAll() {
      this.reminders = []
      this.showPopup = false
    },
  },
})
