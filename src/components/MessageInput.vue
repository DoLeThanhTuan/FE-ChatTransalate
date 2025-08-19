<template>
  <div class="message-input-bar">
    <div v-if="uploadError" class="upload-error">
      {{ uploadError }}
    </div>
    <div v-if="selectedFiles.length > 0" class="files-preview">
      <div class="files-header">
        <span>{{ selectedFiles.length }} file(s)</span>
        <button class="remove-all-files" @click="removeAllFiles">Xóa tất cả</button>
      </div>
      <div class="files-list">
        <div v-for="(file, index) in selectedFiles" 
             :key="index" 
             class="file-item">
          <div class="file-info">
            <span class="file-icon">📎</span>
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
          <button class="remove-file" @click="removeFile(index)" title="Xóa file">×</button>
        </div>
      </div>
    </div>
    <div class="input-container">
      <textarea 
        class="msg-input" 
        v-model="message.content" 
        placeholder="Message..." 
        @keydown="handleKeyDown"
        @input="onInput"
        rows="1"
        ref="textareaRef"
      ></textarea>
      <div v-if="showUserDropdown && filteredMembers.length > 0" class="mention-dropdown">
        <div
          v-for="user in filteredMembers"
          :key="user.id"
          class="mention-item"
          @click="selectUser(user)"
        >
          <img :src="getURLAvatar(user.avatar)" class="mention-avatar" />
          <div class="mention-item_info">
            <span>{{ user.name }}</span>
            <span class="mention-email">{{ user.email }}</span>
          </div>
        </div>
      </div>
      <div class="msg-actions">
        <div class="emoji-picker-container">
          <button class="action-btn" @click="toggleEmojiPicker">😊</button>
          <div v-if="showEmojiPicker" class="emoji-picker">
            <div class="emoji-picker-header">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Tìm emoji..." 
                class="emoji-search"
              >
              <div class="emoji-categories">
                <button 
                  v-for="(emojis, category) in emojiCategories" 
                  :key="category"
                  :class="['category-btn', { active: currentCategory === category }]"
                  @click="currentCategory = category"
                >
                  {{ emojis[0] }}
                </button>
              </div>
            </div>
            <div class="emoji-grid">
              <div v-for="emoji in filteredEmojis" 
                   :key="emoji" 
                   class="emoji" 
                   @click="addEmoji(emoji)">
                {{ emoji }}
              </div>
            </div>
          </div>
        </div>
        <label class="action-btn" title="Gửi file">
          📎
          <input 
            type="file" 
            multiple
            @change="handleFileUpload" 
            style="display: none"
          >
        </label>
        <button @click="sendMessage" class="send-btn" :disabled="isLoading">
          {{ isLoading ? '⌛' : '▶' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import { send } from '@/socket/socketService';
import { fileApi } from '@/axios/api-services/fileApi';
import { useChannelStore } from '@/stores/channelStore';
import { getURLAvatar } from '@/utils/image';
import { removeVietnameseTones } from '@/utils/string';

const message = ref({
  content: "",
})
const textareaRef = ref(null);
const showEmojiPicker = ref(false);
const selectedFiles = ref([]);
const currentCategory = ref('emotions');
const searchQuery = ref('');
const channelStore = useChannelStore();
const showUserDropdown = ref(false);
const mentionQuery = ref('');
const caretPosition = ref(0);
const members = computed(() => channelStore.channelCurrent?.members || []);
console.log('members', members.value);
const filteredMembers = computed(() =>
  members.value.filter(m =>
    removeVietnameseTones(m.name.toLowerCase()).includes(removeVietnameseTones(mentionQuery.value.toLowerCase())) ||
    removeVietnameseTones(m.email.toLowerCase()).includes(removeVietnameseTones(mentionQuery.value.toLowerCase()))
  )
);

const MAX_FILES = 5;

const emojiCategories = {
  emotions: ['😊', '😂', '😍', '😢', '😡', '😴', '🤔', '😎', '🥳', '😭', '😱', '🤯', '😇', '🥺', '😤'],
  animals: ['🐶', '🐱', '🦁', '🐼', '🦊', '🦒', '🦘', '🦜', '🦢', '🦋', '🐢', '🐙', '🦈', '🦉', '🦄'],
  food: ['🍕', '🍔', '🍜', '🍣', '🍱', '🍙', '🍚', '🍘', '🍥', '🥟', '🍤', '🍗', '🍖', '🥩', '🥓'],
  activities: ['⚽', '🎮', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎹', '🎺', '🎻', '🎬', '🎭', '🎪', '🎨'],
  symbols: ['❤️', '⭐', '💯', '✨', '🌟', '💫', '💥', '🔥', '💪', '🙏', '👏', '👍', '🎉', '🏆', '💎']
};

const filteredEmojis = computed(() => {
  if (!searchQuery.value) {
    return emojiCategories[currentCategory.value];
  }
  return Object.values(emojiCategories)
    .flat()
    .filter(emoji => emoji.includes(searchQuery.value));
});

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const removeAllFiles = () => {
  selectedFiles.value = [];
};

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files);
  if (selectedFiles.value.length + files.length > MAX_FILES) {
    alert(`Chỉ được chọn tối đa ${MAX_FILES} file`);
    return;
  }
  selectedFiles.value.push(...files);
};

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
  if (showEmojiPicker.value) {
    searchQuery.value = '';
  }
};

const addEmoji = (emoji) => {
  const textarea = textareaRef.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  message.value.content = 
    message.value.content.substring(0, start) + 
    emoji + 
    message.value.content.substring(end);
  
  nextTick(() => {
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
  });
  
  showEmojiPicker.value = false;
};

const handleKeyDown = (event) => {
  if (event.key === 'Enter') {
    if (event.ctrlKey) {
      // Ctrl+Enter: Insert new line
      const start = event.target.selectionStart;
      const end = event.target.selectionEnd;
      message.value.content = message.value.content.substring(0, start) + '\n' + message.value.content.substring(end);
      // Move cursor after the new line
      nextTick(() => {
        event.target.selectionStart = event.target.selectionEnd = start + 1;
      });
    } else {
      // Enter: Send message
      event.preventDefault();
      sendMessage();
    }
  }
}

const isLoading = ref(false);
const uploadError = ref(null);

const uploadFiles = async (files) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fileApi.uploadFile(formData);

    return response.data;
  } catch (error) {
    console.error('Error uploading files:', error);
    uploadError.value = 'Có lỗi trong quá trình upload file.';
  }
};

const sendMessage = async () => {
  if (message.value.content.trim() || selectedFiles.value.length > 0) {
    try {
      isLoading.value = true;
      uploadError.value = null;

      showUserDropdown.value = false
      channelStore.sendMessage({
        content: message.value.content,
        files: selectedFiles.value,
        channelId: channelStore.channelCurrent.id,
        uploadFiles: uploadFiles
      })
      // send(`/app/chat/send/${channelStore.channelCurrent?.id}`, messageData);
      message.value.content = ""; // Clear input after sending
      selectedFiles.value = []; // Clear selected files
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      isLoading.value = false;
    }
  }
}

const adjustTextareaHeight = () => {
  const textarea = textareaRef.value;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}

watch(() => message.value.content, () => {
  nextTick(adjustTextareaHeight);
});

function onInput(e) {
  const value = e.target.value;
  const pos = e.target.selectionStart;
  caretPosition.value = pos;
  const lastAt = value.lastIndexOf('@', pos - 1);
  if (lastAt !== -1 && (lastAt === 0 || /\s/.test(value[lastAt - 1]))) {
    const query = value.slice(lastAt + 1, pos);
    if (query.length >= 0) {
      mentionQuery.value = query;
      showUserDropdown.value = true;
      console.log('onInput', {mentionQuery: mentionQuery.value, filteredMembers: filteredMembers.value, showUserDropdown: showUserDropdown.value});
      return;
    }
  }
  showUserDropdown.value = false;
  console.log('onInput', {mentionQuery: mentionQuery.value, filteredMembers: filteredMembers.value, showUserDropdown: showUserDropdown.value});
}

function selectUser(user) {
  const textarea = textareaRef.value;
  const value = textarea.value;
  const pos = caretPosition.value;
  const lastAt = value.lastIndexOf('@', pos - 1);
  if (lastAt !== -1) {
    const before = value.slice(0, lastAt + 1);
    const after = value.slice(pos);
    textarea.value = before + user.name + ' ' + after;
    message.value.content = textarea.value;
    textarea.focus();
    showUserDropdown.value = false;
    mentionQuery.value = '';
  }
}

</script>

<style scoped>
.message-input-bar {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary, #f4f4f4);
  border-top: 1px solid #e0e0e0;
  padding: 0.7rem 2rem;
  gap: 0.5rem;
}

.input-container {
  position: relative;
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.files-preview {
  background: #f3f4f8;
  border-radius: 6px;
  padding: 0.5rem;
  margin: 0.2rem 0;
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.remove-all-files {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.remove-all-files:hover {
  background: #ffebee;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 4px;
  padding: 0.4rem;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.file-name {
  font-weight: 500;
  color: #1976d2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  color: #666;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.remove-file {
  background: none;
  border: none;
  color: #666;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  flex-shrink: 0;
  transition: background-color 0.2s;
}

.remove-file:hover {
  background: #e0e0e0;
}

.msg-input {
  flex: 1;
  padding: 0.275rem 1.2rem;
  border-radius: 7px;
  border: 1px solid #e0e0e0;
  font-size: 1rem;
  background: #f7fafd;
  color: #23272f;
  resize: none;
  max-height: 150px;
  overflow-y: auto;
  line-height: 1.5;
  transition: height 0.1s ease;
  outline: none;
  word-break: break-word;
}

.msg-actions {
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
  align-items: flex-end;
}

.action-btn {
  background: #f3f4f8;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0;
  font-size: 1.1rem;
  color: #23272f;
  cursor: pointer;
  width: 36px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #e0e0e0;
}

.send-btn {
  background: #1ed760;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0;
  font-size: 1.1rem;
  cursor: pointer;
  font-weight: bold;
  width: 36px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.send-btn:hover {
  background: #159c4c;
}

.emoji-picker-container {
  position: relative;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  margin-bottom: 10px;
  width: 280px;
  transform: translateX(0);
}

.emoji-picker-header {
  margin-bottom: 10px;
}

.emoji-search {
  width: 100%;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.emoji-categories {
  display: flex;
  gap: 5px;
  margin-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 8px;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.emoji-categories::-webkit-scrollbar {
  display: none;
}

.category-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  font-size: 1.2rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  flex-shrink: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.category-btn:focus {
  outline: none;
}

.category-btn:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.category-btn:hover {
  background-color: #f0f0f0;
}

.category-btn.active {
  background-color: #e0e0e0;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.emoji {
  cursor: pointer;
  padding: 4px;
  text-align: center;
  font-size: 1.2em;
  transition: background-color 0.2s;
  border-radius: 4px;
}

.emoji:hover {
  background-color: #f0f0f0;
}

/* Tablet */
@media (max-width: 768px) {
  .message-input-bar {
    padding: 0.5rem 1rem;
    gap: 0.4rem;
  }
  
  .input-container {
    gap: 0.4rem;
    align-items: flex-end;
  }
  
  .files-preview {
    padding: 0.4rem;
  }
  
  .files-header {
    font-size: 0.85rem;
  }
  
  .file-item {
    padding: 0.3rem;
  }
  
  .file-name {
    font-size: 0.85rem;
  }
  
  .file-size {
    font-size: 0.8rem;
  }
  
  .msg-input {
    padding: 0.2rem 0.8rem;
    font-size: 0.95rem;
    min-height: 32px;
  }
  
  .msg-actions {
    gap: 0.25rem;
  }
  
  .action-btn,
  .send-btn {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  
  .emoji-picker {
    width: 260px;
  }
  
  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .emoji {
    font-size: 1.1em;
  }
}

/* Mobile */
@media (max-width: 400px) {
  .message-input-bar {
    padding: 0.3rem 0.6rem;
    gap: 0.3rem;
  }
  
  .input-container {
    gap: 0.3rem;
    align-items: flex-end;
  }
  
  .files-preview {
    padding: 0.3rem;
    margin: 0.1rem 0;
  }
  
  .files-header {
    font-size: 0.8rem;
    margin-bottom: 0.3rem;
  }
  
  .file-item {
    padding: 0.25rem;
  }
  
  .file-name {
    font-size: 0.8rem;
  }
  
  .file-size {
    font-size: 0.7rem;
  }
  
  .msg-input {
    padding: 0.15rem 0.6rem;
    font-size: 0.9rem;
    min-height: 28px;
  }
  
  .msg-actions {
    gap: 0.2rem;
  }
  
  .action-btn,
  .send-btn {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }
  
  .emoji-picker {
    width: 240px;
    right: -10px;
  }
  
  .emoji-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 3px;
  }
  
  .emoji {
    font-size: 1em;
    padding: 3px;
  }
  
  .emoji-search {
    padding: 6px;
    font-size: 0.85rem;
  }
  
  .category-btn {
    padding: 4px;
    font-size: 1.1rem;
  }
}

.upload-error {
  background-color: #ffebee;
  color: #c62828;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.send-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.send-btn:disabled:hover {
  background: #cccccc;
}

.mention-dropdown {
  position: absolute;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 6px;
  z-index: 9999;
  max-height: 200px;
  overflow-y: auto;
  width: 250px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  left: 0;
  bottom: 100%;
  margin-bottom: 6px;
}
.mention-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.7rem;
  cursor: pointer;
}
.mention-item:hover {
  background: #f3f4f8;
}
.mention-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}
.mention-email {
  color: #888;
  font-size: 0.9em;
}
.mention-item_info {
  color: #1976d2;;
  display: flex;
  gap: 1px;
  flex-direction: column;
}
</style> 