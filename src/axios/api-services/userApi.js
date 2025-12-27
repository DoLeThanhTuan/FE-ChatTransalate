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
  createUser: async (params) => {
    return await axiosClient.post(`${ENDPOINT}`, params, {
      headers: {
        ...setHeader(),
      },
    })
  },
  updateUser: async (id, params) => {
    return await axiosClient.put(`${ENDPOINT}/${id}`, params, {
      headers: {
        ...setHeader(),
      },
    })
  },
  deleteUser: async (id) => {
    return await axiosClient.delete(`${ENDPOINT}/${id}`, {
      headers: {
        ...setHeader(),
      },
    })
  },
}
