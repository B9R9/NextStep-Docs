<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Navbar from '../shared/components/NavBar.vue'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />

    <main class="flex-1 ns-fade-in">
      <RouterView v-slot="{ Component }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </Transition>
      </RouterView>
    </main>

    <footer class="border-t border-border py-4 text-center text-xs text-muted">
      <RouterLink to="/privacy" class="hover:text-text transition-colors">
        {{ t('legal.footer.privacy') }}
      </RouterLink>
    </footer>
  </div>
</template>