<script setup lang="ts">
import ReminderPopup from '@/modules/reminders/components/ReminderPopup.vue'
</script>

<template>
  <main class="min-h-screen bg-bg text-text">
    <RouterView />
    <ReminderPopup />
  </main>
</template>
