<template>
  <div class="language-selector">
    <button 
      @click="toggleDropdown" 
      class="language-btn"
      :title="$t('language.selectLanguage')"
    >
      <svg 
        class="language-icon" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <span class="current-lang">{{ getCurrentLanguageName() }}</span>
      <svg 
        class="dropdown-icon" 
        :class="{ 'rotated': isDropdownOpen }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
    
    <div 
      v-if="isDropdownOpen" 
      class="language-dropdown"
      @click.stop
    >
      <div 
        v-for="lang in languages" 
        :key="lang.code"
        @click="changeLanguage(lang.code)"
        class="language-option"
        :class="{ 'active': lang.code === currentLocale }"
      >
        <span class="flag">{{ lang.flag }}</span>
        <span class="name">{{ lang.name }}</span>
        <span class="native-name">{{ lang.nativeName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const isDropdownOpen = ref(false)
const currentLocale = computed(() => locale.value)

const languages = [
  {
    code: 'vi',
    name: 'Tiếng Việt',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  }
]

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const changeLanguage = (langCode) => {
  locale.value = langCode
  localStorage.setItem('language', langCode)
  isDropdownOpen.value = false
}

const getCurrentLanguageName = () => {
  const currentLang = languages.find(lang => lang.code === currentLocale.value)
  return currentLang ? currentLang.nativeName : 'VI'
}

const closeDropdown = (event) => {
  if (!event.target.closest('.language-selector')) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.language-selector {
  position: relative;
}

.language-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-primary);
  font-size: 0.9rem;
  gap: 0.5rem;
}

.language-btn:hover {
  background: var(--hover-bg);
  border-color: var(--special-text-color);
}

.language-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--special-text-color);
}

.current-lang {
  flex: 1;
  text-align: left;
  font-weight: 500;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow);
  z-index: 1000;
  margin-top: 0.25rem;
  overflow: hidden;
}

.language-option {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  cursor: pointer;
  transition: background 0.2s ease;
  gap: 0.75rem;
}

.language-option:hover {
  background: var(--hover-bg);
}

.language-option.active {
  background: var(--bg-active);
  color: var(--special-text-color);
}

.flag {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.name {
  font-weight: 500;
  flex: 1;
}

.native-name {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-style: italic;
}

.language-option.active .native-name {
  color: var(--special-text-color);
  opacity: 0.8;
}

/* Dark mode adjustments */
:global(.dark) .language-dropdown {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>

