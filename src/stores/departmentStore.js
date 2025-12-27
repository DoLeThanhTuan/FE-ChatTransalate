import { defineStore } from 'pinia'
import { departmentApi } from '@/axios/api-services/departmentApi'
import { ref, computed } from 'vue'

export const useDepartmentStore = defineStore('department', () => {
  const departments = ref([])
  const departmentsDict = computed(() =>
    departments.value.reduce((acc, dept) => {
      acc[dept.id] = dept
      return acc
    }, {})
  )

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAll()
      departments.value = response.data || []
      return response.data
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  const getDepartmentById = (id) => {
    return departmentsDict.value[id]
  }

  const createDepartment = async (departmentData) => {
    try {
      const response = await departmentApi.create(departmentData)
      departments.value.push(response.data)
      return response.data
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  const updateDepartment = async (id, departmentData) => {
    try {
      const response = await departmentApi.update(id, departmentData)
      const index = departments.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        departments.value[index] = response.data
      }
      return response.data
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  const deleteDepartment = async (id) => {
    try {
      await departmentApi.delete(id)
      departments.value = departments.value.filter((d) => d.id !== id)
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  return {
    departments,
    departmentsDict,
    fetchDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  }
})

