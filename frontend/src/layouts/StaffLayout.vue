<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useToastStore } from "../stores/toast";
import { logout as apiLogout } from "../api/auth.api";

const router = useRouter();
const auth = useAuthStore();
const toast = useToastStore();
const loggingOut = ref(false);

const allNavItems = [
  { to: "/staff/home", label: "Trang chủ", icon: "🏠" },
  { to: "/staff/books", label: "Danh sách sách", icon: "📚" },
  { to: "/staff/loans", label: "Quản lý mượn sách", icon: "🧾" },
  { to: "/staff/readers", label: "Độc giả", icon: "🧑‍🤝‍🧑" },
  { to: "/staff/publishers", label: "Nhà xuất bản", icon: "🏢" },
  { to: "/staff/staffs", label: "Nhân viên", icon: "🪪", adminOnly: true },
];

const navItems = computed(() =>
  allNavItems.filter((item) => !item.adminOnly || auth.isManager),
);

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
    <aside
      class="w-64 shrink-0 bg-ink-900 text-ink-100 flex flex-col shadow-xl"
    >
      <div class="px-5 py-5 flex items-center gap-3 border-b border-white/5">
        <img
          src="/logo.png"
          alt="ReadNest Logo"
          class="h-16 w-16 rounded-2xl object-contain"
        />
        <div class="leading-tight">
          <p class="text-sm font-semibold text-white tracking-wide">ReadNest</p>
          <p class="text-xs text-ink-400">Khu vực nhân viên</p>
        </div>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-400 hover:bg-white/5 hover:text-white transition-all duration-200 hover:translate-x-1"
          active-class="!bg-brand-600 !text-white shadow-lg shadow-brand-600/15"
        >
          <span class="text-base">{{ item.icon }}</span>
          {{ item.label }}
        </router-link>
      </nav>

      <!-- Bottom Profile & Logout -->
      <div class="p-3 border-t border-white/5 space-y-2 bg-ink-950/40">
        <router-link
          to="/staff/profile"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all duration-200 group"
        >
          <div
            class="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-500 to-brand-400 flex items-center justify-center text-sm font-semibold text-white shadow-sm"
          >
            {{ (auth.displayName || "NV").charAt(0).toUpperCase() }}
          </div>
          <div class="leading-tight overflow-hidden flex-1">
            <p
              class="text-sm font-medium text-white truncate group-hover:text-brand-300 transition-colors"
            >
              {{ auth.displayName }}
            </p>
            <p class="text-xs text-ink-400">
              {{ auth.user?.ChucVu || "Nhân viên" }}
            </p>
          </div>
        </router-link>

        <button
          :disabled="loggingOut"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-transparent transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          @click="handleLogout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.2"
            stroke="currentColor"
            class="w-4 h-4 shrink-0"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3.07-3H21m0 0l-3-3m3 3l-3 3"
            />
          </svg>
          <span>Đăng xuất</span>
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
