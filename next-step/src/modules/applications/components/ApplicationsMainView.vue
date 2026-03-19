<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ApplicationsEmptyState from './ApplicationsEmptyState.vue'
import ApplicationsTableSkeleton from './ApplicationsTableSkeleton.vue'
import ApplicationsPreviewDialog from './ApplicationsPreviewDialog.vue'
import ApplicationsFormDialog from './ApplicationsFormDialog.vue'
import ActionsMenu from '@/shared/components/ActionsMenu.vue'
import SortButton from '@/shared/components/SortButton.vue'
import { formatDateDDMMYYYY, toISODate } from '@/shared/utils/date'
import SharedMultiSelect, { type SharedMultiSelectOption } from '@/shared/components/SharedMultiSelect.vue'
import SharedDateFilter, { type DateFilterValue } from '@/shared/components/SharedDateFilter.vue'
import { useApplicationsStore } from '../store/useApplicationsStore'
import { useCompaniesStore } from '@/modules/companies/store/useCompaniesStore'
import { useCalendarStore } from '@/modules/calendar/store/useCalendarStore'
import type { Application } from '../types'
import { useRoute, useRouter } from 'vue-router'

type StatusValue =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'technical_assessment'
  | 'interview'
  | 'final_round'
  | 'offer_received'
  | 'rejected'
  | 'no_response'
  | 'withdrawn'
  | 'offer_declined'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const statusOptions = computed(
  () =>
    [
      { value: 'saved', label: t('applications.status.saved'), badge: 'ns-badge' },
      { value: 'applied', label: t('applications.status.applied'), badge: 'ns-badge ns-badge-primary' },
      { value: 'screening', label: t('applications.status.screening'), badge: 'ns-badge ns-badge-primary' },
      { value: 'technical_assessment', label: t('applications.status.technical_assessment'), badge: 'ns-badge ns-badge-primary' },
      { value: 'interview', label: t('applications.status.interview'), badge: 'ns-badge ns-badge-success' },
      { value: 'final_round', label: t('applications.status.final_round'), badge: 'ns-badge ns-badge-success' },
      { value: 'offer_received', label: t('applications.status.offer_received'), badge: 'ns-badge ns-badge-success' },
      { value: 'rejected', label: t('applications.status.rejected'), badge: 'ns-badge ns-badge-danger' },
      { value: 'no_response', label: t('applications.status.no_response'), badge: 'ns-badge' },
      { value: 'withdrawn', label: t('applications.status.withdrawn'), badge: 'ns-badge' },
      { value: 'offer_declined', label: t('applications.status.offer_declined'), badge: 'ns-badge ns-badge-warning' },
    ] as const,
)

const statusColors: Record<StatusValue, string> = {
  saved: 'var(--color-border)',
  applied: 'var(--color-primary)',
  screening: 'var(--color-primary)',
  technical_assessment: 'var(--color-primary)',
  interview: 'var(--color-success)',
  final_round: 'var(--color-success)',
  offer_received: 'var(--color-success)',
  rejected: 'var(--color-danger)',
  no_response: 'var(--color-border)',
  withdrawn: 'var(--color-border)',
  offer_declined: 'var(--color-warning)',
}

const statusRowBg: Record<StatusValue, string> = {
  saved: 'var(--color-surface-2)',
  applied: 'var(--color-primary-soft)',
  screening: 'var(--color-primary-soft)',
  technical_assessment: 'var(--color-primary-soft)',
  interview: 'var(--color-success-soft)',
  final_round: 'var(--color-success-soft)',
  offer_received: 'var(--color-success-soft)',
  rejected: 'var(--color-danger-soft)',
  no_response: 'var(--color-surface-2)',
  withdrawn: 'var(--color-surface-2)',
  offer_declined: 'var(--color-warning-soft)',
}

const applicationsStore = useApplicationsStore()
const companiesStore = useCompaniesStore()
const calendarStore = useCalendarStore()
const rows = computed({
  get: () => applicationsStore.rows,
  set: (value: Application[]) => {
    applicationsStore.rows = value
  },
})
const isLoading = computed(() => applicationsStore.isLoading)
const hasLoaded = computed(() => applicationsStore.hasLoaded)
const loadError = computed(() => applicationsStore.loadError)

const searchInput = ref('')
const searchQuery = ref('')
let searchTimer: ReturnType<typeof setTimeout> | undefined
const statusFilter = ref<SharedMultiSelectOption[] | null>(null)
const appliedFilter = ref<DateFilterValue>({ operator: null, date: '' })
const deadlineFilter = ref<DateFilterValue>({ operator: null, date: '' })
const companyFilter = ref<SharedMultiSelectOption[] | null>(null)


watch(searchInput, (value) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    searchQuery.value = value.trim().toLowerCase()
  }, 500)
})

type SortKey =
  | 'id'
  | 'position'
  | 'company_id'
  | 'status'
  | 'applied'
  | 'deadline'
  | 'hasCV'
  | 'hasCL'

const sortKey = ref<SortKey>('id')
const sortDir = ref<'asc' | 'desc'>('desc')

const statusLabel = computed(() => {
  return Object.fromEntries(statusOptions.value.map((opt) => [opt.value, opt.label]))
})

const companiesById = computed<Record<number, string>>(() =>
  companiesStore.rows.reduce<Record<number, string>>((acc, company) => {
    acc[company.id] = company.name
    return acc
  }, {}),
)

const companyLabel = (companyId: number | null) => {
  if (companyId == null) return '-'
  return companiesById.value[companyId] || '-'
}

const companyOptions = computed<SharedMultiSelectOption[]>(() => {
  return companiesStore.rows
    .map((company) => ({ value: company.id, label: company.name }))
    .sort((a, b) => a.label.localeCompare(b.label, 'fr'))
})

const statusFilterOptions = computed<SharedMultiSelectOption[]>(() =>
  statusOptions.value.map((option) => ({ value: option.value, label: option.label })),
)

const parseDisplayDate = (value: string) => {
  if (!value) return null
  const iso = toISODate(value)
  if (!iso) return null
  return new Date(`${iso}T00:00:00`)
}

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
  return rows.value.filter((row) => {
    const selectedCompanies = companyFilter.value ?? []
    const selectedStatuses = statusFilter.value ?? []

    if (selectedCompanies.length) {
      const selected = new Set(selectedCompanies.map((opt) => Number(opt.value)))
      if (!selected.has(Number(row.company_id))) return false
    }

    if (selectedStatuses.length) {
      const selected = new Set(selectedStatuses.map((opt) => String(opt.value)))
      if (!selected.has(row.status)) return false
    }

    if (appliedFilter.value.operator && appliedFilter.value.date) {
      const appliedDate = parseDisplayDate(row.applied)
      if (!appliedDate) return false
      const filterDate = new Date(`${appliedFilter.value.date}T00:00:00`)
      if (appliedFilter.value.operator === 'before' && !(appliedDate < filterDate)) return false
      if (appliedFilter.value.operator === 'after' && !(appliedDate > filterDate)) return false
    }

    if (deadlineFilter.value.operator && deadlineFilter.value.date) {
      const deadlineDate = parseDisplayDate(row.deadline)
      if (!deadlineDate) return false
      const filterDate = new Date(`${deadlineFilter.value.date}T00:00:00`)
      if (deadlineFilter.value.operator === 'before' && !(deadlineDate < filterDate)) return false
      if (deadlineFilter.value.operator === 'after' && !(deadlineDate > filterDate)) return false
    }

    if (!q) return true

    const haystack = [
      row.position,
      companyLabel(row.company_id),
      statusLabel.value[row.status],
      row.applied,
      row.deadline,
      row.hasCV ? 'cv yes' : 'cv no',
      row.hasCL ? 'lm yes' : 'lm no',
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
})

const hasActiveFilters = computed(() => {
  return Boolean(
    searchQuery.value ||
      (statusFilter.value?.length ?? 0) ||
      (appliedFilter.value.operator && appliedFilter.value.date) ||
      (deadlineFilter.value.operator && deadlineFilter.value.date) ||
      (companyFilter.value?.length ?? 0),
  )
})

const displayedCount = computed(() => filteredRows.value.length)
const totalCount = computed(() => rows.value.length)

const sortedRows = computed(() => {
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...filteredRows.value].sort((a, b) => {
    const key = sortKey.value
    const left = a[key]
    const right = b[key]
    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * dir
    }
    if (typeof left === 'boolean' && typeof right === 'boolean') {
      return (left === right ? 0 : left ? 1 : -1) * dir
    }
    return String(left).localeCompare(String(right), 'fr', { numeric: true }) * dir
  })
})

const hasRows = computed(() => rows.value.length > 0)

const selectedRow = ref<(typeof rows.value)[number] | null>(null)
const isPreviewOpen = ref(false)
const isFormOpen = ref(false)
const isFormCreating = ref(false)
const isFormFromPreview = ref(false)
const openMenuId = ref<number | null>(null)
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
    isFormFromPreview.value = false
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
  const nextId = Math.max(0, ...rows.value.map((row) => row.id)) + 1
  selectedRow.value = {
    id: nextId,
    type: 'CDI',
    position: '',
    company_id: null,
    status: 'saved',
    applied: '',
    deadline: '',
    hasCV: false,
    hasCL: false,
  }
  isFormCreating.value = true
  isFormOpen.value = true
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
  isFormFromPreview.value = true
  isFormOpen.value = true
}

const saveForm = async (updated: Application) => {
  try {
    if (isFormCreating.value) {
      await applicationsStore.createApplication(updated)
      await applicationsStore.loadApplications()
      await calendarStore.loadEvents()
      closeForm()
      showFeedback('success', 'Application created successfully.')
    } else {
      const saved = await applicationsStore.updateApplication(updated)
      await applicationsStore.loadApplications()
      await calendarStore.loadEvents()
      closeForm()
      if (isFormFromPreview.value) {
        selectedRow.value = saved
        isPreviewOpen.value = true
      }
      showFeedback('success', 'Application updated successfully.')
    }
  } catch {
    showFeedback('error', 'Application action failed. Please try again.')
  }
}

const updateRowStatus = async (row: Application) => {
  try {
    await applicationsStore.updateApplication(row)
    await applicationsStore.loadApplications()
    showFeedback('success', 'Application status updated.')
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

const resetFilters = () => {
  searchInput.value = ''
  searchQuery.value = ''
  statusFilter.value = null
  appliedFilter.value = { operator: null, date: '' }
  deadlineFilter.value = { operator: null, date: '' }
  companyFilter.value = null
}

onMounted(() => {
  applicationsStore.loadApplications()
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

const actionsForRow = (rowId: number) => [
  {
    label: t('common.edit'),
    icon: 'edit',
    onClick: () => {
      openPreview(rowId, true)
      closeMenu()
    },
  },
  {
    label: t('common.view'),
    icon: 'visibility',
    onClick: () => {
      openPreview(rowId, false)
      closeMenu()
    },
  },
  {
    label: t('common.delete'),
    icon: 'delete',
    danger: true,
    onClick: async () => {
      try {
        await applicationsStore.deleteApplication(rowId)
        await applicationsStore.loadApplications()
        await calendarStore.loadEvents()
        showFeedback('success', 'Application deleted successfully.')
      } catch {
        showFeedback('error', 'Application action failed. Please try again.')
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

</script>

<template>
  <div class="bg-bg text-text" @click.capture="handleGlobalClick">
    <section class="ns-container max-w-none px-2 sm:px-4 py-8 sm:py-12">
      <div class="flex flex-col gap-6">
        <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight">
              {{ t('applications.title') }}
            </h1>
            <p class="ns-card-subtitle">{{ t('applications.subtitle') }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <button class="ns-btn ns-btn-primary" @click="createNew">
              {{ t('applications.addButton') }}
            </button>
          </div>
        </header>

        <div v-if="isLoading && !hasLoaded" class="ns-card">
          <div class="ns-card-body">
            <ApplicationsTableSkeleton />
          </div>
        </div>

        <div v-else-if="loadError && hasLoaded" class="ns-card">
          <div class="ns-card-body">
            <p class="text-sm text-danger">{{ t('common.loadError') }}</p>
          </div>
        </div>

        <div v-else-if="(hasRows || hasActiveFilters) && hasLoaded" class="ns-card">
          <div class="ns-card-body grid gap-4">
            <div class="flex flex-wrap items-center gap-3">
              <input
                v-model="searchInput"
                class="ns-input w-full sm:w-72"
                :placeholder="t('applications.searchPlaceholder')"
              />
              <SharedMultiSelect
                v-model="companyFilter"
                :options="companyOptions"
                :placeholder="t('applications.filters.allCompanies')"
                class="sm:w-56 w-full"
              />
              <SharedMultiSelect
                v-model="statusFilter"
                :options="statusFilterOptions"
                :placeholder="t('applications.filters.allStatus')"
                class="sm:w-44 w-full"
              />
              <SharedDateFilter
                v-model="appliedFilter"
                :label="t('applications.columns.applied')"
                class="sm:w-44 w-full"
              />
              <SharedDateFilter
                v-model="deadlineFilter"
                :label="t('applications.columns.deadline')"
                class="sm:w-44 w-full"
              />
              <button v-if="hasActiveFilters" class="ns-btn ns-btn-ghost" @click="resetFilters">
                {{ t('applications.resetButton') }}
              </button>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
              <span>{{ t('applications.resultsCount', { count: displayedCount }) }}</span>
              <span>{{ t('applications.totalCount', { count: totalCount }) }}</span>
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
                        :label="t('applications.columns.position')"
                        :active="sortKey === 'position'"
                        :dir="sortDir"
                        @click="toggleSort('position')"
                      />
                    </th>
                    <th class="px-3 py-2">
                      <SortButton
                        :label="t('applications.columns.company')"
                        :active="sortKey === 'company_id'"
                        :dir="sortDir"
                        @click="toggleSort('company_id')"
                      />
                    </th>
                    <th class="px-3 py-2">
                      <SortButton
                        :label="t('applications.columns.status')"
                        :active="sortKey === 'status'"
                        :dir="sortDir"
                        @click="toggleSort('status')"
                      />
                    </th>
                    <th class="px-3 py-2">
                      <SortButton
                        :label="t('applications.columns.applied')"
                        :active="sortKey === 'applied'"
                        :dir="sortDir"
                        @click="toggleSort('applied')"
                      />
                    </th>
                    <th class="px-3 py-2">
                      <SortButton
                        :label="t('applications.columns.deadline')"
                        :active="sortKey === 'deadline'"
                        :dir="sortDir"
                        @click="toggleSort('deadline')"
                      />
                    </th>
                    <th class="px-3 py-2 text-center">
                      <SortButton
                        :label="t('applications.columns.cv')"
                        :active="sortKey === 'hasCV'"
                        :dir="sortDir"
                        @click="toggleSort('hasCV')"
                      />
                    </th>
                    <th class="px-3 py-2 text-center">
                      <SortButton
                        :label="t('applications.columns.cl')"
                        :active="sortKey === 'hasCL'"
                        :dir="sortDir"
                        @click="toggleSort('hasCL')"
                      />
                    </th>
                    <th class="px-3 py-2 text-center">{{ t('applications.columns.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in sortedRows"
                    :key="row.id"
                    :class="['bg-surface-2 border border-border', rowClass(row.id)]"
                    @click="openPreview(row.id)"
                    :style="{ background: statusRowBg[row.status as StatusValue] }"
                  >
                    <td class="px-3 py-3 rounded-l-lg font-medium">{{ row.position }}</td>
                    <td class="px-3 py-3">{{ companyLabel(row.company_id) }}</td>
                    <td class="px-3 py-3">
                      <div class="flex items-center gap-2">
                        <span
                          class="h-2.5 w-2.5"
                          :style="{ background: statusColors[row.status as StatusValue] }"
                          aria-hidden="true"
                        ></span>
                        <select v-model="row.status" class="ns-input w-36" @change="updateRowStatus(row)" @click.stop>
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                        </select>
                      </div>
                    </td>
                    <td class="px-3 py-3">{{ formatDateDDMMYYYY(row.applied) }}</td>
                    <td class="px-3 py-3">{{ formatDateDDMMYYYY(row.deadline) }}</td>
                    <td class="px-3 py-3 text-center">
                      {{ row.hasCV ? t('applications.yes') : t('applications.no') }}
                    </td>
                    <td class="px-3 py-3 text-center">
                      {{ row.hasCL ? t('applications.yes') : t('applications.no') }}
                    </td>
                    <td class="px-3 py-3">
                      <ActionsMenu
                        :open="openMenuId === row.id"
                        :position-class="menuPositionClass(index, sortedRows.length)"
                        :actions="actionsForRow(row.id)"
                        @toggle="toggleMenu(row.id)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="ns-banner text-center">
              <p class="text-sm text-muted">{{ t('applications.searchEmpty.title') }}</p>
              <p class="text-xs text-muted">{{ t('applications.searchEmpty.subtitle') }}</p>
            </div>
          </div>
        </div>
        <ApplicationsEmptyState v-else-if="hasLoaded && !loadError" @create="createNew" />
      </div>
    </section>
    <ApplicationsPreviewDialog
      :open="isPreviewOpen"
      :row="selectedRow"
      @close="closePreview"
      @edit="onPreviewEdit"
    />
    <ApplicationsFormDialog
      :open="isFormOpen"
      :row="selectedRow"
      :is-creating="isFormCreating"
      @close="closeForm"
      @save="saveForm"
    />

    <Transition name="feedback-toast">
      <div
        v-if="feedback"
        class="feedback-toast fixed z-[70] w-[min(92vw,30rem)] rounded-xl border px-4 py-3 shadow-paper backdrop-blur-sm"
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
.feedback-toast {
  position: fixed;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
}

.feedback-toast-enter-active,
.feedback-toast-leave-active {
  transition:
    opacity 220ms ease,
    transform 260ms ease;
}

.feedback-toast-enter-from,
.feedback-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(24px);
}

.feedback-toast-enter-to,
.feedback-toast-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
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
