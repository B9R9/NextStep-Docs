<script setup lang="ts">
import { computed } from 'vue'
import type { Company } from '../types'
import SharedSelect, { type SharedSelectOption } from '@/shared/components/SharedSelect.vue'
import { useI18n } from 'vue-i18n'
import { COMPANY_SIZE_VALUES } from '@/shared/references/catalog'

const props = defineProps<{
  draft: Company | null
  sectorOptions: string[]
  locationQuery: string
  locationResults: string[]
  isLocationOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:locationQuery', value: string): void
  (e: 'selectLocation', value: string): void
  (e: 'focusLocation'): void
  (e: 'blurLocation'): void
}>()

const locationInput = computed({
  get: () => props.locationQuery,
  set: (value: string) => emit('update:locationQuery', value),
})

const { t } = useI18n()

const sectorOptions = computed<SharedSelectOption[]>(() =>
  props.sectorOptions.map((sector) => ({
    value: sector,
    label: t(`references.industry.${sector}`),
  }))
)

const sizeOptions: SharedSelectOption[] = COMPANY_SIZE_VALUES.map((value) => ({
  value,
  label: t(`references.size.${value}`),
}))

const industryModel = computed<SharedSelectOption | null>({
  get: () =>
    sectorOptions.value.find((option) => option.value === props.draft?.industry) ?? null,
  set: (value) => {
    if (props.draft) {
      props.draft.industry = value?.value ? String(value.value) : ''
    }
  },
})

const sizeModel = computed<SharedSelectOption | null>({
  get: () => sizeOptions.find((option) => option.value === props.draft?.size) ?? null,
  set: (value) => {
    if (props.draft) {
      props.draft.size = value?.value ? String(value.value) : ''
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
          <p class="text-sm font-semibold">{{ t('companies.form.identity') }}</p>
        </header>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="grid gap-1 text-sm">
            <span class="text-xs text-muted">{{ t('companies.form.name') }}</span>
            <input v-model="props.draft!.name" class="ns-input h-9 text-xs" />
          </label>
          <div class="grid gap-1 text-sm">
            <SharedSelect
              v-model="industryModel"
              :label="t('companies.form.industry')"
              :options="sectorOptions"
              :clear-label="t('common.noSelection')"
              class="h-9 text-xs"
            />
          </div>
          <div class="grid gap-1 text-sm">
            <SharedSelect
              v-model="sizeModel"
              :label="t('companies.form.size')"
              :options="sizeOptions"
              :clear-label="t('common.noSelection')"
              class="h-9 text-xs"
            />
          </div>
          <label class="grid gap-1 text-sm">
            <span class="text-xs text-muted">{{ t('companies.form.location') }}</span>
            <div class="relative">
              <input
                v-model="locationInput"
                class="ns-input h-9 text-xs"
                :placeholder="t('companies.form.locationPlaceholder')"
                @focus="emit('focusLocation')"
                @blur="emit('blurLocation')"
              />
              <div
                v-if="props.isLocationOpen"
                class="absolute z-10 mt-2 w-full rounded-xl border border-border bg-surface shadow-paper"
              >
                <button
                  v-for="city in props.locationResults"
                  :key="city"
                  type="button"
                  class="flex w-full items-center px-3 py-2 text-sm hover:bg-surface-2"
                  @click="emit('selectLocation', city)"
                >
                  {{ city }}
                </button>
              </div>
            </div>
          </label>
        </div>
      </section>

      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('companies.form.links') }}</p>
        </header>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="grid gap-1 text-sm">
            <span class="text-xs text-muted">{{ t('companies.form.website') }}</span>
            <input v-model="props.draft!.website" type="url" class="ns-input h-9 text-xs" />
          </label>
          <label class="grid gap-1 text-sm">
            <span class="text-xs text-muted">{{ t('companies.form.careerPage') }}</span>
            <input v-model="props.draft!.career_page" type="url" class="ns-input h-9 text-xs" />
          </label>
          <label class="grid gap-1 text-sm sm:col-span-2">
            <span class="text-xs text-muted">{{ t('companies.form.social') }}</span>
            <input v-model="props.draft!.socialMedia" type="url" class="ns-input h-9 text-xs" />
          </label>
        </div>
      </section>
    </div>

    <!-- RIGHT -->
    <div class="space-y-4">
      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('companies.form.contact') }}</p>
        </header>
        <div class="grid gap-3">
          <label class="grid gap-1 text-sm">
            <span class="text-xs text-muted">{{ t('companies.form.contactName') }}</span>
            <input v-model="props.draft!.contactName" class="ns-input h-9 text-xs" />
          </label>
          <label class="grid gap-1 text-sm">
            <span class="text-xs text-muted">{{ t('companies.form.contactEmail') }}</span>
            <input v-model="props.draft!.contactEmail" type="email" class="ns-input h-9 text-xs" />
          </label>
          <label class="grid gap-1 text-sm">
            <span class="text-xs text-muted">{{ t('companies.form.contactPhone') }}</span>
            <input v-model="props.draft!.contactPhone" type="tel" class="ns-input h-9 text-xs" />
          </label>
        </div>
      </section>

      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('companies.form.notes') }}</p>
        </header>
        <textarea v-model="props.draft!.comments" class="ns-textarea text-xs"></textarea>
      </section>
    </div>
  </div>
</template>
