<template>
  <span
    ref="wrapperRef"
    class="user-tooltip-wrapper"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot />
  </span>
  <Teleport to="body">
    <div
      v-if="show && user"
      ref="tooltipRef"
      class="user-tooltip"
      :class="computedPosition"
      :style="tooltipStyle"
    >
      <div class="tooltip-arrow" :class="computedPosition"></div>
      <div class="tooltip-header">
        <img
          :src="getURLAvatar(user.avatar)"
          :alt="user.name"
          class="tooltip-avatar"
        />
        <div class="tooltip-user-info">
          <div class="tooltip-name">{{ user.name }}</div>
          <div class="tooltip-email">{{ user.email }}</div>
        </div>
      </div>
      <div class="tooltip-content">
        <div v-if="user.phone" class="tooltip-row">
          <span class="tooltip-label"
            >{{ $t('USER_MANAGEMENT.LABEL.PHONE') }}:</span
          >
          <span class="tooltip-value">{{ user.phone }}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label"
            >{{ $t('USER_MANAGEMENT.LABEL.ROLE') }}:</span
          >
          <span class="tooltip-value">{{ user.role }}</span>
        </div>
        <div v-if="departmentName" class="tooltip-row">
          <span class="tooltip-label"
            >{{ $t('USER_MANAGEMENT.LABEL.DEPARTMENT') }}:</span
          >
          <span class="tooltip-value">{{ departmentName }}</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue'
import { getURLAvatar } from '@/utils/image'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
  departmentName: {
    type: String,
    default: '',
  },
  position: {
    type: String,
    default: 'bottom',
    validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value),
  },
})

const show = ref(false)
const wrapperRef = ref(null)
const tooltipRef = ref(null)
const tooltipStyle = ref({})
const computedPosition = ref(props.position)

const updatePosition = () => {
  if (!wrapperRef.value || !tooltipRef.value) return

  try {
    const rect = wrapperRef.value.getBoundingClientRect()
    const tooltipRect = tooltipRef.value.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 8
    const arrowSize = 8

    let top = 0
    let left = 0
    let transform = ''
    let actualPosition = props.position

    // Tính toán vị trí ban đầu
    if (props.position === 'bottom') {
      top = rect.bottom + padding
      left = rect.left + rect.width / 2
      transform = 'translateX(-50%)'

      // Kiểm tra nếu bị cắt dưới đáy
      const estimatedHeight = tooltipRect.height > 0 ? tooltipRect.height : 150
      if (top + estimatedHeight > viewportHeight - padding) {
        // Đổi sang hiển thị ở trên
        top = rect.top - estimatedHeight - padding
        actualPosition = 'top'
        computedPosition.value = actualPosition
      }

      // Kiểm tra nếu bị cắt bên phải
      const tooltipLeft = left - tooltipRect.width / 2
      if (tooltipLeft + tooltipRect.width > viewportWidth - padding) {
        left = viewportWidth - tooltipRect.width - padding
        transform = 'translateX(0)'
      }

      // Kiểm tra nếu bị cắt bên trái
      const finalTooltipLeft =
        transform === 'translateX(0)' ? left : left - tooltipRect.width / 2
      if (finalTooltipLeft < padding) {
        left = padding
        transform = 'translateX(0)'
      }
    } else if (props.position === 'top') {
      const estimatedHeight = tooltipRect.height > 0 ? tooltipRect.height : 150
      top = rect.top - estimatedHeight - padding
      left = rect.left + rect.width / 2
      transform = 'translateX(-50%)'

      // Kiểm tra nếu bị cắt phía trên
      if (top < padding) {
        // Đổi sang hiển thị ở dưới
        top = rect.bottom + padding
        actualPosition = 'bottom'
      }

      // Cập nhật computedPosition
      computedPosition.value = actualPosition

      // Kiểm tra nếu bị cắt bên phải
      const tooltipLeft = rect.left + rect.width / 2 - tooltipRect.width / 2
      if (tooltipLeft + tooltipRect.width > viewportWidth - padding) {
        left = viewportWidth - tooltipRect.width - padding
        transform = 'translateX(0)'
      }

      // Kiểm tra nếu bị cắt bên trái
      if (tooltipLeft < padding) {
        left = padding
        transform = 'translateX(0)'
      }
    } else if (props.position === 'right') {
      top = rect.top + rect.height / 2
      left = rect.right + padding
      transform = 'translateY(-50%)'

      // Kiểm tra nếu bị cắt bên phải
      if (left + tooltipRect.width > viewportWidth - padding) {
        // Đổi sang hiển thị bên trái
        const estimatedWidth = tooltipRect.width > 0 ? tooltipRect.width : 250
        left = rect.left - estimatedWidth - padding
        actualPosition = 'left'
      }

      // Cập nhật computedPosition
      computedPosition.value = actualPosition

      // Kiểm tra nếu bị cắt phía trên
      if (top - tooltipRect.height / 2 < padding) {
        top = padding + tooltipRect.height / 2
      }

      // Kiểm tra nếu bị cắt phía dưới
      if (top + tooltipRect.height / 2 > viewportHeight - padding) {
        top = viewportHeight - tooltipRect.height / 2 - padding
      }
    } else if (props.position === 'left') {
      const estimatedWidth = tooltipRect.width > 0 ? tooltipRect.width : 250
      top = rect.top + rect.height / 2
      left = rect.left - estimatedWidth - padding
      transform = 'translateY(-50%)'

      // Kiểm tra nếu bị cắt bên trái
      if (left < padding) {
        // Đổi sang hiển thị bên phải
        left = rect.right + padding
        actualPosition = 'right'
      }

      // Cập nhật computedPosition
      computedPosition.value = actualPosition

      // Kiểm tra nếu bị cắt phía trên
      if (top - tooltipRect.height / 2 < padding) {
        top = padding + tooltipRect.height / 2
      }

      // Kiểm tra nếu bị cắt phía dưới
      if (top + tooltipRect.height / 2 > viewportHeight - padding) {
        top = viewportHeight - tooltipRect.height / 2 - padding
      }
    }

    tooltipStyle.value = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      transform: transform,
    }
  } catch (error) {
    console.error('Error updating tooltip position:', error)
  }
}

const handleMouseEnter = async () => {
  computedPosition.value = props.position
  show.value = true
  await nextTick()
  if (tooltipRef.value) {
    updatePosition()
    // Tính toán lại một lần nữa sau khi tooltip render xong để có kích thước chính xác
    await nextTick()
    updatePosition()
  }
}

const handleMouseLeave = () => {
  show.value = false
}

onBeforeUnmount(() => {
  show.value = false
})
</script>

<style scoped>
.user-tooltip-wrapper {
  display: inline-block;
  line-height: 0;
  vertical-align: middle;
}

.user-tooltip {
  position: fixed;
  z-index: 9999;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  min-width: 250px;
  max-width: 300px;
  pointer-events: none;
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.tooltip-arrow.bottom {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 8px 8px 8px;
  border-color: transparent transparent white transparent;
}

.tooltip-arrow.top {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 8px 8px 0 8px;
  border-color: white transparent transparent transparent;
}

.tooltip-arrow.left {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-width: 8px 0 8px 8px;
  border-color: transparent transparent transparent white;
}

.tooltip-arrow.right {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-width: 8px 8px 8px 0;
  border-color: transparent white transparent transparent;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 0.75rem;
}

.tooltip-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.tooltip-user-info {
  flex: 1;
  min-width: 0;
}

.tooltip-name {
  font-weight: 600;
  font-size: 1rem;
  color: #111827;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tooltip-email {
  font-size: 0.8125rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
}

.tooltip-label {
  color: #6b7280;
  font-weight: 500;
}

.tooltip-value {
  color: #111827;
  font-weight: 400;
  text-align: right;
  flex: 1;
  margin-left: 0.5rem;
}

.user-tooltip {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.user-tooltip.top {
  animation: fadeInTop 0.2s ease-out;
}

@keyframes fadeInTop {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .user-tooltip {
    background: #1f2937;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .tooltip-arrow.bottom {
    border-color: transparent transparent #1f2937 transparent;
  }

  .tooltip-arrow.top {
    border-color: #1f2937 transparent transparent transparent;
  }

  .tooltip-arrow.left {
    border-color: transparent transparent transparent #1f2937;
  }

  .tooltip-arrow.right {
    border-color: transparent #1f2937 transparent transparent;
  }

  .tooltip-header {
    border-bottom-color: #374151;
  }

  .tooltip-name {
    color: #f9fafb;
  }

  .tooltip-email {
    color: #9ca3af;
  }

  .tooltip-label {
    color: #9ca3af;
  }

  .tooltip-value {
    color: #f9fafb;
  }

  .tooltip-avatar {
    border-color: #374151;
  }
}
</style>
