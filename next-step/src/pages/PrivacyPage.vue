<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const sections = [
  'who',
  'data',
  'use',
  'storage',
  'retention',
  'rights',
  'contact',
] as const
</script>

<template>
  <div class="bg-bg text-text min-h-screen">
    <div class="ns-container max-w-2xl py-12">
      <button
        class="ns-btn ns-btn-ghost mb-6 flex items-center gap-1 text-sm"
        type="button"
        @click="router.back()"
      >
        <span class="material-symbols-rounded text-[16px] leading-none">arrow_back</span>
        {{ t('legal.privacy.back') }}
      </button>

      <h1 class="text-3xl font-semibold tracking-tight">{{ t('legal.privacy.title') }}</h1>
      <p class="mt-1 text-xs text-muted">{{ t('legal.privacy.updated') }}</p>

      <div class="mt-10 space-y-8">
        <section v-for="key in sections" :key="key">
          <h2 class="text-base font-semibold">{{ t(`legal.privacy.sections.${key}.title`) }}</h2>
          <p class="mt-2 text-sm leading-relaxed text-muted">
            {{ t(`legal.privacy.sections.${key}.body`) }}
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
