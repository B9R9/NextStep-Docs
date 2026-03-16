import { createApp } from 'vue'
import App from './App.vue'
import { pinia } from './store'
import { router } from './router'
import { startMSW } from './msw/start'
import { i18n } from './i18n'

import './styles/style.css'

await startMSW()

createApp(App)
  .use(pinia)
  .use(router)
  .use(i18n)
  .mount('#app')
