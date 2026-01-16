<template>
  <div ref="wrapper" class="relative inline-block">
    <!-- Button mở dropdown -->
    <button
      class="px-2 rounded-full hover:bg-[#1ed760] hover:text-[#ffff]"
      :class="isOwn ? 'text-[#000000]' : 'text-[var(--text-primary)]'"
      @click="open = !open"
    >
      ⋯
    </button>
  </div>
  <Teleport to="body">
    <!-- Dropdown menu -->
    <div
      v-if="open"
      ref="dropdownRef"
      class="dropdown-menu"
      :style="dropdownStyle"
    >
      <!-- Edit -->
      <div
        v-if="canEdit"
        @click="handleEdit"
        class="flex items-center px-3 py-2 hover:rounded-[8px] hover:bg-gray-100 cursor-pointer gap-2"
      >
        <span>{{ $t('COMPONENT.COMMON.DROP_DOWN_MENU.BUTTON.BTN_EDIT') }}</span>
      </div>

      <!-- Delete -->
      <div
        v-if="canDelete"
        @click="handleDelete"
        class="flex items-center px-3 py-2 hover:rounded-[8px] hover:bg-gray-100 cursor-pointer gap-2"
      >
        <span>{{
          $t('COMPONENT.COMMON.DROP_DOWN_MENU.BUTTON.BTN_DELETE')
        }}</span>
      </div>

      <!-- Detail -->
      <div
        v-if="canDetail"
        @click="handleDetail"
        class="flex items-center px-3 py-2 hover:rounded-[8px] hover:bg-gray-100 cursor-pointer gap-2"
      >
        <span>{{
          $t('COMPONENT.COMMON.DROP_DOWN_MENU.BUTTON.BTN_DETAIL')
        }}</span>
      </div>

      <!-- Dịch -->
      <div
        v-if="canTranslate"
        @click="handleTranslate"
        class="flex items-center px-3 py-2 hover:rounded-[8px] hover:bg-gray-100 cursor-pointer gap-2"
      >
        <span>{{
          $t('COMPONENT.COMMON.DROP_DOWN_MENU.BUTTON.BTN_TRANSLATE')
        }}</span>
      </div>

      <!-- Bản gốc -->
      <div
        v-if="canReturn"
        @click="handleReturn"
        class="flex items-center px-3 py-2 hover:rounded-[8px] hover:bg-gray-100 cursor-pointer gap-2"
      >
        <span>{{
          $t('COMPONENT.COMMON.DROP_DOWN_MENU.BUTTON.BTN_ORIGINAL')
        }}</span>
      </div>

      <!-- Pin -->
      <!-- <div
        v-if="canTranslate"
        @click="handleTranslate"
        class="flex items-center px-3 py-2 hover:rounded-[8px] hover:bg-gray-100 cursor-pointer gap-2"
      >
        <span>Pin</span>
      </div> -->
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

// Props: data, quyền
const props = defineProps({
  isOwn: { type: Boolean, default: true },
  data: { type: Object, default: () => ({}) },
  canEdit: { type: Boolean, default: true },
  canDelete: { type: Boolean, default: true },
  canDetail: { type: Boolean, default: true },
  canTranslate: { type: Boolean, default: true },
  canReturn: { type: Boolean, default: true },
})

// Emit events
const emit = defineEmits(['edit', 'delete', 'detail', 'translate', 'return'])

const open = ref(false)
const wrapper = ref(null)
const dropdownRef = ref(null)
const dropdownStyle = ref({})

const updatePosition = () => {
  if (!wrapper.value || !dropdownRef.value || !open.value) return

  try {
    const rect = wrapper.value.getBoundingClientRect()
    const dropdownRect = dropdownRef.value.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 8
    const margin = 8

    let top = rect.bottom + margin
    let left = rect.right
    let transform = 'translateX(-100%)'

    // Kiểm tra nếu bị cắt bên phải
    if (rect.right - dropdownRect.width < padding) {
      // Đổi sang căn bên trái
      left = rect.left
      transform = 'translateX(0)'
    }

    // Kiểm tra nếu bị cắt dưới đáy
    if (top + dropdownRect.height > viewportHeight - padding) {
      // Hiển thị ở trên
      top = rect.top - dropdownRect.height - margin
    }

    // Kiểm tra nếu bị cắt phía trên
    if (top < padding) {
      top = padding
    }

    dropdownStyle.value = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      transform: transform,
    }
  } catch (error) {
    console.error('Error updating dropdown position:', error)
  }
}

// Gọi emit kèm data
const handleEdit = () => {
  emit('edit', props.data)
  open.value = false
}
const handleDelete = () => {
  emit('delete', props.data)
  open.value = false
}
const handleDetail = () => {
  emit('detail', props.data)
  open.value = false
}
const handleTranslate = () => {
  emit('translate', props.data)
  open.value = false
}
const handleReturn = () => {
  emit('return', props.data)
  open.value = false
}

// Click ngoài dropdown sẽ đóng
const clickOutside = (e) => {
  if (
    wrapper.value &&
    !wrapper.value.contains(e.target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(e.target)
  ) {
    open.value = false
  }
}

watch(open, async (newVal) => {
  if (newVal) {
    await nextTick()
    updatePosition()
  }
})

onMounted(() => {
  document.addEventListener('click', clickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', clickOutside)
})
</script>

<style scoped>
.dropdown-menu {
  width: 11rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  z-index: 50;
}
</style>
