<template>
  <div class="message-list" ref="messageListRef">
    <div v-if="!isConnected" class="connection-status">
      <div class="status-message" :class="{ error: !isConnected }">
        {{ connectionStatusMessage }}
      </div>
    </div>

    <div v-if="error" class="error-message">
      <span>{{ error }}</span>
      <button @click="retryFetch" class="retry-btn">Thử lại</button>
    </div>

    <div v-if="loading && messages.length > 0" class="load-more-indicator">
      <div class="loading-spinner small"></div>
      <span>Đang tải thêm...</span>
    </div>
    <div v-for="msg in messages" :key="msg.id">
      <template v-if="msg.type === 'MESSAGE'">
        <div
          class="message"
          :class="{ 'message-own': msg.fromUser === authStore.userInfo.id }"
        >
          <img
            v-if="msg.fromUser !== authStore.userInfo.id"
            class="avatar"
            :src="getURLAvatar(msg.avatar)"
            alt="avatar"
          />
          <div class="msg-content">
            <div class="msg-header">
              <span class="msg-user">{{
                userStore.usersDict[msg.fromUser].name
              }}</span>
              <span class="msg-time">
                {{ formatDate(msg.createdAt) }}
                <span v-if="msg.isEdit" class="msg-edited">(đã sửa)</span>
              </span>
            </div>

            <template v-if="editingMessageId === msg.id">
              <textarea
                v-model="editedContent"
                @keydown="handleKeyDown"
                @keyup.esc="cancelEdit"
                class="msg-edit-input"
                rows="3"
              ></textarea>
              <div class="msg-edit-actions">
                <button
                  @click="saveEdit"
                  class="save-btn"
                  :disabled="!editedContent.trim()"
                >
                  Lưu
                </button>
                <button @click="cancelEdit" class="cancel-btn edit-hint">
                  Hủy
                </button>
              </div>
            </template>
            <template v-else>
              <div
                class="msg-text"
                v-html="highlightMentions(msg.content)"
              ></div>
            </template>

            <div v-if="msg.files && msg.files.length > 0" class="msg-files">
              <div v-for="file in msg.files" :key="file.id" class="msg-file">
                <div class="file-icon">📎</div>
                <div class="file-info">
                  <a :href="file.path" target="_blank" class="file-name">{{
                    file.name
                  }}</a>
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
          <img
            v-if="msg.fromUser === authStore.userInfo.id"
            class="avatar"
            :src="getURLAvatar(msg.avatar)"
            alt="avatar"
          />
          <DropdownMenu
            v-if="msg.fromUser === authStore.userInfo.id"
            :data="msg"
            :can-detail="false"
            @edit="editMessage"
            @delete="clickDeleteMessage"
          />
        </div>
      </template>
      <template v-else>
        <div class="system-message">
          <img :src="getURLAvatar(msg.avatar)" class="system-avatar" />
          <span class="system-name">{{
            userStore.usersDict[msg.fromUser].name
          }}</span>
          <span class="system-content">{{
            convertMessageMultilanguage(msg)
          }}</span>
        </div>
      </template>
    </div>
    <ModalConfirmDelete
      :visible="isShowModalDelete"
      message="Bạn chắc chắn muốn xóa tin nhắn này không?"
      @confirm="confirmDeleteMessage"
      @cancel="cancelDeleteMessage"
    />
  </div>
</template>

<script setup>
import ModalConfirmDelete from '../../../components/common/ModalConfirmDelete.vue'
import DropdownMenu from '../../../components/common/DropdownMenu.vue'
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { messageApi } from '@/axios/api-services/messageApi'
import { formatDate } from '@/utils/date'
import localStorageUtils from '@/utils/localStorageUtils'
import {
  connectSocket,
  disconnectSocket,
  subscribeSocket,
} from '@/socket/socketService'
import { useAuthStore } from '@/stores/authStore'
import { useChannelStore } from '@/stores/channelStore'
import { useUserChatStore } from '@/stores/userChatStore'
import { useUserStore } from '@/stores/userStore'
import { getURLAvatar } from '@/utils/image'
import {
  removeVietnameseTones,
  convertMessageMultilanguage,
} from '@/utils/string'
import { Status, TypeChat, URLMessage } from '@/config/enum'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const channelStore = useChannelStore()
const userChatStore = useUserChatStore()
const userStore = useUserStore()
const route = useRoute()

// Reactive state
const messages = ref([])
const loading = ref(false)
const hasMore = ref(true)
const error = ref(null)
const typeChat = computed(() => route.params.typeChat)

// New state for message editing
const editingMessageId = ref(null)
const editedContent = ref('')

// New state for message delete
const isShowModalDelete = ref(false)
const deleteMessageId = ref(null)

// Connection state
const isConnected = ref(false)
const reconnectTimeout = ref(null)

// Template refs
const messageListRef = ref(null)

// Computed properties
const connectionStatusMessage = computed(() => {
  if (!isConnected.value) {
    return 'Đang kết nối...'
  }
  return ''
})

const isChannelChat = computed(() => route.params.typeChat === TypeChat.CHANNEL)
const isUserChat = computed(() => route.params.typeChat === TypeChat.USER)
const currentChannelId = computed(() => route.params.chatKey)
const currentChatKey = computed(() => route.params.chatKey)

// Methods
const scrollToBottom = async () => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

const clearError = () => {
  error.value = null
}

const retryFetch = async () => {
  clearError()
  if (isChannelChat.value && currentChannelId.value) {
    await fetchMessagesChannel(true)
  } else if (isUserChat.value && currentChatKey.value) {
    await fetchMessagesUser(true)
  }
}

const handleDisconnect = () => {
  isConnected.value = false
  handleReconnect()
}

const handleConnectSuccess = async () => {
  isConnected.value = true
  clearError()

  try {
    if (isChannelChat.value && currentChannelId.value) {
      await fetchMessagesChannel(true)
      subscribeToChannel()
    } else if (isUserChat.value && currentChatKey.value) {
      await fetchMessagesUser(true)
      subscribeToUser()
    }
    scrollToBottom()
  } catch (err) {
    console.error('Error fetching initial messages:', err)
    error.value = 'Không thể tải tin nhắn ban đầu'
  }
}

const handleReconnect = () => {
  // Clear any existing timeout
  if (reconnectTimeout.value) {
    clearTimeout(reconnectTimeout.value)
  }

  // Try to reconnect after a delay
  if (!isConnected.value) {
    reconnectTimeout.value = setTimeout(() => {
      connectWS()
    }, 5000)
  }
}

const handleConnectionError = (error) => {
  console.error('WebSocket error:', error)
  handleDisconnect()
}

const handleReceiveMessage = (message) => {
  const index = messages.value.findIndex((m) => m.id === message.id)
  if (index !== -1) {
    messages.value[index].content = message.content
    messages.value[index].isEdit = true
  } else {
    messages.value.push(message)
    scrollToBottom()
  }
}

const subscribeToChannel = () => {
  if (!currentChannelId.value) return
  subscribeSocket(
    `${URLMessage.RECEIVE_CHANNEL_MESSAGE}/${currentChannelId.value}`,
    handleReceiveMessage
  )
}

const subscribeToUser = () => {
  subscribeSocket(URLMessage.RECEIVE_USER_MESSAGE, handleReceiveMessage)
}

const connectWS = async () => {
  try {
    await connectSocket(
      localStorageUtils.get('token'),
      handleConnectSuccess,
      handleDisconnect,
      handleConnectionError
    )
  } catch (err) {
    console.error('Failed to connect WebSocket:', err)
    error.value = 'Không thể kết nối...'
  }
}

const fetchMessagesChannel = async (isInitial = false) => {
  if (!currentChatKey.value) {
    error.value = 'Không có channel được chọn'
    return
  }

  if (isInitial == true) {
    messages.value = []
  }

  if (loading.value || (!hasMore.value && !isInitial)) {
    return
  }

  loading.value = true
  clearError()

  const el = messageListRef.value
  let oldScrollHeight, oldScrollTop

  if (!isInitial && el) {
    oldScrollHeight = el.scrollHeight
    oldScrollTop = el.scrollTop
  }

  try {
    const res = await messageApi.getMessagesByChannelId(
      currentChatKey.value,
      messages.value.length,
      10
    )

    if (res.data.length === 0) {
      hasMore.value = false
    }

    if (isInitial) {
      messages.value = res.data.reverse()
      scrollToBottom()
    } else {
      messages.value = [...res.data.reverse(), ...messages.value]
      await nextTick()
      if (el) {
        el.scrollTop = el.scrollHeight - oldScrollHeight + oldScrollTop
      }
    }
  } catch (err) {
    console.error('Error fetching channel messages:', err)
    error.value = 'Không thể tải tin nhắn kênh'
  } finally {
    loading.value = false
  }
}

const fetchMessagesUser = async (isInitial = false) => {
  if (!currentChatKey.value) {
    error.value = 'Không có người dùng được chọn'
    return
  }

  if (loading.value || (!hasMore.value && !isInitial)) return

  loading.value = true
  clearError()

  const el = messageListRef.value
  let oldScrollHeight, oldScrollTop

  if (!isInitial && el) {
    oldScrollHeight = el.scrollHeight
    oldScrollTop = el.scrollTop
  }

  try {
    const res = await messageApi.getMessagesByUserId(
      currentChatKey.value,
      messages.value.length,
      10
    )

    if (res.data.length === 0) {
      hasMore.value = false
    }

    if (isInitial) {
      messages.value = res.data.reverse()
      scrollToBottom()
    } else {
      messages.value = [...res.data.reverse(), ...messages.value]
      await nextTick()
      if (el) {
        el.scrollTop = el.scrollHeight - oldScrollHeight + oldScrollTop
      }
    }
  } catch (err) {
    console.error('Error fetching user messages:', err)
    error.value = 'Không thể tải tin nhắn người dùng'
  } finally {
    loading.value = false
  }
}

// --- Message Editing Logic ---

const handleKeyDown = (event) => {
  if (event.key === 'Enter') {
    if (event.ctrlKey) {
      // Ctrl+Enter: Insert new line
      const start = event.target.selectionStart
      const end = event.target.selectionEnd
      editedContent.value =
        editedContent.value.substring(0, start) +
        '\n' +
        editedContent.value.substring(end)
      // Move cursor after the new line
      nextTick(() => {
        event.target.selectionStart = event.target.selectionEnd = start + 1
      })
    } else {
      // Enter: Send message
      event.preventDefault()
      saveEdit()
    }
  }
}

const editMessage = (msg) => {
  // Chỉ cho phép chỉnh sửa tin nhắn của chính mình và không phải tin nhắn hệ thống
  if (msg.fromUser === authStore.userInfo.id && msg.type === 'MESSAGE') {
    editingMessageId.value = msg.id
    editedContent.value = msg.content // Tải nội dung hiện tại
    nextTick(() => {
      // Focus vào input chỉnh sửa sau khi DOM cập nhật
      const input = messageListRef.value.querySelector('.msg-edit-input')
      if (input) {
        input.focus()
      }
    })
  }
}

const cancelEdit = () => {
  editingMessageId.value = null
  editedContent.value = ''
}

const saveEdit = async () => {
  if (!editingMessageId.value || !editedContent.value.trim()) {
    return cancelEdit()
  }

  const messageId = editingMessageId.value
  const newContent = editedContent.value.trim()

  const originalMessage = messages.value.find((m) => m.id === messageId)
  if (originalMessage && originalMessage.content.trim() === newContent) {
    return cancelEdit()
  }

  clearError()

  try {
    await updateMessage(messageId, newContent)

    cancelEdit()
  } catch (err) {
    console.error('Error updating message:', err)
    error.value = 'Không thể sửa tin nhắn. Vui lòng thử lại.'
  }
}

const updateMessage = async (messageId, newContent) => {
  if (newContent.trim()) {
    try {
      if (typeChat.value == TypeChat.CHANNEL) {
        channelStore.sendMessageToChannel({
          id: messageId,
          content: newContent,
          // files: selectedFiles.value,
          channelId: route.params.chatKey,
          // uploadFiles: uploadFiles,
        })
      } else {
        userChatStore.sendMessageToUser({
          id: messageId,
          content: newContent,
          // files: selectedFiles.value,
          userId: route.params.chatKey,
          // uploadFiles: uploadFiles,
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }
}

// --- End Message Editing Logic ---

// --- Start Message Delete Logic ---
const clickDeleteMessage = (data) => {
  isShowModalDelete.value = true
  deleteMessageId.value = data.id
}

const cancelDeleteMessage = () => {
  isShowModalDelete.value = false
  deleteMessageId.value = null
}

const confirmDeleteMessage = (msgId) => {
  if (msgId != null) {
    try {
      if (typeChat.value == TypeChat.CHANNEL) {
        channelStore.sendMessageToChannel({
          id: msgId,
          content: '',
          channelId: route.params.chatKey,
          type: Status.DELETE_MESSAGE,
        })
      } else {
        userChatStore.sendMessageToUser({
          id: msgId,
          content: '',
          userId: route.params.chatKey,
          type: Status.DELETE_MESSAGE,
        })
      }
    } catch (error) {
      console.error('Error delete message:', error)
    }
  }
}

// --- Utils Functions ---

const formatFileSize = (size) => {
  if (!size) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(size) / Math.log(k))
  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const highlightMentions = (text) => {
  if (!text) return ''

  const members = userStore.getUsersByIds(
    channelStore.channelCurrent?.members || []
  )
  let result = text

  members.forEach((member) => {
    if (member.name) {
      const name = member.name
      const nameNoSign = removeVietnameseTones(name).replace(
        /([.*+?^=!:${}()|\[\]\/\\])/g,
        '\\$1'
      )
      const regex = new RegExp(`@(${name}|${nameNoSign})\\b`, 'gi')
      result = result.replace(regex, '<span class="mention">$1</span>')
    }
  })

  return result
}

const handleScroll = async () => {
  const el = messageListRef.value
  if (!el) return

  // Load more messages when scrolling to top
  if (el.scrollTop === 0 && hasMore.value && !loading.value) {
    if (isChannelChat.value && currentChannelId.value) {
      await fetchMessagesChannel()
    } else if (isUserChat.value && currentChatKey.value) {
      await fetchMessagesUser()
    }
  }
}

// Lifecycle hooks
onMounted(async () => {
  // Add scroll event listener
  if (messageListRef.value) {
    messageListRef.value.addEventListener('scroll', handleScroll)
  }
  // Initialize WebSocket connection
  await connectWS()
})

onUnmounted(() => {
  // Clean up scroll event listener
  if (messageListRef.value) {
    messageListRef.value.removeEventListener('scroll', handleScroll)
  }

  // Clean up reconnection timeout
  if (reconnectTimeout.value) {
    clearTimeout(reconnectTimeout.value)
  }

  // Disconnect WebSocket
  disconnectSocket()
})

// Watchers
// ... (Your existing watchers remain unchanged)

watch(
  () => route.params.typeChat,
  async (newTypeChat, oldTypeChat) => {
    if (newTypeChat === oldTypeChat) return

    messages.value = []
    hasMore.value = true
    error.value = null
    editingMessageId.value = null // Reset edit state

    if (isConnected.value) {
      if (newTypeChat === TypeChat.CHANNEL && currentChatKey.value) {
        subscribeToChannel()
        await fetchMessagesChannel(true)
      } else if (newTypeChat === TypeChat.USER && currentChatKey.value) {
        subscribeToUser()
        await fetchMessagesUser(true)
      } else {
        handleReconnect()
      }
    } else {
      handleReconnect()
    }
  }
)

watch(
  () => currentChatKey.value,
  async (newChatKey, oldChatKey) => {
    if (newChatKey === oldChatKey) return

    messages.value = []
    hasMore.value = true
    error.value = null
    editingMessageId.value = null // Reset edit state

    if (isConnected.value) {
      if (isChannelChat.value && currentChannelId.value) {
        subscribeToChannel()
        await fetchMessagesChannel(true)
      } else if (isUserChat.value && newChatKey) {
        subscribeToUser()
        await fetchMessagesUser(true)
      } else {
        handleReconnect()
      }
    } else {
      handleReconnect()
    }
  }
)
</script>

<style>
/* --- Styles for Edit Feature --- */
.msg-edited {
  font-size: 0.85rem;
  color: #777;
  margin-left: 0.5rem;
  font-weight: 400;
  font-style: italic;
}

.msg-edit-input {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: 0.5rem;
  font-size: 1.05rem;
  resize: vertical; /* Cho phép thay đổi kích thước theo chiều dọc */
  background: var(--bg-primary);
  color: var(--text-color);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.message-own .msg-edit-input {
  background: #fff;
}

.msg-edit-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end; /* Căn nút Save/Cancel sang phải */
  gap: 0.7rem;
  margin-top: 0.5rem;
}

.edit-hint {
  font-size: 0.85rem;
  color: #888;
  margin-right: auto; /* Đẩy hint sang trái */
}

.edit-hint a {
  color: #1976d2;
  cursor: pointer;
  text-decoration: underline;
}

.save-btn {
  padding: 0.4rem 1rem;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  font-weight: 500;
}

.save-btn:hover:not(:disabled) {
  background: #1565c0;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* --- End Styles for Edit Feature --- */

/* --- Existing Styles below --- */

.message-list {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-primary);
  padding: 1.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.message {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  background: var(--hover-bg);
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
  color: var(--text-primary);
}

.message-own .msg-user {
  color: var(--special-text-color);
}

.msg-time {
  color: #888;
  font-size: 0.95rem;
}

.msg-text {
  margin: 0.2rem 0 0.1rem 0;
  color: var(--text-primary);
  font-size: 1.05rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
}

.message-own .msg-text {
  color: var(--text-color);
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

.loading-indicator,
.load-more-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  border-width: 1.5px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8d7da;
  color: #721c24;
  border-radius: 8px;
  margin: 1rem 0;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #c82333;
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
  background: var(--bg-active);
  border-radius: 10px;
  padding: 0.6rem 2rem;
  margin: 0.7rem auto;
  width: fit-content;
  font-size: 1rem;
  font-weight: 500;
  color: #23272f;
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

html.dark .system-name {
  color: #fff;
}

html.dark .system-content {
  color: #fff;
}

.cancel-btn {
  padding: 0.4rem 1rem;
  background: var(--border-secondary);
  color: var(--text-secondary);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  font-weight: 500;
}

.cancel-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.cancel-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
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

  .avatar,
  .system-avatar {
    width: 32px;
    height: 32px;
  }

  .msg-header,
  .system-message {
    font-size: 0.85rem;
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

  .loading-indicator,
  .load-more-indicator {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .error-message {
    padding: 0.5rem;
    margin: 0.5rem 0;
    flex-direction: column;
    gap: 0.5rem;
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

  .msg-header,
  .system-message {
    font-size: 0.8rem;
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

  .loading-indicator,
  .load-more-indicator {
    padding: 0.3rem;
    font-size: 0.75rem;
  }

  .error-message {
    padding: 0.3rem;
    margin: 0.3rem 0;
    font-size: 0.8rem;
  }

  .retry-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }
}
</style>
