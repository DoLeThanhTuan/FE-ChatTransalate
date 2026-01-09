import { createI18n } from 'vue-i18n'
import VI from '../locales/vi.json'
import EN from '../locales/en.json'
import JP from '../locales/jp.json'
import localStorageUtils from '@/utils/localStorageUtils'

const i18n = createI18n({
  legacy: false,
  locale: localStorageUtils.get('language') || 'VI',
  fallbackLocale: 'EN',
  warnHtmlInMessage: 'off',
  messages: {
    VI,
    EN,
    JP,
  },
})

export default i18n
