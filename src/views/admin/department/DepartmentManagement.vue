<template>
  <div class="department-management-wrapper">
    <AppHeader />
    <div class="department-management-container">
      <div class="header">
        <h1>Quản lý phòng ban</h1>
        <button @click="openCreateModal" class="btn-create">
          <i class="fas fa-plus"></i> Tạo phòng ban mới
        </button>
      </div>

      <!-- Search and Filter -->
      <div class="search-filter-bar">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm theo tên phòng ban..."
            class="search-input"
          />
        </div>
        <select v-model="organizationFilter" class="filter-select">
          <option value="">Tất cả tổ chức</option>
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
        <p>Đang tải...</p>
      </div>

      <!-- Departments Table -->
      <div v-else class="table-container">
        <table class="departments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên phòng ban</th>
              <th>Tổ chức</th>
              <th>Mô tả</th>
              <th>Số lượng nhân viên</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
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
                    title="Chỉnh sửa"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" />
                  </button>
                  <button
                    @click="openViewUsersModal(department)"
                    class="btn-action btn-view"
                    title="Xem nhân viên"
                  >
                    <font-awesome-icon :icon="['fas', 'info']" />
                  </button>
                  <button
                    @click="openDeleteModal(department)"
                    class="btn-action btn-delete"
                    title="Xóa"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredDepartments.length === 0">
              <td colspan="7" class="no-data">Không có dữ liệu</td>
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
import AppHeader from '@/components/common/AppHeader.vue'
import { departmentApi } from '@/axios/api-services/departmentApi'
import { useDepartmentStore } from '@/stores/departmentStore'
import { useOrganizationStore } from '@/stores/organizationStore'
import ModalConfirmDelete from '@/components/common/ModalConfirmDelete.vue'
import DepartmentFormModal from '@/components/admin/modals/DepartmentFormModal.vue'
import DepartmentUsersModal from '@/components/admin/modals/DepartmentUsersModal.vue'
import { toast } from 'vue3-toastify'

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
    toast.error('Không thể tải danh sách phòng ban')
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
    toast.error('Không thể tải danh sách nhân viên')
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
      toast.success('Cập nhật phòng ban thành công')
    } else {
      await departmentApi.create(payload)
      toast.success('Tạo phòng ban thành công')
    }
    closeModal()
    await fetchDepartments()
    await departmentStore.fetchDepartments() // Refresh store
  } catch (error) {
    console.error('Error saving department:', error)
    toast.error(
      error.response?.data?.message ||
        (isEditMode.value
          ? 'Không thể cập nhật phòng ban'
          : 'Không thể tạo phòng ban')
    )
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await departmentApi.delete(id)
    toast.success('Xóa phòng ban thành công')
    closeDeleteModal()
    await fetchDepartments()
    await departmentStore.fetchDepartments() // Refresh store
  } catch (error) {
    console.error('Error deleting department:', error)
    toast.error('Không thể xóa phòng ban')
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
