<script setup lang="ts">
import { computed } from 'vue'
import type { AdminOverview } from '../services/admin.service'

const props = defineProps<{ overview: AdminOverview }>()

const total = computed(() => props.overview.users.total || 1)

const features = computed(() => [
  {
    label: 'Applications',
    users: props.overview.engagement.usersWithApplications,
    pct: Math.round((props.overview.engagement.usersWithApplications / total.value) * 100),
    never: props.overview.users.total - props.overview.engagement.usersWithApplications,
  },
  {
    label: 'Jobs',
    users: props.overview.engagement.usersWithJobs,
    pct: Math.round((props.overview.engagement.usersWithJobs / total.value) * 100),
    never: props.overview.users.total - props.overview.engagement.usersWithJobs,
  },
  {
    label: 'Calendar',
    users: props.overview.engagement.usersWithCalendarEvents,
    pct: Math.round((props.overview.engagement.usersWithCalendarEvents / total.value) * 100),
    never: props.overview.engagement.usersNeverUsedCalendar,
  },
  {
    label: 'Companies',
    users: props.overview.users.total - props.overview.engagement.usersNeverUsedCompanies,
    pct: Math.round(((props.overview.users.total - props.overview.engagement.usersNeverUsedCompanies) / total.value) * 100),
    never: props.overview.engagement.usersNeverUsedCompanies,
  },
  {
    label: 'CV attached',
    users: props.overview.applications.withCV,
    pct: props.overview.applications.total > 0 ? Math.round((props.overview.applications.withCV / props.overview.applications.total) * 100) : 0,
    never: null,
    note: '% of applications',
  },
  {
    label: 'Cover letter',
    users: props.overview.applications.withCL,
    pct: props.overview.applications.total > 0 ? Math.round((props.overview.applications.withCL / props.overview.applications.total) * 100) : 0,
    never: null,
    note: '% of applications',
  },
])
</script>

<template>
  <div class="rounded-lg border border-border bg-surface-2 p-4">
    <p class="mb-3 text-sm font-semibold">Feature adoption</p>
    <div class="space-y-3">
      <div v-for="f in features" :key="f.label">
        <div class="flex items-center justify-between text-xs">
          <span>{{ f.label }} <span v-if="f.note" class="text-muted">({{ f.note }})</span></span>
          <span class="tabular-nums font-semibold">{{ f.pct }}%</span>
        </div>
        <div class="mt-1 h-2 overflow-hidden rounded-full bg-border">
          <div class="h-2 rounded-full bg-[--color-primary]" :style="{ width: f.pct + '%' }" />
        </div>
        <p v-if="f.never !== null" class="mt-0.5 text-xs text-muted">{{ f.never }} users never used</p>
      </div>
    </div>
  </div>
</template>
