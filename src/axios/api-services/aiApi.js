import axiosClient from '@/axios/axiosClient.js';
import { setHeader } from '../common';

const ENDPOINT = '/ai'

export const aiApi = {
    translateMessage: async (params) => {
      return await axiosClient.post(`${ENDPOINT}/translate`,params, {
        headers: {
          ...setHeader(),
        },
      });
    }
};