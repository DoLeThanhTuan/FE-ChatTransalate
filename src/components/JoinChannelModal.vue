<template>
  <div v-if="visible" class="modal-overlay dark">
    <div class="modal-content dark">
      <div class="modal-header">
        <h2>Find Channels</h2>
        <span class="close-btn" @click="$emit('close')">×</span>
      </div>
      <div class="modal-body">
        <div style="display: flex; gap: 0.5rem; align-items: center;">
            <input
                v-model="search"
                class="modal-input dark"
                placeholder="Type to find a channel..."
                @keyup.enter="searchChannelsAPI"
            />
            <button class="search-btn" @click="searchChannelsAPI">Search</button>
        </div>
        <div class="modal-section-title">RECENT</div>
        <ul class="channel-list">
          <li v-for="channel in channels" :key="channel.id" class="channel-item" @click="selectChannel(channel)">
            <font-awesome-icon :icon="['fas', channel.isPublic ? 'lock' : 'lock']" style="margin-right:8px;" />
            <span class="channel-name">{{ channel.name }}</span>
            <span class="channel-url">~{{ channel.url }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useChannelStore } from '@/stores/channelStore';
import { useRouter } from 'vue-router';
const props = defineProps({ visible: Boolean });
const emit = defineEmits(['close']);
const channelStore = useChannelStore();
const search = ref('');
const channels = ref([]);
const router = useRouter();

const filterChannels = () => {
  const q = search.value.trim().toLowerCase();
  if (!q) {
    channels.value = [];
  } else {
    channels.value = channels.value.filter(c => c.name.toLowerCase().includes(q));
  }
};

const searchChannelsAPI = async () => {
  const q = search.value.trim();
  if (!q) {
    channels.value = [];
    return;
  }
  const result = await channelStore.searchChannel({q});
  channels.value = result;
  filterChannels();
};

const selectChannel = async (channel) => {
  const res = await channelStore.joinChannel(channel.id);
  router.push(`/chat-view/${res.id}`);
  emit('close');
};

watch(() => props.visible, (v) => {
  if (v) filterChannels();
  if (!v) search.value = '';
});
</script>

<style scoped>
.modal-overlay.dark {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(10,14,22,0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-content.dark {
  background: #23293a;
  color: #fff;
  border-radius: 14px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 2px 24px rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;
  padding: 0;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem 0.5rem 2rem;
}
.modal-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
}
.close-btn {
  font-size: 2rem;
  cursor: pointer;
  color: #fff;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.close-btn:hover {
  opacity: 1;
}
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 0 2rem 1.5rem 2rem;
}
.modal-input.dark {
  background: #181c27;
  color: #fff;
  border: 1.5px solid #2c3144;
  border-radius: 8px;
  padding: 0.7rem 1rem;
  font-size: 1rem;
  margin-bottom: 0.2rem;
  width: 100%;
  box-sizing: border-box;
  transition: border 0.2s, box-shadow 0.2s;
}
.modal-section-title {
  color: #b0b8d1;
  font-size: 0.95rem;
  margin: 0.7rem 0 0.2rem 0.1rem;
  font-weight: 600;
}
.channel-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 320px;
  overflow-y: auto;
}
.channel-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.7rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.channel-item:hover {
  background: #2a3950;
}
.channel-name {
  font-weight: 600;
  color: #fff;
  margin-right: 0.5rem;
  word-break: break-word;
}
.channel-url {
  color: #b0b8d1;
  font-size: 0.95em;
  margin-left: auto;
}
.search-btn {
  background: #1ed760;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.search-btn:hover {
  background: #17b34a;
}
</style> 