import http from "./http";

// filter: { MaDocGia, MaSach, NgayTra, NgayMuon, returned, quaHan }
export function getLoans(filter = {}) {
  return http.get("/monitor-loans", { params: filter }).then((r) => r.data.data);
}

export function getLoansByReaderId(idDG) {
  return http.get(`/monitor-loans/${idDG}`).then((r) => r.data.data);
}

// payload: { MaDocGia, MaSach, NgayHenTra, PhuongThucNhan }
export function createLoan(payload) {
  return http.post("/monitor-loans", payload).then((r) => r.data.data);
}

export function returnLoan(id) {
  return http.patch(`/monitor-loans/${id}`).then((r) => r.data.data);
}
