<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CalendarPanel from './CalendarPanel.vue'
import IconButton from '@/shared/components/IconButton.vue'
import { useCalendarStore } from '@/modules/calendar/store/useCalendarStore'
import { useJobsStore } from '@/modules/jobs/store/useJobsStore'
import { useApplicationsStore } from '@/modules/applications/store/useApplicationsStore'
import type { CalendarEvent } from '@/modules/calendar/types'
import type { Job } from '@/modules/jobs/types'
import type { Application } from '@/modules/applications/types'
import JobsPreviewDialog from '@/modules/jobs/components/JobsPreviewDialog.vue'
import ApplicationsPreviewDialog from '@/modules/applications/components/ApplicationsPreviewDialog.vue'
import SharedModal from '@/shared/components/SharedModal.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open-calendar'): void
}>()

const calendarStore = useCalendarStore()
const jobsStore = useJobsStore()
const applicationsStore = useApplicationsStore()
const { t } = useI18n()
const baseDate = new Date()
const events = computed(() => calendarStore.rows)
const selectedJob = ref<Job | null>(null)
const selectedApplication = ref<Application | null>(null)
const selectedEvent = ref<CalendarEvent | null>(null)
const isJobPreviewOpen = ref(false)
const isApplicationPreviewOpen = ref(false)
const isEventPreviewOpen = ref(false)
const isEventEditOpen = ref(false)

watch(
  () => props.open,
  (value) => {
    if (value && !calendarStore.hasLoaded) {
      calendarStore.loadEvents()
    }
    if (value && !jobsStore.hasLoaded) {
      jobsStore.loadJobs()
    }
    if (value && !applicationsStore.hasLoaded) {
      applicationsStore.loadApplications()
    }
  },
)

const closePreviews = () => {
  isJobPreviewOpen.value = false
  isApplicationPreviewOpen.value = false
  isEventPreviewOpen.value = false
  isEventEditOpen.value = false
  selectedJob.value = null
  selectedApplication.value = null
  selectedEvent.value = null
}

const openEventEdit = () => {
  isEventPreviewOpen.value = false
  isEventEditOpen.value = true
}

const saveEventEdit = async () => {
  if (!selectedEvent.value) return
  await calendarStore.updateEvent(selectedEvent.value)
  isEventEditOpen.value = false
  isEventPreviewOpen.value = true
}

const deleteEvent = async () => {
  if (!selectedEvent.value) return
  await calendarStore.deleteEvent(selectedEvent.value.id)
  closePreviews()
}

const openFromEvent = async (event: CalendarEvent) => {
  if (!jobsStore.hasLoaded) {
    await jobsStore.loadJobs()
  }
  if (!applicationsStore.hasLoaded) {
    await applicationsStore.loadApplications()
  }
  if (event.type === 'deadline') {
    if (event.applicationId) {
      selectedApplication.value =
        applicationsStore.rows.find((row) => row.id === event.applicationId) ?? null
      if (selectedApplication.value) {
        isApplicationPreviewOpen.value = true
      }
      return
    }
    if (event.jobId) {
      selectedJob.value = jobsStore.rows.find((row) => row.id === event.jobId) ?? null
      if (selectedJob.value) {
        isJobPreviewOpen.value = true
      }
      return
    }
  }

  if (event.type === 'published' && event.jobId) {
    selectedJob.value = jobsStore.rows.find((row) => row.id === event.jobId) ?? null
    if (selectedJob.value) {
      isJobPreviewOpen.value = true
    }
  }

  if (event.type === 'event') {
    selectedEvent.value = event
    isEventPreviewOpen.value = true
  }
}
</script>

<template>
  <div v-if="props.open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/20" @click="emit('close')"></div>
  </div>
  <transition name="calendar-slide">
    <div v-if="props.open" class="fixed inset-x-0 top-0 z-50">
      <div class="relative">
        <CalendarPanel
          :base-date="baseDate"
          :range-days="31"
          :events="events"
          show-action
          :action-label="t('calendar.form.openCalendar')"
          @action="emit('open-calendar')"
          @select="openFromEvent"
        />
        <div class="absolute right-4 top-4">
          <IconButton :label="t('common.close')" icon="close" @click="emit('close')" />
        </div>
      </div>
    </div>
  </transition>

  <JobsPreviewDialog
    :open="isJobPreviewOpen"
    :row="selectedJob"
    @close="closePreviews"
  />
  <ApplicationsPreviewDialog
    :open="isApplicationPreviewOpen"
    :row="selectedApplication"
    @close="closePreviews"
  />

  <SharedModal
    :open="isEventPreviewOpen"
    :title="selectedEvent?.title || t('calendar.event.generic')"
    @close="closePreviews"
  >
    <div class="space-y-2 text-sm">
      <p class="text-xs text-muted">{{ t('calendar.form.date') }}</p>
      <p class="font-semibold">{{ selectedEvent?.date || '—' }}</p>
      <p class="text-xs text-muted">{{ t('calendar.form.description') }}</p>
      <p class="whitespace-pre-wrap">{{ selectedEvent?.description || '—' }}</p>
      <div class="flex justify-end gap-2 pt-2">
        <button class="ns-btn ns-btn-ghost" type="button" @click="openEventEdit">
          {{ t('common.edit') }}
        </button>
        <button class="ns-btn ns-btn-ghost text-danger" type="button" @click="deleteEvent">
          {{ t('common.delete') }}
        </button>
      </div>
    </div>
  </SharedModal>

  <SharedModal
    :open="isEventEditOpen"
    :title="t('calendar.form.edit')"
    @close="closePreviews"
  >
    <div v-if="selectedEvent" class="space-y-3 text-sm">
      <label class="grid gap-1">
        <span class="text-xs text-muted">{{ t('calendar.form.name') }}</span>
        <input v-model="selectedEvent.title" class="ns-input" />
      </label>
      <label class="grid gap-1">
        <span class="text-xs text-muted">{{ t('calendar.form.type') }}</span>
        <select v-model="selectedEvent.type" class="ns-input">
          <option value="deadline">{{ t('calendar.form.types.deadline') }}</option>
          <option value="event">{{ t('calendar.form.types.event') }}</option>
          <option value="published">{{ t('calendar.form.types.published') }}</option>
        </select>
      </label>
      <label class="grid gap-1">
        <span class="text-xs text-muted">{{ t('calendar.form.description') }}</span>
        <textarea v-model="selectedEvent.description" class="ns-textarea text-xs"></textarea>
      </label>
      <label class="grid gap-1">
        <span class="text-xs text-muted">{{ t('calendar.form.date') }}</span>
        <input v-model="selectedEvent.date" type="date" class="ns-input" />
      </label>
      <div class="flex justify-end gap-2 pt-2">
        <button class="ns-btn ns-btn-ghost" type="button" @click="closePreviews">
          {{ t('common.close') }}
        </button>
        <button class="ns-btn ns-btn-primary" type="button" @click="saveEventEdit">
          {{ t('common.save') }}
        </button>
      </div>
    </div>
  </SharedModal>
</template>

<style scoped>
.calendar-slide-enter-active,
.calendar-slide-leave-active {
  transition: transform 500ms ease, opacity 380ms ease;
}

.calendar-slide-enter-from,
.calendar-slide-leave-to {
  transform: translateY(-12px);
  opacity: 0;
}
</style>
