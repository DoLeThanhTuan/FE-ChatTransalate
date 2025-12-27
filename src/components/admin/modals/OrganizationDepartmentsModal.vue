<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h2>Danh sách phòng ban - {{ organizationName }}</h2>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="departments-list-container">
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>Đang tải...</p>
        </div>
        <div v-else-if="departments.length === 0" class="no-data">
          Không có phòng ban nào trong tổ chức này
        </div>
        <div v-else class="departments-list">
          <div
            v-for="dept in departments"
            :key="dept.id"
            class="department-item"
          >
            <div class="department-info">
              <div class="department-name">{{ dept.name }}</div>
              <div class="department-description">
                {{ dept.description || 'Không có mô tả' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  organizationName: {
    type: String,
    default: '',
  },
  departments: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])
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

.departments-list-container {
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

.departments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.department-item {
  padding: 1rem;
  background-color: var(--hover-bg);
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.department-item:hover {
  background-color: var(--bg-active);
}

.department-info {
  flex: 1;
}

.department-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

.department-description {
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


