// Chỉ decode phần payload của JWT để lấy thông tin hiển thị (role, mã code...).
// KHÔNG dùng để xác thực - việc xác thực thật sự luôn diễn ra ở backend.
export function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}
