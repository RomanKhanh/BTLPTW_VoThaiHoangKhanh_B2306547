<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useToastStore, extractErrorMessage } from "../../stores/toast";
import {
  getPublishers,
  createPublisher,
  updatePublisher,
  deletePublisher,
} from "../../api/publisher.api";
import Spinner from "../../components/ui/Spinner.vue";
import EmptyState from "../../components/ui/EmptyState.vue";
import AppModal from "../../components/ui/AppModal.vue";
import ConfirmDialog from "../../components/ui/ConfirmDialog.vue";
import Pagination from "../../components/ui/Pagination.vue";

const toast = useToastStore();
const MAX_ADDRESS_LENGTH = 70;
const loading = ref(true);
const publishers = ref([]);
const page = ref(1);
const totalPages = ref(1);
const search = ref("");
let searchDebounce = null;

async function loadPublishers() {
  loading.value = true;
  try {
    const res = await getPublishers({
      TenNXB: search.value || undefined,
      page: page.value,
      limit: 10,
    });
    publishers.value = res.data;
    totalPages.value = res.pagination?.totalPages || 1;
  } catch (err) {
    toast.error(extractErrorMessage(err, "Không tải được danh sách NXB"));
  } finally {
    loading.value = false;
  }
}

watch(search, () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    page.value = 1;
    loadPublishers();
  }, 350);
});

watch(page, loadPublishers);

onMounted(loadPublishers);

// ---- Tạo / sửa ----
const showForm = ref(false);
const saving = ref(false);
const editingPublisher = ref(null);
const form = reactive({ TenNXB: "", DiaChi: "" });

function openCreate() {
  editingPublisher.value = null;
  form.TenNXB = "";
  form.DiaChi = "";
  showForm.value = true;
}

function openEdit(p) {
  editingPublisher.value = p;
  form.TenNXB = p.TenNXB;
  form.DiaChi = p.DiaChi || "";
  showForm.value = true;
}

async function submitForm() {
  if ((form.DiaChi || "").length > MAX_ADDRESS_LENGTH) {
    toast.error(`Địa chỉ chỉ được tối đa ${MAX_ADDRESS_LENGTH} kí tự`);
    return;
  }

  saving.value = true;
  try {
    if (editingPublisher.value) {
      await updatePublisher(editingPublisher.value.MaNXB, { ...form });
      toast.success("Cập nhật NXB thành công");
    } else {
      await createPublisher({ ...form });
      toast.success("Thêm NXB thành công");
    }
    showForm.value = false;
    await loadPublishers();
  } catch (err) {
    toast.error(extractErrorMessage(err, "Lưu thông tin thất bại"));
  } finally {
    saving.value = false;
  }
}

// ---- Xoá ----
const showDelete = ref(false);
const deleting = ref(false);
const deletingPublisher = ref(null);

function askDelete(p) {
  deletingPublisher.value = p;
  showDelete.value = true;
}

async function confirmDelete() {
  deleting.value = true;
  try {
    await deletePublisher(deletingPublisher.value.MaNXB);
    toast.success("Đã xoá NXB");
    showDelete.value = false;
    await loadPublishers();
  } catch (err) {
    toast.error(extractErrorMessage(err, "Không thể xoá NXB"));
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-xl font-semibold text-ink-800">Nhà xuất bản</h1>
        <p class="text-sm text-ink-400 mt-0.5">
          Quản lý danh sách nhà xuất bản
        </p>
      </div>
      <button
        class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
        @click="openCreate"
      >
        + Thêm NXB
      </button>
    </div>

    <div class="bg-white rounded-2xl border border-ink-100 shadow-sm">
      <div class="p-4 border-b border-ink-100">
        <div class="relative max-w-sm">
          <input
            v-model="search"
            type="text"
            placeholder="Tìm theo tên Nhà xuất bản..."
            class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            >🔍</span
          >
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <Spinner />
      </div>

      <EmptyState
        v-else-if="!publishers.length"
        title="Chưa có nhà xuất bản nào"
      />

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-ink-400 border-b border-ink-100">
              <th class="px-5 py-3 font-medium">Mã NXB</th>
              <th class="px-5 py-3 font-medium">Tên NXB</th>
              <th class="px-5 py-3 font-medium">Địa chỉ</th>
              <th class="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in publishers"
              :key="p._id"
              class="border-b border-ink-50 hover:bg-ink-50/60"
            >
              <td class="px-5 py-3 font-medium text-ink-700">{{ p.MaNXB }}</td>
              <td class="px-5 py-3 text-ink-700">{{ p.TenNXB }}</td>
              <td class="px-5 py-3 text-ink-500">{{ p.DiaChi || "—" }}</td>
              <td class="px-5 py-3 text-right space-x-2">
                <button
                  class="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200/50 hover:border-brand-200 shadow-2xs transition-all duration-200 cursor-pointer"
                  @click="openEdit(p)"
                >
                  Sửa
                </button>
                <button
                  class="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 hover:border-rose-200 shadow-2xs transition-all duration-200 cursor-pointer"
                  @click="askDelete(p)"
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
        v-if="!loading && publishers.length"
      >
        <Pagination v-model:page="page" :total-pages="totalPages" />
      </div>
    </div>

    <AppModal
      v-model="showForm"
      :title="editingPublisher ? 'Sửa nhà xuất bản' : 'Thêm nhà xuất bản'"
    >
      <form class="space-y-4" @submit.prevent="submitForm">
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5"
            >Tên NXB *</label
          >
          <input v-model="form.TenNXB" required type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5"
            >Địa chỉ (Tối đa {{ MAX_ADDRESS_LENGTH }} kí tự)</label
          >
          <input v-model="form.DiaChi" type="text" class="input" />
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
      title="Xoá nhà xuất bản"
      :message="`Bạn có chắc muốn xoá NXB '${deletingPublisher?.TenNXB}'?`"
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
