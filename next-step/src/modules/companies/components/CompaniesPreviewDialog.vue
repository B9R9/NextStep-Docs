<script setup lang="ts">
import type { Company } from '../types'
import { useI18n } from 'vue-i18n'
import { useScrollLock } from '@/shared/composables/useScrollLock'
import CompaniesPreviewView from './CompaniesPreviewView.vue'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  row: Company | null
}>()

useScrollLock(() => props.open)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit'): void
}>()

const sectorColors: Record<string, string> = {
  Technology: 'var(--color-primary)',
  Finance: 'var(--color-warning)',
  SaaS: 'var(--color-focus)',
  Health: 'var(--color-success)',
  Retail: 'var(--color-sun)',
  Education: 'var(--color-success)',
  Energy: 'var(--color-danger)',
  Marketing: 'var(--color-primary)',
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-black/40"></div>
    <div class="relative w-full max-w-6xl h-[90vh]">
      <div class="ns-card h-full">
        <div class="ns-card-body flex h-full flex-col gap-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-2xl font-semibold">{{ row?.name }}</h2>
              <p class="text-sm text-muted">
                {{ row?.industry ? t(`references.industry.${row.industry}`) : '' }} · {{ row?.location }}
              </p>
            </div>
            <button class="ns-btn ns-btn-ghost p-2" :aria-label="t('companies.aria.close')" @click="emit('close')">
              <span class="material-symbols-rounded text-[18px] leading-none">close</span>
            </button>
          </div>

          <CompaniesPreviewView :row="row" :sector-colors="sectorColors" />

          <div class="mt-auto flex justify-end gap-2">
            <button class="ns-btn ns-btn-ghost" @click="emit('close')">{{ t('common.cancel') }}</button>
            <button class="ns-btn ns-btn-primary" @click="emit('edit')">{{ t('common.edit') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
