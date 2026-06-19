<script setup>
import { ref, reactive, onMounted } from "vue";
import { useToastStore, extractErrorMessage } from "../../stores/toast";
import { getAllStaff, createStaff, updateStaff, changeStaffPassword } from "../../api/staff.api";
import Spinner from "../../components/ui/Spinner.vue";
import EmptyState from "../../components/ui/EmptyState.vue";
import AppModal from "../../components/ui/AppModal.vue";

const toast = useToastStore();
const loading = ref(true);
const staffList = ref([]);

async function loadStaff() {
  loading.value = true;
  try {
    staffList.value = await getAllStaff();
  } catch (err) {
    toast.error(extractErrorMessage(err, "Không tải được danh sách nhân viên"));
  } finally {
    loading.value = false;
  }
}
onMounted(loadStaff);

// ---- Tạo / sửa nhân viên ----
const showForm = ref(false);
const saving = ref(false);
const editingStaff = ref(null);
const form = reactive({
  HoTenNV: "",
  ChucVu: "",
  DiaChi: "",
  SoDienThoai: "",
  Password: "",
});

function openCreate() {
  editingStaff.value = null;
  Object.assign(form, { HoTenNV: "", ChucVu: "", DiaChi: "", SoDienThoai: "", Password: "" });
  showForm.value = true;
}

function openEdit(s) {
  editingStaff.value = s;
  Object.assign(form, {
    HoTenNV: s.HoTenNV,
    ChucVu: s.ChucVu || "",
    DiaChi: s.DiaChi || "",
    SoDienThoai: s.SoDienThoai || "",
    Password: "",
  });
  showForm.value = true;
}

async function submitForm() {
  saving.value = true;
  try {
    if (editingStaff.value) {
      const payload = { HoTenNV: form.HoTenNV, ChucVu: form.ChucVu, DiaChi: form.DiaChi, SoDienThoai: form.SoDienThoai };
      await updateStaff(editingStaff.value.MSNV, payload);
      toast.success("Cập nhật nhân viên thành công");
    } else {
      await createStaff({ ...form });
      toast.success("Thêm nhân viên thành công");
    }
    showForm.value = false;
    await loadStaff();
  } catch (err) {
    toast.error(extractErrorMessage(err, "Lưu thất bại"));
  } finally {
    saving.value = false;
  }
}

// ---- Đổi mật khẩu ----
const showChangePwd = ref(false);
const changingPwd = ref(false);
const pwdTarget = ref(null);
const pwdForm = reactive({ oldPassword: "", newPassword: "", confirmNew: "" });

function openChangePwd(s) {
  pwdTarget.value = s;
  pwdForm.oldPassword = "";
  pwdForm.newPassword = "";
  pwdForm.confirmNew = "";
  showChangePwd.value = true;
}

async function submitChangePwd() {
  if (pwdForm.newPassword !== pwdForm.confirmNew) {
    toast.error("Mật khẩu xác nhận không khớp");
    return;
  }
  changingPwd.value = true;
  try {
    await changeStaffPassword(pwdTarget.value.MSNV, {
      oldPassword: pwdForm.oldPassword,
      newPassword: pwdForm.newPassword,
    });
    toast.success("Đổi mật khẩu thành công");
    showChangePwd.value = false;
  } catch (err) {
    toast.error(extractErrorMessage(err, "Đổi mật khẩu thất bại"));
  } finally {
    changingPwd.value = false;
  }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl font-semibold text-ink-800">Nhân viên</h1>
        <p class="text-sm text-ink-400 mt-0.5">Quản lý tài khoản nhân viên thư viện</p>
      </div>
      <button
        class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
        @click="openCreate"
      >
        + Thêm nhân viên
      </button>
    </div>

    <div class="bg-white rounded-2xl border border-ink-100 shadow-sm">
      <div v-if="loading" class="flex justify-center py-16"><Spinner /></div>

      <EmptyState v-else-if="!staffList.length" title="Chưa có nhân viên nào" />

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-ink-400 border-b border-ink-100">
              <th class="px-5 py-3 font-medium">MSNV</th>
              <th class="px-5 py-3 font-medium">Họ tên</th>
              <th class="px-5 py-3 font-medium">Chức vụ</th>
              <th class="px-5 py-3 font-medium">Điện thoại</th>
              <th class="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in staffList"
              :key="s.MSNV"
              class="border-b border-ink-50 hover:bg-ink-50/60"
            >
              <td class="px-5 py-3 font-medium text-ink-700">{{ s.MSNV }}</td>
              <td class="px-5 py-3 text-ink-700">{{ s.HoTenNV }}</td>
              <td class="px-5 py-3 text-ink-500">{{ s.ChucVu || "—" }}</td>
              <td class="px-5 py-3 text-ink-500">{{ s.SoDienThoai || "—" }}</td>
              <td class="px-5 py-3 text-right space-x-3">
                <button
                  class="text-brand-600 hover:text-brand-700 font-medium"
                  @click="openEdit(s)"
                >Sửa</button>
                <button
                  class="text-ink-400 hover:text-ink-700 font-medium"
                  @click="openChangePwd(s)"
                >Đổi mật khẩu</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Form thêm/sửa nhân viên -->
    <AppModal
      v-model="showForm"
      :title="editingStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'"
    >
      <form class="space-y-4" @submit.prevent="submitForm">
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Họ tên *</label>
          <input v-model="form.HoTenNV" required type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Chức vụ</label>
          <input v-model="form.ChucVu" type="text" class="input" placeholder="VD: Thủ thư" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Địa chỉ</label>
          <input v-model="form.DiaChi" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Số điện thoại</label>
          <input v-model="form.SoDienThoai" type="tel" class="input" />
        </div>
        <div v-if="!editingStaff">
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Mật khẩu *</label>
          <input v-model="form.Password" required type="password" class="input" placeholder="••••••••" />
        </div>
      </form>
      <template #footer>
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium text-ink-600 hover:bg-ink-100"
          @click="showForm = false"
        >Hủy</button>
        <button
          :disabled="saving"
          class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-60"
          @click="submitForm"
        >{{ saving ? "Đang lưu..." : "Lưu" }}</button>
      </template>
    </AppModal>

    <!-- Đổi mật khẩu nhân viên -->
    <AppModal v-model="showChangePwd" title="Đổi mật khẩu nhân viên">
      <p class="text-sm text-ink-500 mb-4">
        Đang đổi mật khẩu cho: <span class="font-medium text-ink-700">{{ pwdTarget?.HoTenNV }} ({{ pwdTarget?.MSNV }})</span>
      </p>
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
        >{{ changingPwd ? "Đang lưu..." : "Đổi mật khẩu" }}</button>
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
