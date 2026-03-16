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
  <button
    class="ns-btn p-2"
    :class="props.variant === 'primary' ? 'ns-btn-primary' : 'ns-btn-ghost'"
    :aria-label="props.label"
  >
    <span class="material-symbols-rounded text-[20px] leading-none">{{ props.icon }}</span>
  </button>
</template>
