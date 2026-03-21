<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDateDDMMYYYY } from '@/shared/utils/date'
import type { CalendarEvent } from '../types'

const props = defineProps<{
  event: CalendarEvent
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const { t } = useI18n()

const context = computed(() => {
  const { type, jobId, applicationId, position, company } = props.event
  if (type === 'event' && applicationId) {
    return {
      label: t('calendar.context.appliedApplication'),
      badgeClass: 'ns-badge-primary',
      autoDescription: t('calendar.context.appliedApplicationDesc', { position, company }),
    }
  }
  if (type === 'deadline' && applicationId) {
    return {
      label: t('calendar.context.deadlineApplication'),
      badgeClass: 'ns-badge-danger',
      autoDescription: t('calendar.context.deadlineApplicationDesc', { position, company }),
    }
  }
  if (type === 'deadline' && jobId) {
    return {
      label: t('calendar.context.deadlineJob'),
      badgeClass: 'ns-badge-warning',
      autoDescription: t('calendar.context.deadlineJobDesc', { position, company }),
    }
  }
  if (type === 'published' && jobId) {
    return {
      label: t('calendar.context.published'),
      badgeClass: 'ns-badge-success',
      autoDescription: t('calendar.context.publishedDesc', { position, company }),
    }
  }
  return {
    label: t('calendar.context.event'),
    badgeClass: '',
    autoDescription: '',
  }
})

const title = computed(() =>
  props.event.position || props.event.title || t('calendar.event.generic'),
)

const description = computed(() =>
  props.event.description || context.value.autoDescription,
)
</script>

<template>
  <div class="space-y-4 text-sm">
    <span class="ns-badge" :class="context.badgeClass">{{ context.label }}</span>

    <div>
      <p class="text-base font-semibold">{{ title }}</p>
      <p v-if="event.company" class="text-xs text-muted">{{ event.company }}</p>
    </div>

    <p class="text-lg font-semibold tabular-nums">{{ formatDateDDMMYYYY(event.date) }}</p>

    <p v-if="description" class="text-muted whitespace-pre-wrap text-xs leading-relaxed">{{ description }}</p>

    <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
      <div class="flex gap-2">
        <button class="ns-btn ns-btn-ghost" type="button" @click="emit('edit')">
          {{ t('common.edit') }}
        </button>
        <button class="ns-btn ns-btn-ghost text-danger" type="button" @click="emit('delete')">
          {{ t('common.delete') }}
        </button>
      </div>
    </div>
  </div>
</template>
