<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useScrollLock } from '@/shared/composables/useScrollLock'
import { useJobsStore } from '@/modules/jobs/store/useJobsStore'
import { useCompaniesStore } from '@/modules/companies/store/useCompaniesStore'
import ApplicationsFormView from './ApplicationsFormView.vue'
import CompaniesFormDialog from '@/modules/companies/components/CompaniesFormDialog.vue'
import type { Company } from '@/modules/companies/types'
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
  isCreating?: boolean
}>()

useScrollLock(() => props.open)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', value: Row): void
}>()

const { t } = useI18n()

const draft = ref<Row | null>(null)
const selectedJobId = ref<number | null>(null)
const isCompanyDialogOpen = ref(false)
const companyDraft = ref<Company | null>(null)

const jobsStore = useJobsStore()
const companiesStore = useCompaniesStore()

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

const companyOptions = computed(() =>
  companiesStore.rows
    .map((company) => ({ value: Number(company.id), label: company.name }))
    .filter((option) => Number.isFinite(option.value) && Number(option.value) >= 0)
    .sort((a, b) => a.label.localeCompare(b.label, 'fr')),
)

const monthMap: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04',
  May: '05', Jun: '06', Jul: '07', Aug: '08',
  Sep: '09', Oct: '10', Nov: '11', Dec: '12',
}

const toInputDate = (value: string) => {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const match = value.match(/^(\d{1,2})\s([A-Za-z]{3})\s(\d{4})$/)
  if (!match) return value
  const [, rawDay = '', rawMonth = '', rawYear = ''] = match
  return `${rawYear}-${monthMap[rawMonth] ?? '01'}-${rawDay.padStart(2, '0')}`
}

const fromInputDate = (value: string) => {
  if (!value) return ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const [year, month, day] = value.split('-')
  const monthName = Object.keys(monthMap).find((key) => monthMap[key] === month) ?? 'Jan'
  return `${day} ${monthName} ${year}`
}

const jobContractToApplicationType: Record<string, string> = {
  full_time: 'CDI',
  part_time: 'CDD',
  internship: 'Stage',
  freelance: 'Freelance',
  apprenticeship: 'Alternance',
}

watch(
  () => props.open,
  async (value) => {
    draft.value = props.row
      ? { ...props.row, applied: toInputDate(props.row.applied), deadline: toInputDate(props.row.deadline) }
      : null
    selectedJobId.value = props.row?.jobId ?? null
    if (!value) return
    if (!jobsStore.hasLoaded) await jobsStore.loadJobs()
    if (!companiesStore.hasLoaded) await companiesStore.loadCompanies()
  },
)

watch(selectedJobId, (value) => {
  if (!draft.value) return
  if (!value || Number.isNaN(value)) {
    draft.value.jobId = null
    draft.value.position = ''
    draft.value.company_id = null
    draft.value.type = ''
    draft.value.applied = ''
    draft.value.deadline = ''
    draft.value.status = ''
    return
  }
  const job = jobsStore.rows.find((item) => Number(item.id) === Number(value))
  if (!job) return
  draft.value.jobId = value
  draft.value.position = job.position
  draft.value.company_id = job.company_id
  draft.value.type = jobContractToApplicationType[job.contract] ?? draft.value.type
  draft.value.applied = toInputDate(job.published_at)
  draft.value.deadline = toInputDate(job.deadline_at)
  draft.value.status = 'saved'
})

const save = () => {
  if (!draft.value) return
  emit('save', {
    ...draft.value,
    applied: fromInputDate(draft.value.applied),
    deadline: fromInputDate(draft.value.deadline),
  })
}

const close = () => emit('close')

const openCompanyCreate = () => {
  companyDraft.value = {
    id: 0,
    name: '',
    industry: '',
    size: '',
    location: '',
    website: '',
    career_page: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    socialMedia: '',
    comments: '',
    available_jobs: 'In progress',
    total_applications: 0,
  }
  isCompanyDialogOpen.value = true
}

const closeCompanyDialog = () => {
  isCompanyDialogOpen.value = false
  companyDraft.value = null
}

const saveCompany = async (company: Company) => {
  const created = await companiesStore.createCompany(company)
  if (draft.value) draft.value.company_id = created.id
  closeCompanyDialog()
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/40"></div>
    <div class="absolute inset-x-0 top-16 bottom-[3.25rem] flex items-center justify-center px-4 py-4">
    <div class="relative w-full max-w-6xl h-full">
      <div class="ns-card h-full">
        <div class="ns-card-body flex h-full flex-col gap-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <template v-if="isCreating">
                <h2 class="text-2xl font-semibold">{{ t('applications.dialog.createTitle') }}</h2>
                <p class="text-sm text-muted">{{ t('applications.dialog.createSubtitle') }}</p>
              </template>
              <template v-else>
                <p class="text-sm text-muted">{{ t('applications.preview.title') }}</p>
                <h2 class="text-2xl font-semibold">{{ row?.position }}</h2>
              </template>
            </div>
            <button class="ns-btn ns-btn-ghost p-2" :aria-label="t('common.close')" @click="close">
              <span class="material-symbols-rounded text-[18px] leading-none">close</span>
            </button>
          </div>

          <ApplicationsFormView
            :draft="draft"
            :job-options="jobOptions"
            :company-options="companyOptions"
            :selected-job-id="selectedJobId"
            :is-creating="isCreating"
            @update:selected-job-id="selectedJobId = $event"
            @addCompany="openCompanyCreate"
          />

          <div class="mt-auto flex justify-end gap-2">
            <button class="ns-btn ns-btn-ghost" @click="close">{{ t('common.close') }}</button>
            <button class="ns-btn ns-btn-primary" @click="save">{{ t('common.save') }}</button>
          </div>
        </div>
      </div>
    </div>
    </div>
    <CompaniesFormDialog
      :open="isCompanyDialogOpen"
      :row="companyDraft"
      :is-creating="true"
      @close="closeCompanyDialog"
      @save="saveCompany"
    />
  </div>
</template>
