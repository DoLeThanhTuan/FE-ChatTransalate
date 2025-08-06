<template>
  <div class="channel-header">
    <div class="header-left">
      <div class="channel-menu-container" ref="menuContainer">
        <button @click="toggleDropdown" class="channel-name-button">
          <span class="channel-name" :title="channelStore.channelCurrent?.name || 'Loading...'">{{ channelStore.channelCurrent?.name || 'Loading...' }}</span>
          <font-awesome-icon v-if="channelStore.channelCurrent?.name" :icon="['fas', 'chevron-down']" class="dropdown-icon" />
        </button>
        <div v-if="isDropdownOpen" class="channel-dropdown">
          <button class="dropdown-item">
            <font-awesome-icon :icon="['fas', 'info-circle']" />
            <span>Channel Details</span>
          </button>
          <button @click="handleLeaveChannel()" class="dropdown-item dropdown-item-danger">
            <font-awesome-icon :icon="['fas', 'right-from-bracket']" />
            <span>Leave Channel</span>
          </button>
        </div>
      </div>
      <span class="tag">
        <font-awesome-icon :icon="['fas', 'user-tie']" />
        {{ channelStore.channelCurrent?.members?.length }}
      </span>
      <span class="location">Huntsville</span>
    </div>
    <div class="header-right">
      <ThemeStatus />
      <ThemeToggle />
      <span class="member-count">{{ authStore.userInfo.name }}</span>
      <img class="avatar" :src="getURLAvatar(authStore.userInfo.avatar)" alt="avatar" />
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { getURLAvatar } from '@/utils/image';
import { ref, onMounted, onUnmounted } from 'vue';
import { useChannelStore } from '@/stores/channelStore';
import { useRouter } from 'vue-router';
import ThemeToggle from './ThemeToggle.vue';
import ThemeStatus from './ThemeStatus.vue';

const authStore = useAuthStore();
const router = useRouter();
const channelStore = useChannelStore();
const isDropdownOpen = ref(false);
const menuContainer = ref(null);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const handleClickOutside = (event) => {
  if (menuContainer.value && !menuContainer.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

const handleLeaveChannel = async () => {
  try {
    const res = await channelStore.leaveChannel();
    router.push(`/chat-view/${res}`);
  } catch (e) {
    console.error(e);
  } finally {
    isDropdownOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--border-primary);
  padding: 0.5rem 1rem;
  min-height: 64px;
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--border-primary);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  flex: 1;
  min-width: 0;
}

.channel-menu-container {
  position: relative;
}

.channel-name-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.channel-name-button:hover {
  background-color: var(--hover-bg);
}

.dropdown-icon {
  font-size: 0.8rem;
  color: var(--text-primary, #23272f);
  transition: transform 0.2s ease;
}

.channel-name-button[aria-expanded="true"] .dropdown-icon {
  transform: rotate(180deg);
}

.channel-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: var(--bg-primary, #f4f4f4);;
  border: 2px solid var(--border-primary, #e4e4e4);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow);
  z-index: 100;
  width: 240px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  background: none;
  border: none;
  text-align: left;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: var(--hover-bg);
}

.dropdown-item-danger {
  color: #ef4444;
}

.channel-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-primary, #23272f);
  transition: color 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
  display: inline-block;
}

.tag {
  background: #1ed760;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 5px;
  padding: 0.2rem 0.7rem;
}

.location {
  background: var(--bg-primary, #f4f4f4);
  color: var(--text-primary, #23272f);
  font-size: 0.95rem;
  border-radius: 5px;
  padding: 0.2rem 0.7rem;
  transition: all 0.3s ease;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.member-count {
  font-size: 1rem;
  color: var(--text-primary, #23272f);
  font-weight: 500;
  transition: color 0.3s ease;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-primary, #e0e0e0);
  transition: border-color 0.3s ease;
}

@media (max-width: 640px) {
  .location,
  .tag,
  .member-count {
    display: none;
  }

  .header-left {
    gap: 0.5rem;
  }
}

/* Dark mode styles */
:global(.dark) .channel-header {
  --bg-primary: #1a1a1a;
  --border-primary: #333;
  --text-primary: #e5e7eb;
  --bg-tertiary: #333;
}

:global(.dark) .channel-name {
  color: #e5e7eb;
}

:global(.dark) .member-count {
  color: #e5e7eb;
}

:global(.dark) .avatar {
  border-color: #333;
}
</style> 