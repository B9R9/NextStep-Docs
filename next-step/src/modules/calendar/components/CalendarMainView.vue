<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import CalendarPanel from './CalendarPanel.vue'
import CalendarEventForm from './CalendarEventForm.vue'
import SharedModal from '@/shared/components/SharedModal.vue'
import IconButton from '@/shared/components/IconButton.vue'
import { useI18n } from 'vue-i18n'
import { useCalendarStore } from '../store/useCalendarStore'
import { useJobsStore } from '@/modules/jobs/store/useJobsStore'
import { useApplicationsStore } from '@/modules/applications/store/useApplicationsStore'
import type { CalendarEvent } from '../types'
import type { Job } from '@/modules/jobs/types'
import type { Application } from '@/modules/applications/types'
import JobsPreviewDialog from '@/modules/jobs/components/JobsPreviewDialog.vue'
import ApplicationsPreviewDialog from '@/modules/applications/components/ApplicationsPreviewDialog.vue'

const { t, locale } = useI18n()
const calendarStore = useCalendarStore()
const jobsStore = useJobsStore()
const applicationsStore = useApplicationsStore()

const monthOffset = ref(0)
const selectedMonth = ref<number | null>(null)
const selectedYear = ref<number | null>(null)

const monthOptions = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, { month: 'long' })
  return Array.from({ length: 12 }, (_, index) => ({
    value: index,
    label: formatter.format(new Date(2024, index, 1)),
  }))
})

const yearOptions = computed(() => {
  const now = new Date().getFullYear()
  return Array.from({ length: 7 }, (_, index) => now - 3 + index)
})
const baseDate = computed(() => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + monthOffset.value, 1)
})

watch(
  baseDate,
  (value) => {
    selectedMonth.value = value.getMonth()
    selectedYear.value = value.getFullYear()
  },
  { immediate: true },
)

watch([selectedMonth, selectedYear], ([month, year]) => {
  if (month == null || year == null) return
  const now = new Date()
  const newOffset = (year - now.getFullYear()) * 12 + (month - now.getMonth())
  if (newOffset !== monthOffset.value) {
    monthOffset.value = newOffset
  }
})

const goPrev = () => {
  monthOffset.value -= 1
}

const goNext = () => {
  monthOffset.value += 1
}

const isFormOpen = ref(false)

const submitEvent = async (payload: {
  title: string
  type: 'deadline' | 'event' | 'published'
  description: string
  date: string
}) => {
  try {
    await calendarStore.createEvent({
      id: 0,
      type: payload.type,
      date: payload.date,
      position: '',
      company: '',
      title: payload.title,
      description: payload.description,
    })
    isFormOpen.value = false
    showFeedback('success', t('calendar.feedback.created'))
  } catch {
    showFeedback('error', t('calendar.feedback.error'))
  }
}

const selectedJob = ref<Job | null>(null)
const selectedApplication = ref<Application | null>(null)
const selectedEvent = ref<CalendarEvent | null>(null)
const isJobPreviewOpen = ref(false)
const isApplicationPreviewOpen = ref(false)
const isEventPreviewOpen = ref(false)
const isEventEditOpen = ref(false)
const feedback = ref<{ kind: 'success' | 'error'; message: string } | null>(null)
let feedbackTimer: ReturnType<typeof setTimeout> | undefined

const showFeedback = (kind: 'success' | 'error', message: string) => {
  feedback.value = { kind, message }
  if (feedbackTimer) clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => {
    feedback.value = null
  }, 3000)
}

const feedbackClass = computed(() => {
  if (!feedback.value) return ''
  return feedback.value.kind === 'error' ? 'feedback-error' : 'feedback-success'
})

const closePreviews = () => {
  isJobPreviewOpen.value = false
  isApplicationPreviewOpen.value = false
  isEventPreviewOpen.value = false
  isEventEditOpen.value = false
  selectedJob.value = null
  selectedApplication.value = null
  selectedEvent.value = null
}

const openFromEvent = (event: CalendarEvent) => {
  selectedEvent.value = event
  isEventPreviewOpen.value = true
}

const openLinkedJob = () => {
  if (!selectedEvent.value?.jobId) return
  selectedJob.value = jobsStore.rows.find((row) => row.id === selectedEvent.value!.jobId) ?? null
  if (!selectedJob.value) return
  isEventPreviewOpen.value = false
  isJobPreviewOpen.value = true
}

const openLinkedApplication = () => {
  if (!selectedEvent.value?.applicationId) return
  selectedApplication.value = applicationsStore.rows.find((row) => row.id === selectedEvent.value!.applicationId) ?? null
  if (!selectedApplication.value) return
  isEventPreviewOpen.value = false
  isApplicationPreviewOpen.value = true
}

const openEventEdit = () => {
  isEventPreviewOpen.value = false
  isEventEditOpen.value = true
}

const saveEventEdit = async () => {
  if (!selectedEvent.value) return
  try {
    await calendarStore.updateEvent(selectedEvent.value)
    isEventEditOpen.value = false
    isEventPreviewOpen.value = true
    showFeedback('success', t('calendar.feedback.updated'))
  } catch {
    showFeedback('error', t('calendar.feedback.error'))
  }
}

const deleteEvent = async () => {
  if (!selectedEvent.value) return
  try {
    await calendarStore.deleteEvent(selectedEvent.value.id)
    closePreviews()
    showFeedback('success', t('calendar.feedback.deleted'))
  } catch {
    showFeedback('error', t('calendar.feedback.error'))
  }
}

onMounted(() => {
  calendarStore.loadEvents()
  jobsStore.loadJobs()
  applicationsStore.loadApplications()
})
</script>

<template>
  <div class="bg-bg text-text">
    <section class="ns-container max-w-none px-2 sm:px-4 py-8 sm:py-12">
      <div class="flex flex-col gap-6">
        <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight">
              {{ t('calendar.title') }}
            </h1>
            <p class="ns-card-subtitle">{{ t('calendar.subtitle') }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <label class="flex items-center gap-2 text-xs text-muted">
              {{ t('calendar.month') }}
              <select v-model.number="selectedMonth" class="ns-input h-9 text-xs">
                <option v-for="option in monthOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <label class="flex items-center gap-2 text-xs text-muted">
              {{ t('calendar.year') }}
              <select v-model.number="selectedYear" class="ns-input h-9 text-xs">
                <option v-for="year in yearOptions" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </label>
            <button class="ns-btn ns-btn-primary" type="button" @click="isFormOpen = true">
              {{ t('calendar.form.add') }}
            </button>
            <IconButton :label="t('calendar.prev')" icon="chevron_left" @click="goPrev" />
            <IconButton :label="t('calendar.next')" icon="chevron_right" @click="goNext" />
          </div>
        </header>

        <div class="grid gap-4">
          <CalendarPanel :base-date="baseDate" :events="calendarStore.rows" @select="openFromEvent" />
        </div>
      </div>
    </section>
  </div>

  <SharedModal :open="isFormOpen" :title="t('calendar.form.title')" @close="isFormOpen = false">
    <CalendarEventForm @submit="submitEvent" @close="isFormOpen = false" />
  </SharedModal>

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
    :title="selectedEvent?.title || selectedEvent?.position || t('calendar.event.generic')"
    @close="closePreviews"
  >
    <div class="space-y-3 text-sm">
      <span
        class="ns-badge"
        :class="selectedEvent?.type === 'deadline' ? 'ns-badge-danger' : selectedEvent?.type === 'published' ? 'ns-badge-success' : ''"
      >
        {{ t(`calendar.form.types.${selectedEvent?.type || 'event'}`) }}
      </span>

      <div v-if="selectedEvent?.position || selectedEvent?.company">
        <p v-if="selectedEvent?.position" class="font-semibold">{{ selectedEvent.position }}</p>
        <p v-if="selectedEvent?.company" class="text-xs text-muted">{{ selectedEvent.company }}</p>
      </div>

      <div>
        <p class="text-xs text-muted">{{ t('calendar.form.date') }}</p>
        <p class="font-semibold">{{ selectedEvent?.date || '—' }}</p>
      </div>

      <div v-if="selectedEvent?.description">
        <p class="text-xs text-muted">{{ t('calendar.form.description') }}</p>
        <p class="whitespace-pre-wrap">{{ selectedEvent.description }}</p>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div class="flex gap-2">
          <button v-if="selectedEvent?.jobId" class="ns-btn ns-btn-ghost text-sm" type="button" @click="openLinkedJob">
            {{ t('calendar.preview.viewJob') }}
          </button>
          <button v-if="selectedEvent?.applicationId" class="ns-btn ns-btn-ghost text-sm" type="button" @click="openLinkedApplication">
            {{ t('calendar.preview.viewApplication') }}
          </button>
        </div>
        <div class="flex gap-2">
          <button class="ns-btn ns-btn-ghost" type="button" @click="openEventEdit">
            {{ t('common.edit') }}
          </button>
          <button class="ns-btn ns-btn-ghost text-danger" type="button" @click="deleteEvent">
            {{ t('common.delete') }}
          </button>
        </div>
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

  <Transition name="feedback-toast">
    <div
      v-if="feedback"
      class="fixed bottom-5 left-1/2 z-[70] w-[min(92vw,30rem)] -translate-x-1/2 rounded-xl border px-4 py-3 shadow-paper backdrop-blur-sm"
      :class="feedbackClass"
      role="status"
      aria-live="polite"
    >
      <p class="text-sm font-medium">{{ feedback.message }}</p>
    </div>
  </Transition>
</template>

<style scoped>
.feedback-toast-enter-active,
.feedback-toast-leave-active {
  transition:
    opacity 220ms ease,
    transform 260ms ease;
}

.feedback-toast-enter-from,
.feedback-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 24px);
}

.feedback-success {
  color: color-mix(in oklab, var(--color-success) 72%, var(--color-text) 28%);
  border-color: color-mix(in oklab, var(--color-success) 32%, var(--color-border) 68%);
  background: color-mix(in oklab, var(--color-success-soft) 82%, transparent 18%);
}

.feedback-error {
  color: color-mix(in oklab, var(--color-danger) 76%, var(--color-text) 24%);
  border-color: color-mix(in oklab, var(--color-danger) 36%, var(--color-border) 64%);
  background: color-mix(in oklab, var(--color-danger-soft) 84%, transparent 16%);
}
</style>
