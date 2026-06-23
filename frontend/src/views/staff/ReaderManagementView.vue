<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useToastStore, extractErrorMessage } from "../../stores/toast";
import {
  getReaders,
  createReader,
  updateReader,
  deleteReader,
  resetReaderPassword,
} from "../../api/reader.api";
import { formatDate, toDisplayDate, toApiDate } from "../../utils/date";
import Spinner from "../../components/ui/Spinner.vue";
import EmptyState from "../../components/ui/EmptyState.vue";
import AppModal from "../../components/ui/AppModal.vue";
import ConfirmDialog from "../../components/ui/ConfirmDialog.vue";
import Pagination from "../../components/ui/Pagination.vue";

const toast = useToastStore();
const loading = ref(true);
const readers = ref([]);
const filteredReaders = ref([]);
const page = ref(1);
const totalPages = ref(1);
const search = ref("");
let searchDebounce = null;

async function loadReaders() {
  loading.value = true;
  try {
    const res = await getReaders({
      search: search.value || undefined,
      page: page.value,
      limit: 10,
    });
    readers.value = res.data;
    filteredReaders.value = res.data;
    totalPages.value = res.pagination?.totalPages || 1;
  } catch (err) {
    toast.error(extractErrorMessage(err, "Không tải được danh sách độc giả"));
  } finally {
    loading.value = false;
  }
}
onMounted(loadReaders);

watch(search, () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    page.value = 1;
    loadReaders();
  }, 350);
});

watch(page, loadReaders);

// ---- Tạo / sửa độc giả ----
const showForm = ref(false);
const saving = ref(false);
const editingReader = ref(null);
const form = reactive({
  HoLot: "",
  Ten: "",
  NgaySinh: "",
  Phai: "",
  DiaChi: "",
  DienThoai: "",
  Password: "",
});

function openCreate() {
  editingReader.value = null;
  Object.assign(form, {
    HoLot: "",
    Ten: "",
    NgaySinh: "",
    Phai: "",
    DiaChi: "",
    DienThoai: "",
    Password: "",
  });
  showForm.value = true;
}

function openEdit(reader) {
  editingReader.value = reader;
  Object.assign(form, {
    HoLot: reader.HoLot,
    Ten: reader.Ten,
    NgaySinh: toDisplayDate(reader.NgaySinh),
    Phai: reader.Phai || "",
    DiaChi: reader.DiaChi || "",
    DienThoai: reader.DienThoai || "",
    Password: "",
  });
  showForm.value = true;
}

async function submitForm() {
  saving.value = true;
  try {
    const payload = { ...form };
    payload.NgaySinh = toApiDate(payload.NgaySinh);
    if (!payload.NgaySinh) delete payload.NgaySinh;

    if (editingReader.value) {
      delete payload.Password;
      await updateReader(editingReader.value.MaDocGia, payload);
      if (form.Password) {
        await resetReaderPassword(editingReader.value.MaDocGia, form.Password);
      }
      toast.success("Cập nhật độc giả thành công");
    } else {
      await createReader(payload);
      toast.success("Thêm độc giả thành công");
    }
    showForm.value = false;
    await loadReaders();
  } catch (err) {
    toast.error(extractErrorMessage(err, "Lưu thông tin thất bại"));
  } finally {
    saving.value = false;
  }
}

// ---- Xoá ----
const showDelete = ref(false);
const deleting = ref(false);
const deletingReader = ref(null);

function askDelete(reader) {
  deletingReader.value = reader;
  showDelete.value = true;
}

async function confirmDelete() {
  deleting.value = true;
  try {
    await deleteReader(deletingReader.value.MaDocGia);
    toast.success("Đã xoá độc giả");
    showDelete.value = false;
    await loadReaders();
  } catch (err) {
    toast.error(extractErrorMessage(err, "Không thể xoá độc giả"));
  } finally {
    deleting.value = false;
  }
}

function applySearch() {
  const q = search.value.trim().toLowerCase();
  if (!q) {
    filteredReaders.value = readers.value;
    return;
  }
  filteredReaders.value = readers.value.filter(
    (r) =>
      r.MaDocGia?.toLowerCase().includes(q) ||
      `${r.HoLot} ${r.Ten}`.toLowerCase().includes(q),
  );
}

watch(search, applySearch);
watch(readers, applySearch, { immediate: true });
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl font-semibold text-ink-800">Độc giả</h1>
        <p class="text-sm text-ink-400 mt-0.5">Quản lý thông tin độc giả</p>
      </div>
      <button
        class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
        @click="openCreate"
      >
        + Thêm độc giả
      </button>
    </div>

    <div class="bg-white rounded-2xl border border-ink-100 shadow-sm">
      <div class="p-4 border-b border-ink-100">
        <input
          v-model="search"
          type="text"
          placeholder="Tìm theo mã hoặc tên độc giả..."
          class="w-full max-w-sm px-3.5 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
        />
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <Spinner />
      </div>

      <EmptyState
        v-else-if="!filteredReaders.length"
        title="Không tìm thấy độc giả"
      />

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-ink-400 border-b border-ink-100">
              <th class="px-5 py-3 font-medium">Mã độc giả</th>
              <th class="px-5 py-3 font-medium">Họ tên</th>
              <th class="px-5 py-3 font-medium">Ngày sinh</th>
              <th class="px-5 py-3 font-medium">Điện thoại</th>
              <th class="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in filteredReaders"
              :key="r._id"
              class="border-b border-ink-50 hover:bg-ink-50/60"
            >
              <td class="px-5 py-3 font-medium text-ink-700">
                {{ r.MaDocGia }}
              </td>
              <td class="px-5 py-3 text-ink-700">{{ r.HoLot }} {{ r.Ten }}</td>
              <td class="px-5 py-3 text-ink-500">
                {{ formatDate(r.NgaySinh) }}
              </td>
              <td class="px-5 py-3 text-ink-500">{{ r.DienThoai || "—" }}</td>
              <td class="px-5 py-3 text-right space-x-2">
                <button
                  class="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200/50 hover:border-brand-200 shadow-2xs transition-all duration-200 cursor-pointer"
                  @click="openEdit(r)"
                >
                  Sửa
                </button>
                <button
                  class="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 hover:border-rose-200 shadow-2xs transition-all duration-200 cursor-pointer"
                  @click="askDelete(r)"
                >
                  Xoá
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        class="p-4 border-t border-ink-100"
        v-if="!loading && readers.length"
      >
        <Pagination v-model:page="page" :total-pages="totalPages" />
      </div>
    </div>

    <AppModal
      v-model="showForm"
      :title="editingReader ? 'Sửa thông tin độc giả' : 'Thêm độc giả'"
      width="max-w-lg"
    >
      <form
        class="grid grid-cols-1 sm:grid-cols-2 gap-4"
        @submit.prevent="submitForm"
      >
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5"
            >Họ và tên lót *</label
          >
          <input v-model="form.HoLot" required type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5"
            >Tên *</label
          >
          <input v-model="form.Ten" required type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5"
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
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5"
            >Giới tính</label
          >
          <select v-model="form.Phai" class="input">
            <option value="">-- Chọn --</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-ink-600 mb-1.5"
            >Địa chỉ</label
          >
          <input v-model="form.DiaChi" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5"
            >Điện thoại</label
          >
          <input v-model="form.DienThoai" type="tel" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">
            {{ editingReader ? "Đặt lại mật khẩu" : "Mật khẩu *" }}
          </label>
          <input
            v-model="form.Password"
            :required="!editingReader"
            type="password"
            class="input"
            placeholder="••••••••"
          />
        </div>
      </form>
      <template #footer>
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium text-ink-600 hover:bg-ink-100"
          @click="showForm = false"
        >
          Hủy
        </button>
        <button
          :disabled="saving"
          class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-60"
          @click="submitForm"
        >
          {{ saving ? "Đang lưu..." : "Lưu" }}
        </button>
      </template>
    </AppModal>

    <ConfirmDialog
      v-model="showDelete"
      title="Xoá độc giả"
      :message="`Bạn có chắc muốn xoá độc giả '${deletingReader?.Ten}' (${deletingReader?.MaDocGia})?`"
      confirm-text="Xoá"
      :loading="deleting"
      @confirm="confirmDelete"
    />
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
