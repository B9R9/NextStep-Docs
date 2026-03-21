<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminStore } from '../store/useAdminStore'
import AdminKpiCards from '../components/AdminKpiCards.vue'
import AdminFunnelChart from '../components/AdminFunnelChart.vue'
import AdminFeatureAdoption from '../components/AdminFeatureAdoption.vue'
import AdminApiHealth from '../components/AdminApiHealth.vue'
import AdminChurnPanel from '../components/AdminChurnPanel.vue'
import AdminFeedbackPanel from '../components/AdminFeedbackPanel.vue'

const store = useAdminStore()

onMounted(() => store.loadAll())
</script>

<template>
  <div class="min-h-screen bg-bg p-6 text-text">
    <div class="mx-auto max-w-6xl space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold">Admin Dashboard</h1>
          <p class="text-xs text-muted">Internal analytics — restricted access</p>
        </div>
        <button class="ns-btn ns-btn-ghost text-xs" @click="store.loadAll()">
          <span class="material-symbols-rounded text-[16px]">refresh</span>
          Refresh
        </button>
      </div>

      <!-- Loading -->
      <div v-if="store.isLoading" class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div v-for="i in 8" :key="i" class="ns-skeleton h-20 rounded-lg" />
      </div>

      <!-- Error -->
      <div v-else-if="store.error" class="rounded-lg border border-[--color-danger] bg-[--color-danger-soft] p-4 text-sm text-[--color-danger]">
        {{ store.error }}
      </div>

      <template v-else-if="store.overview">
        <!-- KPI cards -->
        <AdminKpiCards :overview="store.overview" />

        <!-- Funnel + Feature adoption -->
        <div class="grid gap-4 lg:grid-cols-2">
          <AdminFunnelChart :overview="store.overview" />
          <AdminFeatureAdoption :overview="store.overview" />
        </div>

        <!-- Top industries -->
        <div class="rounded-lg border border-border bg-surface-2 p-4">
          <p class="mb-3 text-sm font-semibold">Top industries tracked</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="ind in store.overview.companies.topIndustries"
              :key="ind.industry"
              class="rounded-full border border-border px-3 py-1 text-xs"
            >
              {{ ind.industry || 'Unknown' }} · {{ ind.count }}
            </span>
          </div>
        </div>

        <!-- Churn + API health -->
        <div class="grid gap-4 lg:grid-cols-2">
          <AdminChurnPanel v-if="store.churn" :churn="store.churn" />
          <AdminApiHealth v-if="store.apiStats" :stats="store.apiStats" />
        </div>

        <!-- Feedback -->
        <AdminFeedbackPanel v-if="store.feedback" :feedback="store.feedback" />
      </template>

    </div>
  </div>
</template>
