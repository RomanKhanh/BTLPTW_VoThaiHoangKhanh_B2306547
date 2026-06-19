<script setup>
defineProps({
  tone: {
    type: String,
    default: "neutral", // neutral | success | warning | danger | brand
  },
});

const toneClasses = {
  neutral: "bg-ink-100 text-ink-600",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  brand: "bg-brand-100 text-brand-700",
};
</script>

<template>
  <span
    :class="[toneClasses[tone] || toneClasses.neutral, 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap']"
  >
    <slot />
  </span>
</template>
