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
        <IconButton label="Agenda" icon="calendar_today" @click="toggleCalendar" />
        <div class="relative" data-notifications-trigger>
          <IconButton label="Notifications" icon="notifications" @click.stop="toggleNotifications" />
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
          />
        </div>
        <IconButton label="Paramètres" icon="settings" @click="openSettings" />
        <IconButton v-if="isLoggedIn" label="Se déconnecter" icon="logout" @click="logout" />
        <IconButton v-else label="Se connecter" icon="login" variant="primary" @click="router.push('/login')" />
      </div>
    </div>
  </nav>

  <CalendarModal
    :open="isCalendarOpen"
    @close="closeCalendar"
    @open-calendar="openCalendarView"
  />
</template>

<script setup lang="ts">
import IconButton from './IconButton.vue'
import LanguageSelector from './LanguageSelector.vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CalendarModal from '@/modules/calendar/components/CalendarModal.vue'
import NotificationsPanel from '@/modules/notifications/components/NotificationsPanel.vue'
import { clearAuthToken } from '@/modules/auth/services/auth.service'
import { useNotificationsStore } from '@/modules/notifications/store/useNotificationsStore'

const router = useRouter()
const route = useRoute()
const isCalendarOpen = ref(false)
const isNotificationsOpen = ref(false)
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

const isLoggedIn = computed(() => !!localStorage.getItem('auth_token'))

const logout = () => {
  clearAuthToken()
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
