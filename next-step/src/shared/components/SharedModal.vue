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
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-black/40" @click="emit('close')"></div>
    <div class="relative w-full max-w-md">
      <div class="ns-card">
        <div class="ns-card-body space-y-4">
          <div class="flex items-center justify-between gap-2">
            <p v-if="title" class="text-sm font-semibold">{{ title }}</p>
            <button class="ns-btn ns-btn-ghost p-2" type="button" @click="emit('close')">
              <span class="material-symbols-rounded text-[18px] leading-none">close</span>
            </button>
          </div>
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
