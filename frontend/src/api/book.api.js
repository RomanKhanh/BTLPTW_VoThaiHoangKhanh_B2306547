import http from "./http";

export function getBooks({
  TenSach,
  NamXuatBan,
  NguonGocTacGia,
  publisherId,
  page = 1,
  limit = 10,
} = {}) {
  return http
    .get("/books", {
      params: { TenSach, NamXuatBan, NguonGocTacGia, publisherId, page, limit },
    })
    .then((r) => r.data); // { success, data, pagination }
}

export function getBookByMaSach(MaSach) {
  return http.get(`/books/${MaSach}`).then((r) => r.data.data);
}

export function createBook(payload) {
  return http.post("/books", payload).then((r) => r.data.data);
}

export function updateBook(MaSach, payload) {
  return http.patch(`/books/${MaSach}`, payload).then((r) => r.data.data);
}

export function deleteBook(MaSach) {
  return http.delete(`/books/${MaSach}`).then((r) => r.data);
}
