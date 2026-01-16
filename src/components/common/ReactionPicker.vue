<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="pickerRef"
      class="reaction-picker"
      :class="computedPositionClass"
      :style="pickerStyle"
      @click.stop
    >
      <div class="reaction-picker-header">
        <input
          type="text"
          v-model="searchQuery"
          :placeholder="$t('COMPONENT.CHAT_VIEW.MESSAGE_INPUT.SEARCH_EMOJI')"
          class="reaction-search"
        />
        <div class="reaction-categories">
          <button
            v-for="(icons, category) in iconCategories"
            :key="category"
            :class="['category-btn', { active: currentCategory === category }]"
            @click="currentCategory = category"
          >
            {{ icons[0]?.value || '📁' }}
          </button>
        </div>
      </div>
      <div class="reaction-grid">
        <div
          v-for="icon in filteredIcons"
          :key="icon.id"
          class="reaction-icon"
          @click="handleSelectIcon(icon.id)"
          :title="icon.key"
        >
          {{ icon.value }}
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { getIcons } from '@/utils/iconUtils'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  position: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'right'].includes(value),
  },
  containerRef: {
    type: [Object, HTMLElement],
    default: null,
  },
})

const emit = defineEmits(['select', 'close'])

const searchQuery = ref('')
const currentCategory = ref('emotion')
const pickerRef = ref(null)
const pickerStyle = ref({})
const computedPosition = ref(props.position)

const iconCategories = computed(() => {
  const icons = getIcons()
  const categories = {}
  icons.forEach((icon) => {
    if (!categories[icon.category]) {
      categories[icon.category] = []
    }
    categories[icon.category].push(icon)
  })
  return categories
})

const filteredIcons = computed(() => {
  let icons = []

  // Lấy icons theo category
  if (currentCategory.value && iconCategories.value[currentCategory.value]) {
    icons = iconCategories.value[currentCategory.value]
  } else {
    icons = Object.values(iconCategories.value).flat()
  }

  // Filter theo search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    icons = icons.filter(
      (icon) =>
        icon.value.includes(searchQuery.value) ||
        icon.key.toLowerCase().includes(query)
    )
  }

  return icons
})

const computedPositionClass = computed(() => {
  return computedPosition.value === 'right' ? 'reaction-picker-right' : ''
})

const updatePosition = () => {
  if (!props.containerRef || !pickerRef.value || !props.visible) return

  try {
    const containerRect = props.containerRef.getBoundingClientRect()
    const pickerRect = pickerRef.value.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 8
    const margin = 10

    let top = containerRect.top - pickerRect.height - margin
    let left = containerRect.left
    let transform = 'translateX(0)'

    // Kiểm tra nếu bị cắt phía trên
    if (top < padding) {
      // Hiển thị ở dưới
      top = containerRect.bottom + margin
    }

    // Kiểm tra nếu bị cắt dưới đáy
    if (top + pickerRect.height > viewportHeight - padding) {
      top = viewportHeight - pickerRect.height - padding
    }

    // Xử lý vị trí ngang dựa trên position prop
    if (props.position === 'right') {
      left = containerRect.right - pickerRect.width
      // Kiểm tra nếu bị cắt bên phải
      if (left + pickerRect.width > viewportWidth - padding) {
        left = viewportWidth - pickerRect.width - padding
      }
      // Kiểm tra nếu bị cắt bên trái
      if (left < padding) {
        left = padding
      }
    } else {
      // position === 'left'
      left = containerRect.left
      // Kiểm tra nếu bị cắt bên trái
      if (left < padding) {
        left = padding
      }
      // Kiểm tra nếu bị cắt bên phải
      if (left + pickerRect.width > viewportWidth - padding) {
        left = viewportWidth - pickerRect.width - padding
      }
    }

    pickerStyle.value = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      transform: transform,
    }
  } catch (error) {
    console.error('Error updating reaction picker position:', error)
  }
}

watch(
  () => props.visible,
  async (newVal) => {
    if (newVal) {
      computedPosition.value = props.position
      await nextTick()
      if (pickerRef.value && props.containerRef) {
        updatePosition()
      }
    }
  }
)

const handleSelectIcon = (iconId) => {
  emit('select', iconId)
  emit('close')
}
</script>

<style scoped>
.reaction-picker {
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 280px;
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

.reaction-picker-header {
  margin-bottom: 10px;
}

.reaction-search {
  width: 100%;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 0.8125rem;
  box-sizing: border-box;
}

.reaction-categories {
  display: flex;
  gap: 5px;
  margin-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 8px;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.reaction-categories::-webkit-scrollbar {
  display: none;
}

.category-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  font-size: 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  flex-shrink: 0;
  outline: none;
}

.category-btn:hover {
  background-color: #f0f0f0;
}

.category-btn.active {
  background-color: #e0e0e0;
}

.reaction-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.reaction-icon {
  cursor: pointer;
  padding: 6px;
  text-align: center;
  font-size: 1.3em;
  transition: background-color 0.2s, transform 0.1s;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reaction-icon:hover {
  background-color: #f0f0f0;
  transform: scale(1.1);
}
</style>
