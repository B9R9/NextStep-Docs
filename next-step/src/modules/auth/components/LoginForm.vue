<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { login } from '../services/auth.service'
import { useAuthStore } from '../store/useAuthStore'
import { checkAdminAccess } from '@/modules/admin/services/admin.service'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const emit = defineEmits<{
  (e: 'create'): void
  (e: 'forgot'): void
}>()

const handleLogin = async () => {
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    const { user, accessToken } = await login({ email: email.value, password: password.value })
    authStore.setSession(accessToken, user)
    try { await checkAdminAccess(); authStore.setAdmin(true) } catch { authStore.setAdmin(false) }
    router.push('/applications')
  } catch {
    errorMessage.value = 'Invalid credentials'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="w-full max-w-sm space-y-6" @submit.prevent="handleLogin">
    <div class="space-y-2">
      <p class="text-2xl font-semibold">{{ t('auth.login.title') }}</p>
      <p class="text-sm text-muted">{{ t('auth.login.subtitle') }}</p>
    </div>

    <div class="space-y-4">
      <label class="block text-xs font-semibold text-muted">
        {{ t('auth.fields.email') }}
        <input v-model="email" name="email" class="ns-input mt-2 w-full" type="email" autocomplete="email" />
      </label>
      <label class="block text-xs font-semibold text-muted">
        {{ t('auth.fields.password') }}
        <div class="relative mt-2">
          <input
            v-model="password"
            name="password"
            class="ns-input w-full pr-11"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:text-primary-hover"
            :aria-label="
              showPassword
                ? t('auth.passwordVisibility.hide')
                : t('auth.passwordVisibility.show')
            "
            @click="showPassword = !showPassword"
          >
            <span class="material-symbols-rounded text-[18px] leading-none">
              {{ showPassword ? 'visibility_off' : 'visibility' }}
            </span>
          </button>
        </div>
      </label>
      <p v-if="errorMessage" class="text-xs text-danger">{{ errorMessage }}</p>
    </div>

    <button class="ns-btn ns-btn-primary w-full" type="submit" :disabled="isSubmitting">
      {{ t('auth.login.submit') }}
    </button>

    <div class="flex items-center justify-between text-xs text-muted">
      <button class="text-primary hover:text-primary-hover" type="button" @click="emit('forgot')">
        {{ t('auth.login.forgot') }}
      </button>
      <button class="text-primary hover:text-primary-hover" type="button" @click="emit('create')">
        {{ t('auth.login.create') }}
      </button>
    </div>
  </form>
</template>
