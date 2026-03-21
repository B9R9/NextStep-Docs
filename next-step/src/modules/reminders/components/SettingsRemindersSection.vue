<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRemindersStore } from '../store/useRemindersStore'
import SharedModal from '@/shared/components/SharedModal.vue'

const { t } = useI18n()
const store = useRemindersStore()

const isModalOpen = ref(false)
const newDayInput = ref<number | ''>('')
const isSaving = ref(false)
const saveMsg = ref('')

onMounted(() => store.loadSettings())

const settings = computed(() => store.settings ?? { reminders_enabled: false, reminder_days: [] })

const showSaveMsg = (msg: string) => {
  saveMsg.value = msg
  setTimeout(() => { saveMsg.value = '' }, 2000)
}

const toggleEnabled = async () => {
  isSaving.value = true
  try {
    await store.saveSettings({ ...settings.value, reminders_enabled: !settings.value.reminders_enabled })
    showSaveMsg(t('settings.reminders.saved'))
  } finally {
    isSaving.value = false
  }
}

const addDay = async () => {
  if (newDayInput.value === '') return
  const day = Number(newDayInput.value)
  if (!Number.isInteger(day) || day < 0 || day > 365) return
  if (settings.value.reminder_days.includes(day)) return
  isSaving.value = true
  try {
    const newDays = [...settings.value.reminder_days, day].sort((a, b) => a - b)
    await store.saveSettings({ ...settings.value, reminder_days: newDays })
    newDayInput.value = ''
  } finally {
    isSaving.value = false
  }
}

const removeDay = async (day: number) => {
  const newDays = settings.value.reminder_days.filter((d) => d !== day)
  await store.saveSettings({ ...settings.value, reminder_days: newDays })
}

const dayLabel = (day: number) => {
  if (day === 0) return t('settings.reminders.sameDay')
  return t('settings.reminders.daysBefore', { n: day })
}
</script>

<template>
  <div class="rounded-xl border border-border bg-surface-2 px-4 py-3">
    <button
      class="flex w-full items-center justify-between text-sm font-semibold"
      type="button"
      @click="isModalOpen = true"
    >
      {{ t('settings.reminders.title') }}
      <span class="material-symbols-rounded text-[18px] leading-none">chevron_right</span>
    </button>
  </div>

  <SharedModal :open="isModalOpen" :title="t('settings.reminders.title')" @close="isModalOpen = false">
    <div class="space-y-4">
      <p class="text-xs text-muted">{{ t('settings.reminders.subtitle') }}</p>

      <!-- Enable toggle -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200"
          :class="settings.reminders_enabled ? 'bg-primary' : 'bg-border'"
          :aria-pressed="settings.reminders_enabled"
          :disabled="isSaving"
          @click="toggleEnabled"
        >
          <span
            class="pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
            :class="settings.reminders_enabled ? 'translate-x-4' : 'translate-x-0'"
          />
        </button>
        <span class="text-sm">{{ t('settings.reminders.enableToggle') }}</span>
      </div>

      <!-- Days config -->
      <div v-if="settings.reminders_enabled" class="space-y-3">
        <p class="text-xs font-semibold text-muted">{{ t('settings.reminders.daysLabel') }}</p>

        <!-- Chips -->
        <div v-if="settings.reminder_days.length" class="flex flex-wrap gap-2">
          <span
            v-for="day in settings.reminder_days"
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
              <span class="material-symbols-rounded text-[14px]">close</span>
            </button>
          </span>
        </div>
        <p v-else class="text-xs text-muted">{{ t('settings.reminders.noDays') }}</p>

        <!-- Add day input -->
        <div class="flex items-center gap-2">
          <input
            v-model.number="newDayInput"
            type="number"
            min="0"
            max="365"
            class="ns-input w-28 text-sm"
            :placeholder="t('settings.reminders.addDayPlaceholder')"
            @keydown.enter.prevent="addDay"
          />
          <button
            type="button"
            class="ns-btn ns-btn-primary"
            :disabled="isSaving || newDayInput === ''"
            @click="addDay"
          >
            {{ t('settings.reminders.addDay') }}
          </button>
        </div>
        <p class="text-xs text-muted">{{ t('settings.reminders.hint') }}</p>
      </div>

      <p v-if="saveMsg" class="text-xs text-success">{{ saveMsg }}</p>
    </div>
  </SharedModal>
</template>
