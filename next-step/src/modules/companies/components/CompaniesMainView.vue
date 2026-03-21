<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { Company } from '../types'
import CompaniesEmptyState from './CompaniesEmptyState.vue'
import CompaniesSearchEmptyState from './CompaniesSearchEmptyState.vue'
import CompaniesPreviewDialog from './CompaniesPreviewDialog.vue'
import CompaniesFormDialog from './CompaniesFormDialog.vue'
import ActionsMenu from '@/shared/components/ActionsMenu.vue'
import { useCompaniesStore } from '../store/useCompaniesStore'
import { i18n } from '@/app/i18n'
import { useSectorsStore } from '../store/useSectorsStore'
import SharedSelect, { type SharedSelectOption } from '@/shared/components/SharedSelect.vue'
import SortButton from '@/shared/components/SortButton.vue'
import CompaniesTableSkeleton from './CompaniesTableSkeleton.vue'

const { t, te } = i18n.global

const companiesStore = useCompaniesStore()
const rows = computed(() => companiesStore.rows)
const isLoading = computed(() => companiesStore.isLoading)
const hasLoaded = computed(() => companiesStore.hasLoaded)

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
  | 'name'
  | 'industry'
  | 'size'
  | 'location'
  | 'website'
  | 'career_page'
  | 'contactName'
  | 'contactEmail'
  | 'contactPhone'
  | 'available_jobs'
  | 'total_applications'

const sortKey = ref<SortKey>('name')
const sortDir = ref<'asc' | 'desc'>('asc')
const industryFilter = ref<SharedSelectOption | null>(null)

const sectorsStore = useSectorsStore()
const sectorOptions = computed<SharedSelectOption[]>(() => {
  const allOption: SharedSelectOption = { value: 'all', label: t('companies.allSectors') }
  const options = sectorsStore.global.map((sector) => ({
    value: sector,
    label: t(`references.industry.${sector}`),
  }))
  return [allOption, ...options]
})

const toggleSort = (key: SortKey) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

const filteredRows = computed(() => rows.value)
const sortedRows = computed(() => rows.value)

const hasRows = computed(() => rows.value.length > 0)
const hasActiveFilters = computed(() => {
  const hasSearch = searchQuery.value.length > 0
  const hasIndustry = industryFilter.value?.value && industryFilter.value.value !== 'all'
  return hasSearch || hasIndustry
})

const isLinkedIn = (value: string) => value.toLowerCase().includes('linkedin.com')
const industryLabel = (value: string) => {
  if (!value) return '-'
  const key = `references.industry.${value}`
  return te(key) ? t(key) : '-'
}

const selectedRow = ref<Company | null>(null)
const isPreviewOpen = ref(false)
const isFormOpen = ref(false)
const isFormCreating = ref(false)
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
    isFormOpen.value = true
  } else {
    isPreviewOpen.value = true
  }
}

const createNew = () => {
  selectedRow.value = {
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
  isFormOpen.value = true
}

const saveForm = async (updated: Company) => {
  try {
    if (isFormCreating.value) {
      await companiesStore.createCompany(updated)
      closeForm()
      showFeedback('success', t('companies.feedback.created'))
    } else {
      const saved = await companiesStore.updateCompany(updated)
      closeForm()
      selectedRow.value = saved
      isPreviewOpen.value = true
      showFeedback('success', t('companies.feedback.updated'))
    }
  } catch {
    showFeedback('error', t('companies.feedback.error'))
  }
}

const toggleMenu = (rowId: number) => {
  openMenuId.value = openMenuId.value === rowId ? null : rowId
}

const closeMenu = () => {
  openMenuId.value = null
}

const actionsForRow = (row: Company) => [
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
    label: t('common.delete'),
    icon: 'delete',
    danger: true,
    onClick: () => {
      deleteRow(row.id)
    },
  },
]

const deleteRow = async (id: number) => {
  try {
    await companiesStore.deleteCompany(id)
    if (selectedRow.value?.id === id) {
      closePreview()
      selectedRow.value = null
    }
    showFeedback('success', t('companies.feedback.deleted'))
  } catch {
    showFeedback('error', t('companies.feedback.error'))
  } finally {
    closeMenu()
  }
}

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

const refreshCompanies = async () => {
  await companiesStore.loadCompanies({
    q: searchQuery.value || undefined,
    industry:
      industryFilter.value && industryFilter.value.value !== 'all'
        ? String(industryFilter.value.value)
        : undefined,
    sortKey: sortKey.value,
    sortDir: sortDir.value,
  })
}

watch([searchQuery, sortKey, sortDir, industryFilter], () => {
  refreshCompanies()
})

onMounted(() => {
  industryFilter.value = sectorOptions.value[0] ?? null
  refreshCompanies()
})

const resetFilters = () => {
  searchInput.value = ''
  searchQuery.value = ''
  sortKey.value = 'name'
  sortDir.value = 'asc'
  industryFilter.value = sectorOptions.value[0] ?? null
  refreshCompanies()
}
</script>

<template>
  <div class="bg-bg text-text" @click.capture="handleGlobalClick">
    <section class="ns-container max-w-none px-2 sm:px-4 py-8 sm:py-12">
      <div class="flex flex-col gap-6">
        <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight">
              {{ t('companies.title') }}
            </h1>
            <p class="ns-card-subtitle">{{ t('companies.subtitle') }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <button class="ns-btn ns-btn-primary" @click="createNew">
              {{ t('companies.addButton') }}
            </button>
          </div>
        </header>

        <div v-if="isLoading && !hasLoaded" class="ns-card">
          <div class="ns-card-body">
            <CompaniesTableSkeleton />
          </div>
        </div>

        <div v-else-if="(hasRows || hasActiveFilters) && hasLoaded" class="ns-card ns-fade-in">
          <div class="ns-card-body grid gap-4">
            <div class="flex flex-wrap items-center gap-3">
              <input
                v-model="searchInput"
                class="ns-input w-full sm:w-72"
                :placeholder="t('companies.searchPlaceholder')"
              />
              <SharedSelect
                v-model="industryFilter"
                :options="sectorOptions"
                class="sm:w-48 w-auto"
              />
              <button v-if="hasActiveFilters" class="ns-btn ns-btn-ghost" @click="resetFilters">
                {{ t('companies.resetButton') }}
              </button>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
              <span>{{ t('companies.resultsCount', { count: filteredRows.length }) }}</span>
            </div>

            <div v-if="isLoading" class="relative overflow-visible">
              <CompaniesTableSkeleton />
            </div>

            <div v-else-if="sortedRows.length > 0" class="relative overflow-visible">
              <table class="w-full text-left text-sm border-separate border-spacing-y-2">
                <thead class="relative z-0 text-xs uppercase text-muted">
                  <tr>
                    <th class="px-3 py-2">
                      <SortButton
                        :label="t('companies.table.name')"
                        :active="sortKey === 'name'"
                        :dir="sortDir"
                        @click="toggleSort('name')"
                      />
                    </th>
                    <th class="px-3 py-2">
                      <SortButton
                        :label="t('companies.table.industry')"
                        :active="sortKey === 'industry'"
                        :dir="sortDir"
                        @click="toggleSort('industry')"
                      />
                    </th>
                    <th class="px-3 py-2">
                      <SortButton
                        :label="t('companies.table.location')"
                        :active="sortKey === 'location'"
                        :dir="sortDir"
                        @click="toggleSort('location')"
                      />
                    </th>
                    <th class="px-3 py-2 text-center">
                      <SortButton
                        :label="t('companies.table.availableJobs')"
                        :active="sortKey === 'available_jobs'"
                        :dir="sortDir"
                        @click="toggleSort('available_jobs')"
                      />
                    </th>
                    <th class="px-3 py-2">{{ t('companies.table.socialNetworks') }}</th>
                    <th class="px-3 py-2">{{ t('companies.table.careerPage') }}</th>
                    <th class="px-3 py-2 text-center">{{ t('companies.table.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in sortedRows"
                    :key="row.id"
                    :class="['bg-surface-2 border border-border', rowClass(row.id)]"
                    @click="openPreview(row.id)"
                  >
                    <td class="px-3 py-3 rounded-l-lg">{{ row.name }}</td>
                    <td class="px-3 py-3">
                      <div class="flex items-center gap-2">
                        <span
                          class="h-2.5 w-2.5 rounded-full"
                          aria-hidden="true"
                        ></span>
                        <span>{{ industryLabel(row.industry) }}</span>
                      </div>
                    </td>
                    <td class="px-3 py-3">{{ row.location }}</td>
                    <td class="px-3 py-3 text-center">{{ row.available_jobs }}</td>
                    <td class="px-3 py-3">
                      <a
                        v-if="row.socialMedia"
                        :href="row.socialMedia"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 text-primary"
                        @click.stop
                      >
                        <span
                          v-if="isLinkedIn(row.socialMedia)"
                          class="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-[11px] font-bold"
                        >
                          in
                        </span>
                        <span
                          v-else
                          class="material-symbols-rounded text-[18px] leading-none"
                        >
                          link
                        </span>
                      </a>
                      <span v-else>-</span>
                    </td>
                    <td class="px-3 py-3">
                      <a
                        v-if="row.career_page"
                        :href="row.career_page"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-primary"
                        @click.stop
                      >
                        {{ row.career_page }}
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
            <CompaniesSearchEmptyState v-else-if="hasActiveFilters && hasLoaded" />

          </div>
        </div>
        <CompaniesEmptyState v-else-if="hasLoaded" @create="createNew" />
      </div>
    </section>
    <CompaniesPreviewDialog
      :open="isPreviewOpen"
      :row="selectedRow"
      @close="closePreview"
      @edit="onPreviewEdit"
    />
    <CompaniesFormDialog
      :open="isFormOpen"
      :row="selectedRow"
      :is-creating="isFormCreating"
      @close="closeForm"
      @save="saveForm"
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
