<script setup lang="ts">
import type { AdminChurn } from '../services/admin.service'

defineProps<{ churn: AdminChurn }>()
</script>

<template>
  <div class="rounded-lg border border-border bg-surface-2 p-4">
    <p class="mb-3 text-sm font-semibold">Churn / Deletions (30d)</p>
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p class="text-xs text-muted">Deletions this month</p>
        <p class="text-xl font-semibold tabular-nums">{{ churn.deletionsThisMonth }}</p>
        <p class="text-xs text-muted">Rate: {{ (churn.deletionRate30d * 100).toFixed(1) }}%</p>
      </div>
      <div>
        <p class="text-xs text-muted">Avg apps at deletion</p>
        <p class="text-xl font-semibold tabular-nums">{{ churn.avgApplicationsAtDeletion }}</p>
      </div>
    </div>

    <div class="mt-4">
      <p class="mb-2 text-xs font-medium text-muted">Lifecycle at deletion</p>
      <div class="space-y-1">
        <div v-for="(count, key) in churn.lifecycleDistribution" :key="key" class="flex justify-between text-xs">
          <span class="text-muted">{{ key }}</span>
          <span class="tabular-nums font-medium">{{ count }}</span>
        </div>
      </div>
    </div>

    <div v-if="Object.keys(churn.reasons).length" class="mt-4">
      <p class="mb-2 text-xs font-medium text-muted">Reasons</p>
      <div class="space-y-1">
        <div v-for="(count, reason) in churn.reasons" :key="reason" class="flex justify-between text-xs">
          <span class="text-muted">{{ reason }}</span>
          <span class="tabular-nums font-medium">{{ count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
