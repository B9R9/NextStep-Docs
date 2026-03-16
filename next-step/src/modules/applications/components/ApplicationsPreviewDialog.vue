<script setup lang="ts">
import { computed, watch } from 'vue'
import { useScrollLock } from '@/shared/composables/useScrollLock'
import { useJobsStore } from '@/modules/jobs/store/useJobsStore'
import { useCompaniesStore } from '@/modules/companies/store/useCompaniesStore'
import { formatDateDDMMYYYY } from '@/shared/utils/date'
import ApplicationsPreviewView from './ApplicationsPreviewView.vue'
import { useI18n } from 'vue-i18n'

type Row = {
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
}

const props = defineProps<{
  open: boolean
  row: Row | null
}>()

useScrollLock(() => props.open)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit'): void
}>()

const { t } = useI18n()

const jobsStore = useJobsStore()
const companiesStore = useCompaniesStore()

const contractLabel: Record<string, string> = {
  full_time: 'Full time',
  part_time: 'Part time',
  internship: 'Internship',
  freelance: 'Freelance',
}

const workModeLabel: Record<string, string> = {
  onsite: 'Onsite',
  remote: 'Remote',
  hybrid: 'Hybrid',
}

const levelLabel: Record<string, string> = {
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior',
  lead: 'Lead',
}

watch(
  () => props.open,
  async (value) => {
    if (!value) return
    if (!jobsStore.hasLoaded) await jobsStore.loadJobs()
    if (!companiesStore.hasLoaded) await companiesStore.loadCompanies()
  },
)

const companiesMap = computed<Record<number, string>>(() =>
  companiesStore.rows.reduce<Record<number, string>>((acc, company) => {
    acc[company.id] = company.name
    return acc
  }, {}),
)

const jobOptions = computed(() =>
  jobsStore.rows.map((job) => ({
    id: Number(job.id),
    label: `${job.position} · ${job.company_id == null ? '-' : (companiesMap.value[Number(job.company_id)] || '-')}`,
  })),
)

const companyName = (companyId: number | null | undefined) => {
  if (companyId == null) return '-'
  return companiesMap.value[Number(companyId)] || '-'
}

const currentJob = computed(() => {
  if (!props.row?.jobId) return null
  return jobsStore.rows.find((job) => job.id === props.row?.jobId) ?? null
})

const currentJobLabel = computed(() => {
  if (!props.row?.jobId) return ''
  return jobOptions.value.find((job) => job.id === props.row?.jobId)?.label ?? ''
})
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-black/40"></div>
    <div class="relative w-full max-w-6xl h-[90vh]">
      <div class="ns-card h-full">
        <div class="ns-card-body flex h-full flex-col gap-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-muted">{{ t('applications.preview.title') }}</p>
              <h2 class="text-2xl font-semibold">{{ row?.position }}</h2>
              <p class="text-sm text-muted">{{ companyName(row?.company_id) }}</p>
            </div>
            <button class="ns-btn ns-btn-ghost p-2" :aria-label="t('common.close')" @click="emit('close')">
              <span class="material-symbols-rounded text-[18px] leading-none">close</span>
            </button>
          </div>

          <ApplicationsPreviewView
            :row="row"
            :company-name="companyName(row?.company_id)"
            :job-label="currentJobLabel"
            :job="currentJob"
            :work-mode-label="workModeLabel"
            :contract-label="contractLabel"
            :level-label="levelLabel"
            :format-date-short="formatDateDDMMYYYY"
          />

          <div class="mt-auto flex justify-end gap-2">
            <button class="ns-btn ns-btn-ghost" @click="emit('close')">{{ t('common.close') }}</button>
            <button class="ns-btn ns-btn-primary" @click="emit('edit')">{{ t('common.edit') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
