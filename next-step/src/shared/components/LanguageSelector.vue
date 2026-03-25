<template>
  <div
    class="relative hidden sm:block"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <div
      class="inline-flex h-8 items-center gap-1 overflow-hidden rounded-full border border-border bg-surface p-1 text-[11px] font-semibold tracking-[0.2em] text-text shadow-paper transition-[width,box-shadow] duration-200"
      :class="isExpanded ? 'w-[12rem]' : 'w-[3.5rem]'"
      :aria-label="t('languageSelector.aria')"
    >
      <div v-if="!isExpanded" class="flex h-6 w-full items-center justify-center leading-none">
        {{ currentLabel }}
      </div>
      <template v-if="isExpanded">
        <button
          v-for="option in localeOptions"
          :key="option"
          type="button"
          class="flex h-6 items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase leading-none tracking-[0.2em] transition text-muted hover:bg-surface-2 hover:text-text"
          :class="[
            locale === option ? 'underline underline-offset-4 text-text' : '',
            isExpanded || option === locale ? 'opacity-100' : 'opacity-0 pointer-events-none',
          ]"
          @click="setLocale(option)"
        >
          {{ labels[option] }}
        </button>
      </template>
    </div>
  </div>

  <div class="relative sm:hidden">
    <button
      type="button"
      class="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-surface px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-text shadow-paper"
      :aria-label="t('languageSelector.aria')"
      @click="isMobileOpen = !isMobileOpen"
    >
      {{ currentLabel }}
      <span class="text-[10px] text-muted">▾</span>
    </button>
    <div
      v-if="isMobileOpen"
      class="absolute right-0 mt-2 w-28 rounded-xl border border-border bg-surface p-1 shadow-paper"
    >
      <button
        v-for="option in localeOptions"
        :key="option"
        type="button"
        class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted hover:bg-surface-2 hover:text-text"
        :class="locale === option ? 'bg-surface-2 text-text' : ''"
        @click="setLocale(option)"
      >
        <span>{{ labels[option] }}</span>
        <span v-if="locale === option" class="text-[10px]">✓</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SESSION_LOCALE_KEY } from '@/app/i18n'

const { locale, t } = useI18n()

const localeOptions = ['fr', 'en', 'fi', 'sv'] as const
const labels: Record<(typeof localeOptions)[number], string> = {
  fr: 'FR',
  en: 'EN',
  fi: 'FI',
  sv: 'SV',
}

const isExpanded = ref(false)
const isMobileOpen = ref(false)

const currentLabel = computed(() => labels[locale.value as (typeof localeOptions)[number]])

const setLocale = (value: (typeof localeOptions)[number]) => {
  locale.value = value
  localStorage.setItem(SESSION_LOCALE_KEY, value)
  isExpanded.value = false
  isMobileOpen.value = false
}
</script>
