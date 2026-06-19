<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { login as apiLogin } from "../../api/auth.api";
import { useAuthStore } from "../../stores/auth";
import { useToastStore } from "../../stores/toast";
import { extractErrorMessage } from "../../stores/toast";
import Spinner from "../../components/ui/Spinner.vue";

const router = useRouter();
const auth = useAuthStore();
const toast = useToastStore();

const tab = ref("reader"); // "reader" | "staff"
const loading = ref(false);

const readerForm = reactive({ MaDocGia: "", Password: "" });
const staffForm = reactive({ MSNV: "", Password: "" });

async function handleSubmit() {
  loading.value = true;
  try {
    const credentials =
      tab.value === "reader"
        ? { MaDocGia: readerForm.MaDocGia, Password: readerForm.Password }
        : { MSNV: staffForm.MSNV, Password: staffForm.Password };

    const data = await apiLogin(credentials);
    auth.setSession({
      accessToken: data.accessToken,
      role: data.role,
      user: data.role === "staff" ? data.staff : data.reader,
    });

    toast.success("Đăng nhập thành công");
    router.push(data.role === "staff" ? "/staff/home" : "/reader/loans");
  } catch (err) {
    toast.error(extractErrorMessage(err, "Đăng nhập thất bại"));
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-ink-50 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <div class="h-12 w-12 rounded-2xl bg-brand-500 mx-auto flex items-center justify-center font-bold text-white text-lg mb-3">
          QL
        </div>
        <h1 class="text-xl font-semibold text-ink-800">Quản Lý Mượn Sách</h1>
        <p class="text-sm text-ink-400 mt-1">Đăng nhập để tiếp tục</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-ink-100 p-6">
        <div class="flex bg-ink-100 rounded-xl p-1 mb-6">
          <button
            class="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="tab === 'reader' ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500'"
            @click="tab = 'reader'"
          >
            Độc giả
          </button>
          <button
            class="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="tab === 'staff' ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500'"
            @click="tab = 'staff'"
          >
            Nhân viên
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <template v-if="tab === 'reader'">
            <div>
              <label class="block text-sm font-medium text-ink-600 mb-1.5">Mã độc giả</label>
              <input
                v-model="readerForm.MaDocGia"
                type="text"
                required
                placeholder="VD: DG001"
                class="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-600 mb-1.5">Mật khẩu</label>
              <input
                v-model="readerForm.Password"
                type="password"
                required
                placeholder="••••••••"
                class="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 text-sm"
              />
            </div>
          </template>

          <template v-else>
            <div>
              <label class="block text-sm font-medium text-ink-600 mb-1.5">Mã số nhân viên (MSNV)</label>
              <input
                v-model="staffForm.MSNV"
                type="text"
                required
                placeholder="VD: NV001"
                class="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-ink-600 mb-1.5">Mật khẩu</label>
              <input
                v-model="staffForm.Password"
                type="password"
                required
                placeholder="••••••••"
                class="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 text-sm"
              />
            </div>
          </template>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
          >
            <Spinner v-if="loading" size="h-4 w-4" />
            {{ loading ? "Đang đăng nhập..." : "Đăng nhập" }}
          </button>
        </form>

        <p v-if="tab === 'reader'" class="text-sm text-center text-ink-500 mt-5">
          Chưa có tài khoản?
          <router-link to="/register" class="text-brand-600 font-medium hover:underline">Đăng ký ngay</router-link>
        </p>
        <p v-else class="text-sm text-center text-ink-400 mt-5">
          Tài khoản nhân viên do quản trị viên cấp.
        </p>
      </div>
    </div>
  </div>
</template>
