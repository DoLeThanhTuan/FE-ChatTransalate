<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Đăng nhập</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Tên đăng nhập</label>
          <input
            type="text"
            id="email"
            v-model="form.email"
            placeholder="Nhập tên đăng nhập của bạn"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            placeholder="Nhập mật khẩu của bạn"
            required
          />
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="form.remember" />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <a href="#" class="forgot-password">Quên mật khẩu?</a>
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? "Đang đăng nhập..." : "Đăng nhập" }}
        </button>

        <div class="register-link">
          Chưa có tài khoản?
          <router-link to="/register">Đăng ký ngay</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { authApi } from "@/axios/api-services/authApi";
import { toast } from "vue3-toastify";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const loading = ref(false);
const authStore = useAuthStore();

const form = ref({
  email: "",
  password: "",
  remember: false,
  token: authStore.token
});

onMounted(() => {
  console.log(import.meta.env.VITE_API_URL);
});

const handleLogin = async () => {
  try {
    loading.value = true;
    const response = await authApi.login(form.value);
    authStore.setToken(response.data.accessToken);
    authStore.setUserInfo(response.data);
    if(response.status == 200){
      router.push("/chat");
    }
  } catch (error) {
    console.error("Login error:", error);
    toast.error("Có lỗi xảy ra khi đăng nhập");
  } finally {
    loading.value = false;
  }
};
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

input[type="text"],
input[type="password"] {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input[type="text"]:focus,
input[type="password"]:focus {
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
