<template>
  <div class="department-management-wrapper">
    <AppHeader />
    <div class="department-management-container">
      <div class="header">
        <h1>{{ $t('DEPARTMENT_MANAGEMENT.TITLE') }}</h1>
        <button @click="openCreateModal" class="btn-create">
          <i class="fas fa-plus"></i>
          {{ $t('DEPARTMENT_MANAGEMENT.BUTTON.CREATE_DEPARTMENT') }}
        </button>
      </div>

      <!-- Search and Filter -->
      <div class="search-filter-bar">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('DEPARTMENT_MANAGEMENT.LABEL.SEARCH_PLACEHOLDER')"
            class="search-input"
          />
        </div>
        <select v-model="organizationFilter" class="filter-select">
          <option value="">
            {{ $t('DEPARTMENT_MANAGEMENT.LABEL.ALL_ORGANIZATIONS') }}
          </option>
          <option
            v-for="organization in organizations"
            :key="organization.id"
            :value="organization.id"
          >
            {{ organization.name }}
          </option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>{{ $t('DEPARTMENT_MANAGEMENT.LABEL.LOADING') }}</p>
      </div>

      <!-- Departments Table -->
      <div v-else class="table-container">
        <table class="departments-table">
          <thead>
            <tr>
              <th>{{ $t('DEPARTMENT_MANAGEMENT.LABEL.ID') }}</th>
              <th>{{ $t('DEPARTMENT_MANAGEMENT.LABEL.NAME') }}</th>
              <th>{{ $t('DEPARTMENT_MANAGEMENT.LABEL.ORGANIZATION') }}</th>
              <th>{{ $t('DEPARTMENT_MANAGEMENT.LABEL.DESCRIPTION') }}</th>
              <th>{{ $t('DEPARTMENT_MANAGEMENT.LABEL.USER_COUNT') }}</th>
              <th>{{ $t('DEPARTMENT_MANAGEMENT.LABEL.CREATED_DATE') }}</th>
              <th>{{ $t('DEPARTMENT_MANAGEMENT.LABEL.ACTIONS') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="department in filteredDepartments" :key="department.id">
              <td>{{ department.id }}</td>
              <td>
                <strong>{{ department.name }}</strong>
              </td>
              <td>
                {{ getOrganizationName(department.organizationId) || 'N/A' }}
              </td>
              <td>{{ department.description || 'N/A' }}</td>
              <td>{{ department.userCount || 0 }}</td>
              <td>{{ formatDate(department.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button
                    @click="openEditModal(department)"
                    class="btn-action btn-edit"
                    :title="$t('DEPARTMENT_MANAGEMENT.BUTTON.EDIT')"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" />
                  </button>
                  <button
                    @click="openViewUsersModal(department)"
                    class="btn-action btn-view"
                    :title="$t('DEPARTMENT_MANAGEMENT.BUTTON.VIEW_USERS')"
                  >
                    <font-awesome-icon :icon="['fas', 'info']" />
                  </button>
                  <button
                    @click="openDeleteModal(department)"
                    class="btn-action btn-delete"
                    :title="$t('DEPARTMENT_MANAGEMENT.BUTTON.DELETE')"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredDepartments.length === 0">
              <td colspan="7" class="no-data">
                {{ $t('DEPARTMENT_MANAGEMENT.LABEL.NO_DATA') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create/Edit Department Modal -->
      <DepartmentFormModal
        :visible="showModal"
        :is-edit-mode="isEditMode"
        :form-data="formData"
        :organizations="organizations"
        :submitting="submitting"
        @close="closeModal"
        @submit="handleSubmit"
      />

      <!-- View Users Modal -->
      <DepartmentUsersModal
        :visible="showUsersModal"
        :department-name="selectedDepartment?.name || ''"
        :users="departmentUsers"
        :loading="usersLoading"
        @close="closeUsersModal"
      />

      <!-- Delete Confirmation Modal -->
      <ModalConfirmDelete
        :visible="showDeleteModal"
        :id="selectedDepartment?.id"
        @confirm="handleDelete"
        @cancel="closeDeleteModal"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/common/AppHeader.vue'
import { departmentApi } from '@/axios/api-services/departmentApi'
import { useDepartmentStore } from '@/stores/departmentStore'
import { useOrganizationStore } from '@/stores/organizationStore'
import ModalConfirmDelete from '@/components/common/ModalConfirmDelete.vue'
import DepartmentFormModal from '@/components/admin/modals/DepartmentFormModal.vue'
import DepartmentUsersModal from '@/components/admin/modals/DepartmentUsersModal.vue'
import { toast } from 'vue3-toastify'

const { t } = useI18n()

const departmentStore = useDepartmentStore()
const organizationStore = useOrganizationStore()
const departments = ref([])
const organizations = ref([])
const loading = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const showUsersModal = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const organizationFilter = ref('')
const selectedDepartment = ref(null)
const departmentUsers = ref([])
const usersLoading = ref(false)

const formData = ref({
  name: '',
  description: '',
  organizationId: '',
})

const filteredDepartments = computed(() => {
  let filtered = departments.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (dept) =>
        dept.name?.toLowerCase().includes(query) ||
        dept.description?.toLowerCase().includes(query)
    )
  }

  // Filter by organization
  if (organizationFilter.value) {
    filtered = filtered.filter(
      (dept) => dept.organizationId === organizationFilter.value
    )
  }

  return filtered
})

const getOrganizationName = (organizationId) => {
  if (!organizationId) return null
  const organization = organizations.value.find((o) => o.id === organizationId)
  return organization?.name || null
}

const fetchDepartments = async () => {
  loading.value = true
  try {
    const response = await departmentApi.getAll()
    departments.value = response.data || []
  } catch (error) {
    console.error('Error fetching departments:', error)
    toast.error(t('DEPARTMENT_MANAGEMENT.MESSAGE.FETCH_ERROR'))
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditMode.value = false
  formData.value = {
    name: '',
    description: '',
    organizationId: organizationStore.organizations[0].id,
  }
  showModal.value = true
}

const openEditModal = (department) => {
  isEditMode.value = true
  formData.value = {
    name: department.name || '',
    description: department.description || '',
    organizationId: department.organizationId || '',
  }
  selectedDepartment.value = department
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedDepartment.value = null
}

const openViewUsersModal = async (department) => {
  selectedDepartment.value = department
  showUsersModal.value = true
  usersLoading.value = true
  try {
    const response = await departmentApi.getUsersByDepartment(department.id)
    departmentUsers.value = response.data || []
  } catch (error) {
    console.error('Error fetching department users:', error)
    toast.error(t('DEPARTMENT_MANAGEMENT.MESSAGE.FETCH_USERS_ERROR'))
    departmentUsers.value = []
  } finally {
    usersLoading.value = false
  }
}

const closeUsersModal = () => {
  showUsersModal.value = false
  selectedDepartment.value = null
  departmentUsers.value = []
}

const openDeleteModal = (department) => {
  selectedDepartment.value = department
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedDepartment.value = null
}

const handleSubmit = async (payload) => {
  submitting.value = true
  try {
    if (isEditMode.value) {
      await departmentApi.update(selectedDepartment.value.id, payload)
      toast.success(t('DEPARTMENT_MANAGEMENT.MESSAGE.UPDATE_SUCCESS'))
    } else {
      await departmentApi.create(payload)
      toast.success(t('DEPARTMENT_MANAGEMENT.MESSAGE.CREATE_SUCCESS'))
    }
    closeModal()
    await fetchDepartments()
    await departmentStore.fetchDepartments() // Refresh store
  } catch (error) {
    console.error('Error saving department:', error)
    toast.error(
      error.response?.data?.message ||
        (isEditMode.value
          ? t('DEPARTMENT_MANAGEMENT.MESSAGE.UPDATE_ERROR')
          : t('DEPARTMENT_MANAGEMENT.MESSAGE.CREATE_ERROR'))
    )
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  try {
    const res = await departmentApi.delete(id)
    if (res.status !== 200) {
      toast.error(t('DEPARTMENT_MANAGEMENT.MESSAGE.DELETE_ERROR'))
      closeDeleteModal()
      return
    }
    if (res.status === 200 && res.data === false) {
      toast.error(t('DEPARTMENT_MANAGEMENT.MESSAGE.DELETE_ERROR_USED'))
      closeDeleteModal()
      return
    }
    toast.success(t('DEPARTMENT_MANAGEMENT.MESSAGE.DELETE_SUCCESS'))
    closeDeleteModal()
    await fetchDepartments()
    await departmentStore.fetchDepartments() // Refresh store
  } catch (error) {
    console.error('Error deleting department:', error)
    toast.error(t('DEPARTMENT_MANAGEMENT.MESSAGE.DELETE_ERROR'))
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

const fetchOrganizations = async () => {
  try {
    await organizationStore.fetchOrganizations()
    organizations.value = organizationStore.organizations
  } catch (error) {
    console.error('Error fetching organizations:', error)
  }
}

onMounted(() => {
  fetchDepartments()
  fetchOrganizations()
})
</script>

<style scoped>
.department-management-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-tertiary);
  transition: background-color 0.3s ease;
}

.department-management-container {
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

.departments-table {
  width: 100%;
  border-collapse: collapse;
}

.departments-table thead {
  background-color: #891c1c;
  color: white;
}

.departments-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
}

.departments-table tbody tr {
  border-bottom: 1px solid var(--border-primary);
  transition: background-color 0.2s ease;
}

.departments-table tbody tr:hover {
  background-color: var(--hover-bg);
}

.departments-table td {
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

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}
</style>
