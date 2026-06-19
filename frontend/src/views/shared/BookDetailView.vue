<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { useToastStore, extractErrorMessage } from "../../stores/toast";
import { getBookByMaSach, updateBook, deleteBook } from "../../api/book.api";
import { getPublishers } from "../../api/publisher.api";
import { createLoan } from "../../api/monitorLoan.api";
import { toInputDate, addDays, MAX_LOAN_DAYS, DEFAULT_LOAN_DAYS } from "../../utils/date";
import Spinner from "../../components/ui/Spinner.vue";
import AppModal from "../../components/ui/AppModal.vue";
import ConfirmDialog from "../../components/ui/ConfirmDialog.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const toast = useToastStore();

const isStaffArea = computed(() => route.path.startsWith("/staff"));
const listRouteName = computed(() => (isStaffArea.value ? "staff-books" : "reader-borrow"));

const book = ref(null);
const loading = ref(true);

async function loadBook() {
  loading.value = true;
  try {
    book.value = await getBookByMaSach(route.params.MaSach);
  } catch (err) {
    toast.error(extractErrorMessage(err, "Không tải được thông tin sách"));
  } finally {
    loading.value = false;
  }
}
onMounted(loadBook);

// ---------- Mượn sách ----------
const showBorrow = ref(false);
const borrowing = ref(false);
const borrowForm = reactive({
  MaDocGia: "",
  NgayHenTra: toInputDate(addDays(new Date(), DEFAULT_LOAN_DAYS)),
  PhuongThucNhan: "NhanTrucTiep",
});
const maxDueDate = toInputDate(addDays(new Date(), MAX_LOAN_DAYS));
const minDueDate = toInputDate(addDays(new Date(), 1));

function openBorrow() {
  borrowForm.MaDocGia = auth.isReader ? auth.user?.MaDocGia : "";
  borrowForm.NgayHenTra = toInputDate(
    addDays(new Date(), auth.isReader ? MAX_LOAN_DAYS : DEFAULT_LOAN_DAYS),
  );
  borrowForm.PhuongThucNhan = "NhanTrucTiep";
  showBorrow.value = true;
}

async function submitBorrow() {
  borrowing.value = true;
  try {
    await createLoan({
      MaDocGia: borrowForm.MaDocGia,
      MaSach: book.value.MaSach,
      NgayHenTra: borrowForm.NgayHenTra,
      PhuongThucNhan: borrowForm.PhuongThucNhan,
    });
    toast.success("Mượn sách thành công!");
    showBorrow.value = false;
    await loadBook();
  } catch (err) {
    toast.error(extractErrorMessage(err, "Mượn sách thất bại"));
  } finally {
    borrowing.value = false;
  }
}

// ---------- Sửa sách (staff) ----------
const showEdit = ref(false);
const editing = ref(false);
const publishers = ref([]);
const editForm = reactive({
  TenSach: "",
  DonGia: 0,
  SoQuyen: 0,
  NamXuatBan: "",
  MaNXB: "",
  NguonGocTacGia: "",
});

async function openEdit() {
  editForm.TenSach = book.value.TenSach;
  editForm.DonGia = book.value.DonGia;
  editForm.SoQuyen = book.value.SoQuyen;
  editForm.NamXuatBan = book.value.NamXuatBan;
  editForm.MaNXB = book.value.MaNXB?._id || "";
  editForm.NguonGocTacGia = book.value.NguonGocTacGia;
  if (!publishers.value.length) {
    try {
      const res = await getPublishers({ limit: 200 });
      publishers.value = res.data;
    } catch (err) {
      toast.error(extractErrorMessage(err, "Không tải được danh sách NXB"));
    }
  }
  showEdit.value = true;
}

async function submitEdit() {
  editing.value = true;
  try {
    await updateBook(book.value.MaSach, { ...editForm });
    toast.success("Cập nhật sách thành công");
    showEdit.value = false;
    await loadBook();
  } catch (err) {
    toast.error(extractErrorMessage(err, "Cập nhật thất bại"));
  } finally {
    editing.value = false;
  }
}

// ---------- Xoá sách (staff) ----------
const showDelete = ref(false);
const deleting = ref(false);

async function submitDelete() {
  deleting.value = true;
  try {
    await deleteBook(book.value.MaSach);
    toast.success("Đã xoá sách");
    router.push({ name: listRouteName.value });
  } catch (err) {
    toast.error(extractErrorMessage(err, "Không thể xoá sách"));
  } finally {
    deleting.value = false;
    showDelete.value = false;
  }
}
</script>

<template>
  <div>
    <button
      class="text-sm text-ink-500 hover:text-brand-600 mb-4 flex items-center gap-1"
      @click="router.push({ name: listRouteName })"
    >
      ← Quay lại danh sách
    </button>

    <div v-if="loading" class="flex justify-center py-20">
      <Spinner />
    </div>

    <div v-else-if="book" class="bg-white rounded-2xl border border-ink-100 shadow-sm p-6">
      <div class="flex flex-col sm:flex-row gap-6">
        <div
          class="w-full sm:w-44 h-60 shrink-0 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-5xl text-white shadow-inner"
        >
          📖
        </div>

        <div class="flex-1">
          <h1 class="text-2xl font-semibold text-ink-800">{{ book.TenSach }}</h1>
          <p class="text-ink-500 mt-1">{{ book.NguonGocTacGia || "Chưa rõ tác giả" }}</p>

          <dl class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
            <div>
              <dt class="text-xs text-ink-400">Mã sách</dt>
              <dd class="text-sm font-medium text-ink-700 mt-0.5">{{ book.MaSach }}</dd>
            </div>
            <div>
              <dt class="text-xs text-ink-400">Năm xuất bản</dt>
              <dd class="text-sm font-medium text-ink-700 mt-0.5">{{ book.NamXuatBan || "—" }}</dd>
            </div>
            <div>
              <dt class="text-xs text-ink-400">Nhà xuất bản</dt>
              <dd class="text-sm font-medium text-ink-700 mt-0.5">{{ book.MaNXB?.TenNXB || "—" }}</dd>
            </div>
            <div>
              <dt class="text-xs text-ink-400">Đơn giá</dt>
              <dd class="text-sm font-medium text-ink-700 mt-0.5">{{ book.DonGia?.toLocaleString("vi-VN") }} đ</dd>
            </div>
            <div>
              <dt class="text-xs text-ink-400">Số lượng còn lại</dt>
              <dd
                class="text-sm font-semibold mt-0.5"
                :class="book.SoQuyen > 0 ? 'text-emerald-600' : 'text-rose-500'"
              >
                {{ book.SoQuyen }}
              </dd>
            </div>
          </dl>

          <div class="flex flex-wrap gap-3 mt-6">
            <button
              :disabled="book.SoQuyen < 1"
              class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              @click="openBorrow"
            >
              {{ book.SoQuyen < 1 ? "Đã hết sách" : "📚 Mượn sách" }}
            </button>

            <template v-if="isStaffArea && auth.isStaff">
              <button
                class="px-5 py-2.5 rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50 text-sm font-medium"
                @click="openEdit"
              >
                ✏️ Sửa thông tin
              </button>
              <button
                class="px-5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-medium"
                @click="showDelete = true"
              >
                🗑️ Xoá sách
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog mượn sách -->
    <AppModal v-model="showBorrow" title="Mượn sách">
      <form class="space-y-4" @submit.prevent="submitBorrow">
        <div v-if="auth.isStaff">
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Mã độc giả *</label>
          <input
            v-model="borrowForm.MaDocGia"
            type="text"
            required
            placeholder="VD: DG001"
            class="input"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">
            Ngày hẹn trả *
            <span class="text-ink-400 font-normal">(tối đa {{ MAX_LOAN_DAYS / 7 }} tuần)</span>
          </label>
          <input
            v-model="borrowForm.NgayHenTra"
            type="date"
            required
            :min="minDueDate"
            :max="maxDueDate"
            class="input"
          />
        </div>

        <div v-if="auth.isReader">
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Phương thức nhận sách *</label>
          <div class="grid grid-cols-2 gap-3">
            <label
              :class="[
                'flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer text-sm',
                borrowForm.PhuongThucNhan === 'NhanTrucTiep' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600',
              ]"
            >
              <input v-model="borrowForm.PhuongThucNhan" type="radio" value="NhanTrucTiep" class="accent-brand-600" />
              🏬 Nhận tại thư viện
            </label>
            <label
              :class="[
                'flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer text-sm',
                borrowForm.PhuongThucNhan === 'GiaoHang' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600',
              ]"
            >
              <input v-model="borrowForm.PhuongThucNhan" type="radio" value="GiaoHang" class="accent-brand-600" />
              🚚 Giao hàng
            </label>
          </div>
        </div>
      </form>
      <template #footer>
        <button class="px-4 py-2 rounded-lg text-sm font-medium text-ink-600 hover:bg-ink-100" @click="showBorrow = false">
          Hủy
        </button>
        <button
          :disabled="borrowing"
          class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-60"
          @click="submitBorrow"
        >
          {{ borrowing ? "Đang xử lý..." : "Xác nhận mượn" }}
        </button>
      </template>
    </AppModal>

    <!-- Dialog sửa sách -->
    <AppModal v-model="showEdit" title="Sửa thông tin sách" width="max-w-lg">
      <form class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="submitEdit">
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Tên sách *</label>
          <input v-model="editForm.TenSach" required type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Tác giả</label>
          <input v-model="editForm.NguonGocTacGia" type="text" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Năm xuất bản</label>
          <input v-model.number="editForm.NamXuatBan" type="number" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Đơn giá *</label>
          <input v-model.number="editForm.DonGia" required type="number" min="0" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Số quyển *</label>
          <input v-model.number="editForm.SoQuyen" required type="number" min="0" class="input" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Nhà xuất bản *</label>
          <select v-model="editForm.MaNXB" required class="input">
            <option value="" disabled>-- Chọn nhà xuất bản --</option>
            <option v-for="p in publishers" :key="p._id" :value="p._id">{{ p.TenNXB }}</option>
          </select>
        </div>
      </form>
      <template #footer>
        <button class="px-4 py-2 rounded-lg text-sm font-medium text-ink-600 hover:bg-ink-100" @click="showEdit = false">
          Hủy
        </button>
        <button
          :disabled="editing"
          class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-60"
          @click="submitEdit"
        >
          {{ editing ? "Đang lưu..." : "Lưu thay đổi" }}
        </button>
      </template>
    </AppModal>

    <ConfirmDialog
      v-model="showDelete"
      title="Xoá sách"
      :message="`Bạn có chắc muốn xoá sách '${book?.TenSach}'? Hành động này không thể hoàn tác.`"
      confirm-text="Xoá sách"
      :loading="deleting"
      @confirm="submitDelete"
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
