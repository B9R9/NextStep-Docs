<script setup lang="ts">
import type { Job } from '@/modules/jobs/types'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  row: {
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
  } | null
  companyName: string
  jobLabel: string
  job: Job | null
  workModeLabel: Record<string, string>
  contractLabel: Record<string, string>
  levelLabel: Record<string, string>
  formatDateShort: (value: string) => string
}>()
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3 pr-1">
    <!-- LEFT -->
    <div class="space-y-4 lg:col-span-2">
      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('applications.preview.section') }}</p>
        </header>
        <div class="ns-kv">
          <div class="ns-kv-row">
            <p class="ns-k">{{ t('applications.preview.company') }}</p>
            <p class="ns-v font-semibold">{{ companyName || '—' }}</p>
          </div>
          <div class="ns-kv-row">
            <p class="ns-k">{{ t('applications.preview.position') }}</p>
            <p class="ns-v font-semibold">{{ row?.position || '—' }}</p>
          </div>
          <div class="ns-kv-row">
            <p class="ns-k">{{ t('applications.preview.status') }}</p>
            <p class="ns-v font-semibold">{{ row?.status || '—' }}</p>
          </div>
        </div>
      </section>

      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('applications.preview.dates') }}</p>
        </header>
        <div class="grid gap-2 sm:grid-cols-2">
          <div class="ns-banner">
            <p class="text-xs text-muted">{{ t('applications.preview.applied') }}</p>
            <p class="text-sm font-semibold">{{ formatDateShort(row?.applied || '') }}</p>
          </div>
          <div class="ns-banner">
            <p class="text-xs text-muted">{{ t('applications.preview.deadline') }}</p>
            <p class="text-sm font-semibold">{{ formatDateShort(row?.deadline || '') }}</p>
          </div>
        </div>
      </section>
    </div>

    <!-- RIGHT -->
    <div class="space-y-4">
      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('applications.preview.jobLinked') }}</p>
        </header>
        <div v-if="row?.jobId" class="space-y-3">
          <div class="ns-kv">
            <div class="ns-kv-row">
              <p class="ns-k">{{ t('applications.preview.jobTitle') }}</p>
              <p class="ns-v font-semibold">
                {{ jobLabel || t('applications.preview.jobMissing') }}
              </p>
            </div>
            <div class="ns-kv-row">
              <p class="ns-k">{{ t('applications.preview.jobLocation') }}</p>
              <p class="ns-v font-semibold">{{ job?.location || '-' }}</p>
            </div>
            <div class="ns-kv-row">
              <p class="ns-k">{{ t('applications.preview.jobMode') }}</p>
              <p class="ns-v font-semibold">{{ workModeLabel[job?.work_mode || ''] || job?.work_mode || '-' }}</p>
            </div>
            <div class="ns-kv-row">
              <p class="ns-k">{{ t('applications.preview.jobContract') }}</p>
              <p class="ns-v font-semibold">{{ contractLabel[job?.contract || ''] || job?.contract || '-' }}</p>
            </div>
            <div class="ns-kv-row">
              <p class="ns-k">{{ t('applications.preview.jobIndustry') }}</p>
              <p class="ns-v font-semibold">{{ job?.industry || '-' }}</p>
            </div>
            <div class="ns-kv-row">
              <p class="ns-k">{{ t('applications.preview.jobLevel') }}</p>
              <p class="ns-v font-semibold">{{ levelLabel[job?.level || ''] || job?.level || '-' }}</p>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-muted">Aucun</p>
      </section>

      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('applications.preview.documents') }}</p>
        </header>
        <div class="ns-kv">
          <div class="ns-kv-row">
            <p class="ns-k">{{ t('applications.preview.cv') }}</p>
            <p class="ns-v font-semibold">
              {{ row?.hasCV ? t('applications.preview.yes') : t('applications.preview.no') }}
            </p>
          </div>
          <div class="ns-kv-row">
            <p class="ns-k">{{ t('applications.preview.cl') }}</p>
            <p class="ns-v font-semibold">
              {{ row?.hasCL ? t('applications.preview.yes') : t('applications.preview.no') }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
