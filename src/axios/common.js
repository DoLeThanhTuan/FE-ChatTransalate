import localStorageUtils from '@/utils/localStorageUtils'

export const setHeader = (data = null) => {
  return {
    Authorization: `Bearer ${localStorageUtils.get('userInfo')?.accessToken}`,
    ...data,
  }
}
