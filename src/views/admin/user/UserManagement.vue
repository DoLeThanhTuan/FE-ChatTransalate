<template>
  <div class="user-management-wrapper">
    <AppHeader />
    <div class="user-management-container">
      <div class="header">
        <h1>{{ $t('USER_MANAGEMENT.TITLE') }}</h1>
        <button @click="openCreateModal" class="btn-create">
          <i class="fas fa-plus"></i>
          {{ $t('USER_MANAGEMENT.BUTTON.CREATE_USER') }}
        </button>
      </div>

      <!-- Search and Filter -->
      <div class="search-filter-bar">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('USER_MANAGEMENT.LABEL.SEARCH_PLACEHOLDER')"
            class="search-input"
          />
        </div>
        <select v-model="roleFilter" class="filter-select">
          <option value="">{{ $t('USER_MANAGEMENT.LABEL.ALL_ROLES') }}</option>
          <option value="USER">
            {{ $t('USER_MANAGEMENT.MODAL.ROLE_USER') }}
          </option>
          <option value="MANAGER">
            {{ $t('USER_MANAGEMENT.MODAL.ROLE_MANAGER') }}
          </option>
        </select>
        <select v-model="departmentFilter" class="filter-select">
          <option value="">
            {{ $t('DEPARTMENT_MANAGEMENT.LABEL.ALL_DEPARTMENTS') }}
          </option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>{{ $t('USER_MANAGEMENT.LABEL.LOADING') }}</p>
      </div>

      <!-- Users Table -->
      <div v-else class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>{{ $t('USER_MANAGEMENT.LABEL.STT') }}</th>
              <th>{{ $t('USER_MANAGEMENT.LABEL.USERNAME_COLUMN') }}</th>
              <th>{{ $t('USER_MANAGEMENT.LABEL.EMAIL') }}</th>
              <th>{{ $t('USER_MANAGEMENT.LABEL.PHONE') }}</th>
              <th>{{ $t('USER_MANAGEMENT.LABEL.ROLE') }}</th>
              <th>{{ $t('USER_MANAGEMENT.LABEL.DEPARTMENT') }}</th>
              <th>{{ $t('USER_MANAGEMENT.LABEL.ACTIONS') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in filteredUsers" :key="user.id">
              <td>{{ index + 1 }}</td>
              <td class="flex gap-2 items-center">
                <UserTooltip
                  :user="user"
                  :department-name="getDepartmentName(user.departmentId)"
                >
                  <img
                    :src="getURLAvatar(user.avatar)"
                    :alt="user.name"
                    class="avatar-img"
                  />
                </UserTooltip>
                <UserTooltip
                  :user="user"
                  :department-name="getDepartmentName(user.departmentId)"
                >
                  <span class="user-name">{{ user.name }}</span>
                </UserTooltip>
              </td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone || $t('USER_MANAGEMENT.LABEL.NA') }}</td>
              <td>
                <span :class="['role-badge', user.role?.toLowerCase()]">
                  {{ user.role }}
                </span>
              </td>
              <td>
                {{
                  getDepartmentName(user.departmentId) ||
                  $t('USER_MANAGEMENT.LABEL.NA')
                }}
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    @click="openEditModal(user)"
                    class="btn-action btn-edit"
                    :title="$t('USER_MANAGEMENT.BUTTON.EDIT')"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" />
                  </button>
                  <button
                    @click="openResetPasswordModal(user)"
                    class="btn-action btn-reset-password"
                    :title="$t('USER_MANAGEMENT.BUTTON.RESET_PASSWORD')"
                  >
                    <font-awesome-icon :icon="['fas', 'key']" />
                  </button>
                  <button
                    v-if="!user.isDisable"
                    @click="openDisableModal(user)"
                    class="btn-action btn-disable"
                    :title="$t('USER_MANAGEMENT.BUTTON.DISABLE')"
                  >
                    <font-awesome-icon :icon="['fas', 'lock']" />
                  </button>
                  <button
                    v-else
                    @click="openEnableModal(user)"
                    class="btn-action btn-enable"
                    :title="$t('USER_MANAGEMENT.BUTTON.ENABLE')"
                  >
                    <font-awesome-icon :icon="['fas', 'unlock']" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="8" class="no-data">
                {{ $t('USER_MANAGEMENT.LABEL.NO_DATA') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create/Edit User Modal -->
      <UserFormModal
        :visible="showModal"
        :is-edit-mode="isEditMode"
        :form-data="formData"
        :departments="departments"
        :submitting="submitting"
        @close="closeModal"
        @submit="handleSubmit"
      />

      <!-- Enable/Disable Confirmation Modal -->
      <ModalConfirmEnableDisable
        v-if="selectedUser"
        :visible="showEnableDisableModal"
        :id="selectedUser.id"
        :is-enable="isEnableAction"
        :message="enableDisableMessage"
        @confirm="handleEnableDisable"
        @cancel="closeEnableDisableModal"
      />

      <!-- Reset Password Confirmation Modal -->
      <ModalConfirmResetPassword
        v-if="selectedUser"
        :visible="showResetPasswordModal"
        :id="selectedUser.id"
        :message="resetPasswordMessage"
        @confirm="handleResetPassword"
        @cancel="closeResetPasswordModal"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/common/AppHeader.vue'
import { userApi } from '@/axios/api-services/userApi'
import { useUserStore } from '@/stores/userStore'
import { useDepartmentStore } from '@/stores/departmentStore'
import ModalConfirmResetPassword from '@/components/common/ModalConfirmResetPassword.vue'
import ModalConfirmEnableDisable from '@/components/common/ModalConfirmEnableDisable.vue'
import UserFormModal from '@/components/admin/modals/UserFormModal.vue'
import UserTooltip from '@/components/common/UserTooltip.vue'
import defaultAvatarImg from '@/assets/default-avatar.png'
import { getURLAvatar } from '@/utils/image'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'vue3-toastify'
import { Password } from '@/config/enum'

const { t } = useI18n()
const authStore = useAuthStore()
const userStore = useUserStore()
const departmentStore = useDepartmentStore()
const users = ref([])
const departments = ref([])
const loading = ref(false)
const showModal = ref(false)
const showEnableDisableModal = ref(false)
const showResetPasswordModal = ref(false)
const isEnableAction = ref(false) // true = enable, false = disable
const isEditMode = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const roleFilter = ref('')
const departmentFilter = ref('')
const selectedUser = ref(null)

const formData = ref({
  name: '',
  email: '',
  phone: '',
  role: '',
  password: '',
  departmentId: '',
  avatar: null,
  language: '',
  theme: '',
})

const defaultAvatar = defaultAvatarImg

const filteredUsers = computed(() => {
  let filtered = users.value.filter(
    (user) => user.id !== authStore.userInfo()?.id
  )

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    )
  }

  // Filter by role
  if (roleFilter.value) {
    filtered = filtered.filter((user) => user.role === roleFilter.value)
  }

  // Filter by department
  if (departmentFilter.value) {
    filtered = filtered.filter(
      (user) => user.departmentId === departmentFilter.value
    )
  }

  return filtered
})

const getDepartmentName = (departmentId) => {
  if (!departmentId) return null
  const dept = departments.value.find((d) => d.id === departmentId)
  return dept?.name || null
}

const resetPasswordMessage = computed(() => {
  if (selectedUser.value) {
    const userName = selectedUser.value.name || selectedUser.value.username
    const password = Password.DEFAULT // Default password - will be shown in confirmation modal

    const confirmText = t('USER_MANAGEMENT.MESSAGE.RESET_PASSWORD_CONFIRM', {
      name: `<strong>${userName}</strong>`,
    })
    const passwordText = t(
      'USER_MANAGEMENT.MESSAGE.RESET_PASSWORD_CONFIRM_MESSAGE',
      {
        password: `<strong>${password}</strong>`,
      }
    )

    return `${confirmText}<br />${passwordText}`
  }
  return ''
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await userApi.getAll()
    users.value = response.data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    toast.error(t('USER_MANAGEMENT.MESSAGE.FETCH_ERROR'))
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditMode.value = false
  formData.value = {
    name: '',
    email: '',
    phone: '',
    role: 'USER',
    password: '',
    departmentId: departmentStore.departments[0]?.id || '',
    avatar: null,
    language: 'VI',
    theme: 'light',
  }
  showModal.value = true
}

const openEditModal = (user) => {
  isEditMode.value = true
  formData.value = {
    name: user.name || user.username,
    email: user.email,
    phone: user.phone || '',
    role: user.role || '',
    password: '',
    departmentId: user.departmentId || '',
    avatar: user.avatar || null,
    language: user.language || 'VI',
    theme: user.theme || 'light',
  }
  selectedUser.value = user
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
}

const openEnableModal = (user) => {
  selectedUser.value = user
  isEnableAction.value = true
  showEnableDisableModal.value = true
}

const openDisableModal = (user) => {
  selectedUser.value = user
  isEnableAction.value = false
  showEnableDisableModal.value = true
}

const closeEnableDisableModal = () => {
  showEnableDisableModal.value = false
  selectedUser.value = null
  isEnableAction.value = false
}

const enableDisableMessage = computed(() => {
  if (selectedUser.value) {
    const userName = selectedUser.value.name || selectedUser.value.username
    const messageKey = isEnableAction.value
      ? 'COMPONENT.COMMON.MODAL_CONFIRM_ENABLE_DISABLE.LABEL.MESSAGE_ENABLE'
      : 'COMPONENT.COMMON.MODAL_CONFIRM_ENABLE_DISABLE.LABEL.MESSAGE_DISABLE'
    const message = t(messageKey)
    return message.replace(
      'người dùng này',
      `người dùng <strong>${userName}</strong>`
    )
  }
  return ''
})

const openResetPasswordModal = (user) => {
  selectedUser.value = user
  showResetPasswordModal.value = true
}

const closeResetPasswordModal = () => {
  showResetPasswordModal.value = false
  selectedUser.value = null
}

const handleResetPassword = async (id) => {
  try {
    const res = await userApi.resetPassword(id, {
      newPassword: Password.DEFAULT,
    })
    if (res.status !== 200) {
      toast.error(t('USER_MANAGEMENT.MESSAGE.RESET_PASSWORD_ERROR'))
      closeResetPasswordModal()
      return
    }
    if (res.status == 200 && res.data == false) {
      toast.error(t('USER_MANAGEMENT.MESSAGE.RESET_PASSWORD_ERROR'))
      closeResetPasswordModal()
      return
    }
    toast.success(t('USER_MANAGEMENT.MESSAGE.RESET_PASSWORD_SUCCESS'))
    closeResetPasswordModal()
  } catch (error) {
    console.error('Error resetting password:', error)
    toast.error(t('USER_MANAGEMENT.MESSAGE.RESET_PASSWORD_ERROR'))
  }
}

const handleSubmit = async (payload) => {
  submitting.value = true
  try {
    // If there's an avatar file, use FormData
    const formData = new FormData()
    formData.append('name', payload.name)
    formData.append('email', payload.email)
    formData.append('joinChannel', payload.joinChannel)
    formData.append('phone', payload.phone)
    formData.append('role', payload.role)
    formData.append('password', payload.password)
    formData.append('departmentId', payload.departmentId)
    formData.append('language', payload.language)
    formData.append('theme', payload.theme)
    if (payload.avatarFile) formData.append('avatar', payload.avatarFile)

    if (isEditMode.value) {
      const res = await userApi.updateUser(selectedUser.value.id, formData)
      toast.success(t('USER_MANAGEMENT.MESSAGE.UPDATE_SUCCESS'))
      closeModal()
      await fetchUsers()
    } else {
      const res = await userApi.createUser(formData)
      if (res.status == 200) {
        if (res.data) {
          toast.success(t('USER_MANAGEMENT.MESSAGE.CREATE_SUCCESS'))
          closeModal()
          await fetchUsers()
          await userStore.fetchUsers() // Refresh store
        } else {
          toast.error(t('USER_MANAGEMENT.MESSAGE.EXISTS_ERROR'))
        }
      }
    }
  } catch (error) {
    if (error.status == 403) {
      toast.error(t('USER_MANAGEMENT.MESSAGE.UPDATE_USER_ADMIN_CHANNEL_ERROR'))
      return
    }
    console.error('Error saving user:', error)
    toast.error(
      error.response?.data?.message ||
        (isEditMode.value
          ? t('USER_MANAGEMENT.MESSAGE.UPDATE_ERROR')
          : t('USER_MANAGEMENT.MESSAGE.CREATE_ERROR'))
    )
  } finally {
    submitting.value = false
  }
}

const handleEnableDisable = async (id) => {
  try {
    await userApi.changeStatusUser(id)
    toast.success(
      isEnableAction.value
        ? t('USER_MANAGEMENT.MESSAGE.ENABLE_SUCCESS')
        : t('USER_MANAGEMENT.MESSAGE.DISABLE_SUCCESS')
    )
    closeEnableDisableModal()
    await fetchUsers()
    await userStore.fetchUsers()
  } catch (error) {
    console.error('Error enabling/disabling user:', error)
    toast.error(
      isEnableAction.value
        ? t('USER_MANAGEMENT.MESSAGE.ENABLE_ERROR')
        : t('USER_MANAGEMENT.MESSAGE.DISABLE_ERROR')
    )
  }
}

const fetchDepartments = async () => {
  try {
    await departmentStore.fetchDepartments()
    departments.value = departmentStore.departments
  } catch (error) {
    console.error('Error fetching departments:', error)
  }
}

onMounted(() => {
  fetchUsers()
  fetchDepartments()
})
</script>

<style scoped>
.user-management-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-tertiary);
  transition: background-color 0.3s ease;
}

.user-management-container {
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

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
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

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background-color: #891c1c;
  color: white;
}

.users-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
}

.users-table tbody tr {
  border-bottom: 1px solid var(--border-primary);
  transition: background-color 0.2s ease;
}

.users-table tbody tr:hover {
  background-color: var(--hover-bg);
}

.users-table td {
  padding: 1rem;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}

.user-name {
  cursor: pointer;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.role-badge.manager {
  background-color: #fee2e2;
  color: #991b1b;
}

.role-badge.user {
  background-color: #dbeafe;
  color: #1e40af;
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

.btn-reset-password {
  background-color: #10b981;
  color: white;
}

.btn-reset-password:hover {
  opacity: 0.8;
}

.btn-disable {
  background-color: #ef4444;
  color: white;
}

.btn-disable:hover {
  opacity: 0.8;
}

.btn-enable {
  background-color: #10b981;
  color: white;
}

.btn-enable:hover {
  opacity: 0.8;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}
</style>
