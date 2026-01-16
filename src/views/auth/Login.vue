<template>
  <div class="login-container">
    <div class="login-box">
      <h2>{{ $t('AUTH.LOGIN.TITLE') }}</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">{{ $t('AUTH.LOGIN.ACCOUNT_LABEL') }}</label>
          <input
            type="text"
            id="email"
            v-model="form.email"
            :placeholder="$t('AUTH.LOGIN.ACCOUNT_PLACEHOLDER')"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">{{ $t('AUTH.LOGIN.PASSWORD_LABEL') }}</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            :placeholder="$t('AUTH.LOGIN.PASSWORD_PLACEHOLDER')"
            required
          />
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="form.remember" />
            <span>{{ $t('AUTH.LOGIN.REMEMBER_ME') }}</span>
          </label>
          <a href="#" class="forgot-password">{{
            $t('AUTH.LOGIN.FORGOT_PASSWORD')
          }}</a>
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          {{
            loading ? $t('AUTH.LOGIN.BUTTON_LOADING') : $t('AUTH.LOGIN.BUTTON')
          }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { authApi } from '@/axios/api-services/authApi'
import { toast } from 'vue3-toastify'
import { useAuthStore } from '@/stores/authStore'
import { TypeChat } from '@/config/enum'
import { channelApi } from '@/axios/api-services/channelApi'
import { requestNotificationPermission } from '@/utils/notification'
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
const { locale } = useI18n()

const { t } = useI18n()

const router = useRouter()
const loading = ref(false)
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  remember: false,
  token: authStore.token,
})

const handleLogin = async () => {
  try {
    loading.value = true
    const response = await authApi.login(form.value)
    authStore.setToken(response.data.accessToken)
    authStore.setUserInfo(response.data)
    await localStorage.setItem('theme', response.data.theme)
    themeStore.initTheme()
    locale.value = response.data.language.toUpperCase()
    await localStorage.setItem('language', response.data.language.toUpperCase())
    if (response.status == 200) {
      await requestNotificationPermission()
      const response = await channelApi.getChannelDefault()
      if (response.status == 200) {
        router.push(`/chat-view/${TypeChat.CHANNEL}/${response.data.id}`)
      }
    }
  } catch (error) {
    if (error.response?.status == 409) {
      toast.error(t('AUTH.LOGIN.ERROR_USER_DISABLED'))
      return
    }
    if (error.response?.status == 403) {
      toast.error(t('AUTH.LOGIN.ERROR_USER_NOT_FOUND'))
      return
    }
    console.error('Login error:', error)
    toast.error(t('AUTH.LOGIN.ERROR'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 20px;
  margin-top: 64px;
}

.login-box {
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

.login-form {
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

input[type='text'],
input[type='password'] {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input[type='text']:focus,
input[type='password']:focus {
  border-color: #891c1c;
  outline: none;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.forgot-password {
  color: #891c1c;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-button {
  background-color: #891c1c;
  color: white;
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover:not(:disabled) {
  background-color: #6b1515;
}

.login-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.register-link a {
  color: #891c1c;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-container {
    height: calc(100vh - 56px);
    margin-top: 56px;
  }
}
</style>
