<script setup lang="ts">
import type { Company } from '../types'
import { useI18n } from 'vue-i18n'

defineProps<{
  row: Company | null
  sectorColors: Record<string, string>
}>()

const { t } = useI18n()
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3 overflow-y-auto pr-1">
    <!-- LEFT -->
    <div class="space-y-4 lg:col-span-2">
      <!-- Liens -->
      <section class="ns-card-sub">
        <header class="mb-3 flex items-center justify-between">
          <p class="text-sm font-semibold">{{ t('companies.preview.links') }}</p>
        </header>

        <div class="ns-kv">
          <div class="ns-kv-row">
            <p class="ns-k">{{ t('companies.preview.website') }}</p>
            <a
              v-if="row?.website"
              class="ns-v text-primary no-underline hover:opacity-80"
              :href="row.website"
              target="_blank"
              rel="noopener"
            >
              {{ row.website }}
            </a>
            <p v-else class="ns-v text-muted">—</p>
          </div>

          <div class="ns-kv-row">
            <p class="ns-k">{{ t('companies.preview.careerPage') }}</p>
            <a
              v-if="row?.career_page"
              class="ns-v text-primary no-underline hover:opacity-80"
              :href="row.career_page"
              target="_blank"
              rel="noopener"
            >
              {{ row.career_page }}
            </a>
            <p v-else class="ns-v text-muted">—</p>
          </div>

          <div class="ns-kv-row">
            <p class="ns-k">{{ t('companies.preview.social') }}</p>
            <a
              v-if="row?.socialMedia"
              class="ns-v inline-flex items-center gap-2 text-primary no-underline hover:opacity-80"
              :href="row.socialMedia"
              target="_blank"
              rel="noopener"
            >
              <span
                v-if="row.socialMedia.toLowerCase().includes('linkedin.com')"
                class="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-[11px] font-bold"
              >
                in
              </span>
              <span v-else class="material-symbols-rounded text-[18px] leading-none">link</span>
              <span class="truncate max-w-[32ch]">{{ row.socialMedia }}</span>
            </a>
            <p v-else class="ns-v text-muted">—</p>
          </div>
        </div>
      </section>

      <!-- Contact -->
      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('companies.preview.contact') }}</p>
        </header>

        <div class="ns-kv">
          <div class="ns-kv-row">
            <p class="ns-k">{{ t('companies.preview.contactName') }}</p>
            <p class="ns-v font-semibold">{{ row?.contactName || '—' }}</p>
          </div>
          <div class="ns-kv-row">
            <p class="ns-k">{{ t('companies.preview.contactEmail') }}</p>
            <a
              v-if="row?.contactEmail"
              class="ns-v text-primary no-underline hover:opacity-80"
              :href="`mailto:${row.contactEmail}`"
            >
              {{ row.contactEmail }}
            </a>
            <p v-else class="ns-v text-muted">—</p>
          </div>
          <div class="ns-kv-row">
            <p class="ns-k">{{ t('companies.preview.contactPhone') }}</p>
            <a
              v-if="row?.contactPhone"
              class="ns-v text-primary no-underline hover:opacity-80"
              :href="`tel:${row.contactPhone}`"
            >
              {{ row.contactPhone }}
            </a>
            <p v-else class="ns-v text-muted">—</p>
          </div>
        </div>
      </section>

      <!-- Notes -->
      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('companies.preview.notes') }}</p>
        </header>
        <p class="text-sm font-semibold whitespace-pre-wrap">{{ row?.comments || '—' }}</p>
      </section>
    </div>

    <!-- RIGHT -->
    <div class="space-y-4">
      <!-- Meta -->
      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('companies.preview.profile') }}</p>
        </header>

        <div class="ns-kv">
          <div class="ns-kv-row">
            <p class="ns-k">{{ t('companies.preview.industry') }}</p>
            <div class="ns-v inline-flex items-center gap-2 font-semibold">
              <span>{{ row?.industry ? t(`references.industry.${row.industry}`) : '—' }}</span>
            </div>
          </div>

          <div class="ns-kv-row">
            <p class="ns-k">{{ t('companies.preview.size') }}</p>
            <p class="ns-v font-semibold">{{ t('common.employees', { count: row?.size || 0 }) }}</p>
          </div>

          <div class="ns-kv-row">
            <p class="ns-k">{{ t('companies.preview.location') }}</p>
            <p class="ns-v font-semibold">{{ row?.location || '—' }}</p>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="ns-card-sub">
        <header class="mb-3">
          <p class="text-sm font-semibold">{{ t('companies.preview.stats') }}</p>
        </header>

        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <div class="ns-banner">
            <p class="text-xs text-muted">{{ t('companies.preview.availableJobs') }}</p>
            <p class="text-sm font-semibold">{{ row?.available_jobs || '—' }}</p>
          </div>
          <div class="ns-banner">
            <p class="text-xs text-muted">{{ t('companies.preview.totalApplications') }}</p>
            <p class="text-sm font-semibold">{{ row?.total_applications ?? 0 }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
