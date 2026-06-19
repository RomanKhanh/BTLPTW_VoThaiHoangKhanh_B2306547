<script setup>
import { ref, reactive, computed } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useToastStore, extractErrorMessage } from "../../stores/toast";
import { updateStaff, changeStaffPassword } from "../../api/staff.api";

const auth = useAuthStore();
const toast = useToastStore();

const editMode = ref(false);
const saving = ref(false);
const form = reactive({
  HoTenNV: "",
  ChucVu: "",
  DiaChi: "",
  SoDienThoai: "",
});

function startEdit() {
  form.HoTenNV = auth.user?.HoTenNV || "";
  form.ChucVu = auth.user?.ChucVu || "";
  form.DiaChi = auth.user?.DiaChi || "";
  form.SoDienThoai = auth.user?.SoDienThoai || "";
  editMode.value = true;
}

async function submitEdit() {
  saving.value = true;
  try {
    const updated = await updateStaff(auth.user.MSNV, { ...form });
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
    await changeStaffPassword(auth.user.MSNV, {
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

import AppModal from "../../components/ui/AppModal.vue";

const initials = computed(() =>
  (auth.user?.HoTenNV || "NV").charAt(0).toUpperCase(),
);
</script>

<template>
  <div class="max-w-lg">
    <h1 class="text-xl font-semibold text-ink-800 mb-5">Hồ sơ của tôi</h1>

    <div class="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
      <!-- Avatar header -->
      <div class="bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-8 flex items-center gap-4">
        <div class="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
          {{ initials }}
        </div>
        <div>
          <p class="text-lg font-semibold text-white">{{ auth.user?.HoTenNV }}</p>
          <p class="text-brand-200 text-sm">{{ auth.user?.ChucVu || "Nhân viên" }} · {{ auth.user?.MSNV }}</p>
        </div>
      </div>

      <div class="px-6 py-5">
        <div v-if="!editMode" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-ink-400">MSNV</p>
              <p class="text-sm font-medium text-ink-700 mt-0.5">{{ auth.user?.MSNV }}</p>
            </div>
            <div>
              <p class="text-xs text-ink-400">Chức vụ</p>
              <p class="text-sm font-medium text-ink-700 mt-0.5">{{ auth.user?.ChucVu || "—" }}</p>
            </div>
            <div>
              <p class="text-xs text-ink-400">Điện thoại</p>
              <p class="text-sm font-medium text-ink-700 mt-0.5">{{ auth.user?.SoDienThoai || "—" }}</p>
            </div>
            <div>
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

        <!-- Edit form -->
        <form v-else class="space-y-4" @submit.prevent="submitEdit">
          <div>
            <label class="block text-sm font-medium text-ink-600 mb-1.5">Họ tên *</label>
            <input v-model="form.HoTenNV" required type="text" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-ink-600 mb-1.5">Chức vụ</label>
            <input v-model="form.ChucVu" type="text" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-ink-600 mb-1.5">Số điện thoại</label>
            <input v-model="form.SoDienThoai" type="tel" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-ink-600 mb-1.5">Địa chỉ</label>
            <input v-model="form.DiaChi" type="text" class="input" />
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
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal đổi mật khẩu -->
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
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium text-ink-600 hover:bg-ink-100"
          @click="showChangePwd = false"
        >Hủy</button>
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
