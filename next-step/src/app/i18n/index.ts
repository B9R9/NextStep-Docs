import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import fr from './locales/fr.json'
import fi from './locales/fi.json'
import sv from './locales/sv.json'

const VALID_LOCALES = ['en', 'fr', 'fi', 'sv']
const stored = localStorage.getItem('session_locale')
const initialLocale = stored && VALID_LOCALES.includes(stored) ? stored : 'en'

export const SESSION_LOCALE_KEY = 'session_locale'

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    fr,
    fi,
    sv,
  },
})
