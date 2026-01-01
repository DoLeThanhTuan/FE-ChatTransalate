<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <LanguageSelector />
      <div class="logo">{{ $t('COMPONENT.CHAT_VIEW.SIDE_BAR.LOGO') }}</div>
      <button class="create-channel-btn" @click="showModal = true">
        + {{ $t('COMPONENT.CHAT_VIEW.SIDE_BAR.BUTTON.CREATE_CHANNEL') }}
      </button>
      <button class="create-channel-btn" @click="showJoinModal = true">
        <font-awesome-icon :icon="['fas', 'users']" />
        {{ $t('COMPONENT.CHAT_VIEW.SIDE_BAR.BUTTON.SEARCH_CHANNEL') }}
      </button>
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
      <ul v-if="isShowChannel">
        <template v-for="channel in channelStore.channels">
          <li
            @click="handleChannelClick(channel.id)"
            class="channel"
            :class="{
              active:
                channel.id == channelStore.channelCurrent.id &&
                route.params.typeChat == TypeChat.CHANNEL,
            }"
          >
            <span class="channel-title" :title="channel.name">{{
              channel.name
            }}</span>
            <font-awesome-icon
              v-if="channel.isPublic"
              :icon="['fas', 'globe']"
              class="icon-right"
            />
            <font-awesome-icon
              v-else
              :icon="['fas', 'lock']"
              class="icon-right"
            />
          </li>
        </template>
      </ul>
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
          </li>
        </template>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreateChannelModal from '../../../components/CreateChannelModal.vue'
import JoinChannelModal from '../../../components/JoinChannelModal.vue'
import LanguageSelector from '../../../components/LanguageSelector.vue'
import { useChannelStore } from '@/stores/channelStore'
import { TypeChat } from '@/config/enum'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import Avatar from '@/components/common/Avatar.vue'

const route = useRoute()
const router = useRouter()
const showModal = ref(false)
const showJoinModal = ref(false)
const channelStore = useChannelStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const isShowChannel = ref(true)
const isShowUser = ref(true)

const handleChannelClick = (channelId) => {
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
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 1rem 0 0.3rem 1rem;
  font-weight: 600;
  letter-spacing: 1px;
  transition: color 0.3s ease;
  width: fit-content;
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
  display: block;
  max-width: 80%;
  font-weight: 600;
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
</style>
