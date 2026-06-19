import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: null,
    role: null, // "staff" | "reader"
    user: null, // thông tin staff hoặc reader hiện tại
    bootLoading: true, // true trong lúc app đang khôi phục session từ refresh-token cookie
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.role,
    isStaff: (state) => state.role === "staff",
    isReader: (state) => state.role === "reader",
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
    },
    setAccessToken(token) {
      this.accessToken = token;
    },
    setUser(user) {
      this.user = user;
    },
    clearSession() {
      this.accessToken = null;
      this.role = null;
      this.user = null;
    },
  },
});
