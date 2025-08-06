import axiosClient from '@/axios/axiosClient.js';
import { setHeader } from '../common';

const ENDPOINT = '/messages'

export const messageApi = {
    getMessages: async () => {
      return await axiosClient.get("/messages", {
        headers: {
          ...setHeader(),
        },
      });
    },
    getMessagesByChannelId: async (channelId) => {
      return await axiosClient.get(`${ENDPOINT}/${channelId}`, {
        headers: {
          ...setHeader(),
        },
      });
    },
    getMessagesByEmail: async (email) => {
      return await axiosClient.get(`${ENDPOINT}/private/${email}`, {
        headers: {
          ...setHeader(),
        },
      });
    }
};