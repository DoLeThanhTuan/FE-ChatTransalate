<template>
  <div v-if="visible" class="modal-overlay dark">
    <div class="modal-content dark">
      <div class="modal-header">
        <h2>Translate</h2>

        <span class="close-btn" @click="$emit('close')">×</span>
      </div>

      <div class="modal-body">
        <label class="modal-label">Văn bản nguồn</label>

        <textarea
          v-model="sourceText"
          class="modal-input dark"
          placeholder="Nhập văn bản..."
          rows="8"
        ></textarea>

        <div class="controls-row">
          <div class="language-select">
            <select v-model="selectedLanguage" class="select dark">
              <option
                v-for="lang in languages"
                :key="lang.value"
                :value="lang.value"
              >
                {{ lang.label }}
              </option>
            </select>
          </div>

          <button class="translate-btn" @click="handleTranslate">Dịch</button>
        </div>

        <textarea
          v-model="translatedText"
          class="modal-input dark"
          placeholder="Bản dịch sẽ hiển thị ở đây"
          rows="8"
          readonly
        ></textarea>
      </div>

      <div class="modal-actions">
        <button class="modal-cancel-btn" @click="$emit('close')">Đóng</button>
        <button class="modal-cancel-btn" @click="confirm">Xác nhận</button>
      </div>
    </div>
  </div>
  <VueLoading v-model:active="isLoading" :can-cancel="false" loader="dots" />
</template>

<script setup>
import { ref, watch } from 'vue'
import { aiApi } from '@/axios/api-services/aiApi'
import { toast } from 'vue3-toastify'

const props = defineProps({
  visible: { type: Boolean, default: false },
  content: { type: String, default: '' },
  languages: {
    type: Array,
    default: () => [
      { value: 'ENGLISH', label: 'EN' },
      { value: 'VIETNAMESE', label: 'VI' },
      { value: 'JAPAN', label: 'JP' },
    ],
  },
})

const emit = defineEmits(['close', 'confirm'])
const isLoading = ref(false)
const sourceText = ref('')
const translatedText = ref('')
const selectedLanguage = ref('ENGLISH')

watch(
  () => props.visible,
  (v) => {
    if (v) {
      sourceText.value = props.content || ''
      translatedText.value = ''
      selectedLanguage.value = 'ENGLISH'
    }
  }
)

const handleTranslate = async () => {
  isLoading.value = true
  try {
    const params = {
      language: selectedLanguage.value,
      content: sourceText.value,
    }
    const response = await aiApi.translateMessage(params)
    if (!response.data.success) {
      toast.error('Có lỗi xảy ra vui lòng thử lại')
    } else {
      translatedText.value = response.data.content
    }
  } catch {
    console.error('Translate error!')
    toast.error('Có lỗi xảy ra vui lòng thử lại')
  } finally {
    isLoading.value = false
  }
}

const confirm = () => {
  emit('confirm', translatedText.value)
  emit('close')
}
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

  max-width: 720px;

  margin: 0 auto;

  box-shadow: 0 2px 24px rgba(0, 0, 0, 0.35);

  display: grid;

  grid-template-rows: auto auto auto;

  padding: 0;

  max-height: 95vh;

  overflow-x: hidden;

  overflow-y: auto;
}

.modal-header {
  display: flex;

  align-items: center;

  justify-content: space-between;

  padding: 1.5rem 2rem 0.5rem 2rem;

  position: sticky;

  top: 0;

  background: #23293a;

  z-index: 1;
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

  gap: 0.8rem;

  padding: 0 2rem 1rem 2rem;

  min-height: 0;
}

.modal-label {
  font-size: 0.95rem;

  font-weight: 600;

  color: #e0e6f3;

  margin-top: 0.2rem;
}

.modal-input.dark {
  background: #181c27;

  color: #fff;

  border: 1.5px solid #2c3144;

  border-radius: 10px;

  padding: 0.8rem 1rem;

  font-size: 1rem;

  width: 100%;

  box-sizing: border-box;

  transition: border 0.2s, box-shadow 0.2s;

  resize: vertical;
}

.modal-input.dark:focus {
  border: 1.5px solid #4fc3f7;

  outline: none;

  box-shadow: 0 0 0 2px #4fc3f733;
}

.controls-row {
  display: flex;

  align-items: center;

  justify-content: center;
}

.select.dark {
  background: #181c27;

  color: #fff;

  border: 1.5px solid #2c3144;

  border-radius: 8px;

  padding: 0.55rem 0.3rem;

  font-size: 0.98rem;
}

.translate-btn {
  background: #243996;

  color: #fff;

  border: none;

  border-radius: 8px;

  padding: 0.6rem 1.2rem;

  font-weight: 700;

  font-size: 0.98rem;

  cursor: pointer;

  transition: background 0.2s;

  margin-left: 15px;
}

.translate-btn:hover {
  background: #1b2d7a;
}

.modal-actions {
  display: flex;
  gap: 10px;

  justify-content: flex-end;

  padding: 0 2rem 1.2rem 2rem;

  position: sticky;

  bottom: 0;

  background: #23293a;

  z-index: 1;
}

.modal-cancel-btn {
  background: #181c27;

  color: #b0b8d1;

  border: none;

  border-radius: 8px;

  padding: 0.7rem 1.2rem;

  font-weight: 600;

  font-size: 0.98rem;

  cursor: pointer;
}

.modal-cancel-btn:hover {
  background: #232e4a;

  color: #fff;
}

@media (max-width: 600px) {
  .modal-content.dark {
    max-width: 98vw;

    border-radius: 10px;

    max-height: 95vh;
  }

  .modal-body {
    padding-left: 0.8rem;

    padding-right: 0.8rem;

    overflow-y: auto;
  }
}
</style>
