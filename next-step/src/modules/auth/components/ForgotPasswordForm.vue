<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'back'): void
}>()
</script>

<template>
  <div class="w-full max-w-sm space-y-6">
    <div class="space-y-2">
      <p class="text-2xl font-semibold">{{ t('auth.forgot.title') }}</p>
      <p class="text-sm text-muted">{{ t('auth.forgot.subtitle') }}</p>
    </div>

    <label class="block text-xs font-semibold text-muted">
      {{ t('auth.fields.email') }}
      <input class="ns-input mt-2 w-full" type="email" autocomplete="email" />
    </label>

    <button class="ns-btn ns-btn-primary w-full">{{ t('auth.forgot.submit') }}</button>

    <div class="text-center text-xs text-muted">
      <button class="text-primary hover:text-primary-hover" type="button" @click="emit('back')">
        {{ t('auth.forgot.back') }}
      </button>
    </div>
  </div>
</template>
