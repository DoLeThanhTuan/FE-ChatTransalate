<template>
  <div ref="wrapper" class="relative inline-block">
    <!-- Button mở dropdown -->
    <button
      v-if="props.data.id !== authStore.userInfo().id"
      class="px-2 rounded-full hover:bg-[#1ed760] hover:text-[#ffff]"
      @click="open = !open"
    >
      ⋯
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="open"
      class="absolute text-[var(--text-primary)] right-0 mt-2 w-44 bg-[var(--bg-secondary)] rounded-xl shadow-lg z-50"
    >
      <!-- Xóa khỏi channel -->
      <div
        v-if="canRemove"
        @click="handleRemove"
        class="flex items-center px-3 py-2 hover:rounded-[8px] hover:bg-[var(--bg-tab)] cursor-pointer gap-2"
      >
        <span>Xóa khỏi nhóm</span>
      </div>

      <!-- Nhắn tin riêng -->
      <div
        v-if="canChat"
        @click="handleChatPrive"
        class="flex items-center px-3 py-2 hover:rounded-[8px] hover:bg-[var(--bg-tab)] cursor-pointer gap-2"
      >
        <span>Nhắn tin riêng</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { ref, onMounted, onBeforeUnmount } from 'vue'
// Props: data, quyền
const props = defineProps({
  data: { type: Object, default: () => ({}) },
  canRemove: { type: Boolean, default: true },
  canChat: { type: Boolean, default: true },
})

const authStore = useAuthStore()
// Emit events
const emit = defineEmits(['remove', 'chat'])

const open = ref(false)
const wrapper = ref(null)

// Gọi emit kèm data
const handleRemove = () => {
  emit('remove', props.data)
  open.value = false
}
const handleChatPrive = () => {
  emit('chat', props.data)
  open.value = false
}
// Click ngoài dropdown sẽ đóng
const clickOutside = (e) => {
  if (wrapper.value && !wrapper.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', clickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', clickOutside)
})
</script>
