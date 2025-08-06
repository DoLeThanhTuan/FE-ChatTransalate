import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css';
import { FontAwesomeIcon } from './plugins/fontawesome'

const app = createApp(App)
const pinia = createPinia()
app.use(router)
app.use(pinia)
app.use(Toastify, {
    autoClose: 3000,
    position: "top-right"
})
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')

// Initialize theme store after app is mounted
import { useThemeStore } from './stores/themeStore'
const themeStore = useThemeStore()
themeStore.initTheme()
themeStore.watchSystemTheme()
