// import { i18n } from '@/plugins/i18n'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'
import localStorageUtils from '@/utils/localStorageUtils'

// const t = i18n.global.t;
const router = useRouter()
export const handleErrorNavigation = async (error) => {
  if (error.response?.status === 401) {
    toast.error('NOT AUTHENTICATED')
  } else if (error.response?.status === 403) {
    // localStorageUtils.remove('userInfo')
    // localStorageUtils.remove('token')
    // window.location.href = '/login'
  } else if (error.response?.status === 500) {
    // await router.push({
    //     name: '50X',
    //     params: {
    //         code: '500'
    //     }
    // });
    toast.error('INTERNAL SERVER ERROR')
  } else {
    toast.error('ERROR COMMON')
  }
}
