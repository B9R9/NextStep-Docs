<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type OptionValue = string | number

export type SharedMultiSelectOption = {
  value: OptionValue
  label: string
}

const props = defineProps<{
  modelValue: SharedMultiSelectOption[] | null
  options: SharedMultiSelectOption[]
  label?: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  clearLabel?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: SharedMultiSelectOption[] | null): void
}>()

const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const instanceId = `multi-select-${Math.random().toString(36).slice(2, 9)}`

const selectedValues = computed(() => props.modelValue ?? [])

const selectedLabels = computed(() => {
  if (!selectedValues.value.length) return props.placeholder || props.label || ''
  return selectedValues.value.map((item) => item.label).join(', ')
})

const toggleOpen = () => {
  if (props.disabled) return
  const next = !isOpen.value
  if (next) {
    window.dispatchEvent(new CustomEvent('shared-multiselect-open', { detail: instanceId }))
  }
  isOpen.value = next
}

const isSelected = (option: SharedMultiSelectOption) =>
  selectedValues.value.some((item) => String(item.value) === String(option.value))

const toggleOption = (option: SharedMultiSelectOption) => {
  if (isSelected(option)) {
    const nextValue = selectedValues.value.filter(
      (item) => String(item.value) !== String(option.value),
    )
    emit('update:modelValue', nextValue.length ? nextValue : null)
  } else {
    emit('update:modelValue', [...selectedValues.value, option])
  }
}

const clearSelection = () => {
  emit('update:modelValue', null)
  isOpen.value = false
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
    const otherRoot = (target as HTMLElement | null)?.closest?.(
      '[data-multiselect-root],[data-datefilter-root]',
    )
    if (!otherRoot) {
      event.stopPropagation()
      event.preventDefault()
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
  window.addEventListener('shared-multiselect-open', handleOtherOpen as EventListener)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true)
  window.removeEventListener('shared-multiselect-open', handleOtherOpen as EventListener)
})
</script>

<template>
  <div ref="rootRef" class="relative" data-multiselect-root>
    <p v-if="label" class="mb-1 text-xs text-muted">{{ label }}</p>
    <button
      class="ns-input flex w-full items-center justify-between gap-2 text-left"
      type="button"
      :disabled="disabled"
      @click="toggleOpen"
    >
      <span class="truncate" :class="selectedValues.length ? '' : 'text-muted'">
        {{ selectedLabels }}
      </span>
      <span class="text-xs text-muted">▾</span>
    </button>

    <div
      v-if="isOpen"
      class="absolute z-10 mt-2 w-full max-h-60 overflow-y-auto rounded-xl border border-border bg-surface shadow-paper"
    >
      <button
        v-if="clearable !== false"
        type="button"
        class="flex w-full items-center justify-between px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-text"
        @click="clearSelection"
      >
        <span>{{ clearLabel || 'No selection' }}</span>
        <span v-if="!selectedValues.length" class="text-xs">✓</span>
      </button>
      <button
        v-for="option in options"
        :key="String(option.value)"
        type="button"
        class="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-surface-2"
        @click="toggleOption(option)"
      >
        <span>{{ option.label }}</span>
        <span v-if="isSelected(option)" class="text-xs">✓</span>
      </button>
    </div>
  </div>
</template>
