import axios from "axios";
import { handleErrorNavigation } from '@/utils/handlerError.js'


const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

// axiosInstance.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
// axiosInstance.defaults.headers.common['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE';
// axiosInstance.defaults.headers.common['Access-Control-Allow-Headers'] = 'Origin, Content-Type, X-Auth-Token';

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        handleErrorNavigation(error);
        return Promise.reject(error)
    }
)

export default axiosInstance 
