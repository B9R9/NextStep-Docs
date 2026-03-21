<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { register } from '../services/auth.service'
import { useAuthStore } from '../store/useAuthStore'
import { checkAdminAccess } from '@/modules/admin/services/admin.service'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const emit = defineEmits<{
  (e: 'back'): void
}>()

const handleCreateAccount = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    const { user, accessToken } = await register({ name: name.value, email: email.value, password: password.value })
    authStore.setSession(accessToken, user)
    try { await checkAdminAccess(); authStore.setAdmin(true) } catch { authStore.setAdmin(false) }
    router.push('/applications')
  } catch {
    errorMessage.value = 'Failed to create account'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="w-full max-w-sm space-y-6" @submit.prevent="handleCreateAccount">
    <div class="space-y-2">
      <p class="text-2xl font-semibold">{{ t('auth.create.title') }}</p>
      <p class="text-sm text-muted">{{ t('auth.create.subtitle') }}</p>
    </div>

    <div class="space-y-4">
      <label class="block text-xs font-semibold text-muted">
        {{ t('auth.fields.name') }}
        <input v-model="name" name="name" class="ns-input mt-2 w-full" type="text" autocomplete="name" />
      </label>
      <label class="block text-xs font-semibold text-muted">
        {{ t('auth.fields.email') }}
        <input v-model="email" name="email" class="ns-input mt-2 w-full" type="email" autocomplete="username" />
      </label>
      <label class="block text-xs font-semibold text-muted">
        {{ t('auth.fields.password') }}
        <div class="relative mt-2">
          <input
            v-model="password"
            name="password"
            class="ns-input w-full pr-11"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
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
      <label class="block text-xs font-semibold text-muted">
        {{ t('auth.fields.confirmPassword') }}
        <div class="relative mt-2">
          <input
            v-model="confirmPassword"
            name="confirm-password"
            class="ns-input w-full pr-11"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:text-primary-hover"
            :aria-label="
              showConfirmPassword
                ? t('auth.passwordVisibility.hide')
                : t('auth.passwordVisibility.show')
            "
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <span class="material-symbols-rounded text-[18px] leading-none">
              {{ showConfirmPassword ? 'visibility_off' : 'visibility' }}
            </span>
          </button>
        </div>
      </label>
      <p v-if="errorMessage" class="text-xs text-danger">{{ errorMessage }}</p>
    </div>

    <button class="ns-btn ns-btn-primary w-full" type="submit" :disabled="isSubmitting">
      {{ t('auth.create.submit') }}
    </button>

    <div class="text-center text-xs text-muted">
      <button class="text-primary hover:text-primary-hover" type="button" @click="emit('back')">
        {{ t('auth.create.back') }}
      </button>
    </div>
  </form>
</template>
