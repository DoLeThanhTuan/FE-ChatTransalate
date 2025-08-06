import axiosClient from '@/axios/axiosClient.js';
import { setHeader } from '../common';

const ENDPOINT = '/users'

export const userApi = {
    getUsers: async () => {
      return await axiosClient.get(`${ENDPOINT}`, {
        headers: {
          ...setHeader(),
        },
      });
    },
    getUserByEmail: async (email) => {
      return await axiosClient.get(`${ENDPOINT}/${email}`, {
        headers: {
          ...setHeader(),
        },
      });
    }
};