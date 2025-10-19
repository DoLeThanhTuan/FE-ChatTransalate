import axiosClient from '@/axios/axiosClient.js'
import { setHeader } from '../common'

const ENDPOINT = '/messages'

export const messageApi = {
  getMessages: async () => {
    return await axiosClient.get('/messages', {
      headers: {
        ...setHeader(),
      },
    })
  },
  getMessagesByChannelId: async (channelId, totalCurrent = 0, size = 5) => {
    return await axiosClient.get(`${ENDPOINT}/channel/${channelId}`, {
      headers: {
        ...setHeader(),
      },
      params: {
        totalCurrent: totalCurrent,
        size: size,
      },
    })
  },
  getAllMessagesByChannelId: async (channelId) => {
    return await axiosClient.get(`${ENDPOINT}/channel/all/${channelId}`, {
      headers: {
        ...setHeader(),
      },
    })
  },
  getMessagesByUserId: async (userId, totalCurrent = 0, size = 5) => {
    return await axiosClient.get(`${ENDPOINT}/user/${userId}`, {
      headers: {
        ...setHeader(),
      },
      params: {
        totalCurrent: totalCurrent,
        size: size,
      },
    })
  },
}
