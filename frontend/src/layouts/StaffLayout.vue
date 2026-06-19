<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useToastStore } from "../stores/toast";
import { logout as apiLogout } from "../api/auth.api";

const router = useRouter();
const auth = useAuthStore();
const toast = useToastStore();
const loggingOut = ref(false);

const navItems = [
  { to: "/staff/home", label: "Trang chủ", icon: "🏠" },
  { to: "/staff/books", label: "Danh sách sách", icon: "📚" },
  { to: "/staff/loans", label: "Quản lý mượn sách", icon: "🧾" },
  { to: "/staff/readers", label: "Độc giả", icon: "🧑‍🤝‍🧑" },
  { to: "/staff/publishers", label: "Nhà xuất bản", icon: "🏢" },
  { to: "/staff/staffs", label: "Nhân viên", icon: "🪪" },
];

async function handleLogout() {
  loggingOut.value = true;
  try {
    await apiLogout();
  } catch {
    // dù lỗi vẫn cho đăng xuất ở client
  } finally {
    auth.clearSession();
    loggingOut.value = false;
    router.push("/login");
    toast.info("Đã đăng xuất");
  }
}
</script>

<template>
  <div class="h-full flex bg-ink-50">
    <!-- Sidebar -->
    <aside class="w-64 shrink-0 bg-ink-900 text-ink-100 flex flex-col">
      <div class="px-5 py-5 flex items-center gap-2 border-b border-white/10">
        <div class="h-9 w-9 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-white">
          QL
        </div>
        <div class="leading-tight">
          <p class="text-sm font-semibold text-white">QuanLyMuonSach</p>
          <p class="text-xs text-ink-400">Khu vực nhân viên</p>
        </div>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-300 hover:bg-white/5 hover:text-white transition-colors"
          active-class="!bg-brand-600 !text-white"
        >
          <span class="text-base">{{ item.icon }}</span>
          {{ item.label }}
        </router-link>
      </nav>

      <div class="px-3 py-4 border-t border-white/10">
        <router-link
          to="/staff/profile"
          class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 mb-1"
        >
          <div class="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-sm font-semibold text-white">
            {{ (auth.displayName || "NV").charAt(0).toUpperCase() }}
          </div>
          <div class="leading-tight overflow-hidden">
            <p class="text-sm font-medium text-white truncate">{{ auth.displayName }}</p>
            <p class="text-xs text-ink-400">{{ auth.user?.ChucVu || "Nhân viên" }}</p>
          </div>
        </router-link>
        <button
          :disabled="loggingOut"
          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-300 hover:bg-white/5 hover:text-white disabled:opacity-60"
          @click="handleLogout"
        >
          <span>🚪</span> Đăng xuất
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto">
      <div class="max-w-6xl mx-auto px-6 py-6">
        <router-view />
      </div>
    </main>
  </div>
</template>
