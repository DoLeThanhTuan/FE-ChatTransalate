<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h2>{{ $t('DEPARTMENT_MANAGEMENT.MODAL.VIEW_USERS_TITLE') }} - {{ departmentName }}</h2>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="users-list-container">
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>{{ $t('DEPARTMENT_MANAGEMENT.LABEL.LOADING') }}</p>
        </div>
        <div v-else-if="users.length === 0" class="no-data">
          {{ $t('DEPARTMENT_MANAGEMENT.MESSAGE.NO_USERS') }}
        </div>
        <div v-else class="users-list">
          <div v-for="user in users" :key="user.id" class="user-item">
            <img
              :src="user.avatar || defaultAvatar"
              :alt="user.name"
              class="user-avatar"
            />
            <div class="user-info">
              <div class="user-name">{{ user.name || user.username }}</div>
              <div class="user-email">{{ user.email }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import defaultAvatarImg from '@/assets/default-avatar.png'

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  departmentName: {
    type: String,
    default: '',
  },
  users: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])

const defaultAvatar = defaultAvatarImg
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

.modal-large {
  max-width: 700px;
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

.users-list-container {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.loading-container p {
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-primary);
  border-top: 4px solid #891c1c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--hover-bg);
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.user-item:hover {
  background-color: var(--bg-active);
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-primary);
  transition: border-color 0.3s ease;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

.user-email {
  font-size: 0.875rem;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}
</style>


