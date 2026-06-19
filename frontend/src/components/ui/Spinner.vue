<script setup>
defineProps({
  size: { type: String, default: "h-6 w-6" },
});
</script>

<template>
  <div
    :class="[size, 'animate-spin rounded-full border-2 border-ink-200 border-t-brand-600']"
  ></div>
</template>
