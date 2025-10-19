import { defineStore } from 'pinia'
import { userApi } from '@/axios/api-services/userApi'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const usersDict = computed(() =>
    users.value.reduce((acc, user) => {
      acc[user.id] = user
      return acc
    }, {})
  )

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAll()
      users.value = response.data
      return response.data
    } catch (e) {
      console.error(e)
    }
  }

  const getUsersByIds = (ids) => {
    return ids.map((id) => usersDict.value[id]).filter(Boolean)
  }

  return {
    users,
    usersDict,
    fetchUsers,
    getUsersByIds,
  }
})
