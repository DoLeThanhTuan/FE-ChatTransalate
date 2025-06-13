<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2>Bảng điều khiển Streamer</h2>
      <button @click="startStream" class="stream-button" :disabled="isStreaming">
        {{ isStreaming ? 'Đang phát trực tiếp' : 'Bắt đầu phát trực tiếp' }}
      </button>
    </div>

    <div class="dashboard-content">
      <div class="stream-info">
        <h3>Thông tin stream</h3>
        <div class="info-group">
          <label>Trạng thái</label>
          <p>{{ isStreaming ? 'Đang phát trực tiếp' : 'Chưa phát trực tiếp' }}</p>
        </div>
        <div class="info-group" v-if="isStreaming">
          <label>Người xem</label>
          <p>{{ viewers }} người đang xem</p>
        </div>
      </div>

      <div class="chat-section">
        <h3>Chat trực tiếp</h3>
        <div class="chat-messages" ref="chatContainer">
          <div v-for="(message, index) in messages" :key="index" class="message">
            <span class="username">{{ message.username }}:</span>
            <span class="content">{{ message.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { connectSocket, disconnectSocket, send } from '@/socket/socketService'

const router = useRouter()
const isStreaming = ref(false)
const viewers = ref(0)
const messages = ref([])
const chatContainer = ref(null)

const startStream = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:8000/api/stream/start', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      isStreaming.value = true
      connectSocket(token, handleMessage)
    } else {
      alert('Không thể bắt đầu stream')
    }
  } catch (error) {
    console.error('Error starting stream:', error)
    alert('Có lỗi xảy ra khi bắt đầu stream')
  }
}

const handleMessage = (message) => {
  messages.value.push(message)
  scrollToBottom()
}

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
  }
})

onUnmounted(() => {
  disconnectSocket()
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  padding: 2rem;
  background-color: #f5f5f5;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h2 {
  color: #333;
  margin: 0;
}

.stream-button {
  background-color: #891c1c;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.stream-button:hover:not(:disabled) {
  background-color: #6b1515;
}

.stream-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.stream-info, .chat-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h3 {
  color: #333;
  margin-top: 0;
  margin-bottom: 1rem;
}

.info-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

p {
  color: #333;
  margin: 0;
  padding: 0.5rem;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.chat-messages {
  height: 400px;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.message {
  margin-bottom: 0.5rem;
}

.username {
  font-weight: bold;
  color: #891c1c;
  margin-right: 0.5rem;
}

.content {
  color: #333;
}
</style> 