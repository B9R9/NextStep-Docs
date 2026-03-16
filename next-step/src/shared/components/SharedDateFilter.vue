<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { formatDateDDMMYYYY } from '@/shared/utils/date'

export type DateFilterValue = {
  operator: 'before' | 'after' | null
  date: string
}

const props = defineProps<{
  label: string
  modelValue: DateFilterValue
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateFilterValue): void
}>()

const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const instanceId = `date-filter-${Math.random().toString(36).slice(2, 9)}`

const displayLabel = computed(() => {
  if (!props.modelValue.operator || !props.modelValue.date) return props.label
  const prefix = props.modelValue.operator === 'before' ? 'Before' : 'After'
  return `${prefix} ${formatDateDDMMYYYY(props.modelValue.date)}`
})

const toggleOpen = () => {
  const next = !isOpen.value
  if (next) {
    window.dispatchEvent(new CustomEvent('shared-datefilter-open', { detail: instanceId }))
  }
  isOpen.value = next
}

const updateOperator = (value: 'before' | 'after') => {
  emit('update:modelValue', { ...props.modelValue, operator: value })
}

const updateDate = (value: string) => {
  emit('update:modelValue', { ...props.modelValue, date: value })
}

const handleOtherOpen = (event: CustomEvent<string>) => {
  if (event.detail !== instanceId) {
    isOpen.value = false
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node | null
  if (!rootRef.value || !target) return
  if (isOpen.value && !rootRef.value.contains(target)) {
    isOpen.value = false
    const otherFilter = (target as HTMLElement | null)?.closest?.(
      '[data-multiselect-root],[data-datefilter-root]',
    )
    if (!otherFilter) {
      event.stopPropagation()
      event.preventDefault()
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
  window.addEventListener('shared-datefilter-open', handleOtherOpen as EventListener)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true)
  window.removeEventListener('shared-datefilter-open', handleOtherOpen as EventListener)
})
</script>

<template>
  <div ref="rootRef" class="relative" data-datefilter-root>
    <button
      class="ns-input flex w-full items-center justify-between gap-2 text-left"
      type="button"
      @click="toggleOpen"
    >
      <span class="truncate" :class="modelValue.operator && modelValue.date ? '' : 'text-muted'">
        {{ displayLabel }}
      </span>
      <span class="text-xs text-muted">▾</span>
    </button>

    <div
      v-if="isOpen"
      class="absolute z-10 mt-2 w-full rounded-xl border border-border bg-surface shadow-paper p-3"
    >
      <div class="grid gap-2 text-sm">
        <div class="flex items-center gap-2">
          <button
            class="ns-btn ns-btn-ghost px-3 py-1 text-xs"
            type="button"
            :class="modelValue.operator === 'before' ? 'text-text' : 'text-muted'"
            @click="updateOperator('before')"
          >
            Before
          </button>
          <button
            class="ns-btn ns-btn-ghost px-3 py-1 text-xs"
            type="button"
            :class="modelValue.operator === 'after' ? 'text-text' : 'text-muted'"
            @click="updateOperator('after')"
          >
            After
          </button>
        </div>
        <input
          type="date"
          class="ns-input h-9 text-xs"
          :disabled="!modelValue.operator"
          :value="modelValue.date"
          @input="updateDate(($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>
