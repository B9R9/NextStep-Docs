<script setup lang="ts">
import type { AdminOverview } from '../services/admin.service'

const props = defineProps<{ overview: AdminOverview }>()

const cards = [
  { label: 'Total users', value: () => props.overview.users.total, sub: () => `+${props.overview.users.registeredThisWeek} this week` },
  { label: 'Active this week', value: () => props.overview.users.activeThisWeek, sub: () => `${props.overview.users.activeThisMonth} this month` },
  { label: 'Total applications', value: () => props.overview.applications.total, sub: () => `+${props.overview.applications.createdThisWeek} this week` },
  { label: 'Avg apps / user', value: () => props.overview.applications.avgPerUser, sub: () => `Median: ${props.overview.engagement.medianApplicationsPerUser}` },
  { label: 'Total jobs', value: () => props.overview.jobs.total, sub: () => `+${props.overview.jobs.createdThisWeek} this week` },
  { label: 'Total companies', value: () => props.overview.companies.total, sub: () => `${props.overview.engagement.usersNeverUsedCompanies} users never used` },
  { label: 'Churned 30d', value: () => props.overview.users.churned30d, sub: () => '' },
  { label: 'Conv. reg → app', value: () => `${Math.round(props.overview.conversion.registeredToFirstApplication * 100)}%`, sub: () => `Interview → Offer: ${Math.round(props.overview.conversion.interviewToOffer * 100)}%` },
]
</script>

<template>
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
    <div v-for="card in cards" :key="card.label" class="rounded-lg border border-border bg-surface-2 p-4">
      <p class="text-xs text-muted">{{ card.label }}</p>
      <p class="mt-1 text-2xl font-semibold tabular-nums">{{ card.value() }}</p>
      <p v-if="card.sub()" class="mt-0.5 text-xs text-muted">{{ card.sub() }}</p>
    </div>
  </div>
</template>
