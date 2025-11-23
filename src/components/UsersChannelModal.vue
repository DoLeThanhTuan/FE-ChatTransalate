<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <h2>Danh sách thành viên</h2>
        <span class="close-btn" @click="$emit('close')">×</span>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <template v-if="members && members.length">
          <ul class="member-list">
            <li
              v-for="user in members"
              :key="user.id"
              class="member-item flex items-center gap-3"
            >
              <img
                :src="getURLAvatar(user.avatar)"
                alt="avatar"
                class="member-avatar"
              />
              <div class="flex flex-col gap-1">
                <span class="member-name">{{ user.name }}</span>
                <small class="member-username">{{ user.email }}</small>
              </div>
            </li>
          </ul>
        </template>

        <template v-else>
          <p class="text-center text-secondary">Không có thành viên nào</p>
        </template>
      </div>

      <!-- Footer -->
      <div class="modal-actions">
        <button class="modal-cancel-btn" @click="$emit('close')">Đóng</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getURLAvatar } from '@/utils/image'

const props = defineProps({
  visible: { type: Boolean, default: false },
  members: { type: Array, default: () => [] },
})

const emit = defineEmits(['close'])
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
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: 0 2px 24px var(--shadow);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow-y: auto;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem 0.5rem 1.5rem;
  background: var(--bg-active);
  position: sticky;
  top: 0;
  z-index: 1;
}
.modal-header h2 {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
}
.close-btn {
  font-size: 1.8rem;
  cursor: pointer;
  color: var(--text-primary);
  opacity: 0.7;
  transition: opacity 0.2s;
}
.close-btn:hover {
  opacity: 1;
}

/* Body */
.modal-body {
  padding: 1rem 1.5rem;
}
.member-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.member-item {
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border-primary);
}
.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--border-primary, #e0e0e0);
  object-fit: cover;
}
.member-name {
  font-weight: 600;
  color: var(--text-primary);
}
.member-username {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

/* Footer */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0.8rem 1.5rem 1.2rem 1.5rem;
  background: var(--bg-active);
  position: sticky;
  bottom: 0;
}
.modal-cancel-btn {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.modal-cancel-btn:hover {
  background: var(--border-primary);
  color: var(--text-primary);
}

/* Responsive */
@media (max-width: 600px) {
  .modal-content {
    max-width: 95vw;
    border-radius: 10px;
  }
  .modal-body {
    padding: 1rem;
  }
}
</style>
