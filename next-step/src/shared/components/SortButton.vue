<script setup lang="ts">
const props = defineProps<{
  label: string
  active: boolean
  dir: 'asc' | 'desc'
}>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<template>
  <button
    class="inline-flex items-center gap-1 text-xs uppercase text-muted hover:text-text"
    type="button"
    @click="emit('click', $event)"
  >
    {{ label }}
    <span
      class="material-symbols-rounded text-[11px] leading-none"
      :class="props.active ? 'text-muted' : 'opacity-30'"
    >
      {{ props.active && props.dir === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
    </span>
  </button>
</template>

<style scoped>
.material-symbols-rounded {
  font-size: 14px !important;
}
</style>
