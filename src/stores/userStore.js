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

  const createUser = async (userData) => {
    try {
      const response = await userApi.createUser(userData)
      users.value.push(response.data)
      return response.data
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  const updateUser = async (id, userData) => {
    try {
      const response = await userApi.updateUser(id, userData)
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        users.value[index] = response.data
      }
      return response.data
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  const deleteUser = async (id) => {
    try {
      await userApi.deleteUser(id)
      users.value = users.value.filter((u) => u.id !== id)
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  const setNewMessage = (userId, newMessage) => {
    const index = users.value.findIndex((u) => u.id === userId)
    if (index !== -1) {
      users.value[index].newMessage = newMessage
    }
  }

  return {
    users,
    usersDict,
    fetchUsers,
    getUsersByIds,
    createUser,
    updateUser,
    deleteUser,
    setNewMessage,
  }
})
