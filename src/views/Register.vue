<template>
  <div class="register-container">
    <div class="register-box">
      <h2>Đăng ký tài khoản</h2>
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="name">Họ và tên</label>
          <input
            type="text"
            id="name"
            v-model="form.name"
            placeholder="Nhập họ và tên"
            required
          />
        </div>

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

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            placeholder="Nhập email của bạn"
            required
          />
        </div>

        <div class="form-group">
          <label for="phone">Số điện thoại</label>
          <input
            type="tel"
            id="phone"
            v-model="form.phone"
            placeholder="Nhập số điện thoại"
            pattern="[0-9]{10}"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            placeholder="Nhập mật khẩu"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Xác nhận mật khẩu</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="form.confirmPassword"
            placeholder="Nhập lại mật khẩu"
            required
          />
        </div>

        <button type="submit" class="register-button" :disabled="loading">
          {{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}
        </button>

        <div class="login-link">
          Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import defaultAvatar from '@/assets/default-avatar.png'
import { authApi } from '@/axios/api-services/authApi'

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
  avatar: null
})

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Kích thước ảnh không được vượt quá 5MB')
      return
    }
    avatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
    form.value.avatar = file
  }
}

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    alert('Mật khẩu xác nhận không khớp')
    return
  }

  // Validate phone number
  if (!/^[0-9]{10}$/.test(form.value.phone)) {
    alert('Số điện thoại phải có 10 chữ số')
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

    const response = await authApi.signup(formData);

    const data = await response.json()
    
    if (response.ok) {
      alert('Đăng ký thành công! Vui lòng đăng nhập.')
      router.push('/login')
    } else {
      alert(data.message || 'Đăng ký thất bại')
    }
  } catch (error) {
    console.error('Register error:', error)
    alert('Có lỗi xảy ra khi đăng ký')
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