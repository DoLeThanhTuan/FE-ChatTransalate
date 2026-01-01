<template>
  <div class="register-container">
    <div class="register-box">
      <h2>{{ $t('AUTH.REGISTER.TITLE') }}</h2>
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="name">{{ $t('AUTH.REGISTER.NAME_LABEL') }}</label>
          <input
            type="text"
            id="name"
            v-model="form.name"
            :placeholder="$t('AUTH.REGISTER.NAME_PLACEHOLDER')"
            required
          />
        </div>

        <div class="form-group">
          <label for="avatar">{{ $t('AUTH.REGISTER.AVATAR_LABEL') }}</label>
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
              {{ avatarPreview ? $t('AUTH.REGISTER.CHANGE_AVATAR') : $t('AUTH.REGISTER.SELECT_AVATAR') }}
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="email">{{ $t('AUTH.REGISTER.EMAIL_LABEL') }}</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            :placeholder="$t('AUTH.REGISTER.EMAIL_PLACEHOLDER')"
            required
          />
        </div>

        <div class="form-group">
          <label for="phone">{{ $t('AUTH.REGISTER.PHONE_LABEL') }}</label>
          <input
            type="tel"
            id="phone"
            v-model="form.phone"
            :placeholder="$t('AUTH.REGISTER.PHONE_PLACEHOLDER')"
            pattern="[0-9]{10}"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">{{ $t('AUTH.REGISTER.PASSWORD_LABEL') }}</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            :placeholder="$t('AUTH.REGISTER.PASSWORD_PLACEHOLDER')"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">{{ $t('AUTH.REGISTER.CONFIRM_PASSWORD_LABEL') }}</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="form.confirmPassword"
            :placeholder="$t('AUTH.REGISTER.CONFIRM_PASSWORD_PLACEHOLDER')"
            required
          />
        </div>

        <button type="submit" class="register-button" :disabled="loading">
          {{ loading ? $t('AUTH.REGISTER.BUTTON_LOADING') : $t('AUTH.REGISTER.BUTTON') }}
        </button>

        <div class="login-link">
          {{ $t('AUTH.REGISTER.HAS_ACCOUNT') }} <router-link to="/login">{{ $t('AUTH.REGISTER.LOGIN_LINK') }}</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import defaultAvatar from '@/assets/default-avatar.png'
import { authApi } from '@/axios/api-services/authApi'
import { toast } from 'vue3-toastify'

const { t } = useI18n()

const router = useRouter()
const loading = ref(false)
const avatarPreview = ref(null)
const avatarFile = ref(null)

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  avatar: null,
})

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
    form.value.avatar = file
  }
}

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    alert(t('AUTH.REGISTER.PASSWORD_MISMATCH'))
    return
  }

  // Validate phone number
  if (!/^[0-9]{10}$/.test(form.value.phone)) {
    alert(t('AUTH.REGISTER.PHONE_INVALID'))
    return
  }

  try {
    loading.value = true
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('email', form.value.email)
    formData.append('phone', form.value.phone)
    formData.append('password', form.value.password)
    if (form.value.avatar) {
      formData.append('avatar', form.value.avatar)
    }

    const response = await authApi.signup(formData)

    if (response.status == 200) {
      router.push('/login')
      toast.success(t('AUTH.REGISTER.SUCCESS'))
    } else {
      toast.error(t('AUTH.REGISTER.ERROR'))
    }
  } catch (error) {
    console.error('Register error:', error)
    toast.error(t('AUTH.REGISTER.ERROR_GENERAL'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 20px;
}

.register-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #666;
  font-size: 0.9rem;
}

input {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #891c1c;
  outline: none;
}

.register-button {
  background-color: #891c1c;
  color: white;
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.register-button:hover {
  background-color: #6b1515;
}

.register-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.login-link a {
  color: #891c1c;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
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
  border: 2px solid #ddd;
}

.avatar-input {
  display: none;
}

.avatar-label {
  background-color: #891c1c;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.avatar-label:hover {
  background-color: #6b1515;
}
</style>
