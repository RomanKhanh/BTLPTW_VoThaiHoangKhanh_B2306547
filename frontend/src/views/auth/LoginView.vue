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
const pendingMessage = ref(""); // thông báo tài khoản chờ duyệt

const readerForm = reactive({ MaDocGia: "", Password: "" });
const staffForm = reactive({ MSNV: "", Password: "" });

async function handleSubmit() {
  loading.value = true;
  pendingMessage.value = "";
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
    // Tài khoản chưa được duyệt — hiển thị thông báo inline thay vì toast
    const responseData = err?.response?.data;
    if (err?.response?.status === 403 && responseData?.code === "ACCOUNT_PENDING") {
      pendingMessage.value = responseData.message;
    } else {
      toast.error(extractErrorMessage(err, "Đăng nhập thất bại"));
    }
  } finally {
    loading.value = false;
  }
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

    <div class="w-full max-w-md relative z-10">
      <div class="text-center mb-8">
        <img
          src="/logo.png"
          alt="ReadNest Logo"
          class="h-32 w-32 sm:h-36 sm:w-36 mx-auto object-contain mb-5"
        />
        <h1 class="text-2xl font-bold text-ink-900 tracking-tight">ReadNest</h1>
        <p class="text-sm text-ink-500 mt-1.5">
          Đăng nhập tài khoản của bạn để tiếp tục
        </p>
      </div>

      <div
        class="bg-white rounded-3xl shadow-xl shadow-ink-200/40 border border-ink-100/80 p-8"
      >
        <div class="flex bg-ink-100/80 rounded-2xl p-1.5 mb-6">
          <button
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
            :class="
              tab === 'reader'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-ink-500 hover:text-ink-700'
            "
            @click="tab = 'reader'; pendingMessage = ''"
          >
            Độc giả
          </button>
          <button
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
            :class="
              tab === 'staff'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-ink-500 hover:text-ink-700'
            "
            @click="tab = 'staff'; pendingMessage = ''"
          >
            Nhân viên
          </button>
        </div>

        <form class="space-y-5" @submit.prevent="handleSubmit">
          <template v-if="tab === 'reader'">
            <div class="space-y-1.5">
              <label
                class="block text-xs font-semibold text-ink-600 uppercase tracking-wider"
                >Mã độc giả</label
              >
              <input
                v-model="readerForm.MaDocGia"
                type="text"
                required
                placeholder="VD: DG001"
                class="w-full px-4 py-3 rounded-xl border border-ink-200 bg-ink-50/20 focus:bg-white focus:outline-none focus:ring-2.5 focus:ring-brand-500/10 focus:border-brand-500 text-sm transition-all duration-200 placeholder:text-ink-300"
              />
            </div>
            <div class="space-y-1.5">
              <label
                class="block text-xs font-semibold text-ink-600 uppercase tracking-wider"
                >Mật khẩu</label
              >
              <input
                v-model="readerForm.Password"
                type="password"
                required
                placeholder="••••••••"
                class="w-full px-4 py-3 rounded-xl border border-ink-200 bg-ink-50/20 focus:bg-white focus:outline-none focus:ring-2.5 focus:ring-brand-500/10 focus:border-brand-500 text-sm transition-all duration-200 placeholder:text-ink-300"
              />
            </div>
          </template>

          <template v-else>
            <div class="space-y-1.5">
              <label
                class="block text-xs font-semibold text-ink-600 uppercase tracking-wider"
                >Mã nhân viên (MSNV)</label
              >
              <input
                v-model="staffForm.MSNV"
                type="text"
                required
                placeholder="VD: NV001"
                class="w-full px-4 py-3 rounded-xl border border-ink-200 bg-ink-50/20 focus:bg-white focus:outline-none focus:ring-2.5 focus:ring-brand-500/10 focus:border-brand-500 text-sm transition-all duration-200 placeholder:text-ink-300"
              />
            </div>
            <div class="space-y-1.5">
              <label
                class="block text-xs font-semibold text-ink-600 uppercase tracking-wider"
                >Mật khẩu</label
              >
              <input
                v-model="staffForm.Password"
                type="password"
                required
                placeholder="••••••••"
                class="w-full px-4 py-3 rounded-xl border border-ink-200 bg-ink-50/20 focus:bg-white focus:outline-none focus:ring-2.5 focus:ring-brand-500/10 focus:border-brand-500 text-sm transition-all duration-200 placeholder:text-ink-300"
              />
            </div>
          </template>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/15 disabled:opacity-60 cursor-pointer disabled:pointer-events-none mt-2"
          >
            <Spinner v-if="loading" size="h-4 w-4" />
            {{ loading ? "Đang đăng nhập..." : "Đăng nhập" }}
          </button>

          <!-- Thông báo tài khoản chờ duyệt -->
          <div
            v-if="pendingMessage"
            class="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800"
          >
            <span class="text-lg shrink-0 mt-0.5">⏳</span>
            <p class="text-sm leading-relaxed">{{ pendingMessage }}</p>
          </div>
        </form>

        <p
          v-if="tab === 'reader'"
          class="text-sm text-center text-ink-500 mt-6"
        >
          Chưa có tài khoản độc giả?
          <router-link
            to="/register"
            class="text-brand-600 font-semibold hover:text-brand-700 hover:underline transition-colors ml-1"
            >Đăng ký ngay</router-link
          >
        </p>
        <p v-else class="text-xs text-center text-ink-400 mt-6 leading-relaxed">
          Tài khoản nhân viên do quản trị viên cấp và quản lý trực tiếp.
        </p>
      </div>
    </div>
  </div>
</template>
