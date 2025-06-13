import axiosClient from "@/axios/axiosClient.js";
import { setHeader } from "../common";

const ENDPOINT = "/auth";

export const authApi = {
  login: async (params) => {
    return await axiosClient.post(ENDPOINT + "/login", params)
  },
  signup: async (params) => {
    return await axiosClient.post(ENDPOINT + "/signup", params);
  },
};
