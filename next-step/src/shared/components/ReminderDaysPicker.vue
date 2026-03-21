<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  modelValue: number[] | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[] | null): void
}>()

const { t } = useI18n()
const newDayInput = ref<number | ''>('')

const enabled = () => props.modelValue !== null

const toggle = () => {
  emit('update:modelValue', props.modelValue === null ? [] : null)
  newDayInput.value = ''
}

const addDay = () => {
  if (newDayInput.value === '' || props.modelValue === null) return
  const day = Number(newDayInput.value)
  if (!Number.isInteger(day) || day < 0 || day > 365) return
  if (props.modelValue.includes(day)) return
  emit('update:modelValue', [...props.modelValue, day].sort((a, b) => a - b))
  newDayInput.value = ''
}

const removeDay = (day: number) => {
  if (props.modelValue === null) return
  emit('update:modelValue', props.modelValue.filter((d) => d !== day))
}

const dayLabel = (day: number) => {
  if (day === 0) return t('settings.reminders.sameDay')
  return t('settings.reminders.daysBefore', { n: day })
}
</script>

<template>
  <div class="space-y-3">
    <!-- Toggle -->
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200"
        :class="enabled() ? 'bg-primary' : 'bg-border'"
        :aria-pressed="enabled()"
        @click="toggle"
      >
        <span
          class="pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
          :class="enabled() ? 'translate-x-4' : 'translate-x-0'"
        />
      </button>
      <span class="text-xs text-muted">{{ t('calendar.form.reminderEnable') }}</span>
    </div>

    <!-- Days config -->
    <div v-if="enabled()" class="space-y-2 pl-12">
      <!-- Chips -->
      <div v-if="modelValue!.length" class="flex flex-wrap gap-2">
        <span
          v-for="day in modelValue!"
          :key="day"
          class="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs"
        >
          {{ dayLabel(day) }}
          <button
            type="button"
            class="text-muted hover:text-danger leading-none"
            :aria-label="t('settings.reminders.removeDay')"
            @click="removeDay(day)"
          >
            <span class="material-symbols-rounded text-[13px]">close</span>
          </button>
        </span>
      </div>
      <p v-else class="text-xs text-muted">{{ t('settings.reminders.noDays') }}</p>

      <!-- Add input -->
      <div class="flex items-center gap-2">
        <input
          v-model.number="newDayInput"
          type="number"
          min="0"
          max="365"
          class="ns-input w-24 text-xs"
          :placeholder="t('settings.reminders.addDayPlaceholder')"
          @keydown.enter.prevent="addDay"
        />
        <button
          type="button"
          class="ns-btn ns-btn-primary text-xs"
          :disabled="newDayInput === ''"
          @click="addDay"
        >
          {{ t('settings.reminders.addDay') }}
        </button>
      </div>
      <p class="text-xs text-muted">{{ t('settings.reminders.hint') }}</p>
    </div>
  </div>
</template>
