<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <LanguageSelector />
      <div class="logo flex items-center gap-1">
        <img src="/src/assets/logo.png" alt="Logo" class="logo-img" />
        {{ $t('COMPONENT.CHAT_VIEW.SIDE_BAR.LOGO') }}
      </div>
      <button class="create-channel-btn" @click="showModal = true">
        + {{ $t('COMPONENT.CHAT_VIEW.SIDE_BAR.BUTTON.CREATE_CHANNEL') }}
      </button>
      <!-- <button class="create-channel-btn" @click="showJoinModal = true">
        <font-awesome-icon :icon="['fas', 'users']" />
        {{ $t('COMPONENT.CHAT_VIEW.SIDE_BAR.BUTTON.SEARCH_CHANNEL') }}
      </button> -->
    </div>
    <Teleport to="body">
      <CreateChannelModal :visible="showModal" @close="showModal = false" />
      <JoinChannelModal
        :visible="showJoinModal"
        @close="showJoinModal = false"
      />
    </Teleport>
    <div class="sidebar-section">
      <div
        class="section-title font-bold"
        @click="isShowChannel = !isShowChannel"
      >
        <font-awesome-icon
          v-if="isShowChannel"
          icon="fa-solid fa-chevron-down"
        /><font-awesome-icon v-else icon="fa-solid fa-chevron-up" />
        {{ $t('COMPONENT.CHAT_VIEW.SIDE_BAR.LABEL.CHANNELS') }}
      </div>
      <div v-if="isShowChannel">
        <template v-for="(channels, type) in groupedChannels" :key="type">
          <div v-if="channels.length > 0" class="channel-group">
            <div class="channel-group-title" @click="toggleChannelGroup(type)">
              <font-awesome-icon
                v-if="expandedGroups[type]"
                icon="fa-solid fa-chevron-down"
                class="chevron-icon"
              />
              <font-awesome-icon
                v-else
                icon="fa-solid fa-chevron-up"
                class="chevron-icon"
              />
              {{ $t(`COMPONENT.CHAT_VIEW.SIDE_BAR.CHANNEL_GROUP.${type}`) }}
            </div>
            <ul v-if="expandedGroups[type]">
              <template v-for="channel in channels" :key="channel.id">
                <li
                  @click="handleChannelClick(channel.id)"
                  class="channel"
                  :class="{
                    active:
                      channel.id == channelStore.channelCurrent.id &&
                      route.params.typeChat == TypeChat.CHANNEL,
                  }"
                >
                  <span class="channel-title" :title="channel.name">
                    {{ channel.name }}
                  </span>
                  <div class="icon-right">
                    <span
                      v-if="channel.newMessage == 1"
                      class="new-message-badge"
                    >
                      new
                    </span>
                    <font-awesome-icon :icon="getChannelIcon(type)" class="" />
                  </div>
                </li>
              </template>
            </ul>
          </div>
        </template>
      </div>
    </div>
    <div class="sidebar-section">
      <div class="section-title" @click="isShowUser = !isShowUser">
        <font-awesome-icon
          v-if="isShowUser"
          icon="fa-solid fa-chevron-down"
        /><font-awesome-icon v-else icon="fa-solid fa-chevron-up" />
        {{ $t('COMPONENT.CHAT_VIEW.SIDE_BAR.LABEL.USERS') }}
      </div>
      <ul v-if="isShowUser">
        <template v-for="(user, index) in userStore.users" :key="user.email">
          <li
            v-if="user.id != authStore.userInfo().id"
            @click="handleUserClick(user.id)"
            class="user"
            :class="{
              active:
                user.id == route.params.chatKey &&
                route.params.typeChat == TypeChat.USER,
            }"
          >
            <div class="user-item">
              <Avatar
                :avatar="user.avatar"
                :status="user.status"
                size="small"
                :show-status="true"
              />
              {{ user.name }}
            </div>
            <div v-if="user.newMessage == 1" class="icon-right">
              <span class="new-message-badge"> new </span>
            </div>
          </li>
        </template>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreateChannelModal from '../../../components/CreateChannelModal.vue'
import JoinChannelModal from '../../../components/JoinChannelModal.vue'
import LanguageSelector from '../../../components/LanguageSelector.vue'
import { useChannelStore } from '@/stores/channelStore'
import { TypeChat, ChannelType } from '@/config/enum'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import Avatar from '@/components/common/Avatar.vue'
import { channelApi } from '@/axios/api-services/channelApi'

const route = useRoute()
const router = useRouter()
const showModal = ref(false)
const showJoinModal = ref(false)
const channelStore = useChannelStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const isShowChannel = ref(true)
const isShowUser = ref(true)

// Expanded state for each channel group
const expandedGroups = ref({
  [ChannelType.GENERAL]: true,
  [ChannelType.CUSTOM]: true,
  [ChannelType.DEPARTMENT]: true,
  [ChannelType.ORGANIZATION]: true,
})

// Group channels by type
const groupedChannels = computed(() => {
  const groups = {
    [ChannelType.GENERAL]: [],
    [ChannelType.CUSTOM]: [],
    [ChannelType.DEPARTMENT]: [],
    [ChannelType.ORGANIZATION]: [],
  }

  channelStore.channels.forEach((channel) => {
    const type = channel.type || ChannelType.CUSTOM
    if (groups[type]) {
      groups[type].push(channel)
    } else {
      groups[ChannelType.CUSTOM].push(channel)
    }
  })

  return groups
})

const toggleChannelGroup = (type) => {
  expandedGroups.value[type] = !expandedGroups.value[type]
}

const getChannelIcon = (type) => {
  const iconMap = {
    [ChannelType.GENERAL]: ['fas', 'globe'],
    [ChannelType.DEPARTMENT]: ['fas', 'building'],
    [ChannelType.ORGANIZATION]: ['fas', 'sitemap'],
    [ChannelType.CUSTOM]: ['fas', 'lock'],
  }
  return iconMap[type] || ['fas', 'lock']
}

const handleChannelClick = async (channelId) => {
  if (channelStore.channelsDict[channelId].newMessage == 1) {
    channelStore.setNewMessage(channelId, 0)
    await channelApi.readNewMessage({ channelId: channelId })
  }
  router.push(`/chat-view/${TypeChat.CHANNEL}/${channelId}`)
}

const handleUserClick = (userId) => {
  router.push(`/chat-view/${TypeChat.USER}/${userId}`)
}
</script>

<style scoped>
.sidebar {
  width: 270px;
  background: var(--bg-bar);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0.5rem 1rem 0.5rem;
  border-right: 1px solid var(--border-primary);
  min-width: 220px;
  box-shadow: 2px 0 8px var(--shadow);
  transition: all 0.3s ease;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}
.sidebar-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.logo {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--special-text-color);
  letter-spacing: 1px;
}
.logo-img {
  height: 40px;
  width: auto;
  object-fit: contain;
}
.search {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 1rem;
  margin-left: 0.2rem;
  transition: all 0.3s ease;
}
.section-title {
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-primary);
  margin: 1rem 0.5rem 0.5rem 0.5rem;
  padding: 0.6rem 1rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-align: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  transition: all 0.3s ease;
  width: auto;
}

.section-title:hover {
  color: var(--special-text-color);
  background: var(--bg-active);
  border-color: var(--special-text-color);
}

.channel-group {
  margin-bottom: 1rem;
}

.channel-group-title {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0.8rem 0 0.3rem 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  opacity: 0.8;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;
}

.channel-group-title:hover {
  color: var(--special-text-color);
  opacity: 1;
}

.chevron-icon {
  font-size: 0.7rem;
  transition: transform 0.2s;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.channel,
.dm,
.user {
  padding: 0.5rem 1.2rem;
  border-radius: 5px;
  margin-bottom: 0.2rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s, color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
}

.channel.active,
.dm.active,
.user.active,
.channel:hover,
.dm:hover,
.user:hover {
  background: var(--hover-bg);
  color: var(--special-text-color);
}
.user-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.icon-right {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  opacity: 0.8;
}
.create-channel-btn {
  padding: 0.3rem 0.7rem;
  background: #1ed760;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.create-channel-btn:hover {
  background: #17b34a;
}
.channel-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 80%;
  font-weight: 600;
}

.new-message-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1ed760 0%, #17b34a 100%);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(30, 215, 96, 0.3);
  animation: pulse 2s infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.95);
  }
}
.channel.active {
  background: var(--bg-active);
  font-weight: 600;
  border-left: 4px solid #7ee787;
}
.user.active {
  background: var(--bg-active);
  font-weight: 600;
  border-left: 4px solid #7ee787;
}

/* Custom scrollbar styling */
.sidebar::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 4px;
  transition: background 0.2s;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

/* For Firefox */
.sidebar {
  scrollbar-width: thin;
  scrollbar-color: var(--border-secondary) var(--bg-tertiary);
}
</style>
