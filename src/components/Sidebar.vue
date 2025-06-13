<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">DR Team</div>
      <input class="search" placeholder="Find channels" />
    </div>
    <div class="sidebar-section">
      <div class="section-title">FAVORITES</div>
      <ul>
        <template v-for="channel in channels">
          <li class="channel active">
            {{ channel.name }}
            <font-awesome-icon v-if="channel.isPublic" :icon="['fas', 'globe']" class="icon-right" />
            <font-awesome-icon v-else :icon="['fas', 'lock']" class="icon-right" />
          </li>
        </template>
      </ul>
    </div>
    <div class="sidebar-section">
      <div class="section-title">ACTIVE MISSIONS</div>
      <ul>
        <li class="channel">MSN-7234B1</li>
        <li class="channel">MSN-8125C2</li>
        <li class="channel">MSN-5581D3</li>
      </ul>
    </div>
    <div class="sidebar-section">
      <div class="section-title">DIRECT MESSAGES</div>
      <ul>
        <li class="dm active">Lt. Charlene Meyer</li>
        <li class="dm">Lt. Anita Becker</li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { channelApi } from '@/axios/api-services/channelApi';
import { onMounted, ref } from 'vue';

const channels = ref([])

onMounted(async () => {
  try{
    const response = await channelApi.getChannel();
    channels.value = response.data;
  } catch (e) {
    console.error(e);
  }
})
</script>

<style scoped>
.sidebar {
  width: 270px;
  background: #23272f;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0.5rem 1rem 0.5rem;
  border-right: 2px solid #1a1a1a;
  min-width: 220px;
  box-shadow: 2px 0 8px rgba(0,0,0,0.04);
}
.sidebar-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.logo {
  font-size: 1.3rem;
  font-weight: bold;
  color: #7ee787;
  letter-spacing: 1px;
  margin-left: 0.5rem;
}
.search {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background: #181c22;
  color: #fff;
  font-size: 1rem;
  margin-left: 0.2rem;
}
.section-title {
  font-size: 0.8rem;
  color: #bdbdbd;
  margin: 1rem 0 0.3rem 1rem;
  font-weight: 600;
  letter-spacing: 1px;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.channel, .dm {
  padding: 0.5rem 1.2rem;
  border-radius: 5px;
  margin-bottom: 0.2rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s, color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.channel.active, .dm.active, .channel:hover, .dm:hover {
  background: #1a1a1a;
  color: #7ee787;
}
</style> 