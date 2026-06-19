import http, { refreshAccessToken } from "./http";

// credentials: { MSNV, Password } cho staff, { MaDocGia, Password } cho reader
export function login(credentials) {
  return http.post("/auth/login", credentials).then((r) => r.data);
}

export function logout() {
  return http.post("/auth/logout").then((r) => r.data);
}

export function refresh() {
  return refreshAccessToken();
}

export function registerReader(data) {
  return http.post("/readers", data).then((r) => r.data);
}
