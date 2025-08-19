<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">Chat Transalate</div>
      <button class="create-channel-btn" @click="showModal = true">+ Tạo channel</button>
      <button class="create-channel-btn" @click="showJoinModal = true"><font-awesome-icon :icon="['fas', 'users']" /> Join channel</button>
    </div>
    <Teleport to="body">
      <CreateChannelModal
        :visible="showModal"
        @close="showModal = false"
      />
      <JoinChannelModal
        :visible="showJoinModal"
        @close="showJoinModal = false"
      />
    </Teleport>
    <div class="sidebar-section">
      <div class="section-title">CHANNELS</div>
      <ul>
        <template v-for="channel in channelStore.channels">
          <li @click="handleChannelClick(channel.id)" class="channel" :class="{ active: channel.id == route.params.chatId }">
            <span class="channel-title" :title="channel.name">{{ channel.name }}</span>
            <font-awesome-icon v-if="channel.isPublic" :icon="['fas', 'globe']" class="icon-right" />
            <font-awesome-icon v-else :icon="['fas', 'lock']" class="icon-right" />
          </li>
        </template>
      </ul>
    </div>
    <div class="sidebar-section">
      <div class="section-title">USERS</div>
      <ul>
        <li class="channel">MSN-7234B1</li>
        <li class="channel">MSN-8125C2</li>
        <li class="channel">MSN-5581D3</li>
      </ul>
    </div>
    <div class="sidebar-section">
      <div class="section-title">DIRECT MESSAGES</div>
      <ul>
        <li class="dm active">Lt. Charlene Meyer</li>
        <li class="dm">Lt. Anita Becker</li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CreateChannelModal from './CreateChannelModal.vue'
import JoinChannelModal from './JoinChannelModal.vue'
import { useChannelStore } from '@/stores/channelStore';

const route = useRoute();
const router = useRouter();
const showModal = ref(false);
const showJoinModal = ref(false);
const channelStore = useChannelStore();

const handleChannelClick = (channelId) => {
  router.push(`/chat-view/${channelId}`);
}

onMounted(async () => {
  channelStore.fetchChannel();
})
</script>

<style scoped>
.sidebar {
  width: 270px;
  background: var(--border-primary, #ffffff);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0.5rem 1rem 0.5rem;
  /* border-right: 2px solid var(--border-primary); */
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
  color: #7ee787;
  letter-spacing: 1px;
  margin-left: 0.5rem;
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
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 1rem 0 0.3rem 1rem;
  font-weight: 600;
  letter-spacing: 1px;
  transition: color 0.3s ease;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.channel, .dm {
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
.channel.active, .dm.active, .channel:hover, .dm:hover {
  background: var(--hover-bg);
  color: #7ee787;
}
.icon-right {
  font-size: 0.9rem;
  opacity: 0.8;
}
.create-channel-btn {
  margin-left: 8px;
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
  background: var(--primary-color, #f4f4f4);
  color: #000000;
  font-weight: 600;
  border-left: 4px solid #7ee787;
}

html.dark .channel.active {
  background: #2a3950;
  color: #fff;
}
</style> 