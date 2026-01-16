<template>
  <div class="organization-management-wrapper">
    <AppHeader />
    <div class="organization-management-container">
      <div class="header">
        <h1>{{ $t('ORGANIZATION_MANAGEMENT.TITLE') }}</h1>
        <button @click="openCreateModal" class="btn-create">
          <i class="fas fa-plus"></i>
          {{ $t('ORGANIZATION_MANAGEMENT.BUTTON.CREATE_ORGANIZATION') }}
        </button>
      </div>

      <!-- Search -->
      <div class="search-filter-bar">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="
              $t('ORGANIZATION_MANAGEMENT.LABEL.SEARCH_PLACEHOLDER')
            "
            class="search-input"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>{{ $t('ORGANIZATION_MANAGEMENT.LABEL.LOADING') }}</p>
      </div>

      <!-- Organizations Table -->
      <div v-else class="table-container">
        <table class="organizations-table">
          <thead>
            <tr>
              <th>{{ $t('ORGANIZATION_MANAGEMENT.LABEL.ID') }}</th>
              <th>{{ $t('ORGANIZATION_MANAGEMENT.LABEL.NAME') }}</th>
              <th>{{ $t('ORGANIZATION_MANAGEMENT.LABEL.COUNTRY') }}</th>
              <th>{{ $t('ORGANIZATION_MANAGEMENT.LABEL.USER_COUNT') }}</th>
              <th>
                {{ $t('ORGANIZATION_MANAGEMENT.LABEL.DEPARTMENT_COUNT') }}
              </th>
              <th>{{ $t('ORGANIZATION_MANAGEMENT.LABEL.ACTIONS') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="organization in filteredOrganizations"
              :key="organization.id"
            >
              <td>{{ organization.id }}</td>
              <td>
                <strong>{{ organization.name }}</strong>
              </td>
              <td>
                {{ getLanguageByCode(organization.country).name }}
              </td>
              <td>{{ organization.userCount || 0 }}</td>
              <td>{{ organization.departmentCount || 0 }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    @click="openEditModal(organization)"
                    class="btn-action btn-edit"
                    :title="$t('ORGANIZATION_MANAGEMENT.BUTTON.EDIT')"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" />
                  </button>
                  <button
                    @click="openViewDepartmentsModal(organization)"
                    class="btn-action btn-view"
                    :title="
                      $t('ORGANIZATION_MANAGEMENT.BUTTON.VIEW_DEPARTMENTS')
                    "
                  >
                    <font-awesome-icon :icon="['fas', 'info']" />
                  </button>
                  <button
                    @click="openDeleteModal(organization)"
                    class="btn-action btn-delete"
                    :title="$t('ORGANIZATION_MANAGEMENT.BUTTON.DELETE')"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredOrganizations.length === 0">
              <td colspan="6" class="no-data">
                {{ $t('ORGANIZATION_MANAGEMENT.LABEL.NO_DATA') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create/Edit Organization Modal -->
      <OrganizationFormModal
        :visible="showModal"
        :id="idEdit"
        @close="closeModal"
        @submit="handleSubmit"
      />

      <!-- View Departments Modal -->
      <OrganizationDepartmentsModal
        :visible="showDepartmentsModal"
        :organization-name="selectedOrganization?.name || ''"
        :departments="organizationDepartments"
        :loading="departmentsLoading"
        @close="closeDepartmentsModal"
      />

      <!-- Delete Confirmation Modal -->
      <ModalConfirmDelete
        :visible="showDeleteModal"
        :id="selectedOrganization?.id"
        @confirm="handleDelete"
        @cancel="closeDeleteModal"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { organizationApi } from '@/axios/api-services/organizationApi'
import { useOrganizationStore } from '@/stores/organizationStore'
import ModalConfirmDelete from '@/components/common/ModalConfirmDelete.vue'
import OrganizationFormModal from '@/components/admin/modals/OrganizationFormModal.vue'
import OrganizationDepartmentsModal from '@/components/admin/modals/OrganizationDepartmentsModal.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import { toast } from 'vue3-toastify'

const { t } = useI18n()

const organizationStore = useOrganizationStore()
const organizations = ref([])
const loading = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const showDepartmentsModal = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const selectedOrganization = ref(null)
const organizationDepartments = ref([])
const departmentsLoading = ref(false)
const languages = [
  {
    code: 'VI',
    name: 'Viet Nam',
    nativeName: 'Viet Nam',
    flag: '🇻🇳',
  },
  {
    code: 'EN',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'JP',
    name: 'Japan',
    nativeName: 'Japan',
    flag: 'jp',
  },
]
const formData = ref({
  name: '',
  description: '',
})
const idEdit = ref(null)

const filteredOrganizations = computed(() => {
  let filtered = organizations.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (organization) =>
        organization.name?.toLowerCase().includes(query) ||
        organization.description?.toLowerCase().includes(query)
    )
  }

  return filtered
})

const getLanguageByCode = (code) => {
  return languages.filter((lang) => lang.code == code)[0]
}

const fetchOrganizations = async () => {
  loading.value = true
  try {
    const response = await organizationApi.getAll()
    organizations.value = response.data || []
  } catch (error) {
    console.error('Error fetching organizations:', error)
    toast.error(t('ORGANIZATION_MANAGEMENT.MESSAGE.FETCH_ERROR'))
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  idEdit.value = null
  formData.value = {
    name: '',
    description: '',
  }
  showModal.value = true
}

const openEditModal = (organization) => {
  idEdit.value = organization.id
  formData.value = {
    name: organization.name || '',
    description: organization.description || '',
  }
  selectedOrganization.value = organization
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedOrganization.value = null
}

const openViewDepartmentsModal = async (organization) => {
  selectedOrganization.value = organization
  showDepartmentsModal.value = true
  departmentsLoading.value = true
  try {
    const response = await organizationApi.getDepartmentsByOrganization(
      organization.id
    )
    organizationDepartments.value = response.data || []
  } catch (error) {
    console.error('Error fetching organization departments:', error)
    toast.error(t('ORGANIZATION_MANAGEMENT.MESSAGE.FETCH_DEPARTMENTS_ERROR'))
    organizationDepartments.value = []
  } finally {
    departmentsLoading.value = false
  }
}

const closeDepartmentsModal = () => {
  showDepartmentsModal.value = false
  selectedOrganization.value = null
  organizationDepartments.value = []
}

const openDeleteModal = (organization) => {
  selectedOrganization.value = organization
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedOrganization.value = null
}

const handleSubmit = async (payload) => {
  submitting.value = true
  try {
    if (payload.id) {
      await organizationApi.update(selectedOrganization.value.id, payload)
      toast.success(t('ORGANIZATION_MANAGEMENT.MESSAGE.UPDATE_SUCCESS'))
    } else {
      await organizationApi.create(payload)
      toast.success(t('ORGANIZATION_MANAGEMENT.MESSAGE.CREATE_SUCCESS'))
    }
    closeModal()
    await fetchOrganizations()
    await organizationStore.fetchOrganizations()
  } catch (error) {
    console.error('Error saving organization:', error)
    toast.error(t('ORGANIZATION_MANAGEMENT.MESSAGE.GENERAL_ERROR'))
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  try {
    const res = await organizationApi.delete(id)
    if (res.status && res.data) {
      toast.success(t('ORGANIZATION_MANAGEMENT.MESSAGE.DELETE_SUCCESS'))
    } else {
      toast.error(t('ORGANIZATION_MANAGEMENT.MESSAGE.DELETE_ERROR'))
    }
    closeDeleteModal()
    await fetchOrganizations()
    await organizationStore.fetchOrganizations()
  } catch (error) {
    console.error('Error deleting organization:', error)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

onMounted(() => {
  fetchOrganizations()
})
</script>

<style scoped>
.organization-management-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-tertiary);
  transition: background-color 0.3s ease;
}

.organization-management-container {
  flex: 1;
  padding: 2rem;
  background-color: var(--bg-tertiary);
  color: var(--text-primary, #333);
  transition: background-color 0.3s ease;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: var(--text-primary);
  font-size: 2rem;
  margin: 0;
  transition: color 0.3s ease;
}

.btn-create {
  background-color: #891c1c;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
}

.btn-create:hover {
  background-color: #6b1515;
}

.search-filter-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 1rem;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.loading-container p {
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-primary);
  border-top: 4px solid #891c1c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.table-container {
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px var(--shadow);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.organizations-table {
  width: 100%;
  border-collapse: collapse;
}

.organizations-table thead {
  background-color: #891c1c;
  color: white;
}

.organizations-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
}

.organizations-table tbody tr {
  border-bottom: 1px solid var(--border-primary);
  transition: background-color 0.2s ease;
}

.organizations-table tbody tr:hover {
  background-color: var(--hover-bg);
}

.organizations-table td {
  padding: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit {
  background-color: #3b82f6;
  color: white;
}

.btn-edit:hover {
  opacity: 0.8;
}

.btn-view {
  background-color: #10b981;
  color: white;
}

.btn-view:hover {
  opacity: 0.8;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
}

.btn-delete:hover {
  opacity: 0.8;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}
</style>
