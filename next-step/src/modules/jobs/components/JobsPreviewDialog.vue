<script setup lang="ts">
import { computed, watch } from 'vue'
import { useScrollLock } from '@/shared/composables/useScrollLock'
import type { Job } from '../types'
import { formatDateDDMMYYYY } from '@/shared/utils/date'
import JobsPreviewView from './JobsPreviewView.vue'
import { useCompaniesStore } from '@/modules/companies/store/useCompaniesStore'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  open: boolean
  row: Job | null
}>()

useScrollLock(() => props.open)

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit'): void
  (e: 'create-application', value: Job): void
}>()

const companiesStore = useCompaniesStore()

const companiesMap = computed<Record<number, string>>(() =>
  companiesStore.rows.reduce<Record<number, string>>((acc, company) => {
    acc[company.id] = company.name
    return acc
  }, {}),
)

const companyName = (companyId: number | null | undefined) => {
  if (companyId == null) return '-'
  return companiesMap.value[companyId] || '-'
}

const contractLabel = computed<Record<string, string>>(() => ({
  full_time: t('references.contract.full_time'),
  part_time: t('references.contract.part_time'),
  internship: t('references.contract.internship'),
  freelance: t('references.contract.freelance'),
}))

const workModeLabel = computed<Record<string, string>>(() => ({
  onsite: t('references.workMode.onsite'),
  remote: t('references.workMode.remote'),
  hybrid: t('references.workMode.hybrid'),
}))

const levelLabel = computed<Record<string, string>>(() => ({
  junior: t('references.level.junior'),
  mid: t('references.level.mid'),
  senior: t('references.level.senior'),
  lead: t('references.level.lead'),
}))

const industryLabel = computed<Record<string, string>>(() => ({
  tech: t('references.industry.tech'),
  finance: t('references.industry.finance'),
  saas: t('references.industry.saas'),
  health: t('references.industry.health'),
}))

watch(
  () => props.open,
  async (value) => {
    if (!value) return
    await companiesStore.loadCompanies()
  },
)
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-black/40"></div>
    <div class="relative w-full max-w-6xl h-[90vh]">
      <div class="ns-card h-full">
        <div class="ns-card-body flex h-full flex-col gap-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-muted">{{ t('jobs.preview.title') }}</p>
              <h2 class="text-2xl font-semibold">{{ row?.position }}</h2>
              <p class="text-sm text-muted">
                {{ companyName(row?.company_id) }}
                · {{ contractLabel[row?.contract || ''] || row?.contract }}
                · {{ levelLabel[row?.level || ''] || row?.level }}
              </p>
            </div>
            <button class="ns-btn ns-btn-ghost p-2" :aria-label="t('common.close')" @click="emit('close')">
              <span class="material-symbols-rounded text-[18px] leading-none">close</span>
            </button>
          </div>

          <JobsPreviewView
            :row="row"
            :companies-by-id="companiesMap"
            :contract-label="contractLabel"
            :level-label="levelLabel"
            :work-mode-label="workModeLabel"
            :industry-label="industryLabel"
            :format-date-short="formatDateDDMMYYYY"
          />

          <div class="mt-auto flex justify-end gap-2">
            <button class="ns-btn ns-btn-ghost" @click="emit('close')">{{ t('common.close') }}</button>
            <button class="ns-btn ns-btn-secondary" @click="emit('create-application', row as Job)">
              {{ t('jobs.actionsMenu.createApplication') }}
            </button>
            <button class="ns-btn ns-btn-primary" @click="emit('edit')">{{ t('common.edit') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
