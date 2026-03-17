<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LanguageSelector from '@/shared/components/LanguageSelector.vue'
import CreateAccountForm from '../components/CreateAccountForm.vue'
import ForgotPasswordForm from '../components/ForgotPasswordForm.vue'
import LoginForm from '../components/LoginForm.vue'

useI18n()
const panel = ref<'create' | 'login' | 'forgot'>('login')

const transformValue = computed(() => {
  if (panel.value === 'create') return 'translateX(0%)'
  if (panel.value === 'forgot') return 'translateX(-66.666%)'
  return 'translateX(-33.333%)'
})
</script>

<template>
  <div class="min-h-screen bg-bg text-text">
    <div class="grid min-h-screen lg:grid-cols-[minmax(0,520px),1fr]">
      <div class="relative overflow-hidden bg-surface-2">
        <div class="absolute left-6 top-6">
          <div class="flex items-center gap-2">
            <div class="ns-logo">NS</div>
            <div>
              <p class="text-sm font-semibold tracking-tight">NextStep</p>
            </div>
          </div>
        </div>

        <div class="absolute right-6 top-6">
          <LanguageSelector />
        </div>

        <div class="flex h-full items-center">
          <div class="w-full">
            <div class="forms-slider" :style="{ transform: transformValue }">
              <div class="form-panel">
                <CreateAccountForm @back="panel = 'login'" />
              </div>
              <div class="form-panel">
                <LoginForm @create="panel = 'create'" @forgot="panel = 'forgot'" />
              </div>
              <div class="form-panel">
                <ForgotPasswordForm @back="panel = 'login'" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forms-slider {
  display: flex;
  width: 300%;
  height: 100%;
  transition: transform 0.35s var(--ease-organic);
  transform: translateX(-33.333%);
}

.form-panel {
  width: 33.333%;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 120px 32px 48px;
}
</style>
