<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useScrollLock } from '@/shared/composables/useScrollLock'
import type { Company } from '../types'
import { useSectorsStore } from '../store/useSectorsStore'
import { useI18n } from 'vue-i18n'
import CompaniesFormView from './CompaniesFormView.vue'
import { http } from '@/shared/api/http'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  row: Company | null
  isCreating?: boolean
}>()

useScrollLock(() => props.open)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', value: Company): void
}>()

const draft = ref<Company | null>(null)
const locationQuery = ref('')
const locationResults = ref<string[]>([])
const isLocationOpen = ref(false)
const isLocationFocused = ref(false)
const isSelectingLocation = ref(false)
let locationTimer: ReturnType<typeof setTimeout> | undefined

const sectorsStore = useSectorsStore()
const sectorOptions = computed(() => [...sectorsStore.global])

watch(
  () => props.row,
  (value) => {
    draft.value = value ? { ...value } : null
    locationQuery.value = value?.location || ''
  },
)

watch(
  () => props.open,
  (value) => {
    if (!value) {
      draft.value = props.row ? { ...props.row } : null
      locationQuery.value = props.row?.location || ''
    }
  },
)

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

const save = () => {
  if (draft.value) emit('save', draft.value)
}

const close = () => emit('close')
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-black/40"></div>
    <div class="relative w-full max-w-6xl h-[90vh]">
      <div class="ns-card h-full">
        <div class="ns-card-body flex h-full flex-col gap-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <template v-if="isCreating">
                <h2 class="text-2xl font-semibold">{{ t('companies.dialog.createTitle') }}</h2>
                <p class="text-sm text-muted">{{ t('companies.dialog.createSubtitle') }}</p>
              </template>
              <template v-else>
                <h2 class="text-2xl font-semibold">{{ row?.name }}</h2>
                <p class="text-sm text-muted">
                  {{ row?.industry ? t(`references.industry.${row.industry}`) : '' }} · {{ row?.location }}
                </p>
              </template>
            </div>
            <button class="ns-btn ns-btn-ghost p-2" :aria-label="t('companies.aria.close')" @click="close">
              <span class="material-symbols-rounded text-[18px] leading-none">close</span>
            </button>
          </div>

          <CompaniesFormView
            :draft="draft"
            :sector-options="sectorOptions"
            :location-query="locationQuery"
            :location-results="locationResults"
            :is-location-open="isLocationOpen"
            @update:locationQuery="locationQuery = $event"
            @selectLocation="selectLocation"
            @focusLocation="isLocationFocused = true; isLocationOpen = locationResults.length > 0"
            @blurLocation="onBlurLocation"
          />

          <div class="mt-auto flex justify-end gap-2">
            <button class="ns-btn ns-btn-ghost" @click="close">{{ t('common.cancel') }}</button>
            <button class="ns-btn ns-btn-primary" @click="save">{{ t('common.save') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
