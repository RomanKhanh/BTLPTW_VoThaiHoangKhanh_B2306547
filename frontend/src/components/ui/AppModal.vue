<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "" },
  width: { type: String, default: "max-w-md" },
});
const emit = defineEmits(["update:modelValue", "close"]);

function close() {
  emit("update:modelValue", false);
  emit("close");
}
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4"
        @mousedown.self="close"
      >
        <div
          :class="['w-full', width, 'bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]']"
        >
          <div class="flex items-center justify-between px-6 py-4 border-b border-ink-100">
            <h3 class="text-base font-semibold text-ink-800">{{ title }}</h3>
            <button
              class="text-ink-400 hover:text-ink-700 text-xl leading-none"
              @click="close"
            >
              ✕
            </button>
          </div>
          <div class="px-6 py-5 overflow-y-auto">
            <slot />
          </div>
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-ink-100 flex justify-end gap-3">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
