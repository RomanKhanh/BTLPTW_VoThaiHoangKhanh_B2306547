import axios from "axios";
import { useAuthStore } from "../stores/auth";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888/api";

// Instance chính, dùng cho mọi gọi API nghiệp vụ
const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // bắt buộc để gửi cookie refreshToken
});

// Instance "trần", không gắn interceptor, dùng riêng cho gọi /auth/refresh
// để tránh loop vô hạn khi refresh cũng thất bại.
const bareHttp = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export async function refreshAccessToken() {
  const res = await bareHttp.post("/auth/refresh");
  return res.data.accessToken;
}

http.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

let refreshingPromise = null;

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    const isAuthError =
      response?.status === 401 || response?.status === 403;
    const isRefreshCall = config?.url?.includes("/auth/refresh");

    if (isAuthError && !config._retry && !isRefreshCall) {
      config._retry = true;
      try {
        if (!refreshingPromise) {
          refreshingPromise = refreshAccessToken().finally(() => {
            refreshingPromise = null;
          });
        }
        const newToken = await refreshingPromise;
        const auth = useAuthStore();
        auth.setAccessToken(newToken);
        config.headers.Authorization = `Bearer ${newToken}`;
        return http(config);
      } catch (refreshErr) {
        const auth = useAuthStore();
        auth.clearSession();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);

export default http;
