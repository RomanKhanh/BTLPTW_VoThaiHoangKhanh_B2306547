<script setup>
import { ref, reactive, computed } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useToastStore, extractErrorMessage } from "../../stores/toast";
import { updateReader, changeReaderPassword } from "../../api/reader.api";
import { formatDate, toInputDate } from "../../utils/date";
import AppModal from "../../components/ui/AppModal.vue";

const auth = useAuthStore();
const toast = useToastStore();

const editMode = ref(false);
const saving = ref(false);
const form = reactive({
  HoLot: "",
  Ten: "",
  NgaySinh: "",
  Phai: "",
  DiaChi: "",
  DienThoai: "",
});

function startEdit() {
  form.HoLot = auth.user?.HoLot || "";
  form.Ten = auth.user?.Ten || "";
  form.NgaySinh = toInputDate(auth.user?.NgaySinh);
  form.Phai = auth.user?.Phai || "";
  form.DiaChi = auth.user?.DiaChi || "";
  form.DienThoai = auth.user?.DienThoai || "";
  editMode.value = true;
}

async function submitEdit() {
  saving.value = true;
  try {
    const payload = { ...form };
    if (!payload.NgaySinh) delete payload.NgaySinh;
    if (!payload.Phai) delete payload.Phai;
    const updated = await updateReader(auth.user.MaDocGia, payload);
    auth.setUser({ ...auth.user, ...updated });
    toast.success("Cập nhật thông tin thành công");
    editMode.value = false;
  } catch (err) {
    toast.error(extractErrorMessage(err, "Cập nhật thất bại"));
  } finally {
    saving.value = false;
  }
}

// ---- Đổi mật khẩu ----
const showChangePwd = ref(false);
const changingPwd = ref(false);
const pwdForm = reactive({ oldPassword: "", newPassword: "", confirmNew: "" });

async function submitChangePwd() {
  if (pwdForm.newPassword !== pwdForm.confirmNew) {
    toast.error("Mật khẩu xác nhận không khớp");
    return;
  }
  changingPwd.value = true;
  try {
    await changeReaderPassword(auth.user.MaDocGia, {
      oldPassword: pwdForm.oldPassword,
      newPassword: pwdForm.newPassword,
    });
    toast.success("Đổi mật khẩu thành công");
    pwdForm.oldPassword = "";
    pwdForm.newPassword = "";
    pwdForm.confirmNew = "";
    showChangePwd.value = false;
  } catch (err) {
    toast.error(extractErrorMessage(err, "Đổi mật khẩu thất bại"));
  } finally {
    changingPwd.value = false;
  }
}

const displayName = computed(
  () => `${auth.user?.HoLot || ""} ${auth.user?.Ten || ""}`.trim(),
);
</script>

<template>
  <div class="max-w-lg">
    <h1 class="text-xl font-semibold text-ink-800 mb-5">Hồ sơ của tôi</h1>

    <div class="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
      <div class="bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-8 flex items-center gap-4">
        <div class="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
          {{ (displayName || "DG").charAt(0).toUpperCase() }}
        </div>
        <div>
          <p class="text-lg font-semibold text-white">{{ displayName }}</p>
          <p class="text-brand-200 text-sm">Độc giả · {{ auth.user?.MaDocGia }}</p>
        </div>
      </div>

      <div class="px-6 py-5">
        <div v-if="!editMode" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-ink-400">Mã độc giả</p>
              <p class="text-sm font-medium text-ink-700 mt-0.5">{{ auth.user?.MaDocGia }}</p>
            </div>
            <div>
              <p class="text-xs text-ink-400">Giới tính</p>
              <p class="text-sm font-medium text-ink-700 mt-0.5">{{ auth.user?.Phai || "—" }}</p>
            </div>
            <div>
              <p class="text-xs text-ink-400">Ngày sinh</p>
              <p class="text-sm font-medium text-ink-700 mt-0.5">{{ formatDate(auth.user?.NgaySinh) }}</p>
            </div>
            <div>
              <p class="text-xs text-ink-400">Điện thoại</p>
              <p class="text-sm font-medium text-ink-700 mt-0.5">{{ auth.user?.DienThoai || "—" }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-xs text-ink-400">Địa chỉ</p>
              <p class="text-sm font-medium text-ink-700 mt-0.5">{{ auth.user?.DiaChi || "—" }}</p>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
              @click="startEdit"
            >
              ✏️ Chỉnh sửa
            </button>
            <button
              class="px-4 py-2 rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50 text-sm font-medium"
              @click="showChangePwd = true"
            >
              🔐 Đổi mật khẩu
            </button>
          </div>
        </div>

        <form v-else class="space-y-4" @submit.prevent="submitEdit">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-ink-600 mb-1.5">Họ và tên lót *</label>
              <input v-model="form.HoLot" required type="text" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-600 mb-1.5">Tên *</label>
              <input v-model="form.Ten" required type="text" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-600 mb-1.5">Ngày sinh</label>
              <input v-model="form.NgaySinh" type="date" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-600 mb-1.5">Giới tính</label>
              <select v-model="form.Phai" class="input">
                <option value="">-- Chọn --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-ink-600 mb-1.5">Địa chỉ</label>
              <input v-model="form.DiaChi" type="text" class="input" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-ink-600 mb-1.5">Điện thoại</label>
              <input v-model="form.DienThoai" type="tel" class="input" />
            </div>
          </div>

          <div class="flex gap-3">
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-60"
            >
              {{ saving ? "Đang lưu..." : "Lưu thay đổi" }}
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50 text-sm font-medium"
              @click="editMode = false"
            >Hủy</button>
          </div>
        </form>
      </div>
    </div>

    <AppModal v-model="showChangePwd" title="Đổi mật khẩu">
      <form class="space-y-4" @submit.prevent="submitChangePwd">
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Mật khẩu hiện tại</label>
          <input v-model="pwdForm.oldPassword" required type="password" class="input" placeholder="••••••••" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Mật khẩu mới</label>
          <input v-model="pwdForm.newPassword" required type="password" minlength="6" class="input" placeholder="••••••••" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Xác nhận mật khẩu mới</label>
          <input v-model="pwdForm.confirmNew" required type="password" class="input" placeholder="••••••••" />
        </div>
      </form>
      <template #footer>
        <button class="px-4 py-2 rounded-lg text-sm font-medium text-ink-600 hover:bg-ink-100" @click="showChangePwd = false">
          Hủy
        </button>
        <button
          :disabled="changingPwd"
          class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-60"
          @click="submitChangePwd"
        >{{ changingPwd ? "Đang xử lý..." : "Đổi mật khẩu" }}</button>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-ink-200);
  font-size: 0.875rem;
}
.input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-brand-200);
  border-color: var(--color-brand-400);
}
</style>
