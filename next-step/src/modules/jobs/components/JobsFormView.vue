<script setup lang="ts">
import { computed } from 'vue'
import type { Job } from '../types'
import SharedMultiSelect, { type SharedMultiSelectOption } from '@/shared/components/SharedMultiSelect.vue'
import SharedSelect, { type SharedSelectOption } from '@/shared/components/SharedSelect.vue'
import { useI18n } from 'vue-i18n'
import {
  CONTRACT_VALUES,
  INDUSTRY_VALUES,
  LANGUAGE_VALUES,
  LEVEL_VALUES,
  WORK_MODE_VALUES,
} from '@/shared/references/catalog'

const props = defineProps<{
  draft: Job | null
  companyOptions: SharedSelectOption[]
}>()

const emit = defineEmits<{
  (e: 'addCompany'): void
}>()

const { t } = useI18n()

const languageOptions: SharedMultiSelectOption[] = LANGUAGE_VALUES.map((value) => ({
  value,
  label: t(`references.language.${value}`),
}))

const industryOptions = computed(() =>
  INDUSTRY_VALUES.map((value) => ({
    value,
    label: t(`references.industry.${value}`),
  })),
)

const workModeOptions = computed(() =>
  WORK_MODE_VALUES.map((value) => ({
    value,
    label: t(`references.workMode.${value}`),
  })),
)

const contractOptions = computed(() =>
  CONTRACT_VALUES.map((value) => ({
    value,
    label: t(`references.contract.${value}`),
  })),
)

const levelOptions = computed(() =>
  LEVEL_VALUES.map((value) => ({
    value,
    label: t(`references.level.${value}`),
  })),
)

const companyModel = computed<SharedSelectOption | null>({
  get: () => {
    const value = props.draft?.company_id
    if (value === null || value === undefined) return null
    const numeric = Number(value)
    if (!Number.isFinite(numeric) || numeric < 0) return null
    return props.companyOptions.find((option) => Number(option.value) === numeric) ?? null
  },
  set: (value) => {
    if (!props.draft) return
    const numeric = value ? Number(value.value) : NaN
    props.draft.company_id = Number.isFinite(numeric) && numeric >= 0 ? numeric : null
  },
})

const industryModel = computed<SharedSelectOption | null>({
  get: () =>
    industryOptions.value.find((option) => String(option.value) === String(props.draft?.industry)) ??
    null,
  set: (value) => {
    if (props.draft) {
      props.draft.industry = value ? String(value.value) : ''
    }
  },
})

const workModeModel = computed<SharedSelectOption | null>({
  get: () =>
    workModeOptions.value.find((option) => String(option.value) === String(props.draft?.work_mode)) ??
    null,
  set: (value) => {
    if (props.draft) {
      props.draft.work_mode = value ? String(value.value) : ''
    }
  },
})

const contractModel = computed<SharedSelectOption | null>({
  get: () =>
    contractOptions.value.find((option) => String(option.value) === String(props.draft?.contract)) ??
    null,
  set: (value) => {
    if (props.draft) {
      props.draft.contract = value ? String(value.value) : ''
    }
  },
})

const levelModel = computed<SharedSelectOption | null>({
  get: () =>
    levelOptions.value.find((option) => String(option.value) === String(props.draft?.level)) ?? null,
  set: (value) => {
    if (props.draft) {
      props.draft.level = value ? String(value.value) : ''
    }
  },
})

const languageModel = computed<SharedMultiSelectOption[] | null>({
  get: () => {
    const selected = (props.draft?.languages || []).map((lang) => ({
      value: lang,
      label: lang.toUpperCase(),
    }))
    return selected.length ? selected : null
  },
  set: (value) => {
    if (props.draft) {
      props.draft.languages = (value ?? []).map((item) => String(item.value))
    }
  },
})


</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3 overflow-y-auto pr-1 text-sm">
    <!-- LEFT -->
    <div class="space-y-4 lg:col-span-2">
      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('jobs.form.identity') }}</p>
        </header>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="grid gap-1 text-sm">
            <span class="text-xs text-muted">{{ t('jobs.form.position') }}</span>
            <input v-model="props.draft!.position" class="ns-input h-9 text-xs" />
          </label>
          <div class="grid gap-1 text-sm">
            <SharedSelect
              v-model="companyModel"
              :label="t('jobs.form.company')"
              :options="companyOptions"
              :placeholder="t('jobs.form.companyPlaceholder')"
              :clear-label="t('common.noSelection')"
            />
          </div>
          <div class="sm:col-start-2">
            <button
              class="inline-flex w-auto items-center text-left text-[11px] font-semibold text-primary hover:text-primary-hover"
              type="button"
              @click="emit('addCompany')"
            >
              <span class="material-symbols-rounded text-[8px] align-middle mr-1">add</span>
              <span class="text-[11px]">{{ t('jobs.form.addCompany') }}</span>
            </button>
          </div>
          <div class="grid gap-1 text-sm">
            <SharedSelect
              v-model="industryModel"
              :label="t('jobs.form.industry')"
              :options="industryOptions"
              :placeholder="t('jobs.form.industry')"
              :clear-label="t('common.noSelection')"
            />
          </div>
          <div class="grid gap-1 text-sm">
            <SharedMultiSelect
              v-model="languageModel"
              :label="t('jobs.form.languages')"
              :options="languageOptions"
              :placeholder="t('jobs.form.languagesPlaceholder')"
              :clear-label="t('common.noSelection')"
            />
          </div>
          <label class="grid gap-1 text-sm sm:col-span-2">
            <span class="text-xs text-muted">{{ t('jobs.form.link') }}</span>
            <input v-model="props.draft!.link" type="url" class="ns-input h-9 text-xs" />
          </label>
        </div>
      </section>

      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('jobs.form.contractSection') }}</p>
        </header>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="grid gap-1 text-sm">
            <SharedSelect
              v-model="workModeModel"
              :label="t('jobs.form.workMode')"
              :options="workModeOptions"
              :placeholder="t('jobs.form.workMode')"
              :clear-label="t('common.noSelection')"
            />
          </div>
          <div class="grid gap-1 text-sm">
            <SharedSelect
              v-model="contractModel"
              :label="t('jobs.form.contract')"
              :options="contractOptions"
              :placeholder="t('jobs.form.contract')"
              :clear-label="t('common.noSelection')"
            />
          </div>
          <div class="grid gap-1 text-sm">
            <SharedSelect
              v-model="levelModel"
              :label="t('jobs.form.level')"
              :options="levelOptions"
              :placeholder="t('jobs.form.level')"
              :clear-label="t('common.noSelection')"
            />
          </div>
          <label class="grid gap-1 text-sm">
            <span class="text-xs text-muted">{{ t('jobs.form.location') }}</span>
            <input v-model="props.draft!.location" class="ns-input h-9 text-xs" />
          </label>
        </div>
      </section>

      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('jobs.form.dates') }}</p>
        </header>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="grid gap-1 text-sm">
            <span class="text-xs text-muted">{{ t('jobs.form.publishedAt') }}</span>
            <input v-model="props.draft!.published_at" type="date" class="ns-input h-9 text-xs" />
          </label>
          <label class="grid gap-1 text-sm">
            <span class="text-xs text-muted">{{ t('jobs.form.deadlineAt') }}</span>
            <input v-model="props.draft!.deadline_at" type="date" class="ns-input h-9 text-xs" />
          </label>
        </div>
      </section>
    </div>

    <!-- RIGHT -->
    <div class="space-y-4">
      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('jobs.form.description') }}</p>
        </header>
        <textarea v-model="props.draft!.description" class="ns-textarea text-xs"></textarea>
      </section>

      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('jobs.form.requirements') }}</p>
        </header>
        <textarea v-model="props.draft!.requirements" class="ns-textarea text-xs"></textarea>
      </section>
    </div>
  </div>
</template>
