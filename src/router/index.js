import { createRouter, createWebHistory } from 'vue-router'
import LiveStream from '../views/LiveStream.vue'
import WSComponent from '../components/WSComponent.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/stream/:id',
    name: 'LiveStream',
    component: LiveStream,
    props: true
  },
  {
    path: '/chat',
    name: 'Chat',
    component: WSComponent
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true, requiresStreamer: true }
  },
  {
    path: '/chat-view/:chatId',
    name: 'chat-view',
    component: () => import('../views/ChatView.vue'),
    meta: { requiresAuth: true}
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  const isStreamer = localStorage.getItem('isStreamer') === 'true'

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresStreamer && !isStreamer) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router 