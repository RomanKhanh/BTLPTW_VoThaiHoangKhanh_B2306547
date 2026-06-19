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
const menuOpen = ref(false);

const navItems = [
  { to: "/reader/loans", label: "Sách đang mượn", icon: "🧾" },
  { to: "/reader/borrow", label: "Mượn sách", icon: "📚" },
];

async function handleLogout() {
  loggingOut.value = true;
  try {
    await apiLogout();
  } catch {
    // ignore
  } finally {
    auth.clearSession();
    loggingOut.value = false;
    router.push("/login");
    toast.info("Đã đăng xuất");
  }
}
</script>

<template>
  <div class="min-h-full flex flex-col bg-ink-50">
    <header class="bg-white border-b border-ink-100 sticky top-0 z-30">
      <div
        class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <div
            class="h-9 w-9 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-white"
          >
            QL
          </div>
          <span class="font-semibold text-ink-800 hidden sm:inline"
            >QuanLyMuonSach</span
          >
        </div>

        <nav class="hidden md:flex items-center gap-1">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="px-4 py-2 rounded-lg text-sm font-medium text-ink-500 hover:text-brand-600 hover:bg-brand-50"
            active-class="!text-brand-700 !bg-brand-50"
          >
            {{ item.icon }} {{ item.label }}
          </router-link>
        </nav>

        <div class="relative">
          <button
            class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-ink-100"
            @click="menuOpen = !menuOpen"
          >
            <div
              class="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-sm font-semibold text-white"
            >
              {{ (auth.displayName || "DG").charAt(0).toUpperCase() }}
            </div>
            <span class="text-sm font-medium text-ink-700 hidden sm:inline">{{
              auth.displayName
            }}</span>
          </button>
          <div
            v-if="menuOpen"
            class="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-ink-100 py-1 z-40"
            @click="menuOpen = false"
          >
            <router-link
              to="/reader/profile"
              class="block px-4 py-2 text-sm text-ink-600 hover:bg-ink-50"
            >
              Hồ sơ của tôi
            </router-link>
            <button
              :disabled="loggingOut"
              class="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
              @click="handleLogout"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <!-- mobile nav -->
      <nav class="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="px-3 py-1.5 rounded-lg text-sm font-medium text-ink-500 whitespace-nowrap hover:bg-brand-50"
          active-class="!text-brand-700 !bg-brand-50"
        >
          {{ item.icon }} {{ item.label }}
        </router-link>
      </nav>
    </header>

    <main class="flex-1">
      <div class="max-w-6xl mx-auto px-6 py-6">
        <router-view />
      </div>
    </main>
  </div>
</template>
