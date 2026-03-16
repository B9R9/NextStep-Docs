<script setup lang="ts">
import Navbar from '../shared/components/NavBar.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />

    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>