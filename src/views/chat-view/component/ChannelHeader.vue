<template>
  <div class="channel-header">
    <div v-if="isChannelChat" class="header-left">
      <div class="channel-menu-container" ref="menuContainer">
        <button @click="toggleDropdown" class="channel-name-button">
          <span
            class="channel-name"
            :title="
              channelStore.channelCurrent?.name ||
              $t('COMPONENT.COMMON.MODAL_CONFIRM_DELETE.LABEL.MESSAGE')
            "
            >{{ channelStore.channelCurrent?.name || 'Loading...' }}</span
          >
          <font-awesome-icon
            v-if="channelStore.channelCurrent?.name"
            :icon="['fas', 'chevron-down']"
            class="dropdown-icon"
          />
        </button>
        <div v-if="isDropdownOpen" class="channel-dropdown">
          <button class="dropdown-item">
            <font-awesome-icon :icon="['fas', 'info-circle']" />
            <span>Channel Details</span>
          </button>
          <button
            v-if="!channelStore.channelCurrent?.isDefault"
            @click="handleLeaveChannel()"
            class="dropdown-item dropdown-item-danger"
          >
            <font-awesome-icon :icon="['fas', 'right-from-bracket']" />
            <span>Leave Channel</span>
          </button>
        </div>
      </div>
      <span @click="showMembers = true" class="tag">
        <font-awesome-icon :icon="['fas', 'user-tie']" />
        {{ channelStore.channelCurrent?.members?.length }}
      </span>
      <UsersChannelModal
        :visible="showMembers"
        :channel-id="channelStore.channelCurrent.id"
        :members="
          userStore.getUsersByIds(channelStore.channelCurrent?.members || [])
        "
        @close="showMembers = false"
      />
      <span class="location">Huntsville</span>
    </div>
    <div v-if="isUserChat" class="header-left">
      <div class="channel-menu-container" ref="menuContainer">
        <button @click="toggleDropdown" class="channel-name-button">
          <span
            class="channel-name"
            :title="userChatStore.userChatCurrent?.name || 'Loading...'"
            >{{ userChatStore.userChatCurrent?.name || 'Loading...' }}</span
          >
          <font-awesome-icon
            v-if="channelStore.channelCurrent?.name"
            :icon="['fas', 'chevron-down']"
            class="dropdown-icon"
          />
        </button>
        <div v-if="isDropdownOpen" class="channel-dropdown">
          <button class="dropdown-item">
            <font-awesome-icon :icon="['fas', 'info-circle']" />
            <span>Info</span>
          </button>
          <button
            @click="handleLeaveChannel()"
            class="dropdown-item dropdown-item-danger"
          >
            <font-awesome-icon icon="fa-solid fa-ban" />
            <span>Chặn</span>
          </button>
        </div>
      </div>
      <span class="location">Huntsville</span>
    </div>
    <div class="header-right">
      <ThemeToggle />
      <span class="member-count">{{ authStore.userInfo().name }}</span>

      <div class="dropdown">
        <img
          class="avatar"
          :src="getURLAvatar(authStore.userInfo().avatar)"
          alt="avatar"
        />
        <div class="dropdown-content">
          <div class="dropdown-item" @click="handleLogout">
            <font-awesome-icon :icon="['fas', 'right-from-bracket']" />
            <span>Đăng xuất</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { getURLAvatar } from '@/utils/image'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useChannelStore } from '@/stores/channelStore'
import { useUserChatStore } from '@/stores/userChatStore'
import { useRouter } from 'vue-router'
import ThemeToggle from '../../../components/ThemeToggle.vue'
import { TypeChat } from '@/config/enum'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import UsersChannelModal from '../../../components/UsersChannelModal.vue'
import { disconnectSocket } from '@/socket/socketService'
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userChatStore = useUserChatStore()
const channelStore = useChannelStore()
const userStore = useUserStore()
const isDropdownOpen = ref(false)
const menuContainer = ref(null)
const isChannelChat = computed(() => route.params.typeChat === TypeChat.CHANNEL)
const isUserChat = computed(() => route.params.typeChat === TypeChat.USER)
const showMembers = ref(false)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const handleClickOutside = (event) => {
  if (menuContainer.value && !menuContainer.value.contains(event.target)) {
    isDropdownOpen.value = false
  }
}

const handleLogout = async () => {
  disconnectSocket()
  authStore.clearAuth()
  window.location.replace('/login')
}

const handleLeaveChannel = async () => {
  try {
    const res = await channelStore.leaveChannel()
    router.push(`/chat-view/${TypeChat.CHANNEL}/${res}`)
  } catch (e) {
    console.error(e)
  } finally {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-bar);
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

.dropdown-icon {
  font-size: 0.8rem;
  color: var(--text-primary, #23272f);
  transition: transform 0.2s ease;
}

.channel-name-button[aria-expanded='true'] .dropdown-icon {
  transform: rotate(180deg);
}

.channel-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: var(--bg-primary, #f4f4f4);
  border: 2px solid var(--border-primary, #e4e4e4);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow);
  z-index: 100;
  width: 240px;
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
  max-width: fit-content;
  display: inline-block;
}

.tag {
  background: #1ed760;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 5px;
  padding: 0.2rem 0.7rem;
  cursor: pointer;
}

.location {
  background: var(--bg-active);
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

.dropdown {
  position: relative;
}

.dropdown-content {
  position: absolute;
  right: 0px;
  background: var(--bg-primary, #f4f4f4);
  border: 2px solid var(--border-primary, #e4e4e4);
  border-radius: 5px;
  box-shadow: 0 4px 12px var(--shadow);
  z-index: 100;
  display: none;
  width: fit-content;
  white-space: nowrap;
  flex-direction: column;
}

.dropdown:hover .dropdown-content {
  display: block;
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

  .channel-name {
    font-size: 1rem;
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
