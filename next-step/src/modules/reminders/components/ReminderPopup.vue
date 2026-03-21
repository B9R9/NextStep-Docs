<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRemindersStore } from '../store/useRemindersStore'
import { formatDateDDMMYYYY } from '@/shared/utils/date'

const { t } = useI18n()
const store = useRemindersStore()

const eventIcon = (type: string) => {
  if (type === 'deadline') return 'timer'
  if (type === 'published') return 'work'
  return 'event'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div
        v-if="store.showPopup"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        @click.self="store.dismissAll()"
      >
        <div class="ns-fade-in w-full max-w-md rounded-2xl border border-border bg-surface shadow-paper">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p class="text-sm font-semibold">{{ t('reminders.popup.title') }}</p>
              <p class="text-xs text-muted">
                {{ t('reminders.popup.subtitle', { count: store.reminders.length }) }}
              </p>
            </div>
            <button type="button" class="text-muted hover:text-text" @click="store.dismissAll()">
              <span class="material-symbols-rounded text-[20px]">close</span>
            </button>
          </div>

          <!-- List -->
          <div class="max-h-80 overflow-y-auto">
            <div
              v-for="event in store.reminders"
              :key="event.id"
              class="flex items-start gap-3 border-b border-border px-5 py-3 last:border-0"
            >
              <span
                class="material-symbols-rounded mt-0.5 shrink-0 text-[18px]"
                :class="event.type === 'deadline' ? 'text-danger' : 'text-primary'"
              >
                {{ eventIcon(event.type) }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium">{{ event.title || event.position }}</p>
                <p v-if="event.company" class="truncate text-xs text-muted">{{ event.company }}</p>
                <p class="text-xs text-muted">{{ formatDateDDMMYYYY(event.date) }}</p>
              </div>
              <span
                class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                :class="
                  event.days_until === 0
                    ? 'bg-danger-soft text-danger'
                    : 'border border-border bg-surface-2 text-muted'
                "
              >
                {{
                  event.days_until === 0
                    ? t('reminders.popup.today')
                    : t('reminders.popup.inNDays', { n: event.days_until })
                }}
              </span>
              <button
                type="button"
                class="ml-1 shrink-0 text-muted hover:text-text"
                :aria-label="t('reminders.popup.dismiss')"
                @click="store.dismissOne(event.id)"
              >
                <span class="material-symbols-rounded text-[16px]">close</span>
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end border-t border-border px-5 py-3">
            <button type="button" class="ns-btn ns-btn-ghost text-sm" @click="store.dismissAll()">
              {{ t('reminders.popup.dismissAll') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 200ms var(--ease-organic);
}
.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}
</style>
