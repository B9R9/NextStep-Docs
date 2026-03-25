<script setup lang="ts">
type Props = {
  label: string
  icon: string
  variant?: 'ghost' | 'primary'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'ghost',
})
</script>

<template>
  <div class="relative group">
    <button
      class="ns-btn p-2"
      :class="props.variant === 'primary' ? 'ns-btn-primary' : 'ns-btn-ghost'"
      :aria-label="props.label"
    >
      <span class="material-symbols-rounded text-[20px] leading-none">{{ props.icon }}</span>
    </button>
    <span
      class="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      style="background: var(--color-surface-2); color: var(--color-text); border: 1px solid var(--color-border);"
    >
      {{ props.label }}
    </span>
  </div>
</template>
