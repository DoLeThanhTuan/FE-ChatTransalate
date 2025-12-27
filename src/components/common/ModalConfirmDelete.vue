<template>
  <div
    v-if="visible"
    class="fixed inset-0 flex items-center justify-center bg-black/50 z-[2000]"
  >
    <div
      class="w-[360px] rounded-xl shadow-lg p-6 animate-fadeIn"
      style="background: var(--bg-active); color: var(--text-primary)"
    >
      <!-- Title -->
      <h2 class="text-xl font-semibold mb-3">
        {{ $t('COMPONENT.COMMON.MODAL_CONFIRM_DELETE.LABEL.HEADER') }}
      </h2>

      <!-- Message -->
      <p class="text-[var(--text-secondary)] mb-6">
        {{ $t('COMPONENT.COMMON.MODAL_CONFIRM_DELETE.LABEL.MESSAGE') }}
      </p>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 rounded-lg font-semibold"
          style="
            background: var(--border-secondary);
            color: var(--text-secondary);
          "
          @click="emit('cancel')"
        >
          {{ $t('COMPONENT.COMMON.MODAL_CONFIRM_DELETE.BUTTON.BTN_CANCEL') }}
        </button>

        <button
          class="px-4 py-2 rounded-lg font-semibold text-white bg-red-600"
          @click="emit('confirm', props.id)"
        >
          {{ $t('COMPONENT.COMMON.MODAL_CONFIRM_DELETE.BUTTON.BTN_DELETE') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  id: { type: [Number, String], required: true },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.18s ease-out;
}
</style>
