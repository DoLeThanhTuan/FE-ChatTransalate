<template>
  <div v-if="visible" class="modal-overlay dark">
    <div class="modal-content dark">
      <div class="modal-header">
        <h2>Create a new channel</h2>
        <span class="close-btn" @click="$emit('close')">×</span>
      </div>
      <div class="modal-body">
        <label class="modal-label">Channel name</label>
        <input
          v-model="channelName"
          :class="['modal-input', 'dark', { 'input-error': showError }]"
          placeholder="Enter a name for your new channel"
          @blur="validateName"
          @input="showError = false"
        />
        <div v-if="showError" class="input-error-message">
          Channel names must have at least 1 character.
        </div>
        <div class="modal-url-row">
          <span class="modal-url-label">URL:</span>
          <span v-if="!editingUrl" class="modal-url">{{ url }}</span>
          <input v-else v-model="urlEdit" class="modal-url-edit dark" />
          <span class="modal-url-edit-btn" @click="toggleEditUrl">{{
            editingUrl ? 'Save' : 'Edit'
          }}</span>
        </div>
        <div class="modal-section modal-public-group">
          <button
            :class="['public-btn', isPublic ? 'active' : null]"
            @click="isPublic = true"
          >
            <span class="icon">🌐</span>
            <div>
              <div class="public-title">Public Channel</div>
              <div class="public-desc">Anyone can join</div>
            </div>
            <span v-if="isPublic" class="checkmark">✔</span>
          </button>
          <button
            :class="['private-btn', !isPublic ? 'active' : null]"
            @click="isPublic = false"
          >
            <span class="icon">🔒</span>
            <div>
              <div class="public-title">Private Channel</div>
              <div class="public-desc">Only invited members</div>
            </div>
            <span v-if="!isPublic" class="checkmark">✔</span>
          </button>
        </div>
        <label class="modal-label" style="margin-top: 0.5rem"
          >Purpose <span class="optional">(optional)</span></label
        >
        <textarea
          v-model="purpose"
          class="modal-input dark"
          placeholder="Enter a purpose for this channel (optional)"
          rows="2"
        ></textarea>
        <div class="modal-checkbox-row"></div>
      </div>
      <div class="modal-actions">
        <button class="modal-cancel-btn" @click="$emit('close')">Cancel</button>
        <button
          class="modal-create-btn"
          :disabled="!channelName.trim()"
          @click="handleCreate"
        >
          Create channel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useChannelStore } from '@/stores/channelStore'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'
const props = defineProps({
  visible: Boolean,
})
const router = useRouter()
const channelStore = useChannelStore()
const emit = defineEmits(['close'])
const channelName = ref('')
const isPublic = ref(true)
const purpose = ref('')
const url = ref('https://techchat.techzen.vn/chemgio/channels/')
const editingUrl = ref(false)
const urlEdit = ref('')
const showError = ref(false)

function toggleEditUrl() {
  if (editingUrl.value) {
    url.value = urlEdit.value || url.value
  } else {
    urlEdit.value = url.value
  }
  editingUrl.value = !editingUrl.value
}

function validateName() {
  showError.value = !channelName.value.trim()
}

const resetForm = () => {
  channelName.value = ''
  isPublic.value = true
  purpose.value = ''
  showError.value = false
}

const handleCreate = async () => {
  if (!channelName.value.trim()) {
    showError.value = true
    return
  }
  const data = {
    name: channelName.value.trim(),
    isPublic: isPublic.value,
    description: purpose.value,
    url: url.value,
  }
  try {
    const res = await channelStore.createChannel(data)
    if (res) {
      resetForm()
      await router.push(`/chat-view/${res.id}`)
      toast.success('Tạo channel thành công!')
      emit('close')
    } else {
      toast.warning('Channel đã tồn tại')
    }
  } catch (e) {
    toast.error('Lỗi trong quá trình tạo')
  }
}
watch(
  () => props.visible,
  (v) => {
    if (!v) {
      channelName.value = ''
      isPublic.value = true
      purpose.value = ''
      editingUrl.value = false
      urlEdit.value = ''
      showError.value = false
    }
  }
)
</script>

<style scoped>
.modal-overlay.dark {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 14, 22, 0.95);
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
  box-shadow: 0 2px 24px rgba(0, 0, 0, 0.35);
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
  font-size: 2rem;
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
  padding: 0 2rem 0.5rem 2rem;
}
.modal-label {
  font-size: 0.98rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  color: #e0e6f3;
  letter-spacing: 0.01em;
}
.optional {
  color: #b0b8d1;
  font-weight: 400;
  font-size: 0.95em;
}
.modal-input.dark,
.modal-url-edit,
textarea.modal-input.dark {
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
.modal-input.dark:focus,
.modal-url-edit:focus,
textarea.modal-input.dark:focus {
  border: 1.5px solid #4fc3f7;
  outline: none;
  box-shadow: 0 0 0 2px #4fc3f733;
}
.input-error {
  border: 1.5px solid #e74c3c !important;
  background: #2a1a1a !important;
}
.input-error-message {
  color: #e74c3c;
  font-size: 0.93rem;
  margin-bottom: 0.3rem;
  margin-top: -0.1rem;
  padding-left: 2px;
}
textarea.modal-input.dark::placeholder,
.modal-input.dark::placeholder {
  color: #b0b8d1;
  opacity: 1;
}
.modal-url-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.97rem;
  margin-bottom: 0.2rem;
}
.modal-url-label {
  color: #b0b8d1;
}
.modal-url {
  color: #4fc3f7;
  word-break: break-all;
}
.modal-url-edit {
  background: #181c27;
  color: #fff;
  border: 1.5px solid #2c3144;
  border-radius: 8px;
  padding: 0.3rem 0.7rem;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}
.modal-url-edit-btn {
  color: #4fc3f7;
  cursor: pointer;
  font-size: 0.97rem;
  font-weight: 500;
  margin-left: 0.2rem;
  user-select: none;
}
.modal-url-edit-btn:hover {
  text-decoration: underline;
}
.modal-section.modal-public-group {
  display: flex;
  gap: 1rem;
  margin: 1rem 0 0.5rem 0;
  flex-wrap: wrap;
}
.public-btn,
.private-btn {
  min-width: 120px;
  flex: 1 1 0;
  max-width: 48%;
  box-sizing: border-box;
  justify-content: flex-start;
  background: #181c27;
  color: #fff;
  border: 1.5px solid #2c3144;
  border-radius: 8px;
  padding: 1.1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  position: relative;
  transition: border 0.2s, background 0.2s, color 0.2s;
  font-size: 1rem;
}
.public-btn.active,
.private-btn.active {
  border: 2px solid #4fc3f7;
  background: #232e4a;
  color: #4fc3f7;
}
.public-btn:hover,
.private-btn:hover {
  border: 2px solid #4fc3f7;
  background: #232e4a;
  color: #4fc3f7;
}
.public-title {
  font-weight: 600;
  font-size: 1.05rem;
}
.public-desc {
  font-size: 0.93rem;
  color: #b0b8d1;
}
.checkmark {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #4fc3f7;
  font-size: 1.2rem;
}
.icon {
  font-size: 1.5rem;
}
.modal-checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0 0.2rem 0;
}
.info-icon {
  background: #181c27;
  color: #4fc3f7;
  border-radius: 50%;
  font-size: 0.95rem;
  padding: 0 0.3rem;
  margin-left: 0.2rem;
  cursor: pointer;
  border: 1px solid #4fc3f7;
  display: inline-block;
}
.modal-actions {
  display: flex;
  gap: 0.7rem;
  justify-content: flex-end;
  padding: 1.2rem 2rem 1.5rem 2rem;
  background: transparent;
}
.modal-create-btn {
  background: #4fc3f7;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.modal-create-btn:disabled {
  background: #2c3144;
  color: #b0b8d1;
  cursor: not-allowed;
}
.modal-create-btn:not(:disabled):hover {
  background: #1b9edb;
}
.modal-cancel-btn {
  background: #181c27;
  color: #b0b8d1;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.modal-cancel-btn:hover {
  background: #232e4a;
  color: #fff;
}
@media (max-width: 600px) {
  .modal-content.dark {
    max-width: 98vw;
    min-width: unset;
    border-radius: 10px;
    font-size: 0.92rem;
    margin: 0 auto;
  }
  .modal-header h2 {
    font-size: 1.1rem;
  }
  .modal-label,
  .public-title,
  .public-desc,
  .modal-url-label,
  .modal-url,
  .modal-url-edit-btn {
    font-size: 0.9rem;
  }
  .modal-create-btn,
  .modal-cancel-btn {
    font-size: 0.95rem;
  }
  .public-btn,
  .private-btn,
  .modal-input.dark,
  .modal-url-edit,
  textarea.modal-input.dark {
    font-size: 0.92rem;
  }
  .modal-header,
  .modal-body,
  .modal-actions {
    padding-left: 0.7rem;
    padding-right: 0.7rem;
  }
  .modal-actions {
    flex-direction: column;
    gap: 0.7rem;
    align-items: stretch;
    padding-bottom: 1rem;
  }
  .modal-create-btn,
  .modal-cancel-btn {
    width: 100%;
    box-sizing: border-box;
  }
  .modal-section.modal-public-group {
    flex-direction: column;
    gap: 0.7rem;
  }
  .public-btn,
  .private-btn {
    max-width: 100%;
    min-width: 0;
    width: 100%;
    font-size: 1.05rem;
    padding: 1.1rem 1rem;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }
  .icon {
    font-size: 2rem;
    margin-right: 0.7rem;
  }
  .checkmark {
    right: 18px;
    font-size: 1.3rem;
  }
  .modal-body {
    gap: 0.7rem;
  }
  textarea.modal-input.dark,
  .modal-input.dark,
  .modal-url-edit {
    padding: 0.6rem 0.7rem;
  }
}
textarea.modal-input.dark {
  resize: vertical;
  min-height: 2.8em;
}
</style>
