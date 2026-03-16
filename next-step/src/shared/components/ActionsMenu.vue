<script setup lang="ts">
import IconButton from './IconButton.vue'

type ActionItem = {
  label: string
  icon: string
  danger?: boolean
  onClick: () => void
}

const props = defineProps<{
  open: boolean
  positionClass: string
  actions: ActionItem[]
  triggerLabel?: string
  triggerIcon?: string
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<template>
  <div class="relative flex items-center justify-center">
    <IconButton
      :label="triggerLabel || 'Actions'"
      :icon="triggerIcon || 'more_vert'"
      data-actions-trigger
      @click.stop="emit('toggle')"
    />
    <div
      v-if="open"
      data-actions-menu
      :class="[
        'absolute right-0 w-52 rounded-xl border border-border bg-surface shadow-paper',
        positionClass,
      ]"
    >
      <button
        v-for="action in props.actions"
        :key="action.label"
        class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2 rounded-xl whitespace-nowrap"
        :class="action.danger ? 'text-danger' : ''"
        type="button"
        @click.stop="action.onClick"
      >
        <span class="material-symbols-rounded text-[18px] leading-none">{{ action.icon }}</span>
        {{ action.label }}
      </button>
    </div>
  </div>
</template>
