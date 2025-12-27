<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>
          {{ id ? 'Chỉnh sửa tổ chức' : 'Tạo tổ chức mới' }}
        </h2>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="organization-form">
        <div class="form-group">
          <label>Tên tổ chức *</label>
          <input
            v-model="organization.name"
            type="text"
            required
            placeholder="Nhập tên tổ chức"
          />
        </div>

        <div class="form-group">
          <label>Quốc gia *</label>
          <select v-model="organization.country" class="select dark">
            <option
              v-for="lang in languages"
              :key="lang.code"
              :value="lang.code"
            >
              {{ lang.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Mô tả</label>
          <textarea
            v-model="organization.description"
            rows="4"
            placeholder="Nhập mô tả tổ chức"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" @click="handleClose" class="btn-cancel">
            Hủy
          </button>
          <button
            type="submit"
            class="btn-submit"
            @click="handleSubmit"
            :disabled="isLoading"
          >
            {{ 'Cập nhật' }}
          </button>
        </div>
      </div>
    </div>
    <VueLoading v-model:active="isLoading" :can-cancel="false" loader="dots" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { organizationApi } from '@/axios/api-services/organizationApi'
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  id: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['close', 'submit'])
const isLoading = ref(false)
const organization = ref({
  name: '',
  country: '',
  description: '',
})
const languages = [
  {
    code: 'vi',
    name: 'Viet Nam',
    nativeName: 'Viet Nam',
    flag: '🇻🇳',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'jp',
    name: 'Japan',
    nativeName: 'Japan',
    flag: 'jp',
  },
]

watch(
  () => props.visible,
  async (newVal) => {
    if (newVal) {
      if (props.id) {
        isLoading.value = true
        const res = await organizationApi.getById(props.id)
        if (res.status == 200) {
          organization.value = res.data
        }
        isLoading.value = false
      } else {
        organization.value.name = ''
        organization.value.country = ''
        organization.value.description = ''
      }
      isLoading.value = false
    }
  }
)

const handleSubmit = async () => {
  try {
    isLoading.value = true
    emit('submit', organization.value)
  } catch (e) {
    console.error('Lỗi')
  } finally {
    isLoading.value = false
  }
}

const handleClose = () => {
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px var(--shadow);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  transition: border-color 0.3s ease;
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  transition: color 0.3s ease;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background-color: var(--hover-bg);
  color: var(--text-primary);
}

.organization-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  font-family: inherit;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #891c1c;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--text-secondary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background-color: var(--hover-bg);
}

.btn-submit {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background-color: #891c1c;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.btn-submit:hover:not(:disabled) {
  background-color: #6b1515;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

