import { defineStore } from "pinia";

const STORAGE_KEY = "qlms.auth.session";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readPersistedSession() {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    return {
      accessToken: parsed.accessToken ?? null,
      role: parsed.role ?? null,
      user: parsed.user ?? null,
    };
  } catch {
    return null;
  }
}

function persistSession(session) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage quota / privacy mode issues.
  }
}

function clearPersistedSession() {
  if (!canUseStorage()) return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

const persistedSession = readPersistedSession();

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: persistedSession?.accessToken ?? null,
    role: persistedSession?.role ?? null, // "staff" | "reader"
    user: persistedSession?.user ?? null, // thông tin staff hoặc reader hiện tại
    bootLoading: true, // true trong lúc app đang khôi phục session từ refresh-token cookie
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.role,
    isStaff: (state) => state.role === "staff",
    isReader: (state) => state.role === "reader",
    // Quyền quản lý nhân viên dựa trên Chức vụ = "Quản lý" (không phân biệt hoa/thường, khoảng trắng thừa)
    isManager: (state) =>
      state.role === "staff" &&
      typeof state.user?.ChucVu === "string" &&
      state.user.ChucVu.trim().toLowerCase() === "quản lý",
    // Mã định danh: MSNV cho staff, MaDocGia cho reader
    code: (state) => state.user?.MSNV || state.user?.MaDocGia || null,
    displayName: (state) => {
      if (!state.user) return "";
      if (state.role === "staff") return state.user.HoTenNV || state.user.MSNV;
      return `${state.user.HoLot || ""} ${state.user.Ten || ""}`.trim();
    },
  },
  actions: {
    setSession({ accessToken, role, user }) {
      this.accessToken = accessToken;
      this.role = role;
      this.user = user;
      persistSession({ accessToken, role, user });
    },
    setAccessToken(token) {
      this.accessToken = token;
      persistSession({
        accessToken: token,
        role: this.role,
        user: this.user,
      });
    },
    setUser(user) {
      this.user = user;
      persistSession({
        accessToken: this.accessToken,
        role: this.role,
        user,
      });
    },
    clearSession() {
      this.accessToken = null;
      this.role = null;
      this.user = null;
      clearPersistedSession();
    },
  },
});
