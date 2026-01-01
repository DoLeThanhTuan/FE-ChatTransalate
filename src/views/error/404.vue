<template>
  <div class="not-found">
    <h1>{{ $t('ERROR.404.TITLE') }}</h1>
    <h2>{{ $t('ERROR.404.HEADING') }}</h2>
    <p>{{ $t('ERROR.404.MESSAGE') }}</p>
    <router-link to="/" class="home-link">{{ $t('ERROR.404.HOME_LINK') }}</router-link>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
}

h1 {
  font-size: 6rem;
  color: #891c1c;
  margin: 0;
}

h2 {
  font-size: 2rem;
  color: #333;
  margin: 1rem 0;
}

p {
  color: #666;
  margin-bottom: 2rem;
}

.home-link {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: #891c1c;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.home-link:hover {
  background-color: #6b1515;
}
</style> 