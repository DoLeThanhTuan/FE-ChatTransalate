<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>
          {{ isEditMode ? $t('USER_MANAGEMENT.MODAL.EDIT_TITLE') : $t('USER_MANAGEMENT.MODAL.CREATE_TITLE') }}
        </h2>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="user-form">
        <div class="form-group">
          <label>{{ $t('USER_MANAGEMENT.LABEL.USERNAME') }} *</label>
          <input
            v-model="localFormData.name"
            type="text"
            required
            :placeholder="$t('USER_MANAGEMENT.MODAL.USERNAME_PLACEHOLDER')"
          />
        </div>

        <div class="form-group">
          <label>{{ $t('USER_MANAGEMENT.LABEL.EMAIL') }} *</label>
          <input
            v-model="localFormData.email"
            type="email"
            required
            :placeholder="$t('USER_MANAGEMENT.MODAL.EMAIL_PLACEHOLDER')"
          />
        </div>

        <div class="form-group">
          <label>{{ $t('USER_MANAGEMENT.LABEL.PHONE') }}</label>
          <input
            v-model="localFormData.phone"
            type="tel"
            :placeholder="$t('USER_MANAGEMENT.MODAL.PHONE_PLACEHOLDER')"
          />
        </div>

        <div class="form-group">
          <label>{{ $t('USER_MANAGEMENT.LABEL.ROLE') }} *</label>
          <select v-model="localFormData.role" required>
            <option value="USER">{{ $t('USER_MANAGEMENT.MODAL.ROLE_USER') }}</option>
            <option value="ADMIN">{{ $t('USER_MANAGEMENT.MODAL.ROLE_ADMIN') }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ $t('USER_MANAGEMENT.LABEL.DEPARTMENT') }}</label>
          <select v-model="localFormData.departmentId">
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
        </div>

        <div v-if="!isEditMode" class="form-group">
          <label>{{ $t('USER_MANAGEMENT.LABEL.PASSWORD') }} *</label>
          <input
            v-model="localFormData.password"
            type="password"
            :required="!isEditMode"
            :placeholder="$t('USER_MANAGEMENT.MODAL.PASSWORD_PLACEHOLDER')"
          />
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn-cancel">
            {{ $t('USER_MANAGEMENT.BUTTON.CANCEL') }}
          </button>
          <button type="submit" class="btn-submit" :disabled="submitting">
            {{
              submitting ? $t('USER_MANAGEMENT.LABEL.PROCESSING') : isEditMode ? $t('USER_MANAGEMENT.BUTTON.UPDATE') : $t('USER_MANAGEMENT.BUTTON.CREATE')
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  formData: {
    type: Object,
    default: () => ({
      name: '',
      email: '',
      phone: '',
      role: '',
      password: '',
      departmentId: '',
    }),
  },
  departments: {
    type: Array,
    default: () => [],
  },
  submitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'submit'])

const localFormData = ref({ ...props.formData })

watch(
  () => props.formData,
  (newData) => {
    localFormData.value = { ...newData }
  },
  { deep: true }
)

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      localFormData.value = { ...props.formData }
    }
  }
)

const handleSubmit = () => {
  emit('submit', { ...localFormData.value })
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

.user-form {
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
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #891c1c;
}

.form-group input::placeholder {
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

