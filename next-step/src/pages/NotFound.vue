<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center px-6">
      <h1 class="text-7xl font-bold text-gray-900">404</h1>
      <p class="mt-4 text-xl text-gray-600">Page introuvable</p>
      <p class="mt-2 text-gray-500">
        La page que tu cherches n’existe pas ou a été déplacée.
      </p>

      <button
        @click="goHome"
        class="mt-6 inline-flex items-center rounded-lg bg-black px-5 py-2.5 text-white font-medium hover:bg-gray-800 transition"
      >
        Retour à l’accueil
      </button>
    </div>
  </div>
</template>
