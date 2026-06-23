import http from "./http";

export function getAllStaff(filter = {}) {
  return http.get("/staff", { params: filter }).then((r) => r.data);
}

export function getStaffByMSNV(MSNV) {
  return http.get(`/staff/${MSNV}`).then((r) => r.data.data);
}

export function createStaff(payload) {
  return http.post("/staff", payload).then((r) => r.data.data);
}

export function updateStaff(MSNV, payload) {
  return http.patch(`/staff/${MSNV}`, payload).then((r) => r.data.data);
}

export function changeStaffPassword(MSNV, payload) {
  return http
    .patch(`/staff/${MSNV}/change-password`, payload)
    .then((r) => r.data);
}
