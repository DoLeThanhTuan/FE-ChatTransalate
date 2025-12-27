<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-left">
        <router-link to="/" class="logo-link">
          <h1 class="logo">Chat App</h1>
        </router-link>
        <nav class="nav-menu">
          <router-link
            to="/user-management"
            class="nav-item"
            :class="{ active: $route.name === 'UserManagement' }"
          >
            <i class="fas fa-users"></i>
            <span>Quản lý người dùng</span>
          </router-link>
          <router-link
            to="/organization-management"
            class="nav-item"
            :class="{ active: $route.name === 'OrganizationManagement' }"
          >
            <i class="fas fa-building"></i>
            <span>Quản lý tổ chức</span>
          </router-link>
          <router-link
            to="/department-management"
            class="nav-item"
            :class="{ active: $route.name === 'DepartmentManagement' }"
          >
            <i class="fas fa-sitemap"></i>
            <span>Quản lý phòng ban</span>
          </router-link>
          <router-link
            to="/profile"
            class="nav-item"
            :class="{ active: $route.name === 'Profile' }"
          >
            <i class="fas fa-user"></i>
            <span>Hồ sơ</span>
          </router-link>
        </nav>
      </div>
      <div class="header-right">
        <ThemeToggle />
        <div class="user-menu" ref="userMenuRef">
          <button @click="toggleUserMenu" class="user-button">
            <img
              :src="getURLAvatar(authStore.userInfo()?.avatar)"
              :alt="authStore.userInfo()?.name"
              class="user-avatar"
            />
            <span class="user-name">{{ authStore.userInfo()?.name }}</span>
            <i
              class="fas fa-chevron-down"
              :class="{ rotated: isUserMenuOpen }"
            ></i>
          </button>
          <div v-if="isUserMenuOpen" class="user-dropdown">
            <router-link
              to="/profile"
              class="dropdown-item"
              @click="closeUserMenu"
            >
              <i class="fas fa-user"></i>
              <span>Hồ sơ</span>
            </router-link>
            <button @click="handleLogout" class="dropdown-item logout-item">
              <i class="fas fa-sign-out-alt"></i>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { getURLAvatar } from '@/utils/image'
import ThemeToggle from '../ThemeToggle.vue'
import { disconnectSocket } from '@/socket/socketService'

const router = useRouter()
const authStore = useAuthStore()
const isUserMenuOpen = ref(false)
const userMenuRef = ref(null)

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    isUserMenuOpen.value = false
  }
}

const handleLogout = async () => {
  disconnectSocket()
  authStore.clearAuth()
  closeUserMenu()
  window.location.replace('/login')
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-header {
  background: var(--bg-bar, #ffffff);
  border-bottom: 1px solid var(--border-primary, #e4e4e4);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo-link {
  text-decoration: none;
  color: inherit;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #891c1c;
  margin: 0;
}

.nav-menu {
  display: flex;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  color: var(--text-primary, #333);
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: var(--bg-active, #f5f5f5);
}

.nav-item.active {
  background-color: #891c1c;
  color: white;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.user-button:hover {
  background-color: var(--bg-active, #f5f5f5);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-primary, #e0e0e0);
}

.user-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary, #333);
}

.user-button i {
  font-size: 0.75rem;
  color: var(--text-secondary, #666);
  transition: transform 0.2s ease;
}

.user-button i.rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-primary, #e4e4e4);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 200px;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  text-align: left;
  color: var(--text-primary, #333);
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s ease;
  text-decoration: none;
}

.dropdown-item:hover {
  background-color: var(--bg-active, #f5f5f5);
}

.logout-item {
  color: #ef4444;
  border-top: 1px solid var(--border-primary, #e4e4e4);
}

.logout-item:hover {
  background-color: #fee2e2;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }

  .nav-menu {
    display: none;
  }

  .user-name {
    display: none;
  }
}

/* Dark mode */
:global(.dark) .app-header {
  --bg-bar: #1a1a1a;
  --border-primary: #333;
  --text-primary: #e5e7eb;
  --text-secondary: #9ca3af;
  --bg-active: #2a2a2a;
  --bg-primary: #1a1a1a;
}

:global(.dark) .nav-item.active {
  background-color: #891c1c;
  color: white;
}

:global(.dark) .user-dropdown {
  background: #1a1a1a;
  border-color: #333;
}

:global(.dark) .dropdown-item {
  color: #e5e7eb;
}

:global(.dark) .logout-item:hover {
  background-color: #4a1a1a;
}
</style>
