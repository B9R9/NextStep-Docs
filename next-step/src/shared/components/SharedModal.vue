<script setup lang="ts">
import { useScrollLock } from '@/shared/composables/useScrollLock'

const props = defineProps<{
  open: boolean
  title?: string
}>()

useScrollLock(() => props.open)

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="absolute inset-0 bg-black/40" @click="emit('close')"></div>
    <div class="flex min-h-full items-start justify-center p-4 pt-12">
      <div class="relative w-full max-w-md">
        <div class="ns-card flex flex-col" style="max-height: calc(100vh - 4rem)">
          <div class="flex shrink-0 items-center justify-between gap-2 px-5 pt-5 sm:px-6 sm:pt-6">
            <p v-if="title" class="text-sm font-semibold">{{ title }}</p>
            <button class="ns-btn ns-btn-ghost p-2" type="button" @click="emit('close')">
              <span class="material-symbols-rounded text-[18px] leading-none">close</span>
            </button>
          </div>
          <div class="overflow-y-auto px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
