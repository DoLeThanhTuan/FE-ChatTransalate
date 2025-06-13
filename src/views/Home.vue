<template>
  <div class="home">
    <h1>Welcome to LiveStream</h1>
    <div class="streams-grid">
      <div v-for="stream in streams" :key="stream.id" class="stream-card">
        <router-link :to="'/stream/' + stream.id">
          <img :src="stream.thumbnail" :alt="stream.title" />
          <div class="stream-info">
            <h3>{{ stream.title }}</h3>
            <p>{{ stream.username }}</p>
            <span class="viewers">{{ stream.viewers }} viewers</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const streams = ref([
  {
    id: 1,
    title: 'Gaming Stream',
    username: 'Gamer123',
    thumbnail: 'https://via.placeholder.com/320x180',
    viewers: 1234
  },
  {
    id: 2,
    title: 'Music Stream',
    username: 'Musician456',
    thumbnail: 'https://via.placeholder.com/320x180',
    viewers: 567
  }
])
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.streams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stream-card {
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s;
}

.stream-card:hover {
  transform: translateY(-5px);
}

.stream-card a {
  text-decoration: none;
  color: inherit;
}

.stream-card img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
}

.stream-info {
  padding: 15px;
}

.stream-info h3 {
  margin: 0 0 10px 0;
  color: #fff;
}

.stream-info p {
  margin: 0;
  color: #aaa;
}

.viewers {
  display: inline-block;
  margin-top: 10px;
  padding: 4px 8px;
  background: rgba(255, 0, 0, 0.8);
  border-radius: 4px;
  color: white;
  font-size: 0.9em;
}
</style> 