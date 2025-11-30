import { createI18n } from 'vue-i18n'
import vi from '../locales/vi.json'
import en from '../locales/en.json'
import localStorageUtils from '@/utils/localStorageUtils'

const i18n = createI18n({
  legacy: false,
  locale: localStorageUtils.get('language') || 'vi',
  fallbackLocale: 'en',
  warnHtmlInMessage: 'off',
  messages: {
    vi,
    en,
  },
})

export default i18n
