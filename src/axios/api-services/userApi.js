import axiosClient from '@/axios/axiosClient.js'
import { setHeader } from '../common'

const ENDPOINT = '/users'

export const userApi = {
  getUsers: async () => {
    return await axiosClient.get(`${ENDPOINT}`, {
      headers: {
        ...setHeader(),
      },
    })
  },
  getAll: async () => {
    return await axiosClient.get(`${ENDPOINT}/all`, {
      headers: {
        ...setHeader(),
      },
    })
  },
  getUserById: async (id) => {
    return await axiosClient.get(`${ENDPOINT}/${id}`, {
      headers: {
        ...setHeader(),
      },
    })
  },
}
