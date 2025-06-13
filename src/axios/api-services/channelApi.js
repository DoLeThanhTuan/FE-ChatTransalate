import axiosClient from "@/axios/axiosClient.js";
import { setHeader } from "../common";

const ENDPOINT = "/channels";

export const channelApi = {
  getChannel: async (params) => {
    return await axiosClient.post(ENDPOINT + "/all", params , {
      headers: { ...setHeader() }
    })
  },
};
