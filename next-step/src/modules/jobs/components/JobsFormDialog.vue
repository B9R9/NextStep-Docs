<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useScrollLock } from '@/shared/composables/useScrollLock'
import type { Job } from '../types'
import JobsFormView from './JobsFormView.vue'
import CompaniesFormDialog from '@/modules/companies/components/CompaniesFormDialog.vue'
import type { Company } from '@/modules/companies/types'
import { useCompaniesStore } from '@/modules/companies/store/useCompaniesStore'
import { useI18n } from 'vue-i18n'
import type { SharedSelectOption } from '@/shared/components/SharedSelect.vue'
import { http } from '@/shared/api/http'

const props = defineProps<{
  open: boolean
  row: Job | null
  isCreating?: boolean
}>()

useScrollLock(() => props.open)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', value: Job): void
}>()

const { t } = useI18n()

const draft = ref<Job | null>(null)
const isCompanyDialogOpen = ref(false)
const companyDraft = ref<Company | null>(null)

const locationQuery = ref('')
const locationResults = ref<string[]>([])
const isLocationOpen = ref(false)
const isLocationFocused = ref(false)
const isSelectingLocation = ref(false)
let locationTimer: ReturnType<typeof setTimeout> | undefined

type LocationsResponse = { results?: string[] }

watch(locationQuery, (value) => {
  if (isSelectingLocation.value) return
  if (locationTimer) clearTimeout(locationTimer)
  locationTimer = setTimeout(async () => {
    const query = value.trim()
    if (!query) {
      locationResults.value = []
      isLocationOpen.value = false
      return
    }
    try {
      const { data } = await http.get<LocationsResponse>('/locations', { params: { query } })
      locationResults.value = data.results || []
      isLocationOpen.value = isLocationFocused.value && locationResults.value.length > 0
    } catch {
      locationResults.value = []
      isLocationOpen.value = false
    }
  }, 500)
})

const selectLocation = (value: string) => {
  isSelectingLocation.value = true
  if (draft.value) draft.value.location = value
  locationQuery.value = value
  isLocationOpen.value = false
  locationResults.value = []
  setTimeout(() => { isSelectingLocation.value = false }, 0)
}

const onBlurLocation = () => {
  isLocationFocused.value = false
  setTimeout(() => { isLocationOpen.value = false }, 100)
}

const companiesStore = useCompaniesStore()

const companiesMap = computed<Record<number, string>>(() =>
  companiesStore.rows.reduce<Record<number, string>>((acc, company) => {
    acc[company.id] = company.name
    return acc
  }, {}),
)

const companyOptions = computed<SharedSelectOption[]>(() =>
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
  if (!match || !match[1] || !match[2] || !match[3]) return value
  return `${match[3]}-${monthMap[match[2]] ?? '01'}-${match[1].padStart(2, '0')}`
}

watch(
  () => props.row,
  (value) => {
    draft.value = value
      ? { ...value, published_at: toInputDate(value.published_at), deadline_at: toInputDate(value.deadline_at) }
      : null
    locationQuery.value = value?.location || ''
  },
)

watch(
  () => props.open,
  async (value) => {
    if (!value) {
      draft.value = props.row
        ? { ...props.row, published_at: toInputDate(props.row.published_at), deadline_at: toInputDate(props.row.deadline_at) }
        : null
      locationQuery.value = props.row?.location || ''
      return
    }
    await companiesStore.loadCompanies()
  },
)

const save = () => {
  if (!draft.value) return
  const normalizedCompanyId = (() => {
    const raw = draft.value!.company_id
    if (raw === null || raw === undefined) return null
    const numeric = Number(raw)
    return Number.isFinite(numeric) && numeric >= 0 ? numeric : null
  })()
  emit('save', { ...draft.value, company_id: normalizedCompanyId })
}

const close = () => emit('close')

const companyName = (companyId: number | null | undefined) => {
  if (companyId == null) return '-'
  return companiesMap.value[companyId] || '-'
}

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
                <h2 class="text-2xl font-semibold">{{ t('jobs.dialog.createTitle') }}</h2>
                <p class="text-sm text-muted">{{ t('jobs.dialog.createSubtitle') }}</p>
              </template>
              <template v-else>
                <p class="text-sm text-muted">{{ t('jobs.preview.title') }}</p>
                <h2 class="text-2xl font-semibold">{{ row?.position }}</h2>
                <p class="text-sm text-muted">{{ companyName(row?.company_id) }}</p>
              </template>
            </div>
            <button class="ns-btn ns-btn-ghost p-2" :aria-label="t('common.close')" @click="close">
              <span class="material-symbols-rounded text-[18px] leading-none">close</span>
            </button>
          </div>

          <JobsFormView
            :draft="draft"
            :company-options="companyOptions"
            :location-query="locationQuery"
            :location-results="locationResults"
            :is-location-open="isLocationOpen"
            @addCompany="openCompanyCreate"
            @update:locationQuery="locationQuery = $event"
            @selectLocation="selectLocation"
            @focusLocation="isLocationFocused = true; isLocationOpen = locationResults.length > 0"
            @blurLocation="onBlurLocation"
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
