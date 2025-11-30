<template>
  <div ref="wrapper" class="relative inline-block">
    <!-- Button mở dropdown -->
    <button
      class="px-2 rounded-full hover:bg-[#2a3950] hover:text-[#ffff]"
      @click="open = !open"
    >
      ⋯
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="open"
      class="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
    >
      <!-- Edit -->
      <div
        v-if="canEdit"
        @click="handleEdit"
        class="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer gap-2"
      >
        <span>{{ $t('COMPONENT.COMMON.DROP_DOWN_MENU.BUTTON.BTN_EDIT') }}</span>
      </div>

      <!-- Delete -->
      <div
        v-if="canDelete"
        @click="handleDelete"
        class="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer gap-2"
      >
        <span>{{
          $t('COMPONENT.COMMON.DROP_DOWN_MENU.BUTTON.BTN_DELETE')
        }}</span>
      </div>

      <!-- Detail -->
      <div
        v-if="canDetail"
        @click="handleDetail"
        class="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer gap-2"
      >
        <span>{{
          $t('COMPONENT.COMMON.DROP_DOWN_MENU.BUTTON.BTN_DETAIL')
        }}</span>
      </div>

      <!-- Dịch -->
      <div
        v-if="canTranslate"
        @click="handleTranslate"
        class="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer gap-2"
      >
        <span>{{
          $t('COMPONENT.COMMON.DROP_DOWN_MENU.BUTTON.BTN_TRANSLATE')
        }}</span>
      </div>

      <!-- Pin -->
      <div
        v-if="canTranslate"
        @click="handleTranslate"
        class="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer gap-2"
      >
        <span>Pin</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Props: data, quyền
const props = defineProps({
  data: { type: Object, default: () => ({}) },
  canEdit: { type: Boolean, default: true },
  canDelete: { type: Boolean, default: true },
  canDetail: { type: Boolean, default: true },
  canTranslate: { type: Boolean, default: true },
})

// Emit events
const emit = defineEmits(['edit', 'delete', 'detail'])

const open = ref(false)
const wrapper = ref(null)

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
