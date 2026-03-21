<script setup lang="ts">
import type { AdminApiStats } from '../services/admin.service'

defineProps<{ stats: AdminApiStats }>()
</script>

<template>
  <div class="rounded-lg border border-border bg-surface-2 p-4">
    <div class="mb-3 flex items-center justify-between">
      <p class="text-sm font-semibold">API health</p>
      <span class="text-xs text-muted">Since {{ new Date(stats.since).toLocaleDateString() }}</span>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-border text-left text-muted">
            <th class="pb-2 pr-4 font-medium">Route</th>
            <th class="pb-2 pr-3 text-right font-medium">Calls</th>
            <th class="pb-2 pr-3 text-right font-medium">Avg ms</th>
            <th class="pb-2 pr-3 text-right font-medium">Max ms</th>
            <th class="pb-2 text-right font-medium">Error rate</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in stats.routes"
            :key="r.route"
            class="border-b border-border last:border-0"
          >
            <td class="py-1.5 pr-4 font-mono">{{ r.route }}</td>
            <td class="py-1.5 pr-3 text-right tabular-nums">{{ r.count }}</td>
            <td class="py-1.5 pr-3 text-right tabular-nums">{{ r.avgMs }}</td>
            <td class="py-1.5 pr-3 text-right tabular-nums" :class="r.maxMs > 1000 ? 'text-[--color-warning]' : ''">{{ r.maxMs }}</td>
            <td
              class="py-1.5 text-right tabular-nums"
              :class="r.errorRate > 0.05 ? 'text-[--color-danger]' : r.errorRate > 0 ? 'text-[--color-warning]' : 'text-muted'"
            >
              {{ r.errorRate > 0 ? (r.errorRate * 100).toFixed(1) + '%' : '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
