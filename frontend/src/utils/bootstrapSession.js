import { useAuthStore } from "../stores/auth";
import { refresh as apiRefresh } from "../api/auth.api";
import { getStaffByMSNV } from "../api/staff.api";
import { getReaderByMaDocGia } from "../api/reader.api";
import { decodeJwtPayload } from "./jwt";

export async function bootstrapSession() {
  const auth = useAuthStore();
  try {
    const accessToken = await apiRefresh();
    auth.setAccessToken(accessToken);

    const payload = decodeJwtPayload(accessToken);
    if (!payload) throw new Error("Token không hợp lệ");

    if (payload.role === "staff") {
      const staff = await getStaffByMSNV(payload.MSNV);
      auth.setSession({ accessToken, role: "staff", user: staff });
    } else if (payload.role === "reader") {
      const reader = await getReaderByMaDocGia(payload.MaDocGia);
      auth.setSession({ accessToken, role: "reader", user: reader });
    } else {
      auth.clearSession();
    }
  } catch {
    auth.clearSession();
  } finally {
    auth.bootLoading = false;
  }
}
