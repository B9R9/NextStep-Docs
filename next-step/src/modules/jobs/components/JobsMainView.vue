<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Job } from '../types'
import JobsEmptyState from './JobsEmptyState.vue'
import JobsTableSkeleton from './JobsTableSkeleton.vue'
import JobsSearchEmptyState from './JobsSearchEmptyState.vue'
import JobsPreviewDialog from './JobsPreviewDialog.vue'
import JobsFormDialog from './JobsFormDialog.vue'
import ApplicationsFormDialog from '@/modules/applications/components/ApplicationsFormDialog.vue'
import type { Application } from '@/modules/applications/types'
import SortButton from '@/shared/components/SortButton.vue'
import ActionsMenu from '@/shared/components/ActionsMenu.vue'
import { formatDateDDMMYYYY, toISODate } from '@/shared/utils/date'
import { useJobsStore } from '../store/useJobsStore'
import { useApplicationsStore } from '@/modules/applications/store/useApplicationsStore'
import SharedMultiSelect, { type SharedMultiSelectOption } from '@/shared/components/SharedMultiSelect.vue'
import SharedDateFilter, { type DateFilterValue } from '@/shared/components/SharedDateFilter.vue'
import { useRoute, useRouter } from 'vue-router'
import { useCalendarStore } from '@/modules/calendar/store/useCalendarStore'
import { useCompaniesStore } from '@/modules/companies/store/useCompaniesStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const jobsStore = useJobsStore()
const applicationsStore = useApplicationsStore()
const calendarStore = useCalendarStore()
const companiesStore = useCompaniesStore()

const companiesMap = computed<Record<number, string>>(() => {
  return companiesStore.rows.reduce<Record<number, string>>((acc, company) => {
    acc[company.id] = company.name
    return acc
  }, {})
})
const rows = computed({
  get: () => jobsStore.rows,
  set: (value: Job[]) => {
    jobsStore.rows = value
  },
})
const isLoading = computed(() => jobsStore.isLoading)
const hasLoaded = computed(() => jobsStore.hasLoaded)
const loadError = computed(() => jobsStore.loadError)

const searchInput = ref('')
const searchQuery = ref('')
let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(searchInput, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchQuery.value = value.trim().toLowerCase()
  }, 500)
})

type SortKey =
  | 'id'
  | 'position'
  | 'industry'
  | 'location'
  | 'contract'
  | 'published_at'
  | 'deadline_at'
  | 'company_id'
  | 'link'
  | 'languages'

const sortKey = ref<SortKey>('id')
const sortDir = ref<'asc' | 'desc'>('desc')

const toggleSort = (key: SortKey) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

const filteredRows = computed(() => {
  const q = searchQuery.value
  if (!q) return rows.value
  return rows.value.filter((row) => {
    const haystack = [
      row.position,
      row.industry,
      row.location,
      row.contract,
      String(row.company_id),
      row.published_at,
      row.deadline_at,
      row.link,
      row.languages.join(' '),
      row.description,
      row.requirements,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
})

const industryOptions = computed<SharedMultiSelectOption[]>(() => {
  const values = Array.from(new Set(rows.value.map((row) => row.industry).filter(Boolean)))
  return values.map((value) => ({
    value,
    label: industryLabel[value] || value,
  }))
})

const industryFilter = ref<SharedMultiSelectOption[] | null>(null)
const toCompanyId = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null
}

const companyOptions = computed<SharedMultiSelectOption[]>(() => {
  const companyIds = rows.value
    .map((row) => row.company_id)
    .map((value) => toCompanyId(value))
    .filter((value): value is number => value !== null)
  const values = Array.from(new Set(companyIds))
  return values.map((value) => ({
    value,
    label: companiesMap.value[value] || '-',
  }))
})


const companyLabel = (row: Job) => {
  const normalized = toCompanyId(row.company_id)
  if (normalized == null) return '-'
  return companiesMap.value[normalized] || row.company_name || '-'
}

const contractOptions = computed<SharedMultiSelectOption[]>(() => {
  const values = Array.from(new Set(rows.value.map((row) => row.contract).filter(Boolean)))
  return values.map((value) => ({
    value,
    label: contractLabel[value] || value,
  }))
})

const languageOptions = computed<SharedMultiSelectOption[]>(() => {
  const values = Array.from(new Set(rows.value.flatMap((row) => row.languages)))
  return values.map((value) => ({
    value,
    label: value.toUpperCase(),
  }))
})

const companyFilter = ref<SharedMultiSelectOption[] | null>(null)
const contractFilter = ref<SharedMultiSelectOption[] | null>(null)
const languageFilter = ref<SharedMultiSelectOption[] | null>(null)
const publishedFilter = ref<DateFilterValue>({ operator: null, date: '' })
const deadlineFilter = ref<DateFilterValue>({ operator: null, date: '' })

const sortedRows = computed(() => {
  const dir = sortDir.value === 'asc' ? 1 : -1
  let filtered = filteredRows.value
  const selectedIndustry = industryFilter.value ?? []
  const selectedCompanies = companyFilter.value ?? []
  const selectedContracts = contractFilter.value ?? []
  const selectedLanguages = languageFilter.value ?? []
  if (selectedIndustry.length) {
    filtered = filtered.filter((row) =>
      selectedIndustry.some((option) => option.value === row.industry),
    )
  }
  if (selectedCompanies.length) {
    filtered = filtered.filter((row) =>
      selectedCompanies.some((option) => Number(option.value) === toCompanyId(row.company_id)),
    )
  }
  if (selectedContracts.length) {
    filtered = filtered.filter((row) =>
      selectedContracts.some((option) => option.value === row.contract),
    )
  }
  if (selectedLanguages.length) {
    filtered = filtered.filter((row) =>
      selectedLanguages.some((option) => row.languages.includes(String(option.value))),
    )
  }
  if (publishedFilter.value.operator && publishedFilter.value.date) {
    filtered = filtered.filter((row) => {
      const rowDate = toISODate(row.published_at)
      if (!rowDate) return false
      return publishedFilter.value.operator === 'before'
        ? rowDate <= publishedFilter.value.date
        : rowDate >= publishedFilter.value.date
    })
  }
  if (deadlineFilter.value.operator && deadlineFilter.value.date) {
    filtered = filtered.filter((row) => {
      const rowDate = toISODate(row.deadline_at)
      if (!rowDate) return false
      return deadlineFilter.value.operator === 'before'
        ? rowDate <= deadlineFilter.value.date
        : rowDate >= deadlineFilter.value.date
    })
  }
  return [...filtered].sort((a, b) => {
    const key = sortKey.value
    const left = a[key]
    const right = b[key]
    if (typeof left === 'boolean' && typeof right === 'boolean') {
      return (left === right ? 0 : left ? 1 : -1) * dir
    }
    if (Array.isArray(left) && Array.isArray(right)) {
      return left.join(',').localeCompare(right.join(','), 'fr') * dir
    }
    return String(left).localeCompare(String(right), 'fr', { numeric: true }) * dir
  })
})

const contractLabel: Record<string, string> = {
  full_time: 'Full time',
  part_time: 'Part time',
  internship: 'Internship',
  freelance: 'Freelance',
}

const industryLabel: Record<string, string> = {
  tech: 'Tech',
  finance: 'Finance',
  saas: 'SaaS',
  health: 'Santé',
}


const hasRows = computed(() => rows.value.length > 0)
const displayedCount = computed(() => sortedRows.value.length)
const totalCount = computed(() => rows.value.length)
const hasActiveFilters = computed(() => {
  if (searchQuery.value.length) return true
  if ((industryFilter.value?.length ?? 0) > 0) return true
  if ((companyFilter.value?.length ?? 0) > 0) return true
  if ((contractFilter.value?.length ?? 0) > 0) return true
  if ((languageFilter.value?.length ?? 0) > 0) return true
  if (publishedFilter.value.operator && publishedFilter.value.date) return true
  if (deadlineFilter.value.operator && deadlineFilter.value.date) return true
  return false
})

const selectedRow = ref<Job | null>(null)
const isPreviewOpen = ref(false)
const isFormOpen = ref(false)
const isFormCreating = ref(false)
const openMenuId = ref<number | null>(null)
const isApplicationOpen = ref(false)
const applicationDraft = ref<Application | null>(null)
const feedback = ref<{ kind: 'success' | 'error'; message: string } | null>(null)
let feedbackTimer: ReturnType<typeof setTimeout> | undefined

const showFeedback = (kind: 'success' | 'error', message: string) => {
  feedback.value = { kind, message }
  if (feedbackTimer) clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => {
    feedback.value = null
  }, 3000)
}

const feedbackClass = computed(() => {
  if (!feedback.value) return ''
  return feedback.value.kind === 'error' ? 'feedback-error' : 'feedback-success'
})

const openPreview = (rowId: number, editMode = false) => {
  selectedRow.value = rows.value.find((row) => row.id === rowId) ?? null
  if (!selectedRow.value) return
  if (editMode) {
    isFormCreating.value = false
    isFormOpen.value = true
  } else {
    isPreviewOpen.value = true
  }
}

const tryOpenFromQuery = () => {
  const previewId = Number(route.query.preview)
  if (!previewId || Number.isNaN(previewId)) return
  const exists = rows.value.find((row) => row.id === previewId)
  if (!exists) return
  openPreview(previewId, false)
  const nextQuery = { ...route.query }
  delete nextQuery.preview
  router.replace({ query: nextQuery })
}

const createNew = () => {
  selectedRow.value = {
    id: 0,
    position: '',
    company_id: null,
    industry: '',
    work_mode: '',
    location: '',
    contract: '',
    level: '',
    published_at: '',
    deadline_at: '',
    link: '',
    languages: [],
    description: '',
    requirements: '',
  }
  isFormCreating.value = true
  isFormOpen.value = true
}

const openApplicationFromJob = (job: Job) => {
  const nextId = Date.now()
  applicationDraft.value = {
    id: nextId,
    type: job.contract,
    position: job.position,
    company_id: job.company_id != null ? job.company_id : null,
    status: 'to_apply',
    applied: job.published_at,
    deadline: job.deadline_at,
    hasCV: false,
    hasCL: false,
    jobId: job.id,
  }
  isApplicationOpen.value = true
}

const closeApplication = () => {
  isApplicationOpen.value = false
  applicationDraft.value = null
}

const closePreview = () => {
  isPreviewOpen.value = false
}

const closeForm = () => {
  isFormOpen.value = false
  isFormCreating.value = false
}

const onPreviewEdit = () => {
  isPreviewOpen.value = false
  isFormCreating.value = false
  isFormOpen.value = true
}

const saveForm = async (updated: Job) => {
  try {
    if (isFormCreating.value) {
      await jobsStore.createJob(updated)
      await jobsStore.loadJobs()
      await calendarStore.loadEvents()
      closeForm()
      showFeedback('success', 'Job created successfully.')
    } else {
      const saved = await jobsStore.updateJob(updated)
      await jobsStore.loadJobs()
      await calendarStore.loadEvents()
      closeForm()
      selectedRow.value = saved
      isPreviewOpen.value = true
      showFeedback('success', 'Job updated successfully.')
    }
  } catch {
    showFeedback('error', 'Job action failed. Please try again.')
  }
}

const saveApplication = async (updated: Application) => {
  try {
    await applicationsStore.createApplication(updated)
    await applicationsStore.loadApplications()
    closeApplication()
    showFeedback('success', 'Application created successfully.')
  } catch {
    showFeedback('error', 'Application action failed. Please try again.')
  }
}

const toggleMenu = (rowId: number) => {
  openMenuId.value = openMenuId.value === rowId ? null : rowId
}

const closeMenu = () => {
  openMenuId.value = null
}

const actionsForRow = (row: Job) => [
  {
    label: t('common.edit'),
    icon: 'edit',
    onClick: () => {
      openPreview(row.id, true)
      closeMenu()
    },
  },
  {
    label: t('common.view'),
    icon: 'visibility',
    onClick: () => {
      openPreview(row.id, false)
      closeMenu()
    },
  },
  {
    label: t('jobs.actionsMenu.createApplication'),
    icon: 'add_circle',
    onClick: () => {
      openApplicationFromJob(row)
      closeMenu()
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    danger: true,
    onClick: async () => {
      try {
        await jobsStore.deleteJob(row.id)
        await calendarStore.loadEvents()
        if (selectedRow.value?.id === row.id) {
          closePreview()
          selectedRow.value = null
        }
        showFeedback('success', 'Job deleted successfully.')
      } catch {
        showFeedback('error', 'Job action failed. Please try again.')
      }
      closeMenu()
    },
  },
]

const handleGlobalClick = (event: MouseEvent) => {
  if (openMenuId.value === null) return
  const target = event.target as HTMLElement | null
  if (target?.closest('[data-actions-menu]') || target?.closest('[data-actions-trigger]')) {
    return
  }
  closeMenu()
  event.stopPropagation()
}

const menuPositionClass = (_index: number, _total: number) => {
  return 'right-full mr-0 top-0 z-[1000]'
}

const rowClass = (rowId: number) => {
  return openMenuId.value === rowId ? 'relative z-[60]' : 'relative z-0'
}

const resetFilters = () => {
  searchInput.value = ''
  searchQuery.value = ''
  industryFilter.value = null
  companyFilter.value = null
  contractFilter.value = null
  languageFilter.value = null
  publishedFilter.value = { operator: null, date: '' }
  deadlineFilter.value = { operator: null, date: '' }
}

onMounted(() => {
  jobsStore.loadJobs()
  companiesStore.loadCompanies()
})

watch(
  () => [route.query.preview, rows.value.length, hasLoaded.value],
  () => {
    if (hasLoaded.value) {
      tryOpenFromQuery()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="bg-bg text-text" @click.capture="handleGlobalClick">
    <section class="ns-container max-w-none px-2 sm:px-4 py-8 sm:py-12">
      <div class="flex flex-col gap-6">
        <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight">
              {{ t('jobs.title') }}
            </h1>
            <p class="ns-card-subtitle">{{ t('jobs.subtitle') }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <button class="ns-btn ns-btn-primary" @click="createNew">
              {{ t('jobs.addButton') }}
            </button>
          </div>
        </header>

        <div v-if="isLoading && !hasLoaded" class="ns-card">
          <div class="ns-card-body">
            <JobsTableSkeleton />
          </div>
        </div>

        <div v-else-if="loadError && hasLoaded" class="ns-card">
          <div class="ns-card-body">
            <p class="text-sm text-danger">{{ t('common.loadError') }}</p>
          </div>
        </div>

        <div v-else-if="(hasRows || hasActiveFilters) && hasLoaded" class="ns-card">
          <div class="ns-card-body grid gap-4">
            <div class="flex flex-wrap items-center gap-2">
              <input
                v-model="searchInput"
                class="ns-input w-40"
                :placeholder="t('jobs.searchPlaceholder')"
              />
              <SharedMultiSelect
                v-model="industryFilter"
                :options="industryOptions"
                :placeholder="t('jobs.industry')"
                class="w-36"
              />
              <SharedMultiSelect
                v-model="companyFilter"
                :options="companyOptions"
                :placeholder="t('jobs.company')"
                class="w-36"
              />
              <SharedMultiSelect
                v-model="contractFilter"
                :options="contractOptions"
                :placeholder="t('jobs.contract')"
                class="w-36"
              />
              <SharedMultiSelect
                v-model="languageFilter"
                :options="languageOptions"
                :placeholder="t('jobs.languages')"
                class="w-36"
              />
              <SharedDateFilter
                v-model="publishedFilter"
                :label="t('jobs.published_at')"
                class="w-40"
              />
              <SharedDateFilter
                v-model="deadlineFilter"
                :label="t('jobs.deadline_at')"
                class="w-40"
              />
              <button v-if="hasActiveFilters" class="ns-btn ns-btn-ghost" @click="resetFilters">
                {{ t('jobs.resetButton') }}
              </button>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
              <span>{{ t('jobs.resultsCount', { count: displayedCount }) }}</span>
              <span>{{ t('jobs.totalCount', { count: totalCount }) }}</span>
            </div>

            <div v-if="isLoading" class="ns-banner text-center">
              <p class="text-sm text-muted">{{ t('common.loading') }}</p>
            </div>

            <div v-else-if="sortedRows.length > 0" class="relative overflow-visible">
              <table class="w-full text-left text-sm border-separate border-spacing-y-2">
                <thead class="relative z-0 text-xs uppercase text-muted">
                  <tr>
                    <th class="px-3 py-2">
                      <SortButton
                        :label="t('jobs.position')"
                        :active="sortKey === 'position'"
                        :dir="sortDir"
                        @click="toggleSort('position')"
                      />
                    </th>
                    <th class="px-3 py-2">
                      <SortButton
                        :label="t('jobs.company')"
                        :active="sortKey === 'company_id'"
                        :dir="sortDir"
                        @click="toggleSort('company_id')"
                      />
                    </th>
                    <th class="px-3 py-2">
                      <SortButton
                        :label="t('jobs.industry')"
                        :active="sortKey === 'industry'"
                        :dir="sortDir"
                        @click="toggleSort('industry')"
                      />
                    </th>
                    <th class="px-3 py-2">
                      <SortButton
                        :label="t('jobs.location')"
                        :active="sortKey === 'location'"
                        :dir="sortDir"
                        @click="toggleSort('location')"
                      />
                    </th>
                    <th class="px-3 py-2">
                      <SortButton
                        :label="t('jobs.contract')"
                        :active="sortKey === 'contract'"
                        :dir="sortDir"
                        @click="toggleSort('contract')"
                      />
                    </th>
                    <th class="px-3 py-2">
                      <SortButton
                        :label="t('jobs.published_at')"
                        :active="sortKey === 'published_at'"
                        :dir="sortDir"
                        @click="toggleSort('published_at')"
                      />
                    </th>
                    <th class="px-3 py-2">
                      <SortButton
                        :label="t('jobs.deadline_at')"
                        :active="sortKey === 'deadline_at'"
                        :dir="sortDir"
                        @click="toggleSort('deadline_at')"
                      />
                    </th>
                    <th class="px-3 py-2">{{ t('jobs.languages') }}</th>
                    <th class="px-3 py-2 text-center">{{ t('jobs.link') }}</th>
                    <th class="px-3 py-2 text-center">{{ t('jobs.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in sortedRows"
                    :key="row.id"
                    :class="['bg-surface-2 border border-border', rowClass(row.id)]"
                    @click="openPreview(row.id)"
                  >
                    <td class="px-3 py-3 rounded-l-lg capitalize">{{ row.position }}</td>
                    <td class="px-3 py-3 capitalize">{{ companyLabel(row) }}</td>
                    <td class="px-3 py-3 capitalize">{{ industryLabel[row.industry] || row.industry || '-' }}</td>
                    <td class="px-3 py-3 capitalize">{{ row.location || '-' }}</td>
                    <td class="px-3 py-3 capitalize">{{ contractLabel[row.contract] || row.contract }}</td>
                    <td class="px-3 py-3">{{ formatDateDDMMYYYY(row.published_at) }}</td>
                    <td class="px-3 py-3">{{ formatDateDDMMYYYY(row.deadline_at) }}</td>
                    <td class="px-3 py-3 uppercase">
                      {{ row.languages.length ? row.languages.join(', ') : '-' }}
                    </td>
                    <td class="px-3 py-3 text-center">
                      <a
                        v-if="row.link"
                        :href="row.link"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-primary"
                        @click.stop
                      >
                        <span class="material-symbols-rounded text-[18px] leading-none">open_in_new</span>
                      </a>
                      <span v-else>-</span>
                    </td>
                    <td class="px-3 py-3 rounded-r-lg">
                      <ActionsMenu
                        :open="openMenuId === row.id"
                        :position-class="menuPositionClass(index, sortedRows.length)"
                        :actions="actionsForRow(row)"
                        @toggle="toggleMenu(row.id)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <JobsSearchEmptyState v-else-if="hasActiveFilters" />
          </div>
        </div>
        <JobsEmptyState v-else-if="hasLoaded && !loadError" @create="createNew" />
      </div>
    </section>
    <JobsPreviewDialog
      :open="isPreviewOpen"
      :row="selectedRow"
      @close="closePreview"
      @edit="onPreviewEdit"
      @create-application="openApplicationFromJob"
    />
    <JobsFormDialog
      :open="isFormOpen"
      :row="selectedRow"
      :is-creating="isFormCreating"
      @close="closeForm"
      @save="saveForm"
    />
    <ApplicationsFormDialog
      :open="isApplicationOpen"
      :row="applicationDraft"
      :is-creating="true"
      @close="closeApplication"
      @save="saveApplication"
    />

    <Transition name="feedback-toast">
      <div
        v-if="feedback"
        class="fixed bottom-5 left-1/2 z-[70] w-[min(92vw,30rem)] -translate-x-1/2 rounded-xl border px-4 py-3 shadow-paper backdrop-blur-sm"
        :class="feedbackClass"
        role="status"
        aria-live="polite"
      >
        <p class="text-sm font-medium">{{ feedback.message }}</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.feedback-toast-enter-active,
.feedback-toast-leave-active {
  transition:
    opacity 220ms ease,
    transform 260ms ease;
}

.feedback-toast-enter-from,
.feedback-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 24px);
}

.feedback-success {
  color: color-mix(in oklab, var(--color-success) 72%, var(--color-text) 28%);
  border-color: color-mix(in oklab, var(--color-success) 32%, var(--color-border) 68%);
  background: color-mix(in oklab, var(--color-success-soft) 82%, transparent 18%);
}

.feedback-error {
  color: color-mix(in oklab, var(--color-danger) 76%, var(--color-text) 24%);
  border-color: color-mix(in oklab, var(--color-danger) 36%, var(--color-border) 64%);
  background: color-mix(in oklab, var(--color-danger-soft) 84%, transparent 16%);
}
</style>
