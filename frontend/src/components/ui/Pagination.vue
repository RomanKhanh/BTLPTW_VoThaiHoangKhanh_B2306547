<script setup>
import { computed } from "vue";

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
});
const emit = defineEmits(["update:page"]);

const pages = computed(() => {
  const total = props.totalPages;
  const current = props.page;
  const range = [];
  const delta = 1;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    } else if (range[range.length - 1] !== "...") {
      range.push("...");
    }
  }
  return range;
});

function go(p) {
  if (p === "..." || p === props.page || p < 1 || p > props.totalPages) return;
  emit("update:page", p);
}
</script>

<template>
  <div class="flex items-center justify-center gap-1" v-if="totalPages > 1">
    <button
      class="px-3 py-1.5 rounded-lg text-sm text-ink-600 hover:bg-ink-100 disabled:opacity-40 disabled:hover:bg-transparent"
      :disabled="page <= 1"
      @click="go(page - 1)"
    >
      ‹ Trước
    </button>
    <button
      v-for="(p, idx) in pages"
      :key="idx"
      :class="[
        'min-w-[34px] px-2 py-1.5 rounded-lg text-sm',
        p === page ? 'bg-brand-600 text-white font-medium' : 'text-ink-600 hover:bg-ink-100',
        p === '...' ? 'cursor-default' : 'cursor-pointer',
      ]"
      @click="go(p)"
    >
      {{ p }}
    </button>
    <button
      class="px-3 py-1.5 rounded-lg text-sm text-ink-600 hover:bg-ink-100 disabled:opacity-40 disabled:hover:bg-transparent"
      :disabled="page >= totalPages"
      @click="go(page + 1)"
    >
      Sau ›
    </button>
  </div>
</template>
