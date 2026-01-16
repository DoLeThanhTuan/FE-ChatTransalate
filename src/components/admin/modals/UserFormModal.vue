<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>
          {{
            isEditMode
              ? $t('USER_MANAGEMENT.MODAL.EDIT_TITLE')
              : $t('USER_MANAGEMENT.MODAL.CREATE_TITLE')
          }}
        </h2>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="user-form">
        <div class="form-group">
          <label for="avatar">{{ $t('USER_MANAGEMENT.LABEL.AVATAR') }}</label>
          <div class="avatar-upload">
            <img
              :src="avatarPreview || defaultAvatar"
              class="avatar-preview"
              alt="Avatar preview"
            />
            <input
              type="file"
              id="avatar"
              @change="handleAvatarChange"
              accept="image/*"
              class="avatar-input"
            />
            <label for="avatar" class="avatar-label">
              {{
                avatarPreview
                  ? $t('USER_MANAGEMENT.MODAL.CHANGE_AVATAR')
                  : $t('USER_MANAGEMENT.MODAL.SELECT_AVATAR')
              }}
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="name">{{ $t('USER_MANAGEMENT.LABEL.USERNAME') }} *</label>
          <input
            id="name"
            v-model="localFormData.name"
            type="text"
            required
            :class="{ 'input-error': errors.name }"
            :placeholder="$t('USER_MANAGEMENT.MODAL.USERNAME_PLACEHOLDER')"
            @blur="validateField('name')"
          />
          <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="email">{{ $t('USER_MANAGEMENT.LABEL.EMAIL') }} *</label>
          <input
            id="email"
            v-model="localFormData.email"
            type="email"
            required
            :class="{ 'input-error': errors.email }"
            :placeholder="$t('USER_MANAGEMENT.MODAL.EMAIL_PLACEHOLDER')"
            @blur="validateField('email')"
          />
          <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="phone">{{ $t('USER_MANAGEMENT.LABEL.PHONE') }}</label>
          <input
            id="phone"
            v-model="localFormData.phone"
            type="tel"
            :placeholder="$t('USER_MANAGEMENT.MODAL.PHONE_PLACEHOLDER')"
          />
        </div>

        <div v-if="!isEditMode" class="form-group">
          <label for="password"
            >{{ $t('COMPONENT.CHAT_VIEW.SIDE_BAR.LABEL.CHANNELS') }} *
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="joinChannel" />
              {{ $t('USER_MANAGEMENT.MODAL.JOIN_ALL_CHANNEL') }}
            </label></label
          >
        </div>

        <div v-if="!isEditMode" class="form-group">
          <label for="password"
            >{{ $t('USER_MANAGEMENT.LABEL.PASSWORD') }} *
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="useDefaultPassword"
                @change="handleDefaultPassword"
              />
              {{ $t('USER_MANAGEMENT.MODAL.USE_DEFAULT_PASSWORD') }} ({{
                Password.DEFAULT
              }})
            </label></label
          >
          <input
            id="password"
            v-model="localFormData.password"
            type="password"
            :required="!isEditMode && !useDefaultPassword"
            :disabled="useDefaultPassword"
            :class="{ 'input-error': errors.password }"
            :placeholder="$t('USER_MANAGEMENT.MODAL.PASSWORD_PLACEHOLDER')"
            @blur="validateField('password')"
          />
          <span v-if="errors.password" class="error-msg">{{
            errors.password
          }}</span>
        </div>

        <div class="form-group">
          <label for="role">{{ $t('USER_MANAGEMENT.LABEL.ROLE') }} *</label>
          <select
            id="role"
            v-model="localFormData.role"
            required
            :class="{ 'input-error': errors.role }"
            @change="validateField('role')"
          >
            <option value="USER">
              {{ $t('USER_MANAGEMENT.MODAL.ROLE_USER') }}
            </option>
            <option value="MANAGER">
              {{ $t('USER_MANAGEMENT.MODAL.ROLE_MANAGER') }}
            </option>
          </select>
          <span v-if="errors.role" class="error-msg">{{ errors.role }}</span>
        </div>

        <div class="form-group">
          <label for="department"
            >{{ $t('USER_MANAGEMENT.LABEL.DEPARTMENT') }} *</label
          >
          <select
            id="department"
            v-model="localFormData.departmentId"
            required
            :class="{ 'input-error': errors.departmentId }"
            @change="validateField('departmentId')"
          >
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
          <span v-if="errors.departmentId" class="error-msg">{{
            errors.departmentId
          }}</span>
        </div>

        <div class="form-group">
          <label for="language">{{
            $t('USER_MANAGEMENT.LABEL.LANGUAGE')
          }}</label>
          <select id="language" v-model="localFormData.language">
            <option value="">
              {{ $t('USER_MANAGEMENT.LABEL.SELECT_LANGUAGE') }}
            </option>
            <option
              v-for="lang in languages"
              :key="lang.value"
              :value="lang.value"
            >
              {{ lang.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ $t('USER_MANAGEMENT.LABEL.THEME') }}</label>
          <div class="theme-toggle-group">
            <label class="theme-option">
              <input type="radio" v-model="localFormData.theme" value="light" />
              <span class="theme-label">
                <span class="theme-icon">☀️</span>
                {{ $t('USER_MANAGEMENT.MODAL.THEME_LIGHT') }}
              </span>
            </label>
            <label class="theme-option">
              <input type="radio" v-model="localFormData.theme" value="dark" />
              <span class="theme-label">
                <span class="theme-icon">🌙</span>
                {{ $t('USER_MANAGEMENT.MODAL.THEME_DARK') }}
              </span>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn-cancel">
            {{ $t('USER_MANAGEMENT.BUTTON.CANCEL') }}
          </button>
          <button
            type="submit"
            class="btn-submit"
            :disabled="submitting || !isFormValid"
          >
            {{
              submitting
                ? $t('USER_MANAGEMENT.LABEL.PROCESSING')
                : isEditMode
                ? $t('USER_MANAGEMENT.BUTTON.UPDATE')
                : $t('USER_MANAGEMENT.BUTTON.CREATE')
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import defaultAvatar from '@/assets/default-avatar.png'
import { getURLAvatar } from '@/utils/image'
import { Language, Password } from '@/config/enum'

const { t } = useI18n()
const languages = Language
const errors = ref({})

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
      avatar: null,
      language: '',
      theme: '',
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
const avatarPreview = ref(null)
const avatarFile = ref(null)
const useDefaultPassword = ref(false)
const joinChannel = ref(false)

watch(
  () => props.formData,
  (newData) => {
    localFormData.value = { ...newData }
    if (newData.avatar) {
      avatarPreview.value = getURLAvatar(newData.avatar)
    } else {
      avatarPreview.value = null
    }
  },
  { deep: true }
)

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      localFormData.value = { ...props.formData }
      if (props.formData.avatar) {
        avatarPreview.value = getURLAvatar(props.formData.avatar)
      } else {
        avatarPreview.value = null
      }
      avatarFile.value = null
      errors.value = {}
    } else {
      avatarPreview.value = null
      avatarFile.value = null
      errors.value = {}
      useDefaultPassword.value = false
    }
  }
)

const handleDefaultPassword = () => {
  if (useDefaultPassword.value) {
    localFormData.value.password = Password.DEFAULT
    errors.value.password = ''
  } else {
    localFormData.value.password = ''
  }
}

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      alert(t('AUTH.REGISTER.AVATAR_SIZE_ERROR'))
      return
    }
    avatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
    localFormData.value.avatar = file
  }
}

const validateField = (fieldName) => {
  const value = localFormData.value[fieldName]
  errors.value[fieldName] = ''

  switch (fieldName) {
    case 'name':
      if (!value || value.trim() === '') {
        errors.value[fieldName] = t('USER_MANAGEMENT.VALIDATION.NAME_REQUIRED')
      }
      break
    case 'email':
      if (!value || value.trim() === '') {
        errors.value[fieldName] = t('USER_MANAGEMENT.VALIDATION.EMAIL_REQUIRED')
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.value[fieldName] = t('USER_MANAGEMENT.VALIDATION.EMAIL_INVALID')
      }
      break
    case 'role':
      if (!value || value === '') {
        errors.value[fieldName] = t('USER_MANAGEMENT.VALIDATION.ROLE_REQUIRED')
      }
      break
    case 'departmentId':
      if (!value || value === '') {
        errors.value[fieldName] = t(
          'USER_MANAGEMENT.VALIDATION.DEPARTMENT_REQUIRED'
        )
      }
      break
    case 'password':
      if (!props.isEditMode && !useDefaultPassword.value) {
        if (!value || value.trim() === '') {
          errors.value[fieldName] = t(
            'USER_MANAGEMENT.VALIDATION.PASSWORD_REQUIRED'
          )
        } else if (value.length < 3) {
          errors.value[fieldName] = t(
            'USER_MANAGEMENT.VALIDATION.PASSWORD_MIN_LENGTH'
          )
        }
      }
      break
  }
}

const isFormValid = computed(() => {
  const hasName = localFormData.value.name?.trim()
  const hasEmail = localFormData.value.email?.trim()
  const hasRole = localFormData.value.role
  const hasDepartment = localFormData.value.departmentId

  const hasPassword = props.isEditMode
    ? true
    : useDefaultPassword.value || localFormData.value.password?.trim()

  return hasName && hasEmail && hasRole && hasDepartment && hasPassword
})

const handleSubmit = () => {
  const submitData = { ...localFormData.value, joinChannel: joinChannel.value }
  if (avatarFile.value) {
    submitData.avatarFile = avatarFile.value
  }
  emit('submit', submitData)
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
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 24px var(--shadow);
}

@media (min-width: 768px) {
  .modal-content {
    max-width: 700px;
  }
}

@media (min-width: 1024px) {
  .modal-content {
    max-width: 800px;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem 0.5rem 2rem;
  border-bottom: 1px solid var(--border-primary);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  flex: 1;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--text-primary);
  opacity: 0.7;
  padding: 0.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: opacity 0.2s;
}

.btn-close:hover {
  opacity: 1;
}

.user-form {
  padding: 0 2rem 0.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--text-primary);
  font-size: 0.98rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  letter-spacing: 0.01em;
}

.form-group input,
.form-group select {
  padding: 0.7rem 1rem;
  border: 1.5px solid var(--border-primary);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transition: border 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  border: 1.5px solid var(--special-text-color);
  outline: none;
  box-shadow: 0 0 0 2px var(--special-text-color);
}

.form-group input::placeholder {
  color: var(--text-secondary);
  opacity: 1;
}

.input-error {
  border: 1.5px solid #e74c3c !important;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.1);
}

.error-msg {
  color: #e74c3c;
  font-size: 0.93rem;
  margin-top: 0.4rem;
  display: block;
  padding-left: 2px;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-primary);
}

.avatar-input {
  display: none;
}

.avatar-label {
  background: var(--border-secondary);
  color: var(--text-secondary) !important;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.avatar-label:hover {
  filter: brightness(1.15);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
  margin-top: 1rem;
  padding: 1.2rem 2rem 1.5rem 2rem;
  background: transparent;
}

.btn-cancel {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--border-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-cancel:hover {
  filter: brightness(1.15);
}

.btn-submit {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--border-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  filter: brightness(1.15);
}

.btn-submit:disabled {
  background: var(--border-secondary);
  color: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.5;
}

.theme-toggle-group {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.theme-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  flex: 1;
}

.theme-option input[type='radio'] {
  display: none;
}

.theme-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  border: 2px solid var(--border-primary);
  border-radius: 8px;
  width: 100%;
  text-align: center;
  justify-content: center;
  transition: all 0.3s;
  font-size: 0.95rem;
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.theme-option input[type='radio']:checked + .theme-label {
  border-color: var(--special-text-color);
  background-color: var(--bg-active);
  color: var(--special-text-color);
  font-weight: 600;
}

.theme-option:hover .theme-label {
  border-color: var(--special-text-color);
  background-color: var(--bg-tertiary);
}

.theme-icon {
  font-size: 1.2rem;
}
</style>
