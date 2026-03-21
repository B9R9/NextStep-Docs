import type { CalendarEvent } from '../types'
import { useJobsStore } from '@/modules/jobs/store/useJobsStore'
import { useApplicationsStore } from '@/modules/applications/store/useApplicationsStore'

export function useCalendarEventSync() {
  const jobsStore = useJobsStore()
  const applicationsStore = useApplicationsStore()

  const syncEventToLinkedEntity = async (event: CalendarEvent) => {
    if (event.jobId) {
      const job = jobsStore.rows.find((r) => r.id === event.jobId)
      if (!job) return
      const updated = { ...job }
      if (event.type === 'published') updated.published_at = event.date
      if (event.type === 'deadline') updated.deadline_at = event.date
      await jobsStore.updateJob(updated)
      return
    }
    if (event.applicationId) {
      const app = applicationsStore.rows.find((r) => r.id === event.applicationId)
      if (!app) return
      const updated = { ...app }
      if (event.type === 'event') updated.applied = event.date
      if (event.type === 'deadline') updated.deadline = event.date
      await applicationsStore.updateApplication(updated)
    }
  }

  return { syncEventToLinkedEntity }
}
