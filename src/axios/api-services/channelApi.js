import axiosClient from "@/axios/axiosClient.js";
import { setHeader } from "../common";

const ENDPOINT = "/channels";

export const channelApi = {
  getChannel: async (params) => {
    return await axiosClient.get(ENDPOINT + "/all", {
      headers: { ...setHeader() }
    })
  },
  getChannelById: async (channelId) => {
    return await axiosClient.get(ENDPOINT + `/${channelId}`, {
      headers: { ...setHeader() }
    })
  },
  createChannel: async (params) => {
    return await axiosClient.post(ENDPOINT, params, {
      headers: { ...setHeader() }
    })
  },
  leaveChannel: async (channelId) => {
    return await axiosClient.get(ENDPOINT + `/leave/${channelId}`, {
      headers: { ...setHeader() }
    })
  },
  joinChannel: async (channelId) => {
    return await axiosClient.get(ENDPOINT + `/join/${channelId}`, {
      headers: { ...setHeader() }
    })
  },
  searchChannel: async (params) => {
    return await axiosClient.post(ENDPOINT + `/search`, params, {
      headers: { ...setHeader() }
    })
  },
};
