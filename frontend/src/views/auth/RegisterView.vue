<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { registerReader } from "../../api/auth.api";
import { useToastStore, extractErrorMessage } from "../../stores/toast";
import Spinner from "../../components/ui/Spinner.vue";
import AppModal from "../../components/ui/AppModal.vue";

const router = useRouter();
const toast = useToastStore();

const form = reactive({
  HoLot: "",
  Ten: "",
  NgaySinh: "",
  Phai: "",
  DiaChi: "",
  DienThoai: "",
  Password: "",
});
const confirmPassword = ref("");
const loading = ref(false);
const successInfo = ref(null); // { MaDocGia }

async function handleSubmit() {
  if (form.Password !== confirmPassword.value) {
    toast.error("Mật khẩu xác nhận không khớp");
    return;
  }
  loading.value = true;
  try {
    const payload = { ...form };
    if (!payload.NgaySinh) delete payload.NgaySinh;
    if (!payload.Phai) delete payload.Phai;

    const reader = await registerReader(payload);
    successInfo.value = reader;
  } catch (err) {
    toast.error(extractErrorMessage(err, "Đăng ký thất bại"));
  } finally {
    loading.value = false;
  }
}

function goToLogin() {
  router.push("/login");
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-ink-50 px-4 py-10">
    <div class="w-full max-w-lg">
      <div class="text-center mb-6">
        <div class="h-12 w-12 rounded-2xl bg-brand-500 mx-auto flex items-center justify-center font-bold text-white text-lg mb-3">
          QL
        </div>
        <h1 class="text-xl font-semibold text-ink-800">Đăng ký tài khoản độc giả</h1>
        <p class="text-sm text-ink-400 mt-1">Tạo tài khoản để mượn sách trực tuyến</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-ink-100 p-6">
        <form class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-sm font-medium text-ink-600 mb-1.5">Họ và tên lót *</label>
            <input v-model="form.HoLot" type="text" required class="input" placeholder="Nguyễn Văn" />
          </div>
          <div>
            <label class="block text-sm font-medium text-ink-600 mb-1.5">Tên *</label>
            <input v-model="form.Ten" type="text" required class="input" placeholder="An" />
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
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-ink-600 mb-1.5">Địa chỉ</label>
            <input v-model="form.DiaChi" type="text" class="input" placeholder="123 Đường ABC, Quận 1, TP.HCM" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-ink-600 mb-1.5">Số điện thoại</label>
            <input v-model="form.DienThoai" type="tel" class="input" placeholder="0901234567" />
          </div>
          <div>
            <label class="block text-sm font-medium text-ink-600 mb-1.5">Mật khẩu *</label>
            <input v-model="form.Password" type="password" required minlength="6" class="input" placeholder="••••••••" />
          </div>
          <div>
            <label class="block text-sm font-medium text-ink-600 mb-1.5">Xác nhận mật khẩu *</label>
            <input v-model="confirmPassword" type="password" required minlength="6" class="input" placeholder="••••••••" />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="sm:col-span-2 mt-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
          >
            <Spinner v-if="loading" size="h-4 w-4" />
            {{ loading ? "Đang đăng ký..." : "Đăng ký" }}
          </button>
        </form>

        <p class="text-sm text-center text-ink-500 mt-5">
          Đã có tài khoản?
          <router-link to="/login" class="text-brand-600 font-medium hover:underline">Đăng nhập</router-link>
        </p>
      </div>
    </div>

    <AppModal :model-value="!!successInfo" title="Đăng ký thành công 🎉" @update:model-value="goToLogin">
      <p class="text-sm text-ink-600">
        Tài khoản của bạn đã được tạo. Mã độc giả của bạn là:
      </p>
      <p class="text-2xl font-semibold text-brand-600 mt-2">{{ successInfo?.MaDocGia }}</p>
      <p class="text-sm text-ink-400 mt-2">Hãy ghi nhớ mã này, bạn cần dùng nó để đăng nhập.</p>
      <template #footer>
        <button class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700" @click="goToLogin">
          Đến trang đăng nhập
        </button>
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
