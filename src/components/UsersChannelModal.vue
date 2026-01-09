<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <h2>{{ $t('COMPONENT.CHANNEL.USERS.TITLE') }}</h2>
        <span class="close-btn" @click="$emit('close')">×</span>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <div class="tabs">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'members' }"
            @click="activeTab = 'members'"
          >
            <font-awesome-icon :icon="['fas', 'user-tie']" />
            {{ $t('COMPONENT.CHANNEL.USERS.TAB_MEMBERS') }}
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'add' }"
            @click="activeTab = 'add'"
          >
            + {{ $t('COMPONENT.CHANNEL.USERS.TAB_ADD') }}
          </button>
        </div>

        <div v-if="activeTab === 'members'">
          <template v-if="members && members.length">
            <ul class="member-list">
              <li
                v-for="user in members"
                :key="user.id"
                class="member-item flex items-center justify-between"
              >
                <div class="flex items-center gap-3">
                  <Avatar
                    :avatar="user.avatar"
                    :status="user.status"
                    size="medium"
                    :show-status="true"
                  />
                  <div class="flex flex-col gap-1">
                    <span class="member-name">{{ user.name }} </span>
                    <small class="member-username">{{ user.email }}</small>
                  </div>
                </div>
                <div
                  class="icon-right"
                  v-if="user.id == channelStore.channelCurrent.admin?.id"
                >
                  <span class="new-message-badge">
                    {{ $t('COMPONENT.CHANNEL.USERS.ADMIN') }}
                  </span>
                </div>
                <DropdownMenu
                  :data="user"
                  :can-remove="
                    channelStore.channelCurrent.admin?.id ==
                    authStore.userInfo().id
                  "
                  @remove="handleRemove"
                  @chat="handleChatPrive"
                />
              </li>
            </ul>
          </template>

          <template v-else>
            <p class="text-center text-secondary">
              {{ $t('COMPONENT.CHANNEL.USERS.NO_MEMBERS') }}
            </p>
          </template>
        </div>

        <div v-else class="add-member-panel">
          <div class="candidate-search flex gap-2">
            <input
              v-model.trim="searchKeyword"
              type="text"
              :placeholder="$t('COMPONENT.CHANNEL.USERS.SEARCH_PLACEHOLDER')"
            />
            <button class="btn primary" type="button">
              {{ $t('COMPONENT.CHANNEL.USERS.SEARCH') }}
            </button>
          </div>
          <div class="divider"></div>

          <div v-if="filteredCandidates.length" class="candidate-list">
            <label
              v-for="user in filteredCandidates"
              :key="user.id"
              class="candidate-item"
            >
              <input
                type="checkbox"
                :value="user.id"
                v-model="selectedCandidateIds"
              />
              <Avatar :avatar="user" size="small" />
              <div class="candidate-info">
                <span class="candidate-name">{{ user.name }} </span>
                <small class="candidate-email">{{ user.email }}</small>
              </div>
            </label>
          </div>
          <p v-else class="empty-state">
            {{ $t('COMPONENT.CHANNEL.USERS.NOT_FOUND') }}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-actions gap-2">
        <button class="modal-cancel-btn" @click="$emit('close')">
          {{ $t('COMPONENT.CHANNEL.USERS.CLOSE') }}
        </button>
        <button
          class="btn primary"
          type="button"
          @click="handleAddMembers"
          :disabled="!selectedCandidateIds.length"
        >
          {{ $t('COMPONENT.CHANNEL.USERS.CONFIRM') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import DropdownMenu from './common/DropdownMenuUser.vue'
import Avatar from './common/Avatar.vue'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { TypeChat } from '@/config/enum'
import { useAuthStore } from '@/stores/authStore'
import { useChannelStore } from '@/stores/channelStore'

const props = defineProps({
  visible: { type: Boolean, default: false },
  channelId: { type: [String, Number], required: true },
  members: { type: Array, default: () => [] },
  availableUsers: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'add-members'])
const router = useRouter()
const activeTab = ref('members')
const searchKeyword = ref('')
const selectedCandidateIds = ref([])
const authStore = useAuthStore()
const channelStore = useChannelStore()

const memberIds = computed(
  () => new Set((props.members || []).map((member) => member.id))
)

const filteredCandidates = computed(() => {
  const keyword = searchKeyword.value.toLowerCase()
  return (props.availableUsers || [])
    .filter((user) => !memberIds.value.has(user.id))
    .filter((user) => {
      if (!keyword) return true
      const name = user.name?.toLowerCase() || ''
      const email = user.email?.toLowerCase() || ''
      return name.includes(keyword) || email.includes(keyword)
    })
})

const handleRemove = (user) => {
  // Gửi socket message đến với format @UserCurrent {REMOVED} @UserWasRemoved
  // console.log(`${authStore.userInfo().id} đã xóa ${user.id}`)
  channelStore.removeMemberFromChannel(channelStore.channelCurrent.id, [
    user.id,
  ])
}

const handleChatPrive = (user) => {
  router.push(`/chat-view/${TypeChat.USER}/${user.id}`)
  emit('close')
}

const handleAddMembers = async () => {
  const res = await channelStore.addMemberIntoChannel(props.channelId, [
    ...selectedCandidateIds.value,
  ])
  emit('close')
}

watch(
  () => props.visible,
  (v) => {
    if (!v) {
      activeTab.value = 'members'
      searchKeyword.value = ''
      selectedCandidateIds.value = []
    }
  }
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

:global(.dark) .modal-overlay {
  background: rgba(10, 14, 22, 0.95);
}

.modal-content {
  background: var(--bg-active);
  color: var(--text-primary);
  border-radius: 14px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: 0 2px 24px var(--shadow);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow-y: auto;
}

.candidate-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem 0.5rem 1.5rem;
  background: var(--bg-active);
  position: sticky;
  top: 0;
  z-index: 1;
}
.modal-header h2 {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
}
.close-btn {
  font-size: 1.8rem;
  cursor: pointer;
  color: var(--text-primary);
  opacity: 0.7;
  transition: opacity 0.2s;
}
.close-btn:hover {
  opacity: 1;
}

/* Body */
.modal-body {
  padding: 0.5rem 1.5rem;
}
.tabs {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
  padding: 0.25rem;
  background: var(--bg-tab);
  border-radius: 999px;
}
.tab-btn {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.tab-btn.active {
  background: var(--bg-secondary);
  color: var(--text-primary);
}
.tab-btn:not(.active):hover {
  background: rgba(255, 255, 255, 0.04);
}
.divider {
  margin: 1rem 0;
  height: 1px;
  background: var(--border-primary);
  opacity: 0.6;
}
.member-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.member-item {
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border-primary);
}
.member-name {
  font-weight: 600;
  color: var(--text-primary);
}
.member-username {
  color: var(--text-secondary);
  font-size: 0.85rem;
}
.add-member-panel {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
}
.panel-header h3 {
  margin: 0;
  font-size: 1.05rem;
}
.panel-header p {
  margin: 0.2rem 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}
.candidate-search input {
  width: 100%;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
.candidate-list {
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 0.4rem;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.candidate-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.45rem 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
}
.candidate-item:hover {
  background: var(--hover-bg);
}
.candidate-name {
  font-weight: 600;
  color: var(--text-primary);
}
.candidate-email {
  color: var(--text-secondary);
}
.empty-state {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  padding: 0.5rem 0;
}
.panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
.btn {
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn.primary {
  background: #1ed760;
  color: #fff;
}
.btn.primary:hover:not(:disabled) {
  filter: brightness(0.95);
}
.btn.subtle {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}
.btn.subtle:hover:not(:disabled) {
  filter: brightness(0.95);
}

/* Footer */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0.8rem 1.5rem 1.2rem 1.5rem;
  background: var(--bg-active);
  position: sticky;
  bottom: 0;
}
.modal-cancel-btn {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.modal-cancel-btn:hover {
  background: var(--border-primary);
  color: var(--text-primary);
}

/* Responsive */
@media (max-width: 600px) {
  .modal-content {
    max-width: 95vw;
    border-radius: 10px;
  }
  .modal-body {
    padding: 1rem;
  }
}

.new-message-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1ed760 0%, #17b34a 100%);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(30, 215, 96, 0.3);
  animation: pulse 2s infinite;
  flex-shrink: 0;
}
</style>
