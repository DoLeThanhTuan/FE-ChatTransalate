<template>
  <div class="avatar-wrapper" :class="{ 'with-status': showStatus }">
    <img class="avatar" :class="sizeClass" :src="avatarUrl" :alt="alt" />
    <span
      v-if="showStatus && status"
      class="status-indicator"
      :class="{
        online: status === 'ONLINE',
        offline: status === 'OFFLINE',
      }"
    ></span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getURLAvatar } from '@/utils/image'

const props = defineProps({
  // Avatar name (string) hoặc user object (để tương thích ngược)
  avatar: {
    type: [String, Object],
    default: null,
  },
  // Status riêng: 'ONLINE' | 'OFFLINE'
  status: {
    type: String,
    default: null,
    validator: (value) => !value || ['ONLINE', 'OFFLINE'].includes(value),
  },
  // Size: 'small' | 'medium' | 'large' | 'xlarge' hoặc custom size
  size: {
    type: String,
    default: 'medium',
    validator: (value) =>
      ['small', 'medium', 'large', 'xlarge'].includes(value) ||
      value.includes('px'),
  },
  // Hiển thị status indicator
  showStatus: {
    type: Boolean,
    default: false,
  },
  // Alt text cho image
  alt: {
    type: String,
    default: 'avatar',
  },
})

const avatarUrl = computed(() => {
  if (!props.avatar) return getURLAvatar(null)
  if (typeof props.avatar === 'string') {
    return getURLAvatar(props.avatar)
  }
  // Nếu là object (user object)
  return getURLAvatar(props.avatar.avatar)
})

const status = computed(() => {
  // Ưu tiên status prop trước
  if (props.status) {
    return props.status
  }
  // Nếu truyền user object thì lấy status từ object
  if (typeof props.avatar === 'object' && props.avatar?.status) {
    return props.avatar.status
  }
  return null
})

const sizeClass = computed(() => {
  if (['small', 'medium', 'large', 'xlarge'].includes(props.size)) {
    return `avatar-${props.size}`
  }
  return ''
})

const avatarSize = computed(() => {
  if (props.size.includes('px')) {
    return props.size
  }
  return null
})
</script>

<style scoped>
.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar-wrapper.with-status {
  position: relative;
}

.avatar {
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-primary, #e0e0e0);
  display: block;
}

.avatar-small {
  width: 30px;
  height: 30px;
}

.avatar-medium {
  width: 40px;
  height: 40px;
}

.avatar-large {
  width: 44px;
  height: 44px;
}

.avatar-xlarge {
  width: 60px;
  height: 60px;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2.5px solid var(--bg-bar);
  box-sizing: border-box;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.status-indicator.online {
  background-color: #10b981;
  box-shadow: 0 0 0 2px var(--bg-bar), 0 0 4px rgba(16, 185, 129, 0.5);
}

.status-indicator.offline {
  background-color: #6b7280;
  box-shadow: 0 0 0 2px var(--bg-bar);
}

/* Custom size */
.avatar[style*='width'] {
  height: var(--avatar-size, auto);
}
</style>
