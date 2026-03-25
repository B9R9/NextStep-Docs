<template>
  <nav class="ns-nav sticky top-0 z-40">
    <div class="ns-container max-w-none flex items-center justify-between py-3">
      <!-- Brand -->
      <div class="flex items-center gap-3">
        <div class="ns-logo">
          NS
        </div>
        <div class="leading-tight">
          <p class="text-sm font-semibold tracking-tight">NextStep</p>
        </div>
      </div>

      <!-- Desktop nav -->
    <div class="hidden items-center gap-6 text-sm font-medium sm:flex">
      <button
        class="ns-nav-link"
        :class="isActive('/applications') ? 'active' : ''"
        type="button"
        @click="goTo('/applications')"
      >Applications</button>
      <button
        class="ns-nav-link"
        :class="isActive('/jobs') ? 'active' : ''"
        type="button"
        @click="goTo('/jobs')"
      >Jobs</button>
      <button
        class="ns-nav-link"
        :class="isActive('/companies') ? 'active' : ''"
        type="button"
        @click="goTo('/companies')"
      >Companies</button>
    </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <LanguageSelector />
        <IconButton v-if="authStore.isAdmin" :label="t('nav.icons.admin')" icon="admin_panel_settings" @click="router.push('/admin')" />
        <IconButton :label="t('nav.icons.feedback')" icon="feedback" @click="isFeedbackOpen = true" />
        <IconButton :label="t('nav.icons.calendar')" icon="calendar_today" @click="toggleCalendar" />
        <div class="relative" data-notifications-trigger>
          <IconButton :label="t('nav.icons.notifications')" icon="notifications" @click.stop="toggleNotifications" />
          <span
            v-if="notificationsStore.unreadCount > 0"
            class="absolute right-1 top-1 h-2.5 w-2.5 rounded-full"
            style="background: var(--color-danger);"
            aria-hidden="true"
          />
          <NotificationsPanel
            v-if="isNotificationsOpen"
            :notifications="notificationsStore.rows"
            :loading="notificationsStore.isLoading"
            @dismiss="dismissNotification"
            @dismiss-all="notificationsStore.dismissAll()"
          />
        </div>
        <IconButton :label="t('nav.icons.settings')" icon="settings" @click="openSettings" />
        <IconButton v-if="isLoggedIn" :label="t('nav.icons.logout')" icon="logout" @click="logout" />
        <IconButton v-else :label="t('nav.icons.login')" icon="login" variant="primary" @click="router.push('/login')" />
      </div>
    </div>
  </nav>

  <CalendarModal
    :open="isCalendarOpen"
    @close="closeCalendar"
    @open-calendar="openCalendarView"
  />
  <FeedbackModal :open="isFeedbackOpen" @close="isFeedbackOpen = false" />
</template>

<script setup lang="ts">
import IconButton from './IconButton.vue'
import LanguageSelector from './LanguageSelector.vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CalendarModal from '@/modules/calendar/components/CalendarModal.vue'
import FeedbackModal from './FeedbackModal.vue'
import NotificationsPanel from '@/modules/notifications/components/NotificationsPanel.vue'
import { logout as authLogout } from '@/modules/auth/services/auth.service'
import { useAuthStore } from '@/modules/auth/store/useAuthStore'
import { useNotificationsStore } from '@/modules/notifications/store/useNotificationsStore'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const isCalendarOpen = ref(false)
const isNotificationsOpen = ref(false)
const isFeedbackOpen = ref(false)
const notificationsStore = useNotificationsStore()

const toggleCalendar = () => {
  isCalendarOpen.value = !isCalendarOpen.value
}

const closeCalendar = () => {
  isCalendarOpen.value = false
}

const toggleNotifications = async () => {
  isNotificationsOpen.value = !isNotificationsOpen.value
  if (isNotificationsOpen.value && !notificationsStore.hasLoaded) {
    await notificationsStore.loadNotifications()
  }
}

const closeNotifications = () => {
  isNotificationsOpen.value = false
}

const dismissNotification = (id: number) => {
  notificationsStore.dismiss(id)
}

const openCalendarView = () => {
  closeCalendar()
  router.push('/calendar')
}

const openSettings = () => {
  router.push('/settings')
}

const goTo = (path: string) => {
  router.push(path)
}

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)

const logout = async () => {
  await authLogout()
  authStore.clearSession()
  router.push('/login')
}

const isActive = (path: string) => route.path === path || route.path.startsWith(`${path}/`)

const handleClickOutside = (event: MouseEvent) => {
  if (!isNotificationsOpen.value) return
  const target = event.target as HTMLElement | null
  if (!target) return
  if (target.closest('[data-notifications-panel]')) return
  if (target.closest('[data-notifications-trigger]')) return
  closeNotifications()
}

onMounted(() => {
  notificationsStore.loadNotifications()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

</script>
