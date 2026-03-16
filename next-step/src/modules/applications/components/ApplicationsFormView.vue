<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SharedSelect, { type SharedSelectOption } from '@/shared/components/SharedSelect.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  draft: {
    id: number
    type: string
    position: string
    company_id: number | null
    status: string
    applied: string
    deadline: string
    hasCV: boolean
    hasCL: boolean
    jobId?: number | null
  } | null
  jobOptions: { id: number; label: string }[]
  companyOptions: SharedSelectOption[]
  selectedJobId: number | null
  isCreating?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:selectedJobId', value: number | null): void
  (e: 'addCompany'): void
}>()

const { t } = useI18n()

type YesNoOption = 'true' | 'false'
const isYesSelected = ref<YesNoOption>('false')

const yesNoOptions = computed<SharedSelectOption[]>(() => [
  { value: 'true', label: t('common.yes') },
  { value: 'false', label: t('common.no') },
])

const selectedYesNoOption = computed<SharedSelectOption | null>({
  get: () => yesNoOptions.value.find((opt) => opt.value === String(isYesSelected.value)) ?? null,
  set: (value) => {
    isYesSelected.value = value?.value === 'true' ? 'true' : 'false'
  },
})

const jobSelectOptions = computed<SharedSelectOption[]>(() =>
  props.jobOptions.map((job) => ({ value: job.id, label: job.label })),
)

const companyModel = computed<SharedSelectOption | null>({
  get: () =>
    props.draft
      ? props.companyOptions.find((option) => option.value === props.draft!.company_id) ?? null
      : null,
  set: (value) => {
    if (props.draft) {
      props.draft.company_id = value ? Number(value.value) : null
    }
  },
})

const selectedJobModel = computed<SharedSelectOption | null>({
  get: () =>
    props.selectedJobId == null
      ? null
      : jobSelectOptions.value.find((option) => option.value === props.selectedJobId) ?? null,
  set: (value) => emit('update:selectedJobId', value ? Number(value.value) : null),
})

const currentDateLabel = computed(() =>
  isYesSelected.value === 'true' ? t('applications.form.applied') : t('applications.form.deadline'),
)

const toInputDate = (date: string): string => {
  if (!date) return ''
  const iso = date.match(/^(\d{4}-\d{2}-\d{2})/)
  return iso ? iso[1] : ''
}

const selectedDate = computed<string>({
  get: () => {
    if (!props.draft) return ''
    const date = isYesSelected.value === 'true' ? props.draft.applied : props.draft.deadline
    return date ? toInputDate(date) : ''
  },
  set: (value: string) => {
    if (!props.draft) return
    if (isYesSelected.value === 'true') {
      props.draft.applied = value
      props.draft.deadline = ''
    } else {
      props.draft.deadline = value
      props.draft.applied = ''
    }
  },
})

watch(
  () => props.draft,
  (value) => {
    if (!value) {
      isYesSelected.value = 'false'
      return
    }
    isYesSelected.value = value.applied ? 'true' : 'false'
  },
  { immediate: true },
)

watch(isYesSelected, (value) => {
  if (!props.draft) return
  if (value === 'true') {
    props.draft.applied = selectedDate.value
    props.draft.deadline = ''
  } else {
    props.draft.applied = ''
    props.draft.deadline = selectedDate.value
  }
})
</script>

<template>
  <div class="grid gap-x-4 gap-y-3 sm:grid-cols-2">
    <!-- Row 1: Job | Position -->
    <div class="grid gap-1 text-sm">
      <SharedSelect
        v-model="selectedJobModel"
        :label="t('applications.form.jobExisting')"
        :options="jobSelectOptions"
        :placeholder="t('applications.form.jobPlaceholder')"
        :clear-label="t('common.noSelection')"
      />
      <span class="text-[11px] text-muted">{{ t('applications.form.jobHelp') }}</span>
    </div>
    <label class="grid gap-1 text-sm self-start">
      <span class="text-xs text-muted">{{ t('applications.form.position') }}</span>
      <input v-model="draft!.position" class="ns-input" />
    </label>

    <!-- Row 2: Company | Applied question -->
    <div class="grid gap-1 text-sm">
      <SharedSelect
        v-model="companyModel"
        :label="t('applications.form.company')"
        :options="companyOptions"
        :placeholder="t('applications.form.companyPlaceholder')"
        :clear-label="t('common.noSelection')"
      />
      <button
        class="inline-flex w-auto items-center text-left text-[11px] font-semibold text-primary hover:text-primary-hover"
        type="button"
        @click="emit('addCompany')"
      >
        <span class="material-symbols-rounded text-[8px] align-middle mr-1">add</span>
        <span class="text-[11px]">{{ t('applications.form.addCompany') }}</span>
      </button>
    </div>
    <div class="grid gap-1 text-sm self-start">
      <span class="text-xs text-muted">{{ t('applications.form.appliedQuestion') }}</span>
      <SharedSelect
        v-model="selectedYesNoOption"
        :options="yesNoOptions"
        :clearable="false"
      />
    </div>

    <!-- Row 3: Documents | Date -->
    <div class="grid gap-2 text-sm self-start">
      <span class="text-xs text-muted">{{ t('applications.form.documentsQuestion') }}</span>
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2">
          <input v-model="draft!.hasCV" type="checkbox" />
          <span>{{ t('applications.form.cv') }}</span>
        </label>
        <label class="flex items-center gap-2">
          <input v-model="draft!.hasCL" type="checkbox" />
          <span>{{ t('applications.form.cl') }}</span>
        </label>
      </div>
    </div>
    <div class="grid gap-1 text-sm self-start">
      <label class="text-xs text-muted">{{ currentDateLabel }}</label>
      <input v-model="selectedDate" type="date" class="ns-input" />
    </div>
  </div>
</template>
