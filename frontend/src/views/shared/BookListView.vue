<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { useToastStore, extractErrorMessage } from "../../stores/toast";
import { getBooks, createBook } from "../../api/book.api";
import { getPublishers } from "../../api/publisher.api";
import Pagination from "../../components/ui/Pagination.vue";
import Spinner from "../../components/ui/Spinner.vue";
import EmptyState from "../../components/ui/EmptyState.vue";
import AppModal from "../../components/ui/AppModal.vue";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const toast = useToastStore();

const isStaffArea = computed(() => route.path.startsWith("/staff"));
const detailRouteName = computed(() => (isStaffArea.value ? "staff-book-detail" : "reader-book-detail"));

const books = ref([]);
const loading = ref(true);
const page = ref(1);
const totalPages = ref(1);
const search = ref("");
let searchDebounce = null;

async function loadBooks() {
  loading.value = true;
  try {
    const res = await getBooks({ TenSach: search.value || undefined, page: page.value, limit: 10 });
    books.value = res.data;
    totalPages.value = res.pagination?.totalPages || 1;
  } catch (err) {
    toast.error(extractErrorMessage(err, "Không tải được danh sách sách"));
  } finally {
    loading.value = false;
  }
}

watch(search, () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    page.value = 1;
    loadBooks();
  }, 350);
});

watch(page, loadBooks);

onMounted(loadBooks);

function viewDetail(book) {
  router.push({ name: detailRouteName.value, params: { MaSach: book.MaSach } });
}

// ---- Thêm sách mới (chỉ staff) ----
const showCreate = ref(false);
const creating = ref(false);
const publishers = ref([]);
const createForm = reactive({
  TenSach: "",
  DonGia: 0,
  SoQuyen: 0,
  NamXuatBan: new Date().getFullYear(),
  MaNXB: "",
  NguonGocTacGia: "",
});

async function openCreate() {
  showCreate.value = true;
  if (!publishers.value.length) {
    try {
      const res = await getPublishers({ limit: 200 });
      publishers.value = res.data;
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không tải được danh sách NXB"));
    }
  }
}

async function submitCreate() {
  creating.value = true;
  try {
    await createBook({ ...createForm });
    toast.success("Thêm sách thành công");
    showCreate.value = false;
    page.value = 1;
    await loadBooks();
  } catch (err) {
    toast.error(extractErrorMessage(err, "Thêm sách thất bại"));
  } finally {
    creating.value = false;
  }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl font-semibold text-ink-800">
          {{ isStaffArea ? "Danh sách sách" : "Mượn sách" }}
        </h1>
        <p class="text-sm text-ink-400 mt-0.5">
          {{ isStaffArea ? "Quản lý và tìm kiếm sách trong thư viện" : "Tìm và mượn sách bạn muốn đọc" }}
        </p>
      </div>
      <button
        v-if="isStaffArea && auth.isStaff"
        class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
        @click="openCreate"
      >
        + Thêm sách
      </button>
    </div>

    <div class="bg-white rounded-2xl border border-ink-100 shadow-sm">
      <div class="p-4 border-b border-ink-100">
        <div class="relative max-w-sm">
          <input
            v-model="search"
            type="text"
            placeholder="Tìm theo tên sách..."
            class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">🔍</span>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <Spinner />
      </div>

      <EmptyState
        v-else-if="!books.length"
        title="Không tìm thấy sách"
        description="Thử tìm với từ khoá khác."
      />

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-ink-400 border-b border-ink-100">
              <th class="px-4 py-3 font-medium">Mã sách</th>
              <th class="px-4 py-3 font-medium">Tên sách</th>
              <th class="px-4 py-3 font-medium">Tác giả</th>
              <th class="px-4 py-3 font-medium">Năm XB</th>
              <th class="px-4 py-3 font-medium">Còn lại</th>
              <th class="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="book in books"
              :key="book._id"
              class="border-b border-ink-50 hover:bg-ink-50/60 transition-colors"
            >
              <td class="px-4 py-3 font-medium text-ink-700">{{ book.MaSach }}</td>
              <td class="px-4 py-3 text-ink-700">{{ book.TenSach }}</td>
              <td class="px-4 py-3 text-ink-500">{{ book.NguonGocTacGia || "—" }}</td>
              <td class="px-4 py-3 text-ink-500">{{ book.NamXuatBan || "—" }}</td>
              <td class="px-4 py-3">
                <span :class="book.SoQuyen > 0 ? 'text-emerald-600' : 'text-rose-500'" class="font-medium">
                  {{ book.SoQuyen }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200/50 hover:border-brand-200 shadow-2xs transition-all duration-200 cursor-pointer"
                  @click="viewDetail(book)"
                >
                  Xem chi tiết
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-4 border-t border-ink-100" v-if="!loading && books.length">
        <Pagination v-model:page="page" :total-pages="totalPages" />
      </div>
    </div>

    <!-- Modal thêm sách -->
    <AppModal v-model="showCreate" title="Thêm sách mới" width="max-w-lg">
      <form class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="submitCreate">
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Tên sách *</label>
          <input v-model="createForm.TenSach" required type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Tác giả</label>
          <input v-model="createForm.NguonGocTacGia" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Năm xuất bản</label>
          <input v-model.number="createForm.NamXuatBan" type="number" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Đơn giá *</label>
          <input v-model.number="createForm.DonGia" required type="number" min="0" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Số quyển *</label>
          <input v-model.number="createForm.SoQuyen" required type="number" min="0" class="input" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Nhà xuất bản *</label>
          <select v-model="createForm.MaNXB" required class="input">
            <option value="" disabled>-- Chọn nhà xuất bản --</option>
            <option v-for="p in publishers" :key="p._id" :value="p._id">{{ p.TenNXB }}</option>
          </select>
        </div>
      </form>
      <template #footer>
        <button class="px-4 py-2 rounded-lg text-sm font-medium text-ink-600 hover:bg-ink-100" @click="showCreate = false">
          Hủy
        </button>
        <button
          :disabled="creating"
          class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-60"
          @click="submitCreate"
        >
          {{ creating ? "Đang lưu..." : "Lưu sách" }}
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
