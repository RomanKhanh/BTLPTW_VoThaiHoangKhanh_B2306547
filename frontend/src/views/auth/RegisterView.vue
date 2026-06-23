<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { registerReader } from "../../api/auth.api";
import { useToastStore, extractErrorMessage } from "../../stores/toast";
import { toApiDate } from "../../utils/date";
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
    payload.NgaySinh = toApiDate(payload.NgaySinh);
    if (!payload.NgaySinh) delete payload.NgaySinh;
    if (!payload.Phai) delete payload.Phai;

    const reader = await registerReader(payload);
    successInfo.value = reader.data;
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
  <div
    class="min-h-screen flex items-center justify-center bg-radial from-brand-50/50 via-ink-50 to-ink-50 px-4 py-12 relative overflow-hidden"
  >
    <!-- Decorative background elements -->
    <div
      class="absolute -top-40 -left-40 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl pointer-events-none"
    ></div>
    <div
      class="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none"
    ></div>

    <div class="w-full max-w-lg relative z-10">
      <div class="text-center mb-8">
        <img
          src="/logo.png"
          alt="ReadNest Logo"
          class="h-20 w-20 mx-auto object-contain mb-4"
        />
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight">
          Đăng ký tài khoản độc giả
        </h1>
        <p class="text-sm text-ink-500 mt-1.5">
          Tạo tài khoản để mượn sách trực tuyến dễ dàng
        </p>
      </div>

      <div
        class="bg-white rounded-3xl shadow-xl shadow-ink-200/40 border border-ink-100/80 p-8"
      >
        <form
          class="grid grid-cols-1 sm:grid-cols-2 gap-4"
          @submit.prevent="handleSubmit"
        >
          <div class="space-y-1">
            <label
              class="block text-xs font-semibold text-ink-600 uppercase tracking-wider"
              >Họ và tên lót *</label
            >
            <input
              v-model="form.HoLot"
              type="text"
              required
              class="input"
              placeholder="Nguyễn Văn"
            />
          </div>
          <div class="space-y-1">
            <label
              class="block text-xs font-semibold text-ink-600 uppercase tracking-wider"
              >Tên *</label
            >
            <input
              v-model="form.Ten"
              type="text"
              required
              class="input"
              placeholder="An"
            />
          </div>
          <div class="space-y-1">
            <label
              class="block text-xs font-semibold text-ink-600 uppercase tracking-wider"
              >Ngày sinh</label
            >
            <input
              v-model="form.NgaySinh"
              type="text"
              inputmode="numeric"
              placeholder="dd/mm/yyyy"
              class="input"
            />
          </div>
          <div class="space-y-1">
            <label
              class="block text-xs font-semibold text-ink-600 uppercase tracking-wider"
              >Giới tính</label
            >
            <select v-model="form.Phai" class="input select-input">
              <option value="">-- Chọn --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div class="sm:col-span-2 space-y-1">
            <label
              class="block text-xs font-semibold text-ink-600 uppercase tracking-wider"
              >Địa chỉ</label
            >
            <input
              v-model="form.DiaChi"
              type="text"
              class="input"
              placeholder="123 Đường ABC, Quận 1, TP.HCM"
            />
          </div>
          <div class="sm:col-span-2 space-y-1">
            <label
              class="block text-xs font-semibold text-ink-600 uppercase tracking-wider"
              >Số điện thoại</label
            >
            <input
              v-model="form.DienThoai"
              type="tel"
              class="input"
              placeholder="0901234567"
            />
          </div>
          <div class="space-y-1">
            <label
              class="block text-xs font-semibold text-ink-600 uppercase tracking-wider"
              >Mật khẩu *</label
            >
            <input
              v-model="form.Password"
              type="password"
              required
              minlength="6"
              class="input"
              placeholder="••••••••"
            />
          </div>
          <div class="space-y-1">
            <label
              class="block text-xs font-semibold text-ink-600 uppercase tracking-wider"
              >Xác nhận mật khẩu *</label
            >
            <input
              v-model="confirmPassword"
              type="password"
              required
              minlength="6"
              class="input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="sm:col-span-2 mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/15 disabled:opacity-60 cursor-pointer disabled:pointer-events-none"
          >
            <Spinner v-if="loading" size="h-4 w-4" />
            {{ loading ? "Đang đăng ký..." : "Đăng ký" }}
          </button>
        </form>

        <p class="text-sm text-center text-ink-500 mt-6">
          Đã có tài khoản?
          <router-link
            to="/login"
            class="text-brand-600 font-semibold hover:text-brand-700 hover:underline transition-colors ml-1"
            >Đăng nhập ngay</router-link
          >
        </p>
      </div>
    </div>

    <AppModal
      :model-value="!!successInfo"
      title="Đăng ký thành công 🎉"
      @update:model-value="goToLogin"
    >
      <div class="text-center py-2">
        <p class="text-sm text-ink-600">
          Tài khoản độc giả của bạn đã được tạo thành công.
        </p>
        <div
          class="my-5 p-4 bg-brand-50 rounded-2xl border border-brand-100 inline-block"
        >
          <p
            class="text-xs text-brand-600 font-semibold uppercase tracking-wider mb-1"
          >
            Mã độc giả của bạn
          </p>
          <p class="text-3xl font-extrabold text-brand-700 tracking-wide">
            {{ successInfo?.MaDocGia }}
          </p>
        </div>
        <p class="text-xs text-rose-500 font-medium">
          ⚠️ Hãy lưu lại mã độc giả này để sử dụng khi đăng nhập.
        </p>
      </div>
      <template #footer>
        <button
          class="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors cursor-pointer"
          @click="goToLogin"
        >
          Đến trang đăng nhập
        </button>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-ink-200);
  background-color: rgba(241, 245, 249, 0.3); /* ink-100 with opacity */
  font-size: 0.875rem;
  transition: all 0.2s ease;
}
.input:focus {
  outline: none;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1);
  border-color: var(--color-brand-500);
}
.select-input {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.25rem;
  padding-right: 2rem;
}
</style>
