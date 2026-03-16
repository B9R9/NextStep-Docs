<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="ns-card">
    <div class="ns-card-body text-center">
      <p class="text-sm text-muted">{{ t('jobs.searchEmpty.title') }}</p>
      <p class="text-xs text-muted mt-2">{{ t('jobs.searchEmpty.subtitle') }}</p>
    </div>
  </div>
</template>
