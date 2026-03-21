<template>
  <div class="ns-card rounded-none border-x-0 border-t-0">
    <div class="ns-card-body">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-2">
          <div class="skeleton h-3 w-20 rounded" />
          <div class="skeleton h-6 w-40 rounded" />
        </div>
      </div>

      <div class="mt-4 grid gap-2 sm:gap-3">
        <!-- Weekday labels -->
        <div class="grid grid-cols-7 gap-2">
          <div v-for="i in 7" :key="i" class="skeleton mx-auto h-3 w-8 rounded" />
        </div>

        <!-- Calendar grid: 6 rows × 7 cols -->
        <div class="grid grid-cols-7 gap-2 sm:gap-3">
          <div
            v-for="i in 42"
            :key="i"
            class="skeleton min-h-[60px] rounded-lg sm:min-h-[80px]"
          />
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
