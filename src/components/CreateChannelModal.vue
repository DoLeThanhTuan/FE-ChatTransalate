<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ $t('COMPONENT.CHANNEL.CREATE.TITLE') }}</h2>
        <span class="close-btn" @click="$emit('close')">×</span>
      </div>
      <div class="modal-body">
        <label class="modal-label">{{ $t('COMPONENT.CHANNEL.CREATE.NAME_LABEL') }}</label>
        <div>
          <input
            v-model="channelName"
            :class="['modal-input', { 'input-error': showError }]"
            :placeholder="$t('COMPONENT.CHANNEL.CREATE.NAME_PLACEHOLDER')"
          />
          <div v-if="showError" class="input-error-message">
            {{ $t('COMPONENT.CHANNEL.CREATE.NAME_ERROR') }}
          </div>
        </div>

        <div class="modal-url-row">
          <span class="modal-url-label">{{ $t('COMPONENT.CHANNEL.CREATE.URL_LABEL') }}</span>
          <span v-if="!editingUrl" class="modal-url">{{ url }}</span>
          <input v-else v-model="urlEdit" class="modal-url-edit dark" />
          <span class="modal-url-edit-btn" @click="toggleEditUrl">{{
            editingUrl ? $t('COMPONENT.CHANNEL.CREATE.SAVE_URL') : $t('COMPONENT.CHANNEL.CREATE.EDIT_URL')
          }}</span>
        </div>
        <div class="modal-section modal-public-group">
          <button
            :class="['public-btn', isPublic ? 'active' : null]"
            @click="isPublic = true"
          >
            <span class="icon">🌐</span>
            <div>
              <div class="public-title">{{ $t('COMPONENT.CHANNEL.CREATE.PUBLIC_TITLE') }}</div>
              <div class="public-desc">{{ $t('COMPONENT.CHANNEL.CREATE.PUBLIC_DESC') }}</div>
            </div>
            <span v-if="isPublic" class="checkmark">✔</span>
          </button>
          <button
            :class="['private-btn', !isPublic ? 'active' : null]"
            @click="isPublic = false"
          >
            <span class="icon">🔒</span>
            <div>
              <div class="public-title">{{ $t('COMPONENT.CHANNEL.CREATE.PRIVATE_TITLE') }}</div>
              <div class="public-desc">{{ $t('COMPONENT.CHANNEL.CREATE.PRIVATE_DESC') }}</div>
            </div>
            <span v-if="!isPublic" class="checkmark">✔</span>
          </button>
        </div>
        <label class="modal-label" style="margin-top: 0.5rem"
          >{{ $t('COMPONENT.CHANNEL.CREATE.DESCRIPTION_LABEL') }} <span class="optional">{{ $t('COMPONENT.CHANNEL.CREATE.OPTIONAL') }}</span></label
        >
        <textarea
          v-model="purpose"
          class="modal-input"
          :placeholder="$t('COMPONENT.CHANNEL.CREATE.DESCRIPTION_PLACEHOLDER')"
          rows="2"
        ></textarea>
        <div class="modal-checkbox-row"></div>
      </div>
      <div class="modal-actions">
        <button class="modal-cancel-btn" @click="$emit('close')">{{ $t('COMPONENT.CHANNEL.CREATE.CANCEL') }}</button>
        <button
          class="modal-create-btn"
          :disabled="!channelName.trim()"
          @click="handleCreate"
        >
          {{ $t('COMPONENT.CHANNEL.CREATE.CREATE') }}
        </button>
      </div>
    </div>
    <VueLoading v-model:active="isLoading" :can-cancel="false" loader="dots" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChannelStore } from '@/stores/channelStore'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'
import { TypeChat } from '@/config/enum'

const { t } = useI18n()
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
const isLoading = ref(false)

function toggleEditUrl() {
  if (editingUrl.value) {
    url.value = urlEdit.value || url.value
  } else {
    urlEdit.value = url.value
  }
  editingUrl.value = !editingUrl.value
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
  isLoading.value = true
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
      await router.push(`/chat-view/${TypeChat.CHANNEL}/${res.id}`)
      toast.success(t('COMPONENT.CHANNEL.CREATE.SUCCESS'))
      emit('close')
    } else {
      toast.warning(t('COMPONENT.CHANNEL.CREATE.EXISTS'))
    }
  } catch (e) {
    toast.error(t('COMPONENT.CHANNEL.CREATE.ERROR'))
  } finally {
    isLoading.value = false
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

:global(.dark) .modal-overlay {
  background: rgba(10, 14, 22, 0.95);
}

.modal-content {
  background: var(--bg-active);
  color: var(--text-primary);
  border-radius: 14px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 2px 24px var(--shadow);
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
  color: var(--text-primary);
  opacity: 0.7;
  transition: opacity 0.2s;
}
.close-btn:hover {
  opacity: 1;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 2rem 0.5rem 2rem;
}

.modal-label {
  font-size: 0.98rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  color: var(--text-primary);
  letter-spacing: 0.01em;
}
.optional {
  color: var(--text-secondary);
  font-weight: 400;
  font-size: 0.95em;
}

.modal-input,
.modal-url-edit,
textarea.modal-input {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1.5px solid var(--border-primary);
  border-radius: 8px;
  padding: 0.7rem 1rem;
  font-size: 1rem;
  margin-bottom: 0.2rem;
  width: 100%;
  box-sizing: border-box;
  transition: border 0.2s, box-shadow 0.2s;
}
.modal-input:focus,
.modal-url-edit:focus,
textarea.modal-input:focus {
  border: 1.5px solid var(--special-text-color);
  outline: none;
  box-shadow: 0 0 0 2px var(--special-text-color);
}

.input-error {
  border: 1.5px solid #e74c3c !important;
}
.input-error-message {
  color: #e74c3c;
  font-size: 0.93rem;
  margin-bottom: 0.3rem;
  padding-left: 2px;
}
textarea.modal-input::placeholder,
.modal-input::placeholder {
  color: var(--text-secondary);
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
  color: var(--text-secondary);
}
.modal-url {
  color: var(--special-text-color);
  word-break: break-all;
}
.modal-url-edit-btn {
  color: var(--special-text-color);
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
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1.5px solid var(--border-primary);
  border-radius: 8px;
  padding: 1.1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  position: relative;
  transition: border 0.2s, background 0.2s, color 0.2s;
  font-size: 1rem;
  outline: none;
}
.public-btn.active,
.private-btn.active {
  border: 2px solid var(--special-text-color, #53ac5a);
  background: var(--bg-active, #f4f4f4);
  color: var(--special-text-color, #53ac5a);
}
.public-btn:hover,
.private-btn:hover {
  border: 2px solid var(--special-text-color, #53ac5a);
  background: var(--bg-active, #f4f4f4);
  color: var(--special-text-color, #53ac5a);
}

.public-title {
  font-weight: 600;
  font-size: 1.05rem;
}
.public-desc {
  font-size: 0.93rem;
  color: var(--text-secondary, #666);
}
.checkmark {
  position: absolute;
  top: 10px;
  right: 10px;
  color: var(--special-text-color, #53ac5a);
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
  background: var(--bg-tertiary, #f3f4f8);
  color: var(--special-text-color, #53ac5a);
  border-radius: 50%;
  font-size: 0.95rem;
  padding: 0 0.3rem;
  margin-left: 0.2rem;
  cursor: pointer;
  border: 1px solid var(--special-text-color, #53ac5a);
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
  background: var(--border-secondary);
  color: var(--text-secondary);
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.modal-create-btn:hover {
  filter: brightness(1.15);
}
.modal-create-btn:disabled {
  background: var(--border-secondary);
  color: var(--text-secondary);
  cursor: not-allowed;
}
.modal-cancel-btn {
  background: var(--border-secondary);
  color: var(--text-secondary);
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.modal-cancel-btn:hover {
  filter: brightness(1.15);
}

@media (max-width: 600px) {
  .modal-content {
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
  .modal-input,
  .modal-url-edit,
  textarea.modal-input {
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
  textarea.modal-input,
  .modal-input,
  .modal-url-edit {
    padding: 0.6rem 0.7rem;
  }
}

textarea.modal-input {
  resize: vertical;
  min-height: 2.8em;
}
</style>
