export const MAX_LOAN_DAYS = 21;
export const DEFAULT_LOAN_DAYS = 14;

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN");
}

// Trả về chuỗi yyyy-MM-dd để dùng cho input[type=date]
export function toInputDate(value) {
  const d = value ? new Date(value) : new Date();
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isOverdue(loan) {
  if (!loan || loan.NgayTra) return false;
  if (!loan.NgayHenTra) return false;
  return new Date(loan.NgayHenTra).getTime() < Date.now();
}

export function daysLeft(loan) {
  if (!loan?.NgayHenTra) return null;
  const diff = new Date(loan.NgayHenTra).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
