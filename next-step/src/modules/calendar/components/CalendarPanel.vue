<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import IconButton from '@/shared/components/IconButton.vue'
import type { CalendarEvent } from '../types'
import { toISODate } from '@/shared/utils/date'

const props = withDefaults(
  defineProps<{
    showAction?: boolean
    actionLabel?: string
    baseDate?: Date | null
    rangeDays?: number | null
    events?: CalendarEvent[]
  }>(),
  {
    showAction: false,
    actionLabel: '',
    baseDate: null,
    rangeDays: null,
    events: () => [],
  },
)

const emit = defineEmits<{
  (e: 'action'): void
  (e: 'select', event: CalendarEvent): void
}>()

const { t, locale } = useI18n()

const nextMonthDate = computed(() => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1)
})

const activeDate = computed(() => props.baseDate ?? nextMonthDate.value)

const monthLabel = computed(() => {
  if (props.rangeDays) {
    return t('calendar.rangeLabel', { days: props.rangeDays })
  }
  return new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' }).format(
    activeDate.value,
  )
})

const weekdayLabels = computed(() => {
  const base = new Date(2024, 0, 1) // Monday
  const formatter = new Intl.DateTimeFormat(locale.value, { weekday: 'short' })
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(base)
    date.setDate(base.getDate() + index)
    return formatter.format(date)
  })
})

const monthGrid = computed(() => {
  const year = activeDate.value.getFullYear()
  const month = activeDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = (firstDay.getDay() + 6) % 7
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - offset + 1
    if (day < 1 || day > daysInMonth) return null
    return new Date(year, month, day)
  })
})

const rangeGrid = computed(() => {
  if (!props.rangeDays) return []
  const start = props.baseDate ? new Date(props.baseDate) : new Date()
  start.setHours(0, 0, 0, 0)
  const offset = (start.getDay() + 6) % 7
  const total = props.rangeDays
  const cells = offset + total
  return Array.from({ length: Math.ceil(cells / 7) * 7 }, (_, index) => {
    const dayIndex = index - offset
    if (dayIndex < 0 || dayIndex >= total) return null
    const date = new Date(start)
    date.setDate(start.getDate() + dayIndex)
    return date
  })
})

const eventsByDate = computed(() => {
  const map = new Map<string, CalendarEvent[]>()
  props.events.forEach((event) => {
    const eventDate = toISODate(event.date || '')
    if (!eventDate) return
    const list = map.get(eventDate) ?? []
    list.push(event)
    map.set(eventDate, list)
  })
  return map
})

const toISO = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const todayIso = computed(() => toISO(new Date()))

const eventsForDate = (date: Date | null) => {
  if (!date) return []
  return eventsByDate.value.get(toISO(date)) ?? []
}

const onEventClick = (event: CalendarEvent) => {
  emit('select', event)
}
</script>

<template>
  <div class="ns-card rounded-none border-x-0 border-t-0">
    <div class="ns-card-body">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase text-muted">{{ t('nav.calendar.title') }}</p>
          <h2 class="text-xl font-semibold">{{ monthLabel }}</h2>
        </div>
        <div v-if="props.showAction" class="flex items-center gap-2">
          <IconButton :label="props.actionLabel" icon="open_in_full" @click="emit('action')" />
        </div>
      </div>

      <div class="mt-4 grid gap-2 sm:gap-3">
        <div class="grid grid-cols-7 gap-2 text-[11px] uppercase text-muted">
          <span v-for="label in weekdayLabels" :key="label" class="text-center">
            {{ label }}
          </span>
        </div>

        <div class="grid grid-cols-7 gap-2 sm:gap-3">
          <div
            v-for="(cell, index) in props.rangeDays ? rangeGrid : monthGrid"
            :key="index"
            class="min-h-[3.5rem] rounded-xl border border-border bg-surface px-2 py-2 text-xs"
            :class="[
              cell ? 'text-text' : 'text-muted/40 bg-surface-2 border-transparent',
              cell && toISO(cell) === todayIso ? 'calendar-cell-today' : '',
            ]"
          >
            <template v-if="cell">
              <span class="font-semibold">{{ cell.getDate() }}</span>
              <span v-if="cell.getDate() === 1" class="ml-1 text-[10px] text-muted">
                {{ cell.toLocaleString(locale.value, { month: 'short' }) }}
              </span>
              <div class="mt-1 grid gap-1">
                <button
                  v-for="item in eventsForDate(cell)"
                  :key="item.id"
                  class="calendar-event"
                  :class="
                    item.type === 'deadline'
                      ? 'calendar-event-deadline'
                      : item.type === 'published'
                        ? 'calendar-event-published'
                        : 'calendar-event-generic'
                  "
                  type="button"
                  @click="onEventClick(item)"
                >
                  {{
                    item.type === 'deadline'
                      ? t('calendar.event.deadline', { position: item.position, company: item.company })
                      : item.type === 'published'
                        ? t('calendar.event.published', { position: item.position, company: item.company })
                        : item.title || t('calendar.event.generic')
                  }}
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-event {
  display: block;
  width: 100%;
  text-align: left;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
  line-height: 1.2;
  border: 1px solid transparent;
  transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease;
}

.calendar-event-deadline {
  background: var(--color-danger-soft);
  border-color: color-mix(in oklab, var(--color-danger) 28%, var(--color-border) 72%);
  color: color-mix(in oklab, var(--color-danger) 70%, var(--color-text) 30%);
}

.calendar-event-published {
  background: var(--color-success-soft);
  border-color: color-mix(in oklab, var(--color-success) 28%, var(--color-border) 72%);
  color: color-mix(in oklab, var(--color-success) 70%, var(--color-text) 30%);
}

.calendar-event-generic {
  background: var(--color-surface-2);
  border-color: var(--color-border);
  color: var(--color-text);
}

.calendar-cell-today {
  border-color: color-mix(in oklab, var(--color-primary) 50%, var(--color-border) 50%);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary) 20%, transparent 80%);
  background: color-mix(in oklab, var(--color-primary) 8%, var(--color-surface) 92%);
}
</style>
