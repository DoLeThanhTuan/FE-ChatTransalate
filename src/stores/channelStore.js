import { defineStore } from 'pinia'
import { channelApi } from '@/axios/api-services/channelApi'
import { computed, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { send } from '@/socket/socketService'
import { Status, URLMessage } from '@/config/enum'

export const useChannelStore = defineStore('channel', () => {
  const channelCurrent = ref({})
  const channels = ref([])
  const channelsDict = computed(() =>
    channels.value.reduce((item, channel) => {
      item[channel.id] = channel
      return item
    }, {})
  )

  const fetchChannelById = async (channelId) => {
    try {
      const response = await channelApi.getChannelById(channelId)
      channelCurrent.value = response.data
      return response.data
    } catch (e) {
      console.error(e)
    }
  }

  const fetchChannel = async () => {
    try {
      const response = await channelApi.getChannel()
      channels.value = response.data
      return response.data
    } catch (e) {
      console.error(e)
    }
  }

  const createChannel = async (channelData) => {
    try {
      const res = await channelApi.createChannel(channelData)
      if (res.data == '') {
        return null
      } else {
        await fetchChannel()
      }
      return res.data
    } catch (e) {
      console.error('Failed to create channel:', e)
      toast.error('Có lỗi xảy ra khi tạo channel.')
    }
  }

  const leaveChannel = async () => {
    try {
      const res = await channelApi.leaveChannel(channelCurrent.value.id)
      await sendMessageToChannel({
        content: `{${Status.LEAVE_CHANNEL}}`,
        channelId: channelCurrent.value.id,
        type: Status.LEAVE_CHANNEL,
      })
      await fetchChannel()
      return res.data
    } catch (e) {
      console.error(e)
    }
  }

  // const addMemberIntoChannel = async (channelId, userIds) => {
  //   try {
  //     const params = {
  //       channelId: channelId,
  //       userIds: userIds,
  //     }
  //     const res = await channelApi.addMemberIntoChannel(params)
  //     await sendMessageToChannel({
  //       content: `{${Status.LEAVE_CHANNEL}}`,
  //       channelId: channelCurrent.value.id,
  //       type: Status.LEAVE_CHANNEL,
  //     })
  //     await fetchChannel()
  //     return res.data
  //   } catch (e) {
  //     console.error(e)
  //   }
  // }

  const removeMemberFromChannel = async (channelId, userIds) => {
    try {
      const params = {
        channelId: channelId,
        userIds: userIds,
      }
      const res = await channelApi.removeMemberFromChannel(params)
      await sendMessageToChannel({
        content: `{${Status.REMOVE_MEMBER}}${params.userIds}`,
        channelId: channelCurrent.value.id,
        type: Status.REMOVE_MEMBER,
      })
      channelCurrent.value.members = channelCurrent.value.members.filter(
        (member_id) => !userIds.includes(member_id)
      )
      return res.data
    } catch (e) {
      console.error(e)
    }
  }

  const updateMemberChannel = async (message) => {
    var actionUserIds = []
    if (message.type == Status.REMOVE_MEMBER) {
      actionUserIds = message.content.replace(`{${Status.REMOVE_MEMBER}}`, '')
      actionUserIds = actionUserIds.split(',')
      channelCurrent.value.members = channelCurrent.value.members.filter(
        (member_id) => !actionUserIds.includes(member_id)
      )
    } else if (message.type == Status.JOIN_CHANNEL) {
      const index = channelCurrent.value.members.findIndex(
        (member) => member == message.fromUser
      )
      if (index === -1) {
        channelCurrent.value.members.push(message.fromUser)
      }
    } else if (message.type == Status.LEAVE_CHANNEL) {
      channelCurrent.value.members = channelCurrent.value.members.filter(
        (member) => member !== message.fromUser
      )
    }
  }

  const joinChannel = async (channelId) => {
    try {
      const res = await channelApi.joinChannel(channelId)
      channels.value.push(res.data)
      channelCurrent.value = res.data
      sendMessageToChannel({
        content: `{${Status.JOIN_CHANNEL}}`,
        channelId: channelId,
        type: Status.JOIN_CHANNEL,
      })
      return res.data
    } catch (e) {
      console.error(e)
    }
  }

  const searchChannel = async (params) => {
    try {
      const res = await channelApi.searchChannel(params)
      return res.data
    } catch (e) {
      console.error(e)
    }
  }

  function getUserName(email) {
    const found = channelCurrent.value?.members?.find((m) => m.email === email)
    return found ? found.name : email
  }

  const sendMessageToChannel = async ({
    id = null,
    content,
    files = [],
    channelId,
    uploadFiles,
    type = Status.MESSAGE,
    messageReplyId = null,
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
          messageReply: {
            id: messageReplyId,
          },
        }
        send(`${URLMessage.CHANNEL}/${channelId}`, messageData)
        return true
      } catch (error) {
        console.error('Error sending message:', error)
        throw error
      }
    }
    return false
  }

  return {
    channelCurrent,
    channels,
    channelsDict,
    fetchChannelById,
    fetchChannel,
    createChannel,
    leaveChannel,
    removeMemberFromChannel,
    updateMemberChannel,
    searchChannel,
    joinChannel,
    getUserName,
    sendMessageToChannel,
  }
})
