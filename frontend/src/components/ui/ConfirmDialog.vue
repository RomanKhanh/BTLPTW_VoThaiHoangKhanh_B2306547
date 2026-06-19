<script setup>
import AppModal from "./AppModal.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "Xác nhận" },
  message: { type: String, default: "Bạn có chắc chắn muốn thực hiện hành động này?" },
  confirmText: { type: String, default: "Xác nhận" },
  cancelText: { type: String, default: "Hủy" },
  danger: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

function onCancel() {
  emit("update:modelValue", false);
  emit("cancel");
}
function onConfirm() {
  emit("confirm");
}
</script>

<template>
  <AppModal :model-value="modelValue" :title="title" width="max-w-sm" @update:model-value="$emit('update:modelValue', $event)">
    <p class="text-sm text-ink-600">{{ message }}</p>
    <template #footer>
      <button
        class="px-4 py-2 rounded-lg text-sm font-medium text-ink-600 hover:bg-ink-100"
        @click="onCancel"
      >
        {{ cancelText }}
      </button>
      <button
        :disabled="loading"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60',
          danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700',
        ]"
        @click="onConfirm"
      >
        {{ loading ? "Đang xử lý..." : confirmText }}
      </button>
    </template>
  </AppModal>
</template>
