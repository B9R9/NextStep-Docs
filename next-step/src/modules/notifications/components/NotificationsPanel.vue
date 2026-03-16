<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Notification } from '../types'
import { formatDateDDMMYYYY } from '@/shared/utils/date'

const { t } = useI18n()

const props = defineProps<{
  notifications: Notification[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'dismiss', id: number): void
}>()
</script>

<template>
  <div
    class="absolute right-0 mt-3 w-[22rem] rounded-2xl border border-border bg-surface shadow-paper"
    data-notifications-panel
  >
    <div class="flex items-center justify-between border-b border-border px-4 py-3">
      <div>
        <p class="text-sm font-semibold">{{ t('notifications.title') }}</p>
        <p class="text-xs text-muted">{{ t('notifications.count', { count: props.notifications.length }) }}</p>
      </div>
    </div>

    <div class="max-h-[360px] overflow-y-auto">
      <div v-if="props.loading">
        <div
          v-for="i in 4"
          :key="i"
          class="flex items-start justify-between gap-3 px-4 py-3 border-t border-border first:border-t-0"
        >
          <div class="min-w-0 flex-1 space-y-1.5">
            <div class="skeleton h-3.5 w-32 rounded" />
            <div class="skeleton h-3 w-48 rounded" />
            <div class="skeleton h-2.5 w-16 rounded" />
          </div>
          <div class="skeleton h-3 w-12 rounded shrink-0" />
        </div>
      </div>
      <div v-else-if="!props.notifications.length" class="px-4 py-6 text-sm text-muted">
        {{ t('notifications.empty') }}
      </div>
      <div v-else>
        <div
          v-for="item in props.notifications"
          :key="item.id"
          class="flex items-start justify-between gap-3 px-4 py-3 border-t border-border first:border-t-0"
        >
          <div class="min-w-0">
            <p class="text-sm font-semibold">{{ item.title }}</p>
            <p class="text-xs text-muted">{{ item.description }}</p>
            <p class="text-[11px] text-muted">{{ formatDateDDMMYYYY(item.createdAt) }}</p>
          </div>
          <button
            class="text-[11px] font-semibold text-muted hover:text-text"
            type="button"
            @click.stop="emit('dismiss', item.id)"
          >
            {{ t('notifications.dismiss') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  background: color-mix(in oklab, var(--color-border) 80%, var(--color-bg) 20%);
  animation: skeleton-pulse 1.6s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}
</style>
