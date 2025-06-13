import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css';

import {
  library
} from '@fortawesome/fontawesome-svg-core'
import {
  FontAwesomeIcon
} from '@fortawesome/vue-fontawesome'
import {
  faGlobe,
  faLock
} from '@fortawesome/free-solid-svg-icons'

library.add(faGlobe, faLock)

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
