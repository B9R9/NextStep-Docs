<script setup lang="ts">
import { useRouter } from 'vue-router'
import LanguageSelector from '@/shared/components/LanguageSelector.vue'

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-bg text-text">
    <div class="ns-container max-w-none px-2 sm:px-4 pt-6">
      <div class="flex items-center justify-end gap-3">
        <button class="ns-btn ns-btn-ghost" @click="goToLogin">
          {{ $t('auth.login.submit') }}
        </button>
        <LanguageSelector />
      </div>
    </div>
    <section class="ns-container max-w-none px-2 sm:px-4 py-10 sm:py-14">
      <div class="grid gap-10 lg:grid-cols-[minmax(0,620px)]">
        <div class="space-y-6">
          <div class="inline-flex items-center gap-2 text-xs font-semibold text-muted">
            <span class="ns-badge ns-badge-primary">{{ $t('home.badges.new') }}</span>
            <span class="ns-badge">{{ $t('home.badges.brand') }}</span>
          </div>
          <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight">
            {{ $t('home.heroTitle') }}
          </h1>
          <p class="text-base text-muted max-w-xl">
            {{ $t('home.heroSubtitle') }}
          </p>
          <div class="flex flex-wrap gap-3">
            <button class="ns-btn ns-btn-primary" @click="goToLogin">{{ $t('home.ctaPrimary') }}</button>
            <button class="ns-btn ns-btn-ghost">{{ $t('home.ctaSecondary') }}</button>
          </div>
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="ns-banner">
              <p class="text-xs text-muted">{{ $t('home.cards.applications.title') }}</p>
              <p class="text-sm font-semibold">{{ $t('home.cards.applications.body') }}</p>
            </div>
            <div class="ns-banner">
              <p class="text-xs text-muted">{{ $t('home.cards.jobs.title') }}</p>
              <p class="text-sm font-semibold">{{ $t('home.cards.jobs.body') }}</p>
            </div>
            <div class="ns-banner">
              <p class="text-xs text-muted">{{ $t('home.cards.calendar.title') }}</p>
              <p class="text-sm font-semibold">{{ $t('home.cards.calendar.body') }}</p>
            </div>
            <div id="test" class="ns-banner" @click="goToLogin">
              <p class="text-xs text-muted">Test</p>
              <p class="text-sm font-semibold">Test 2</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
