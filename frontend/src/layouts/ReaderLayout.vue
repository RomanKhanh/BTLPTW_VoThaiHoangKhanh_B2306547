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
    <header
      class="bg-white/80 backdrop-blur-md border-b border-ink-100 sticky top-0 z-30 shadow-xs"
    >
      <div
        class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"
      >
        <div class="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="ReadNest Logo"
            class="h-16 w-16 rounded-2xl object-contain"
          />
          <span
            class="font-semibold text-ink-800 tracking-wide hidden sm:inline"
            >ReadNest</span
          >
        </div>

        <nav class="hidden md:flex items-center gap-1.5">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="px-4 py-2 rounded-lg text-sm font-medium text-ink-500 hover:text-brand-600 hover:bg-brand-50/60 transition-all duration-200"
            active-class="!text-brand-700 !bg-brand-100/60 font-semibold"
          >
            {{ item.icon }} {{ item.label }}
          </router-link>
        </nav>

        <div class="relative">
          <button
            class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-ink-100/80 transition-all duration-200 cursor-pointer"
            @click="menuOpen = !menuOpen"
          >
            <div
              class="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-500 to-brand-400 flex items-center justify-center text-sm font-semibold text-white shadow-sm"
            >
              {{ (auth.displayName || "DG").charAt(0).toUpperCase() }}
            </div>
            <span class="text-sm font-medium text-ink-700 hidden sm:inline">{{
              auth.displayName
            }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="w-3.5 h-3.5 text-ink-400 transition-transform duration-200"
              :class="{ 'rotate-180': menuOpen }"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
          <div
            v-if="menuOpen"
            class="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-ink-100/60 py-1.5 z-40 overflow-hidden"
            @click="menuOpen = false"
          >
            <router-link
              to="/reader/profile"
              class="flex items-center gap-2 px-4 py-2 text-sm text-ink-600 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4 text-ink-400"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              Hồ sơ của tôi
            </router-link>
            <button
              :disabled="loggingOut"
              class="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors text-left cursor-pointer border-t border-ink-100/50 mt-1 pt-2 disabled:opacity-60"
              @click="handleLogout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3.07-3H21m0 0l-3-3m3 3l-3 3"
                />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <!-- mobile nav -->
      <nav
        class="md:hidden flex items-center gap-1.5 px-4 pb-2.5 overflow-x-auto"
      >
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="px-3.5 py-1.5 rounded-lg text-sm font-medium text-ink-500 whitespace-nowrap hover:bg-brand-50/60 transition-colors"
          active-class="!text-brand-700 !bg-brand-100/60 font-semibold"
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
