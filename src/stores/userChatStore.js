import { defineStore } from 'pinia'
import { userApi } from '@/axios/api-services/userApi'
import { ref } from 'vue'
import { Status, URLMessage } from '@/config/enum'
import { send } from '@/socket/socketService'

export const useUserChatStore = defineStore('userChat', () => {
  const users = ref([])
  const userChatCurrent = ref({})

  const fetchUserByUserId = async (userId) => {
    try {
      const response = await userApi.getUserById(userId)
      userChatCurrent.value = response.data
      return response.data
    } catch (e) {
      console.error(e)
    }
  }

  const sendMessageToUser = async ({
    id = null,
    content,
    files = [],
    userId,
    uploadFiles,
    type = Status.MESSAGE,
  }) => {
    if (content.trim() || files.length > 0) {
      try {
        let uploadedFiles = []
        if (files.length > 0) {
          uploadedFiles = await uploadFiles(files)
        }
        const messageData = {
          id,
          content,
          type,
          files: uploadedFiles,
        }
        send(`${URLMessage.USER}/${userId}`, messageData)
        return true
      } catch (error) {
        console.error('Error sending message:', error)
        throw error
      }
    }
    return false
  }

  return {
    users,
    userChatCurrent,
    fetchUserByUserId,
    sendMessageToUser,
  }
})
