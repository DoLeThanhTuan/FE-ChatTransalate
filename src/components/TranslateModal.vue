<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ $t('COMPONENT.TRANSLATE_MODAL.TITLE') }}</h2>

        <span class="close-btn" @click="$emit('close')">×</span>
      </div>

      <div class="modal-body">
        <label class="modal-label">{{
          $t('COMPONENT.TRANSLATE_MODAL.SOURCE_LABEL')
        }}</label>

        <textarea
          v-model="sourceText"
          class="modal-input"
          :placeholder="$t('COMPONENT.TRANSLATE_MODAL.SOURCE_PLACEHOLDER')"
          rows="8"
        ></textarea>

        <div class="controls-row">
          <div class="language-select">
            <select v-model="selectedLanguage" class="select">
              <option
                v-for="lang in languages"
                :key="lang.value"
                :value="lang.value"
              >
                {{ lang.label }}
              </option>
            </select>
          </div>

          <button class="translate-btn" @click="handleTranslate">
            {{ $t('COMPONENT.TRANSLATE_MODAL.TRANSLATE_BUTTON') }}
          </button>
        </div>

        <textarea
          v-model="translatedText"
          class="modal-input"
          :placeholder="$t('COMPONENT.TRANSLATE_MODAL.RESULT_PLACEHOLDER')"
          rows="8"
          readonly
        ></textarea>
      </div>

      <div class="modal-actions">
        <button class="modal-cancel-btn" @click="$emit('close')">
          {{ $t('COMPONENT.TRANSLATE_MODAL.CLOSE') }}
        </button>
        <button class="modal-cancel-btn" @click="confirm">
          {{ $t('COMPONENT.TRANSLATE_MODAL.CONFIRM') }}
        </button>
      </div>
    </div>
  </div>
  <VueLoading v-model:active="isLoading" :can-cancel="false" loader="dots" />
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { aiApi } from '@/axios/api-services/aiApi'
import { toast } from 'vue3-toastify'

const { t } = useI18n()

const props = defineProps({
  visible: { type: Boolean, default: false },
  content: { type: String, default: '' },
  languageDefault: { type: String, default: '' },
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
const selectedLanguage = ref(props.languageDefault)

watch(
  () => props.visible,
  (v) => {
    if (v) {
      sourceText.value = props.content || ''
      translatedText.value = ''
      selectedLanguage.value = props.languageDefault || 'ENGLISH'
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
      toast.error(t('COMPONENT.TRANSLATE_MODAL.ERROR'))
    } else {
      translatedText.value = response.data.content
    }
  } catch {
    console.error('Translate error!')
    toast.error(t('COMPONENT.TRANSLATE_MODAL.ERROR'))
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
  max-width: 720px;
  margin: 0 auto;
  box-shadow: 0 2px 24px var(--shadow);
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
  background: var(--bg-active);
  z-index: 1;
}

.modal-header h2 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin: 0;
}

.close-btn {
  font-size: var(--font-size-xl);
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
  gap: 0.8rem;
  padding: 0 2rem 1rem 2rem;
  min-height: 0;
}

.modal-label {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 0.2rem;
  letter-spacing: 0.01em;
}

.modal-input {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1.5px solid var(--border-primary);
  border-radius: 8px;
  padding: 0.8rem 1rem;
  font-size: var(--font-size-base);
  width: 100%;
  box-sizing: border-box;
  transition: border 0.2s, box-shadow 0.2s;
  resize: vertical;
}

.modal-input:focus {
  border: 1.5px solid var(--special-text-color);
  outline: none;
  box-shadow: 0 0 0 2px var(--special-text-color);
}

.modal-input::placeholder {
  color: var(--text-secondary);
  opacity: 1;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.select {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1.5px solid var(--border-primary);
  border-radius: 8px;
  padding: 0.55rem 0.3rem;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: border 0.2s, box-shadow 0.2s;
}

.select:focus {
  border: 1.5px solid var(--special-text-color);
  outline: none;
  box-shadow: 0 0 0 2px var(--special-text-color);
}

.translate-btn {
  background: var(--special-text-color, #53ac5a);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: background 0.2s;
  margin-left: 15px;
}

.translate-btn:hover {
  filter: brightness(1.15);
}

.modal-actions {
  display: flex;
  gap: 0.7rem;
  justify-content: flex-end;
  padding: 0 2rem 1.2rem 2rem;
  position: sticky;
  bottom: 0;
  background: var(--bg-active);
  z-index: 1;
}

.modal-cancel-btn {
  background: var(--border-secondary);
  color: var(--text-secondary);
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-weight: 600;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.modal-cancel-btn:hover {
  filter: brightness(1.15);
}

@media (max-width: 600px) {
  .modal-content {
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
