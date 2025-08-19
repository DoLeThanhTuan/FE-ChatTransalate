<template>
</template>

<script setup>
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
</script>

<style scoped>
.theme-status {
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: var(--bg-tertiary, #f3f4f8);
  border: 1px solid var(--border-primary, #e0e0e0);
  transition: all 0.3s ease;
}

.theme-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-primary, #23272f);
  transition: color 0.3s ease;
}
</style> 