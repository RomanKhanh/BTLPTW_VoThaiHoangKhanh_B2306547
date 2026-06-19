<script setup>
defineProps({
  title: { type: String, default: "Không có dữ liệu" },
  description: { type: String, default: "" },
});
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="h-14 w-14 rounded-2xl bg-ink-100 flex items-center justify-center text-2xl mb-4">
      📭
    </div>
    <p class="text-sm font-medium text-ink-700">{{ title }}</p>
    <p v-if="description" class="text-sm text-ink-400 mt-1 max-w-sm">{{ description }}</p>
  </div>
</template>
