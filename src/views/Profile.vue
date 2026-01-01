<template>
  <div class="profile-wrapper">
    <AppHeader />
    <div class="profile-container">
      <div class="profile-box">
        <h2>{{ $t('PROFILE.TITLE') }}</h2>
        <div class="profile-info">
          <div class="form-group">
            <label for="avatar">{{ $t('PROFILE.AVATAR_LABEL') }}</label>
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
                {{ avatarPreview ? $t('PROFILE.CHANGE_AVATAR') : $t('PROFILE.SELECT_AVATAR') }}
              </label>
            </div>
          </div>
          <div class="info-group">
            <label>{{ $t('PROFILE.USERNAME_LABEL') }}</label>
            <p>{{ userInfo.username }}</p>
          </div>
          <div class="info-group">
            <label>{{ $t('PROFILE.EMAIL_LABEL') }}</label>
            <p>{{ userInfo.email }}</p>
          </div>
          <div class="info-group">
            <label>{{ $t('PROFILE.PHONE_LABEL') }}</label>
            <p>{{ userInfo.phone }}</p>
          </div>
          <div class="info-group">
            <label>{{ $t('PROFILE.ROLE_LABEL') }}</label>
            <p>{{ userInfo.role }}</p>
          </div>
        </div>
        <button @click="handleLogout" class="logout-button">{{ $t('PROFILE.LOGOUT_BUTTON') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AppHeader from '@/components/common/AppHeader.vue'
const router = useRouter()
const authStore = useAuthStore()
const userInfo = ref({
  username: authStore.userInfo().name,
  email: authStore.userInfo().email,
  phone: authStore.userInfo().phone,
  role: authStore.userInfo().role,
})

const handleLogout = () => {
  authStore.clearAuth()
  router.push('/login')
}

onMounted(() => {})
</script>

<style scoped>
.profile-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-tertiary);
  transition: background-color 0.3s ease;
}

.profile-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
  padding: 20px;
  transition: background-color 0.3s ease;
}

.profile-box {
  background: var(--bg-primary);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px var(--shadow);
  width: 100%;
  max-width: 400px;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

h2 {
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  transition: color 0.3s ease;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

p {
  color: var(--text-primary);
  font-size: 1rem;
  margin: 0;
  padding: 0.5rem;
  background-color: var(--hover-bg);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.logout-button {
  width: 100%;
  background-color: #891c1c;
  color: white;
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: #6b1515;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  transition: border-color 0.3s ease;
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
