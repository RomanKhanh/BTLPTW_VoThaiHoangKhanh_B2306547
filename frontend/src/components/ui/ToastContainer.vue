<script setup>
import { useToastStore } from "../../stores/toast";

const toast = useToastStore();

const styles = {
  success: "bg-emerald-600",
  error: "bg-rose-600",
  info: "bg-ink-800",
};
</script>

<template>
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
    <transition-group name="toast">
      <div
        v-for="t in toast.items"
        :key="t.id"
        :class="[styles[t.type] || styles.info, 'text-white rounded-lg shadow-lg px-4 py-3 text-sm flex items-start gap-2']"
      >
        <span class="flex-1">{{ t.message }}</span>
        <button
          class="opacity-70 hover:opacity-100 leading-none"
          @click="toast.remove(t.id)"
        >
          ✕
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
