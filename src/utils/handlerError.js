import router from '@/router/index.js';
// import { i18n } from '@/plugins/i18n'
import { toast } from 'vue3-toastify';

// const t = i18n.global.t;
export const handleErrorNavigation = async (error) => {
    if (error.response?.status === 401) {
        toast.error("Lỗi 401");
    }
    else if (error.response?.status === 403) {
        toast.error("Lỗi 403");
    }
    else if (error.response?.status === 500) {
        // await router.push({ 
        //     name: '50X', 
        //     params: { 
        //         code: '500'
        //     }
        // });
        toast.error("Lỗi 500");
    }
    else {
        toast.error("Lỗi chung");
    }

}; 