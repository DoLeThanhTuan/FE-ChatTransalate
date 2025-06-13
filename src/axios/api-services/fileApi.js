import axiosClient from '@/axios/axiosClient.js';
import { setHeader } from '../common';

const ENDPOINT = '/files'

export const fileApi = {
    getAvatar: async (fileName) => {
        return await axiosClient.get(ENDPOINT + `/avatar/${fileName}`, {
        });
    },
    uploadFile: async (data) => {
        return await axiosClient.post(ENDPOINT, data, {
          headers: {
            ...setHeader(),
          },
        });
    },
};