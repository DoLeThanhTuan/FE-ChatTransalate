import { createRouter, createWebHistory } from 'vue-router'
import localStorageUtils from '@/utils/localStorageUtils'
import { channelApi } from '@/axios/api-services/channelApi'
import { TypeChat } from '@/config/enum'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/auth/Login.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/user-management',
    name: 'UserManagement',
    component: () => import('../views/admin/user/UserManagement.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/department-management',
    name: 'DepartmentManagement',
    component: () =>
      import('../views/admin/department/DepartmentManagement.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/organization-management',
    name: 'OrganizationManagement',
    component: () =>
      import('../views/admin/organization/OrganizationManagement.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/chat-view/:typeChat/:chatKey',
    name: 'chat-view',
    component: () => import('../views/chat-view/ChatView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('../views/error/404.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: '403',
    component: () => import('../views/error/403.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const isAuthenticated =
    localStorageUtils.get('userInfo')?.accessToken == null ? false : true
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  } else if (!to.meta.requiresAuth && isAuthenticated) {
    const response = await channelApi.getChannelDefault()
    if (response.status == 200) {
      next({
        name: 'chat-view',
        params: {
          typeChat: TypeChat.CHANNEL,
          chatKey: response.data.id,
        },
      })
      return
    } else {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  } else {
    next()
    return
  }
})

export default router
