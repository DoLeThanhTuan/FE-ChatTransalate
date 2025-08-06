<template>
  <button 
    @click="themeStore.toggleTheme()" 
    class="theme-toggle"
    :title="themeStore.isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'"
  >
    <!-- Sun icon for dark mode -->
    <svg 
      v-if="themeStore.isDark" 
      class="theme-icon sun-icon" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
    
    <!-- Moon icon for light mode -->
    <svg 
      v-else 
      class="theme-icon moon-icon" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  </button>
</template>

<script setup>
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-primary, #36cd68);
}

.theme-toggle:hover {
  background: var(--hover-bg, rgb(241, 241, 242));
  transform: scale(1.05);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.theme-icon {
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
}

.sun-icon {
  color: #fbbf24;
}

.moon-icon {
  color: #6366f1;
}

/* Dark mode styles */
:global(.dark) .theme-toggle {
  color: var(--text-primary, #e5e7eb);
}

:global(.dark) .theme-toggle:hover {
  background: var(--hover-bg, rgba(206, 50, 50, 0.1));
}
</style> 