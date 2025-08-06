<template>
  <div class="chat-layout">
    <div class="sidebar-overlay" 
         :class="{ visible: isSidebarVisible }"
         @click="toggleSidebar"
         v-if="isMobile"></div>
    <Sidebar :class="{ visible: isSidebarVisible }" />
    <div class="chat-view">
      <div class="mobile-header" v-if="isMobile">
        <button class="menu-btn" @click="toggleSidebar">
          <span class="menu-icon">☰</span>
        </button>
        <ChannelHeader/>
      </div>
      <ChannelHeader v-if="!isMobile" />
      <MessageList />
      <MessageInput />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import ChannelHeader from '../components/ChannelHeader.vue'
import MessageList from '../components/MessageList.vue'
import MessageInput from '../components/MessageInput.vue'
import { useChannelStore } from '@/stores/channelStore'

const route = useRoute()
const isSidebarVisible = ref(false)
const isMobile = ref(false)
const channelStore = useChannelStore()

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value
}

const fetchChannel = async () => {
  try {
    const response = await channelStore.fetchChannelById(route.params.chatId);
  } catch (e) {
    console.error('Error fetching channel:', e);
  }
}

watch(
  () => route.params.chatId,
  (newChatId) => {
    fetchChannel();
  },
  { immediate: true }
)

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: 100dvh;
  height: -webkit-fill-available;
  background: var(--bg-tertiary);
  position: relative;
  overflow: hidden;
  transition: background-color 0.3s ease;
}

.chat-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  height: -webkit-fill-available;
  background: var(--bg-secondary);
  position: relative;
  transition: background-color 0.3s ease;
}

.mobile-header {
  display: flex;
  align-items: center;
  padding: 0.3rem;
  background: var(--border-primary);
  border-bottom: 1px solid var(--border-primary);
  position: sticky;
  top: 0;
  z-index: 10;
  transition: all 0.3s ease;
}

.mobile-header .channel-header {
  flex-grow: 1;
}

.menu-btn {
  background: none;
  border: none;
  padding: 0.3rem;
  margin-right: 0.3rem;
  cursor: pointer;
  font-size: 1.3rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  touch-action: manipulation;
  transition: color 0.3s ease;
}

.menu-icon {
  display: block;
  line-height: 1;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar-overlay.visible {
  display: block;
  opacity: 1;
}

@media (max-width: 768px) {
  .chat-layout {
    position: relative;
    display: block;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1000;
    width: 85%;
    max-width: 300px;
  }

  .sidebar.visible {
    transform: translateX(0);
  }
}

@media (max-width: 400px) {
  .mobile-header {
    padding: 0.2rem;
  }

  .menu-btn {
    min-width: 28px;
    height: 28px;
    font-size: 1.2rem;
    padding: 0.2rem;
    margin-right: 0.2rem;
  }

  .sidebar {
    width: 90%;
    max-width: 280px;
  }
}
</style> 