<script setup lang="ts">
import { computed } from 'vue'
import type { AdminOverview } from '../services/admin.service'

const props = defineProps<{ overview: AdminOverview }>()

const STATUS_ORDER = [
  { key: 'saved', label: 'Saved', color: 'bg-[--color-border]' },
  { key: 'applied', label: 'Applied', color: 'bg-blue-500' },
  { key: 'screening', label: 'Screening', color: 'bg-indigo-500' },
  { key: 'technical_assessment', label: 'Technical', color: 'bg-violet-500' },
  { key: 'interview', label: 'Interview', color: 'bg-[--color-warning]' },
  { key: 'final_round', label: 'Final round', color: 'bg-orange-500' },
  { key: 'offer_received', label: 'Offer', color: 'bg-[--color-success]' },
  { key: 'rejected', label: 'Rejected', color: 'bg-[--color-danger]' },
  { key: 'no_response', label: 'No response', color: 'bg-gray-400' },
  { key: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-300' },
]

const total = computed(() => props.overview.applications.total || 1)

const rows = computed(() =>
  STATUS_ORDER.map((s) => ({
    ...s,
    count: props.overview.applications.byStatus[s.key] || 0,
    pct: Math.round(((props.overview.applications.byStatus[s.key] || 0) / total.value) * 100),
  })).filter((r) => r.count > 0).sort((a, b) => b.count - a.count)
)
</script>

<template>
  <div class="rounded-lg border border-border bg-surface-2 p-4">
    <p class="mb-3 text-sm font-semibold">Application funnel</p>
    <div class="space-y-2">
      <div v-for="row in rows" :key="row.key" class="flex items-center gap-3">
        <span class="w-28 shrink-0 text-xs text-muted">{{ row.label }}</span>
        <div class="flex-1 overflow-hidden rounded-full bg-border h-2">
          <div :class="['h-2 rounded-full', row.color]" :style="{ width: row.pct + '%' }" />
        </div>
        <span class="w-16 text-right text-xs tabular-nums">{{ row.count }} <span class="text-muted">({{ row.pct }}%)</span></span>
      </div>
    </div>
  </div>
</template>
