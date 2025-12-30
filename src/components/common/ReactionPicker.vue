<template>
  <div
    v-if="visible"
    class="reaction-picker"
    :class="positionClass"
    @click.stop
  >
    <div class="reaction-picker-header">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Tìm icon..."
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
</template>

<script setup>
import { ref, computed } from 'vue'
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
})

const emit = defineEmits(['select', 'close'])

const searchQuery = ref('')
const currentCategory = ref('emotion')

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

const positionClass = computed(() => {
  return props.position === 'right' ? 'reaction-picker-right' : ''
})

const handleSelectIcon = (iconId) => {
  emit('select', iconId)
  emit('close')
}
</script>

<style scoped>
.reaction-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-bottom: 10px;
  width: 280px;
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

.reaction-picker-right {
  left: auto;
  right: 0;
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
  font-size: 0.9rem;
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
  font-size: 1.2rem;
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
