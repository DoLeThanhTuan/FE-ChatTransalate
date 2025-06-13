import { ref, computed } from 'vue'
import { defineStore } from "pinia";
import localStorageUtils from "@/utils/localStorageUtils";

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref(!!localStorageUtils.get("token"));
    const userInfo = computed(() => localStorageUtils.get("userInfo"));
    const token = computed(() => localStorageUtils.get("token"));

    const clearAuth = () => {
        localStorageUtils.remove("userInfo");
        localStorageUtils.remove("token");
        localStorageUtils.remove("isStreamer");
        isAuthenticated.value = false;
    }

    const setUserInfo = (data) => {
        localStorageUtils.set("userInfo", data);
        isAuthenticated.value = true;
    }

    const setToken = (data) => {
        localStorageUtils.set("token", data);
        isAuthenticated.value = true;
    }

    return {
        isAuthenticated,
        userInfo,
        token,
        clearAuth,
        setUserInfo,
        setToken
    };
})