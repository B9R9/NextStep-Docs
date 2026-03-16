<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'create'): void
}>()
</script>

<template>
  <div class="ns-card">
    <div class="ns-card-body flex flex-col items-center gap-4 text-center">
      <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <span class="material-symbols-rounded text-[24px] leading-none">assignment</span>
      </div>
      <div class="space-y-2">
        <h2 class="text-lg font-semibold">{{ t('applications.emptyState.title') }}</h2>
        <p class="text-sm text-muted">{{ t('applications.emptyState.subtitle') }}</p>
      </div>
      <button class="ns-btn ns-btn-primary" @click="emit('create')">
        {{ t('applications.emptyState.button') }}
      </button>
    </div>
  </div>
</template>
