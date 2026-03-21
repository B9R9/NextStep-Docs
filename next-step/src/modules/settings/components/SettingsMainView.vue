<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { me, updateMe, updatePassword, deleteMe } from '@/modules/auth/services/auth.service'
import SharedModal from '@/shared/components/SharedModal.vue'
import SettingsRemindersSection from '@/modules/reminders/components/SettingsRemindersSection.vue'

const { t } = useI18n()
const router = useRouter()

const openAccountSection = ref<'profile' | 'password' | null>('profile')

const toggleAccountSection = (section: 'profile' | 'password') => {
  openAccountSection.value = openAccountSection.value === section ? null : section
}

const profile = ref({
  name: '',
  email: '',
})

const isSavingProfile = ref(false)
const saveMessage = ref('')
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isSavingPassword = ref(false)
const passwordMessage = ref('')
const isDeletingAccount = ref(false)
const isDeleteDialogOpen = ref(false)
const deletePassword = ref('')
const deleteError = ref('')

const loadProfile = async () => {
  saveMessage.value = ''
  try {
    const user = await me()
    profile.value.name = user.name
    profile.value.email = user.email
  } catch {
    saveMessage.value = 'Unable to load profile'
  }
}

const saveProfile = async () => {
  saveMessage.value = ''
  isSavingProfile.value = true
  try {
    const updated = await updateMe({
      name: profile.value.name,
      email: profile.value.email,
    })
    profile.value.name = updated.name
    profile.value.email = updated.email
saveMessage.value = 'Profile saved'
  } catch {
    saveMessage.value = 'Failed to save profile'
  } finally {
    isSavingProfile.value = false
  }
}

onMounted(() => {
  loadProfile()
})

const savePassword = async () => {
  passwordMessage.value = ''
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    passwordMessage.value = 'Please fill all password fields'
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordMessage.value = 'Passwords do not match'
    return
  }

  isSavingPassword.value = true
  try {
    await updatePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })
    passwordForm.value.currentPassword = ''
    passwordForm.value.newPassword = ''
    passwordForm.value.confirmPassword = ''
    passwordMessage.value = 'Password updated'
  } catch {
    passwordMessage.value = 'Failed to update password'
  } finally {
    isSavingPassword.value = false
  }
}

const openDeleteDialog = () => {
  deletePassword.value = ''
  deleteError.value = ''
  isDeleteDialogOpen.value = true
}

const closeDeleteDialog = () => {
  isDeleteDialogOpen.value = false
  deletePassword.value = ''
  deleteError.value = ''
}

const handleDeleteAccount = async () => {
  deleteError.value = ''
  isDeletingAccount.value = true
  try {
    await deleteMe(deletePassword.value)
    router.push('/login')
  } catch (err: any) {
    const status = err?.response?.status
    deleteError.value = status === 401
      ? t('settings.account.deleteDialog.wrongPassword')
      : t('settings.account.deleteDialog.error')
  } finally {
    isDeletingAccount.value = false
  }
}

</script>

<template>
  <div class="min-h-screen bg-bg text-text">
    <section class="ns-container max-w-none px-2 sm:px-4 py-8 sm:py-12">
      <header class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight">
          {{ t('settings.title') }}
        </h1>
        <p class="ns-card-subtitle">{{ t('settings.subtitle') }}</p>
      </header>

      <div class="grid gap-6 lg:grid-cols-1">
        <section class="ns-card">
          <div class="ns-card-body space-y-4">
            <div>
              <p class="text-sm font-semibold">{{ t('settings.account.title') }}</p>
              <p class="text-xs text-muted">{{ t('settings.account.subtitle') }}</p>
            </div>
            <div class="space-y-3">
              <div class="rounded-xl border border-border bg-surface-2 px-4 py-3">
                <button
                  class="flex w-full items-center justify-between text-sm font-semibold"
                  type="button"
                  @click="toggleAccountSection('profile')"
                >
                  {{ t('settings.account.editProfile') }}
                  <span class="material-symbols-rounded text-[18px] leading-none">
                    {{ openAccountSection === 'profile' ? 'expand_less' : 'expand_more' }}
                  </span>
                </button>
                <div v-if="openAccountSection === 'profile'" class="mt-3 space-y-3">
                  <label class="block text-xs font-semibold text-muted">
                    {{ t('settings.account.name') }}
                    <input v-model="profile.name" class="ns-input mt-1 w-full" />
                  </label>
                  <label class="block text-xs font-semibold text-muted">
                    {{ t('settings.account.email') }}
                    <input v-model="profile.email" class="ns-input mt-1 w-full" type="email" />
                  </label>
<button
                    class="ns-btn ns-btn-primary"
                    type="button"
                    :disabled="isSavingProfile"
                    @click="saveProfile"
                  >
                    {{ t('settings.save') }}
                  </button>
                  <p v-if="saveMessage" class="text-xs text-muted">{{ saveMessage }}</p>
                </div>
              </div>

              <div class="rounded-xl border border-border bg-surface-2 px-4 py-3">
                <button
                  class="flex w-full items-center justify-between text-sm font-semibold"
                  type="button"
                  @click="toggleAccountSection('password')"
                >
                  {{ t('settings.account.changePassword') }}
                  <span class="material-symbols-rounded text-[18px] leading-none">
                    {{ openAccountSection === 'password' ? 'expand_less' : 'expand_more' }}
                  </span>
                </button>
                <div v-if="openAccountSection === 'password'" class="mt-3 space-y-3">
                  <label class="block text-xs font-semibold text-muted">
                    {{ t('settings.account.currentPassword') }}
                    <div class="relative mt-1">
                      <input
                        v-model="passwordForm.currentPassword"
                        class="ns-input w-full pr-11"
                        :type="showCurrentPassword ? 'text' : 'password'"
                      />
                      <button
                        type="button"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:text-primary-hover"
                        :aria-label="
                          showCurrentPassword
                            ? t('auth.passwordVisibility.hide')
                            : t('auth.passwordVisibility.show')
                        "
                        @click="showCurrentPassword = !showCurrentPassword"
                      >
                        <span class="material-symbols-rounded text-[18px] leading-none">
                          {{ showCurrentPassword ? 'visibility_off' : 'visibility' }}
                        </span>
                      </button>
                    </div>
                  </label>
                  <label class="block text-xs font-semibold text-muted">
                    {{ t('settings.account.newPassword') }}
                    <div class="relative mt-1">
                      <input
                        v-model="passwordForm.newPassword"
                        class="ns-input w-full pr-11"
                        :type="showNewPassword ? 'text' : 'password'"
                      />
                      <button
                        type="button"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:text-primary-hover"
                        :aria-label="
                          showNewPassword
                            ? t('auth.passwordVisibility.hide')
                            : t('auth.passwordVisibility.show')
                        "
                        @click="showNewPassword = !showNewPassword"
                      >
                        <span class="material-symbols-rounded text-[18px] leading-none">
                          {{ showNewPassword ? 'visibility_off' : 'visibility' }}
                        </span>
                      </button>
                    </div>
                  </label>
                  <label class="block text-xs font-semibold text-muted">
                    {{ t('settings.account.confirmPassword') }}
                    <div class="relative mt-1">
                      <input
                        v-model="passwordForm.confirmPassword"
                        class="ns-input w-full pr-11"
                        :type="showConfirmPassword ? 'text' : 'password'"
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
                  <button
                    class="ns-btn ns-btn-primary"
                    type="button"
                    :disabled="isSavingPassword"
                    @click="savePassword"
                  >
                    {{ t('settings.account.updatePassword') }}
                  </button>
                  <p v-if="passwordMessage" class="text-xs text-muted">{{ passwordMessage }}</p>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button
                class="ns-btn ns-btn-ghost text-danger"
                type="button"
                @click="openDeleteDialog"
              >
                {{ t('settings.account.deleteAccount') }}
              </button>
            </div>
          </div>
        </section>

        <!-- Reminders -->
        <section class="ns-card">
          <div class="ns-card-body space-y-4">
            <div>
              <p class="text-sm font-semibold">{{ t('settings.reminders.cardTitle') }}</p>
              <p class="text-xs text-muted">{{ t('settings.reminders.cardSubtitle') }}</p>
            </div>
            <div class="space-y-3">
              <SettingsRemindersSection />
            </div>
          </div>
        </section>

      </div>
    </section>

    <SharedModal :open="isDeleteDialogOpen" :title="t('settings.account.deleteDialog.title')" @close="closeDeleteDialog">
      <div class="space-y-4 text-sm">
        <p class="text-danger font-medium">{{ t('settings.account.deleteDialog.warning') }}</p>
        <label class="block text-xs font-semibold text-muted">
          {{ t('settings.account.deleteDialog.passwordLabel') }}
          <input
            v-model="deletePassword"
            type="password"
            class="ns-input mt-1 w-full"
            autocomplete="current-password"
            @keydown.enter="handleDeleteAccount"
          />
        </label>
        <p v-if="deleteError" class="text-xs text-danger">{{ deleteError }}</p>
        <div class="flex justify-end gap-2 pt-1">
          <button class="ns-btn ns-btn-ghost" type="button" @click="closeDeleteDialog">
            {{ t('common.cancel') }}
          </button>
          <button
            class="ns-btn ns-btn-primary bg-danger border-danger hover:bg-danger/90"
            type="button"
            :disabled="isDeletingAccount || !deletePassword"
            @click="handleDeleteAccount"
          >
            {{ t('settings.account.deleteDialog.confirm') }}
          </button>
        </div>
      </div>
    </SharedModal>
  </div>
</template>
