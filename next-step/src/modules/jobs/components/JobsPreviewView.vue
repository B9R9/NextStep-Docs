<script setup lang="ts">
import { computed } from 'vue'
import type { Job } from '../types'
import { useI18n } from 'vue-i18n'
import { toISODate } from '@/shared/utils/date'

const { t } = useI18n()

const props = defineProps<{
  row: Job | null
  companiesById: Record<number, string>
  contractLabel: Record<string, string>
  levelLabel: Record<string, string>
  workModeLabel: Record<string, string>
  industryLabel: Record<string, string>
  formatDateShort: (value: string) => string
}>()

const warningThresholdDays = 2

const deadlineState = computed(() => {
  const iso = toISODate(props.row?.deadline_at || '')
  if (!iso) return 'normal'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadline = new Date(`${iso}T00:00:00`)
  const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0) return 'overdue'
  if (diffDays <= warningThresholdDays) return 'warning'
  return 'normal'
})

const deadlineBannerClass = computed(() => {
  if (deadlineState.value === 'overdue') return 'ns-banner-danger'
  if (deadlineState.value === 'warning') return 'ns-banner-warning'
  return ''
})

</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3 overflow-y-auto pr-1">
    <!-- LEFT -->
    <div class="space-y-6 lg:col-span-2">
      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('jobs.preview.dates') }}</p>
        </header>
        <div class="grid gap-2 sm:grid-cols-2">
          <div class="ns-banner">
            <p class="text-xs text-muted">{{ t('jobs.preview.publishedAt') }}</p>
            <p class="text-sm font-semibold">{{ formatDateShort(row?.published_at || '') }}</p>
          </div>
          <div class="ns-banner" :class="deadlineBannerClass">
            <p class="text-xs text-muted">{{ t('jobs.preview.deadlineAt') }}</p>
            <p class="text-sm font-semibold">{{ formatDateShort(row?.deadline_at || '') }}</p>
          </div>
        </div>
      </section>

      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('jobs.preview.description') }}</p>
        </header>
        <p class="text-base leading-relaxed whitespace-pre-wrap">{{ row?.description || '-' }}</p>
      </section>

    </div>

    <!-- RIGHT -->
    <div class="space-y-4">
      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('jobs.preview.meta') }}</p>
        </header>
        <div class="ns-kv">
          <div class="ns-kv-row">
            <p class="ns-k">{{ t('jobs.preview.industry') }}</p>
            <p class="ns-v font-semibold">{{ industryLabel[row?.industry || ''] || row?.industry || '-' }}</p>
          </div>
          <div class="ns-kv-row">
            <p class="ns-k">{{ t('jobs.preview.workMode') }}</p>
            <p class="ns-v font-semibold">{{ workModeLabel[row?.work_mode || ''] || row?.work_mode || '-' }}</p>
          </div>
          <div class="ns-kv-row">
            <p class="ns-k">{{ t('jobs.preview.location') }}</p>
            <p class="ns-v font-semibold">{{ row?.location || '-' }}</p>
          </div>
          <div class="ns-kv-row">
            <p class="ns-k">{{ t('jobs.preview.languages') }}</p>
            <p class="ns-v font-semibold">
              {{ row?.languages?.length ? row.languages.join(', ') : '-' }}
            </p>
          </div>
          <div class="ns-kv-row">
            <p class="ns-k">{{ t('jobs.preview.link') }}</p>
            <a
              v-if="row?.link"
              class="ns-v inline-flex items-center justify-center text-primary hover:text-primary-hover"
              :href="row.link"
              target="_blank"
              rel="noopener noreferrer"
              :title="row.link"
            >
              <span class="material-symbols-rounded text-[20px] leading-none">open_in_new</span>
            </a>
            <p v-else class="ns-v text-muted">—</p>
          </div>
        </div>
      </section>

      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('jobs.preview.requirements') }}</p>
        </header>
        <p class="text-base leading-relaxed whitespace-pre-wrap">{{ row?.requirements || '-' }}</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.ns-banner-warning {
  background: var(--color-warning-soft);
  border-color: color-mix(in oklab, var(--color-warning) 28%, var(--color-border) 72%);
  color: color-mix(in oklab, var(--color-warning) 70%, var(--color-text) 30%);
}

.ns-banner-danger {
  background: var(--color-danger-soft);
  border-color: color-mix(in oklab, var(--color-danger) 28%, var(--color-border) 72%);
  color: color-mix(in oklab, var(--color-danger) 70%, var(--color-text) 30%);
}
</style>
