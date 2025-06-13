<template>
  <div class="channel-header">
    <div class="header-left">
      <span class="channel-name">MSN-3234A3</span>
      <span class="tag">IL 4</span>
      <span class="location">Huntsville</span>
    </div>
    <div class="header-right">
      <span class="member-count">{{ authStore.userInfo.name }}</span>
      <img class="avatar" :src="getURLAvatar(authStore.userInfo.avatar)" alt="avatar" />
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { getURLAvatar } from '@/utils/image';

const authStore = useAuthStore();
</script>

<style scoped>
.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 1.1rem 2rem 1.1rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  min-height: 64px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 1.1rem;
}
.channel-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #23272f;
}
.tag {
  background: #1ed760;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 5px;
  padding: 0.2rem 0.7rem;
}
.location {
  background: #e0e0e0;
  color: #23272f;
  font-size: 0.95rem;
  border-radius: 5px;
  padding: 0.2rem 0.7rem;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.member-count {
  font-size: 1rem;
  color: #23272f;
  font-weight: 500;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e0e0e0;
}
</style> 