import http from "./http";

export function getReaders(filter = {}) {
  return http.get("/readers", { params: filter }).then((r) => r.data);
}

export function getReaderByMaDocGia(MaDocGia) {
  return http.get(`/readers/${MaDocGia}`).then((r) => r.data.data);
}

export function createReader(payload) {
  return http.post("/readers", payload).then((r) => r.data.data);
}

export function updateReader(MaDocGia, payload) {
  return http.patch(`/readers/${MaDocGia}`, payload).then((r) => r.data.data);
}

export function changeReaderPassword(MaDocGia, payload) {
  return http
    .patch(`/readers/${MaDocGia}/change-password`, payload)
    .then((r) => r.data);
}

export function resetReaderPassword(MaDocGia, newPassword) {
  return http
    .patch(`/readers/${MaDocGia}/reset-password`, { newPassword })
    .then((r) => r.data);
}

export function deleteReader(MaDocGia) {
  return http.delete(`/readers/${MaDocGia}`).then((r) => r.data);
}
