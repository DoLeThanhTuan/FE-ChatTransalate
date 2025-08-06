<template>
  <div class="main-layout">
    <aside class="sidebar">
      <h3>Channels</h3>
      <ul>
        <li
          v-for="channel in channels"
          :key="channel.id"
          :class="{ active: selectedChannel.id === channel.id }"
          @click="selectChannel(channel)"
        >
          # {{ channel.name }}
        </li>
      </ul>
    </aside>
    <section class="chat-section">
      <div class="chat-header">
        <h2>Live Chat</h2>
      </div>
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message-row', msg.email === message.email ? 'own-message' : null]"
        >
          <img
            class="avatar"
            :src="'http://localhost:8000/files/avatar/' + getAvatar(msg.email)"
            alt="avatar"
          />
          <div class="bubble-group">
            <div class="message-header">
              <span class="username">{{ msg.email }}</span>
              <span class="timestamp">{{ formatTime(msg.createdAt) }}</span>
            </div>
            <div class="message-bubble">{{ msg.content }}</div>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <input type="hidden" v-model="message.email" class="username-input" />
        <div class="message-input-container">
          <input
            type="text"
            v-model="message.content"
            placeholder="Type your message..."
            @keyup.enter="sendMessage"
            class="message-input"
          />
          <button @click="sendMessage" class="send-button">
            <span class="material-icons">send</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick } from "vue";
import { connectSocket, disconnectSocket, send } from "@/socket/socketService";
import { useAuthStore } from "@/stores/authStore";
import { messageApi } from "@/axios/api-services/messageApi.js";
import defaultAvatar from '@/assets/default-avatar.png'
import { fileApi } from "@/axios/api-services/fileApi";

const messages = ref([]);
const messagesContainer = ref(null);
const authStore = useAuthStore();

const message = ref({
  email: authStore.userInfo.email,
  avatar: authStore.userInfo.avatar,
  content: "",
});

const users = ref([])

// Channel sidebar data
const channels = ref([
  { id: 1, name: "General" },
  { id: 2, name: "DevOps" },
  { id: 3, name: "Frontend" },
  { id: 4, name: "Backend" },
]);
const selectedChannel = ref(channels.value[0]);
const selectChannel = (channel) => {
  selectedChannel.value = channel;
  // TODO: fetch messages for this channel nếu cần
};

const onInit = async () => {
  try {
    await connectSocket(authStore.token, (message) => {
      messages.value.push(message);
      console.log(message);
      console.log(messages.value);
      messages;
      scrollToBottom();
    });
    console.log("WebSocket ready, now you can send");
  } catch (err) {
    console.error("WebSocket failed to connect:", err);
  }
};

const getAvatar = (email) => {
  const user = users.value.find(u => u.email === email);
  return user?.avatar;
}

const fetchMessages = async () => {
  try {
    const response = await messageApi.getMessages();
    messages.value = response.data.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    users.value = response.data.users;
    console.log(users);
  } catch (err) {
    console.error("Fetch message error");
  }
};

const fetchAvatar = async(imageName) => {
  try{
    const response = await fileApi.getAvatar(imageName);
    return response.data;
  } catch {
    return defaultAvatar;
  }
}

const sendMessage = () => {
  if (!message.value.content.trim() || !message.value.email.trim()) return;
  send("/app/chat/send", message.value);
  message.value.content = "";
  scrollToBottom();
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const datePart = date.toLocaleDateString("vi-VN");
  const timePart = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${timePart} ${datePart}`
};

onMounted(async () => {
  await onInit();
  await fetchMessages();
  scrollToBottom();
});

onUnmounted(() => {
  disconnectSocket();
});
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  background: #f3f4f8;
}

.sidebar {
  width: 250px;
  background: #23272f;
  color: #fff;
  padding: 2rem 1rem 1rem 1rem;
  border-right: 2px solid #891c1c;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 2px 0 8px rgba(0,0,0,0.04);
  min-width: 200px;
}

.sidebar h3 {
  margin: 0 0 1.5rem 0.5rem;
  font-size: 1.15rem;
  letter-spacing: 1px;
  font-weight: 600;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 0.6rem 1rem;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 0.25rem;
  transition: background 0.2s, color 0.2s;
  font-size: 1rem;
  font-weight: 500;
}

.sidebar li.active,
.sidebar li:hover {
  background: #891c1c;
  color: #fff;
}

.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 900px;
  margin: 32px auto;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  overflow: hidden;
  min-width: 350px;
}

.chat-header {
  padding: 1.2rem 2rem;
  background: #1a1a1a;
  color: white;
  border-radius: 14px 14px 0 0;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

.chat-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.2rem 2rem 1.2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: #f7fafd;
  min-height: 300px;
  max-height: 60vh;
}

.message-row {
  display: flex;
  align-items: flex-end;
  margin-bottom: 0.7rem;
  gap: 0.7rem;
}

.own-message {
  flex-direction: row-reverse;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.bubble-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 70vw;
}

.own-message .bubble-group {
  align-items: flex-end;
}

.message-header {
  display: flex;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 2px;
}

.username {
  font-weight: bold;
  color: #333;
}

.timestamp {
  font-size: 0.8rem;
  color: #666;
}

.message-bubble {
  background: #fff;
  color: #222;
  padding: 0.7rem 1.1rem;
  border-radius: 18px 18px 18px 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  font-size: 1.05rem;
  word-break: break-word;
  max-width: 100%;
  min-width: 40px;
  transition: background 0.2s;
}

.own-message .message-bubble {
  background: #e3f2fd;
  color: #222;
  border-radius: 18px 18px 4px 18px;
  text-align: right;
}

.own-message .message-header {
  flex-direction: row-reverse;
}

.own-message .username {
  color: #1976d2;
}

.chat-input {
  padding: 1rem 2rem;
  background-color: #f7fafd;
  border-top: 1px solid #eee;
  border-radius: 0 0 14px 14px;
}

.username-input {
  width: 100%;
  padding: 0.3rem;
  margin-bottom: 0.3rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.message-input-container {
  display: flex;
  gap: 0.5rem;
}

.message-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: #fff;
  transition: border 0.2s;
}

.message-input:focus {
  border: 1.5px solid #1976d2;
  outline: none;
}

.send-button {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: background 0.2s;
}

.send-button:hover {
  background-color: #1256a3;
}

/* Scrollbar styling */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
