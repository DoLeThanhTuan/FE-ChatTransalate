import { defineStore } from 'pinia'
import localStorageUtils from '@/utils/localStorageUtils'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const replyingToMessage = ref(null)

  const userInfo = () => {
    return localStorageUtils.get('userInfo')
  }

  const token = () => {
    return localStorageUtils.get('userInfo', {}).accessToken
  }

  const clearAuth = () => {
    localStorageUtils.remove('userInfo')
    localStorageUtils.remove('token')
  }

  const setUserInfo = (data) => {
    localStorageUtils.set('userInfo', data)
  }

  const setToken = (data) => {
    localStorageUtils.set('token', data)
  }

  return {
    replyingToMessage,
    userInfo,
    token,
    clearAuth,
    setUserInfo,
    setToken,
  }
})
