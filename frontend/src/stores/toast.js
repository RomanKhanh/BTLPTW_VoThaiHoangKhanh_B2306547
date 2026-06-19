import { defineStore } from "pinia";

let nextId = 1;

export const useToastStore = defineStore("toast", {
  state: () => ({
    items: [],
  }),
  actions: {
    push(message, type = "info", timeout = 3500) {
      const id = nextId++;
      this.items.push({ id, message, type });
      if (timeout > 0) {
        setTimeout(() => this.remove(id), timeout);
      }
      return id;
    },
    success(message, timeout) {
      return this.push(message, "success", timeout);
    },
    error(message, timeout) {
      return this.push(message, "error", timeout ?? 5000);
    },
    info(message, timeout) {
      return this.push(message, "info", timeout);
    },
    remove(id) {
      this.items = this.items.filter((t) => t.id !== id);
    },
  },
});

// Helper để lấy message lỗi từ response axios một cách nhất quán
export function extractErrorMessage(err, fallback = "Có lỗi xảy ra") {
  return err?.response?.data?.message || err?.message || fallback;
}
