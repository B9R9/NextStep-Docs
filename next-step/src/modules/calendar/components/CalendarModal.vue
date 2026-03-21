<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CalendarPanel from './CalendarPanel.vue'
import IconButton from '@/shared/components/IconButton.vue'
import { useCalendarStore } from '@/modules/calendar/store/useCalendarStore'
import type { CalendarEvent } from '@/modules/calendar/types'
import CalendarEventPreview from './CalendarEventPreview.vue'
import { useCalendarEventSync } from '../composables/useCalendarEventSync'
import SharedModal from '@/shared/components/SharedModal.vue'
import { useI18n } from 'vue-i18n'

const { syncEventToLinkedEntity } = useCalendarEventSync()

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open-calendar'): void
}>()

const calendarStore = useCalendarStore()
const { t } = useI18n()
const baseDate = new Date()
const events = computed(() => calendarStore.rows)
const selectedEvent = ref<CalendarEvent | null>(null)
const isEventPreviewOpen = ref(false)
const isEventEditOpen = ref(false)

watch(
  () => props.open,
  (value) => {
    if (value && !calendarStore.hasLoaded) {
      calendarStore.loadEvents()
    }
  },
)

const closePreviews = () => {
  isEventPreviewOpen.value = false
  isEventEditOpen.value = false
  selectedEvent.value = null
}

const openEventEdit = () => {
  isEventPreviewOpen.value = false
  isEventEditOpen.value = true
}

const saveEventEdit = async () => {
  if (!selectedEvent.value) return
  await calendarStore.updateEvent(selectedEvent.value)
  await syncEventToLinkedEntity(selectedEvent.value)
  isEventEditOpen.value = false
  isEventPreviewOpen.value = true
}

const deleteEvent = async () => {
  if (!selectedEvent.value) return
  await calendarStore.deleteEvent(selectedEvent.value.id)
  closePreviews()
}

const openFromEvent = (event: CalendarEvent) => {
  selectedEvent.value = event
  isEventPreviewOpen.value = true
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

  <SharedModal
    :open="isEventPreviewOpen"
    :title="selectedEvent?.title || selectedEvent?.position || t('calendar.event.generic')"
    @close="closePreviews"
  >
    <CalendarEventPreview
      v-if="selectedEvent"
      :event="selectedEvent"
      @edit="openEventEdit"
      @delete="deleteEvent"
    />
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
