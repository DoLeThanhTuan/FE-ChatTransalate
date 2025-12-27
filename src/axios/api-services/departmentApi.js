import axiosClient from '@/axios/axiosClient.js'
import { setHeader } from '../common'

const ENDPOINT = '/departments'

export const departmentApi = {
  getAll: async () => {
    return await axiosClient.get(`${ENDPOINT}`, {
      headers: {
        ...setHeader(),
      },
    })
  },
  getById: async (id) => {
    return await axiosClient.get(`${ENDPOINT}/${id}`, {
      headers: {
        ...setHeader(),
      },
    })
  },
  create: async (params) => {
    return await axiosClient.post(`${ENDPOINT}`, params, {
      headers: {
        ...setHeader(),
      },
    })
  },
  update: async (id, params) => {
    return await axiosClient.put(`${ENDPOINT}/${id}`, params, {
      headers: {
        ...setHeader(),
      },
    })
  },
  delete: async (id) => {
    return await axiosClient.delete(`${ENDPOINT}/${id}`, {
      headers: {
        ...setHeader(),
      },
    })
  },
  getUsersByDepartment: async (id) => {
    return await axiosClient.get(`${ENDPOINT}/${id}/users`, {
      headers: {
        ...setHeader(),
      },
    })
  },
}

