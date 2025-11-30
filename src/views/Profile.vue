<template>
  <div class="profile-container">
    <div class="profile-box">
      <h2>Thông tin cá nhân</h2>
      <div class="profile-info">
        <div class="form-group">
          <label for="avatar">Ảnh đại diện</label>
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
              {{ avatarPreview ? 'Thay đổi ảnh' : 'Chọn ảnh' }}
            </label>
          </div>
        </div>
        <div class="info-group">
          <label>Tên đăng nhập</label>
          <p>{{ userInfo.username }}</p>
        </div>
        <div class="info-group">
          <label>Email</label>
          <p>{{ userInfo.email }}</p>
        </div>
        <div class="info-group">
          <label>Số điện thoại</label>
          <p>{{ userInfo.phone }}</p>
        </div>
        <div class="info-group">
          <label>Vai trò</label>
          <p>{{ userInfo.role }}</p>
        </div>
      </div>
      <button @click="handleLogout" class="logout-button">Đăng xuất</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
const router = useRouter()
const authStore = useAuthStore()
const userInfo = ref({
  username: authStore.userInfo.name,
  email: authStore.userInfo.email,
  phone: authStore.userInfo.phone,
  role: authStore.userInfo.role,
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('isStreamer')
  router.push('/login')
}

onMounted(() => {})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 20px;
}

.profile-box {
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
  color: #666;
  font-size: 0.9rem;
}

p {
  color: #333;
  font-size: 1rem;
  margin: 0;
  padding: 0.5rem;
  background-color: #f8f8f8;
  border-radius: 4px;
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
