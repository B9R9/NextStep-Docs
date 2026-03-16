<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  (e: 'submit', payload: { title: string; type: 'deadline' | 'event' | 'published'; description: string; date: string }): void
  (e: 'close'): void
}>()

const { t } = useI18n()

const title = ref('')
const type = ref<'deadline' | 'event' | 'published'>('event')
const description = ref('')
const date = ref('')

const onSubmit = () => {
  if (!title.value.trim() || !date.value) return
  emit('submit', {
    title: title.value.trim(),
    type: type.value,
    description: description.value.trim(),
    date: date.value,
  })
  title.value = ''
  description.value = ''
  date.value = ''
  type.value = 'event'
}
</script>

<template>
  <div class="space-y-3">
    <label class="grid gap-1 text-sm">
      <span class="text-xs text-muted">{{ t('calendar.form.name') }}</span>
      <input v-model="title" class="ns-input" />
    </label>
    <label class="grid gap-1 text-sm">
      <span class="text-xs text-muted">{{ t('calendar.form.type') }}</span>
      <select v-model="type" class="ns-input">
        <option value="deadline">{{ t('calendar.form.types.deadline') }}</option>
        <option value="event">{{ t('calendar.form.types.event') }}</option>
        <option value="published">{{ t('calendar.form.types.published') }}</option>
      </select>
    </label>
    <label class="grid gap-1 text-sm">
      <span class="text-xs text-muted">{{ t('calendar.form.description') }}</span>
      <textarea v-model="description" class="ns-textarea text-xs"></textarea>
    </label>
    <label class="grid gap-1 text-sm">
      <span class="text-xs text-muted">{{ t('calendar.form.date') }}</span>
      <input v-model="date" type="date" class="ns-input" />
    </label>
    <div class="flex justify-end gap-2 pt-2">
      <button class="ns-btn ns-btn-ghost" type="button" @click="emit('close')">
        {{ t('common.close') }}
      </button>
      <button class="ns-btn ns-btn-primary" type="button" @click="onSubmit">
        {{ t('calendar.form.create') }}
      </button>
    </div>
  </div>
</template>
