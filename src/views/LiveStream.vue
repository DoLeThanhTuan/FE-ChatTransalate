<template>
  <div class="live-stream-container">
    <div class="stream-section">
      <div class="video-container">
        <video 
          v-if="isStreaming"
          ref="videoPlayer"
          class="video-player"
          controls
          autoplay
        ></video>
        <div v-else class="offline-placeholder">
          <img :src="offlineImage" alt="Stream Offline" />
          <p>Stream is currently offline</p>
        </div>
      </div>
      
      <div class="stream-controls">
        <button 
          v-if="isStreamer"
          @click="toggleStream"
          :class="['stream-btn', { 'is-live': isStreaming }]"
        >
          {{ isStreaming ? 'Stop Stream' : 'Start Stream' }}
        </button>
      </div>
    </div>

    <div class="chat-section">
      <div class="chat-messages" ref="chatContainer">
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          :class="['message', { 'own-message': message.isOwn }]"
        >
          <span class="username">{{ message.username }}:</span>
          <span class="content">{{ message.content }}</span>
        </div>
      </div>
      
      <div class="chat-input">
        <input 
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Type your message..."
        />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import offlineImage from '@/assets/image/CameraOff.png'

const route = useRoute()
const videoPlayer = ref(null)
const chatContainer = ref(null)
const newMessage = ref('')
const messages = ref([])
const isStreaming = ref(false)
const isStreamer = ref(false)
const ws = ref(null)

// WebSocket connection
const connectWebSocket = () => {
  ws.value = new WebSocket('ws://localhost:8080/ws/chat')
  
  ws.value.onmessage = (event) => {
    const message = JSON.parse(event.data)
    messages.value.push(message)
    scrollToBottom()
  }
  
  ws.value.onclose = () => {
    console.log('WebSocket connection closed')
    setTimeout(connectWebSocket, 1000) // Reconnect after 1 second
  }
}

// Stream handling
const toggleStream = async () => {
  if (isStreaming.value) {
    stopStream()
  } else {
    startStream()
  }
}

const startStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    if (videoPlayer.value) {
      videoPlayer.value.srcObject = stream
    }
    isStreaming.value = true
  } catch (err) {
    console.error('Error starting stream:', err)
  }
}

const stopStream = () => {
  if (videoPlayer.value && videoPlayer.value.srcObject) {
    videoPlayer.value.srcObject.getTracks().forEach(track => track.stop())
    videoPlayer.value.srcObject = null
  }
  isStreaming.value = false
}

// Chat handling
const sendMessage = () => {
  if (newMessage.value.trim() && ws.value) {
    const message = {
      username: 'User', // Replace with actual username
      content: newMessage.value,
      isOwn: true
    }
    ws.value.send(JSON.stringify(message))
    messages.value.push(message)
    newMessage.value = ''
    scrollToBottom()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

onMounted(() => {
  connectWebSocket()
  // Check if user is streamer (you can implement this based on your auth system)
  isStreamer.value = true // Temporary
})

onUnmounted(() => {
  stopStream()
  if (ws.value) {
    ws.value.close()
  }
})
</script>

<style scoped>
.live-stream-container {
  display: flex;
  height: 100vh;
  gap: 20px;
  padding: 20px;
}

.stream-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.video-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.offline-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.offline-placeholder img {
  width: 200px;
  height: auto;
  margin-bottom: 20px;
}

.stream-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.stream-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background: #ff0000;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

.stream-btn.is-live {
  background: #00ff00;
}

.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.message {
  margin-bottom: 10px;
  color: #fff;
}

.message.own-message {
  text-align: right;
}

.username {
  font-weight: bold;
  margin-right: 5px;
}

.chat-input {
  padding: 20px;
  display: flex;
  gap: 10px;
  background: #2a2a2a;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 20px;
  background: #3a3a3a;
  color: #fff;
}

.chat-input button {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background: #ff69b4;
  color: white;
  cursor: pointer;
}

@media (max-width: 768px) {
  .live-stream-container {
    flex-direction: column;
  }
  
  .stream-section {
    flex: none;
  }
}
</style> 