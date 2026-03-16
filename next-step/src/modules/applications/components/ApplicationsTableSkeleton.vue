<script setup lang="ts">
defineProps<{ rows?: number }>()
</script>

<template>
  <table class="w-full text-left text-sm border-separate border-spacing-y-2">
    <thead class="text-xs uppercase text-muted">
      <tr>
        <th class="px-3 py-2"><div class="skeleton h-3 w-20 rounded" /></th>
        <th class="px-3 py-2"><div class="skeleton h-3 w-20 rounded" /></th>
        <th class="px-3 py-2"><div class="skeleton h-3 w-16 rounded" /></th>
        <th class="px-3 py-2"><div class="skeleton h-3 w-16 rounded" /></th>
        <th class="px-3 py-2"><div class="skeleton h-3 w-20 rounded" /></th>
        <th class="px-3 py-2"><div class="skeleton h-3 w-20 rounded" /></th>
        <th class="px-3 py-2"><div class="skeleton h-3 w-8 rounded mx-auto" /></th>
        <th class="px-3 py-2"><div class="skeleton h-3 w-8 rounded mx-auto" /></th>
        <th class="px-3 py-2"><div class="skeleton h-3 w-8 rounded mx-auto" /></th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="i in (rows ?? 6)"
        :key="i"
        class="bg-surface-2 border border-border"
      >
        <td class="px-3 py-3 rounded-l-lg"><div class="skeleton h-4 w-32 rounded" /></td>
        <td class="px-3 py-3"><div class="skeleton h-4 w-24 rounded" /></td>
        <td class="px-3 py-3"><div class="skeleton h-4 w-20 rounded" /></td>
        <td class="px-3 py-3">
          <div class="flex items-center gap-2">
            <div class="skeleton h-2.5 w-2.5 rounded-full shrink-0" />
            <div class="skeleton h-4 w-20 rounded" />
          </div>
        </td>
        <td class="px-3 py-3"><div class="skeleton h-4 w-20 rounded" /></td>
        <td class="px-3 py-3"><div class="skeleton h-4 w-20 rounded" /></td>
        <td class="px-3 py-3 text-center"><div class="skeleton h-5 w-10 rounded-full mx-auto" /></td>
        <td class="px-3 py-3 text-center"><div class="skeleton h-5 w-10 rounded-full mx-auto" /></td>
        <td class="px-3 py-3 rounded-r-lg"><div class="skeleton h-6 w-6 rounded mx-auto" /></td>
      </tr>
    </tbody>
  </table>
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
