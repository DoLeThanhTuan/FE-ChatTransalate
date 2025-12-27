import { defineStore } from 'pinia'
import { organizationApi } from '@/axios/api-services/organizationApi'
import { ref, computed } from 'vue'

export const useOrganizationStore = defineStore('organization', () => {
  const organizations = ref([])
  const organizationsDict = computed(() =>
    organizations.value.reduce((acc, organization) => {
      acc[organization.id] = organization
      return acc
    }, {})
  )

  const fetchOrganizations = async () => {
    try {
      const response = await organizationApi.getAll()
      organizations.value = response.data || []
      return response.data
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  const getOrganizationById = (id) => {
    return organizationsDict.value[id]
  }

  const createOrganization = async (organizationData) => {
    try {
      const response = await organizationApi.create(organizationData)
      organizations.value.push(response.data)
      return response.data
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  const updateOrganization = async (id, organizationData) => {
    try {
      const response = await organizationApi.update(id, organizationData)
      const index = organizations.value.findIndex((o) => o.id === id)
      if (index !== -1) {
        organizations.value[index] = response.data
      }
      return response.data
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  const deleteOrganization = async (id) => {
    try {
      await organizationApi.delete(id)
      organizations.value = organizations.value.filter((o) => o.id !== id)
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  return {
    organizations,
    organizationsDict,
    fetchOrganizations,
    getOrganizationById,
    createOrganization,
    updateOrganization,
    deleteOrganization,
  }
})

