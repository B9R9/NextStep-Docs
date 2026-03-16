<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type OptionValue = string | number

export type SharedSelectOption = {
  value: OptionValue
  label: string
}

const props = defineProps<{
  modelValue: SharedSelectOption | null
  options: SharedSelectOption[]
  label?: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  clearLabel?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: SharedSelectOption | null): void
}>()

const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const instanceId = `select-${Math.random().toString(36).slice(2, 9)}`

const selectedLabel = computed(
  () => props.modelValue?.label || props.placeholder || props.label || '',
)
const canClear = computed(() => props.clearable !== false)

const toggleOpen = () => {
  if (props.disabled) return
  const next = !isOpen.value
  if (next) {
    window.dispatchEvent(new CustomEvent('shared-select-open', { detail: instanceId }))
  }
  isOpen.value = next
}

const selectOption = (option: SharedSelectOption) => {
  const isAlreadySelected = String(props.modelValue?.value) === String(option.value)
  emit('update:modelValue', isAlreadySelected ? null : option)
  isOpen.value = false
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
      '[data-select-root],[data-multiselect-root],[data-datefilter-root]',
    )
    if (!otherRoot) {
      event.stopPropagation()
      event.preventDefault()
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
  window.addEventListener('shared-select-open', handleOtherOpen as EventListener)
  window.addEventListener('shared-multiselect-open', handleOtherOpen as EventListener)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true)
  window.removeEventListener('shared-select-open', handleOtherOpen as EventListener)
  window.removeEventListener('shared-multiselect-open', handleOtherOpen as EventListener)
})
</script>

<template>
  <div ref="rootRef" class="relative" data-select-root>
    <p v-if="label" class="mb-1 text-xs text-muted">{{ label }}</p>
    <button
      class="ns-input flex w-full items-center justify-between gap-2 text-left"
      type="button"
      :disabled="disabled"
      @click="toggleOpen"
    >
      <span class="truncate" :class="modelValue ? '' : 'text-muted'">
        {{ selectedLabel }}
      </span>
      <span class="text-xs text-muted">▾</span>
    </button>

    <div
      v-if="isOpen"
      class="absolute z-10 mt-2 w-full max-h-60 overflow-y-auto rounded-xl border border-border bg-surface shadow-paper"
    >
      <button
        v-if="canClear"
        type="button"
        class="flex w-full items-center justify-between px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-text"
        @click="clearSelection"
      >
        <span>{{ clearLabel || 'No selection' }}</span>
        <span v-if="!modelValue" class="text-xs">✓</span>
      </button>
      <button
        v-for="option in options"
        :key="String(option.value)"
        type="button"
        class="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-surface-2"
        @click="selectOption(option)"
      >
        <span>{{ option.label }}</span>
        <span v-if="String(modelValue?.value) === String(option.value)" class="text-xs">✓</span>
      </button>
    </div>
  </div>
</template>
