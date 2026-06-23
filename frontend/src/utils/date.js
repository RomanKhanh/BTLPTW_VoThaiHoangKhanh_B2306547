export const MAX_LOAN_DAYS = 21;
export const DEFAULT_LOAN_DAYS = 14;

function getDateParts(value) {
  if (!value) return null;

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return {
      day: value.getDate(),
      month: value.getMonth() + 1,
      year: value.getFullYear(),
      hours: value.getHours(),
      minutes: value.getMinutes(),
    };
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  const displayMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (displayMatch) {
    return {
      day: Number(displayMatch[1]),
      month: Number(displayMatch[2]),
      year: Number(displayMatch[3]),
      hours: 0,
      minutes: 0,
    };
  }

  const isoDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    return {
      day: Number(isoDateMatch[3]),
      month: Number(isoDateMatch[2]),
      year: Number(isoDateMatch[1]),
      hours: 0,
      minutes: 0,
    };
  }

  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return null;

  return {
    day: parsed.getDate(),
    month: parsed.getMonth() + 1,
    year: parsed.getFullYear(),
    hours: parsed.getHours(),
    minutes: parsed.getMinutes(),
  };
}

function formatTwoDigits(value) {
  return String(value).padStart(2, "0");
}

export function formatDate(value) {
  const parts = getDateParts(value);
  if (!parts) return "—";
  return `${formatTwoDigits(parts.day)}/${formatTwoDigits(parts.month)}/${parts.year}`;
}

export function formatDateTime(value) {
  const parts = getDateParts(value);
  if (!parts) return "—";
  return `${formatTwoDigits(parts.day)}/${formatTwoDigits(parts.month)}/${parts.year} ${formatTwoDigits(parts.hours)}:${formatTwoDigits(parts.minutes)}`;
}

export function toDisplayDate(value) {
  const parts = getDateParts(value);
  if (!parts) return "";
  return `${formatTwoDigits(parts.day)}/${formatTwoDigits(parts.month)}/${parts.year}`;
}

export function toApiDate(value) {
  const parts = getDateParts(value);
  if (!parts) return "";
  return `${parts.year}-${formatTwoDigits(parts.month)}-${formatTwoDigits(parts.day)}`;
}

// Trả về chuỗi yyyy-MM-dd để dùng cho input[type=date]
export function toInputDate(value) {
  return toApiDate(value);
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
