import http from "./http";

export function getPublishers({ page = 1, limit = 100 } = {}) {
  return http.get("/publishers", { params: { page, limit } }).then((r) => r.data);
}

export function getPublisherByMaNXB(MaNXB) {
  return http.get(`/publishers/MaNXB/${MaNXB}`).then((r) => r.data.data);
}

export function createPublisher(payload) {
  return http.post("/publishers", payload).then((r) => r.data.data);
}

export function updatePublisher(MaNXB, payload) {
  return http.patch(`/publishers/MaNXB/${MaNXB}`, payload).then((r) => r.data.data);
}

export function deletePublisher(MaNXB) {
  return http.delete(`/publishers/MaNXB/${MaNXB}`).then((r) => r.data);
}
