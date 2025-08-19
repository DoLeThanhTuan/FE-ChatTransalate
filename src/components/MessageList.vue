<template>
  <div class="message-list" ref="messageListRef">
    <div v-if="!isConnected" class="connection-status">
      <div class="status-message" :class="{ 'error': !isConnected }">
        {{ connectionStatusMessage }}
      </div>
    </div>
    <div v-for="msg in messages" :key="msg.id">
      <template v-if="msg.type === 'MESSAGE'">
        <div class="message" :class="{ 'message-own': msg.email === authStore.userInfo.email }">
          <img v-if="msg.email !== authStore.userInfo.email" class="avatar" :src="getURLAvatar(msg.avatar)" alt="avatar" />
          <div class="msg-content">
            <div class="msg-header">
              <span class="msg-user">{{ msg.name }}</span>
              <span class="msg-time">{{ formatDate(msg.createdAt) }}</span>
            </div>
            <div class="msg-text" v-html="highlightMentions(msg.content)"></div>
            <div v-if="msg.files && msg.files.length > 0" class="msg-files">
              <div v-for="file in msg.files" :key="file.id" class="msg-file">
                <div class="file-icon">📎</div>
                <div class="file-info">
                  <a :href="file.path" target="_blank" class="file-name">{{ file.name }}</a>
                  <div class="file-size">{{ formatFileSize(file.size) }}</div>
                </div>
              </div>
            </div>
            <div class="msg-reactions">
              <span v-for="r in msg.reactions" :key="r.emoji" class="reaction">
                {{ r.emoji }} {{ r.count }}
              </span>
            </div>
          </div>
          <img v-if="msg.email === authStore.userInfo.email" class="avatar" :src="getURLAvatar(msg.avatar)" alt="avatar" />
        </div>
      </template>
      <template v-else>
        <div class="system-message">
          <img :src="getURLAvatar(msg.avatar)" class="system-avatar" />
          <span class="system-name">{{ channelStore.getUserName(msg.email) }}</span>
          <span class="system-content">{{ convertMessageMultilanguage(msg) }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { messageApi } from '@/axios/api-services/messageApi'
import { formatDate } from '@/utils/date'
import { connectSocket, disconnectSocket, subscribeSocket } from '@/socket/socketService'
import { useAuthStore } from '@/stores/authStore'
import { getURLAvatar } from '@/utils/image'
import { useChannelStore } from '@/stores/channelStore'
import { removeVietnameseTones, convertMessageMultilanguage } from '@/utils/string'
import { URLMessage } from '@/config/enum'

const authStore = useAuthStore()
const channelStore = useChannelStore()
const messages = ref([])
const loading = ref(true)
const error = ref(null)

// Connection state
const isConnected = ref(false)
const reconnectTimeout = ref(null)

const connectionStatusMessage = computed(() => {
  if (!isConnected.value) {
    return 'Đang kết nối...'
  }
  return ''
})

const messageListRef = ref(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

const handleDisconnect = () => {
  isConnected.value = false
  handleReconnect()
}

const handleConnectSuccess = () => {
  isConnected.value = true;
  fetchMessages().then(() => {
    scrollToBottom()
  })
}

const handleReconnect = () => {
  // Clear any existing timeout
  isConnected.value = false
  if (reconnectTimeout.value) {
    clearTimeout(reconnectTimeout.value)
  }

  // Try to reconnect after a delay
  reconnectTimeout.value = setTimeout(() => {
    connectWS()
  }, 2000) // Wait 3 seconds before attempting to reconnect
}

const handleConnectionError = (error) => {
  console.error('WebSocket error:', error)
  handleDisconnect()
}

const handleReceiveMessage = (message) => {
  messages.value.push(message);
  scrollToBottom();
}

const connectWS = async () => {
  await connectSocket(
    authStore.token,
    handleConnectSuccess,
    handleDisconnect,
    handleConnectionError
  )
  subscribeSocket(`${URLMessage.RECEIVE_CHANNEL_MESSAGE}/${channelStore.channelCurrent?.id}`,(message) => handleReceiveMessage(message))
}

const fetchMessages = async () => {
  loading.value = true
  try {
    const res = await messageApi.getMessagesByChannelId(channelStore.channelCurrent?.id)
    messages.value = res.data
    scrollToBottom()
  } catch (err) {
    error.value = 'Không thể tải tin nhắn'
  } finally {
    loading.value = false
  }
}

const formatFileSize = (size) => {
  if (!size) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

function highlightMentions(text) {
  if (!text) return '';
  const members = channelStore.channelCurrent?.members || [];
  let result = text;
  members.forEach(member => {
    const name = member.name;
    const nameNoSign = removeVietnameseTones(name).replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
    const regex = new RegExp(`@(${name}|${nameNoSign})\\b`, 'gi');
    result = result.replace(regex, `<span class=\"mention\">@$1</span>`);
  });
  return result;
}

onUnmounted(() => {
  if (reconnectTimeout.value) {
    clearTimeout(reconnectTimeout.value)
  }
  disconnectSocket()
})

watch(
  () => channelStore.channelCurrent?.id,
  async () => {
    messages.value = []
    if(isConnected.value == true){
      subscribeSocket(`${URLMessage.RECEIVE_CHANNEL_MESSAGE}/${channelStore.channelCurrent?.id}`,(message) => handleReceiveMessage(message))
      await fetchMessages();
    }else{
      handleReconnect()
    }
  }
)
</script>

<style>
.message-list {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-primary,#f4f4f4);
  padding: 1.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 1.1rem;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 1.1rem 1.5rem;
  max-width: 80%;
}

.message-own {
  margin-left: auto;
  background: #e3f2fd;
}

.message-own .avatar {
  order: 2;
}

.message-own .msg-content {
  order: 1;
  align-items: flex-end;
}

.message-own .msg-header {
  flex-direction: row-reverse;
}

.message-own .msg-files {
  align-items: flex-end;
}

.message-own .msg-file {
  background: #fff;
}

.message-own .msg-file:hover {
  background: #f5f5f5;
}

.message-own .msg-reactions {
  justify-content: flex-end;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e0e0e0;
}

.msg-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.msg-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1rem;
}

.msg-user {
  font-weight: bold;
  color: #23272f;
}

.msg-time {
  color: #888;
  font-size: 0.95rem;
}

.msg-text {
  margin: 0.2rem 0 0.1rem 0;
  color: #23272f;
  font-size: 1.05rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
}

.msg-files {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.2rem 0;
}

.msg-file {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: #f3f4f8;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  transition: background-color 0.2s;
}

.msg-file:hover {
  background: #e8eaf6;
}

.file-icon {
  font-size: 1.3rem;
}

.file-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: #1976d2;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-name:hover {
  text-decoration: underline;
}

.file-size {
  color: #888;
  font-size: 0.92rem;
}

.msg-reactions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.2rem;
}

.reaction {
  background: #f3f4f8;
  border-radius: 12px;
  padding: 0.1rem 0.7rem;
  font-size: 1rem;
  color: #23272f;
  border: 1px solid #e0e0e0;
}

.connection-status {
  position: sticky;
  top: 0;
  z-index: 2;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
}

.status-message {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: #fff3cd;
  color: #856404;
  font-size: 0.9rem;
}

.status-message.error {
  background: #f8d7da;
  color: #721c24;
}

.mention {
  color: #1976d2;
  font-weight: 600;
  cursor: pointer;
}

.system-message {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 10px;
  padding: 0.6rem 2rem;
  margin: 0.7rem auto;
  width: fit-content;
  font-size: 1rem;
  font-weight: 500;
  color: #444;
}
.system-avatar {
  margin-right: 0.5rem;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
}
.system-name {
  font-weight: bold;
  color: #222;
  margin-right: 0.25rem;
}
html.dark .system-message {
  background: #23293a;
  color: #eee;
}
html.dark .system-name {
  color: #fff;
}

@media (max-width: 768px) {
  .message-list {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .message {
    padding: 0.6rem;
    gap: 0.6rem;
    max-width: 90%;
  }

  .avatar {
    width: 32px;
    height: 32px;
  }

  .msg-header {
    font-size: 0.85rem;
    gap: 0.4rem;
  }

  .msg-time {
    font-size: 0.8rem;
  }

  .msg-text {
    font-size: 0.9rem;
    line-height: 1.4;
    margin: 0.1rem 0;
  }

  .msg-files {
    gap: 0.3rem;
  }

  .msg-file {
    padding: 0.3rem 0.5rem;
    gap: 0.4rem;
  }

  .file-icon {
    font-size: 1rem;
  }

  .file-name {
    font-size: 0.85rem;
  }

  .file-size {
    font-size: 0.75rem;
  }

  .msg-reactions {
    gap: 0.3rem;
    margin-top: 0.1rem;
  }

  .reaction {
    padding: 0.1rem 0.4rem;
    font-size: 0.85rem;
  }

  .status-message {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }
}

@media (max-width: 400px) {
  .message-list {
    padding: 0.3rem;
    gap: 0.3rem;
  }

  .message {
    padding: 0.4rem;
    gap: 0.4rem;
    border-radius: 8px;
    max-width: 95%;
  }

  .avatar {
    width: 28px;
    height: 28px;
    border-width: 1px;
  }

  .msg-header {
    font-size: 0.8rem;
    gap: 0.3rem;
  }

  .msg-time {
    font-size: 0.75rem;
  }

  .msg-text {
    font-size: 0.85rem;
    line-height: 1.3;
  }

  .msg-files {
    gap: 0.2rem;
  }

  .msg-file {
    padding: 0.2rem 0.4rem;
    gap: 0.3rem;
    border-radius: 4px;
  }

  .file-icon {
    font-size: 0.9rem;
  }

  .file-name {
    font-size: 0.8rem;
  }

  .file-size {
    font-size: 0.7rem;
  }

  .msg-reactions {
    gap: 0.2rem;
  }

  .reaction {
    padding: 0.1rem 0.3rem;
    font-size: 0.8rem;
    border-radius: 10px;
  }

  .status-message {
    font-size: 0.75rem;
    padding: 0.2rem 0.4rem;
  }
}
</style>
