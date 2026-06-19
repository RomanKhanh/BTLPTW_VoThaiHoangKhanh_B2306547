<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToastStore, extractErrorMessage } from "../../stores/toast";
import { getLoans, returnLoan } from "../../api/monitorLoan.api";
import { formatDate, isOverdue, daysLeft } from "../../utils/date";
import Spinner from "../../components/ui/Spinner.vue";
import EmptyState from "../../components/ui/EmptyState.vue";
import StatusBadge from "../../components/ui/StatusBadge.vue";
import ConfirmDialog from "../../components/ui/ConfirmDialog.vue";

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const tabs = [
  { key: "chuaTra", label: "Chưa trả" },
  { key: "quaHan", label: "Quá hạn chưa trả" },
  { key: "timKiem", label: "Tìm kiếm" },
];
const activeTab = ref(route.query.tab || "chuaTra");

watch(activeTab, (val) => {
  router.replace({ query: { ...route.query, tab: val } });
});

const loading = ref(true);
const loans = ref([]);

const searchForm = reactive({
  MaDocGia: "",
  NgayMuon: "",
  NgayTra: "",
});

async function loadLoans() {
  loading.value = true;
  try {
    let filter = {};
    if (activeTab.value === "chuaTra") {
      filter = { returned: "false" };
    } else if (activeTab.value === "quaHan") {
      filter = { quaHan: "true" };
    } else {
      filter = {
        MaDocGia: searchForm.MaDocGia || undefined,
        NgayMuon: searchForm.NgayMuon || undefined,
        NgayTra: searchForm.NgayTra || undefined,
      };
    }
    loans.value = await getLoans(filter);
  } catch (err) {
    toast.error(extractErrorMessage(err, "Không tải được danh sách phiếu mượn"));
  } finally {
    loading.value = false;
  }
}

watch(activeTab, () => {
  if (activeTab.value !== "timKiem") loadLoans();
});

onMounted(loadLoans);

function submitSearch() {
  loadLoans();
}

function resetSearch() {
  searchForm.MaDocGia = "";
  searchForm.NgayMuon = "";
  searchForm.NgayTra = "";
  loadLoans();
}

// ---- Trả sách ----
const showConfirmReturn = ref(false);
const returning = ref(false);
const selectedLoan = ref(null);

function askReturn(loan) {
  selectedLoan.value = loan;
  showConfirmReturn.value = true;
}

async function confirmReturn() {
  returning.value = true;
  try {
    await returnLoan(selectedLoan.value._id);
    toast.success("Đã ghi nhận trả sách");
    showConfirmReturn.value = false;
    await loadLoans();
  } catch (err) {
    toast.error(extractErrorMessage(err, "Không thể cập nhật trả sách"));
  } finally {
    returning.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold text-ink-800">Quản lý mượn sách</h1>
    <p class="text-sm text-ink-400 mt-0.5 mb-5">Theo dõi các phiếu mượn sách của độc giả</p>

    <div class="flex bg-ink-100 rounded-xl p-1 mb-5 w-full sm:w-fit">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 sm:flex-none"
        :class="activeTab === t.key ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500'"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Form tìm kiếm -->
    <div v-if="activeTab === 'timKiem'" class="bg-white rounded-2xl border border-ink-100 shadow-sm p-5 mb-5">
      <form class="grid grid-cols-1 sm:grid-cols-3 gap-4" @submit.prevent="submitSearch">
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Mã độc giả</label>
          <input v-model="searchForm.MaDocGia" type="text" placeholder="VD: DG001" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Ngày mượn</label>
          <input v-model="searchForm.NgayMuon" type="date" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-600 mb-1.5">Ngày trả</label>
          <input v-model="searchForm.NgayTra" type="date" class="input" />
        </div>
        <div class="sm:col-span-3 flex gap-3">
          <button type="submit" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium">
            Tìm kiếm
          </button>
          <button type="button" class="px-4 py-2 rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50 text-sm font-medium" @click="resetSearch">
            Đặt lại
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white rounded-2xl border border-ink-100 shadow-sm">
      <div v-if="loading" class="flex justify-center py-16">
        <Spinner />
      </div>

      <EmptyState v-else-if="!loans.length" title="Không có phiếu mượn nào" />

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-ink-400 border-b border-ink-100">
              <th class="px-5 py-3 font-medium">Độc giả</th>
              <th class="px-5 py-3 font-medium">Sách</th>
              <th class="px-5 py-3 font-medium">Ngày mượn</th>
              <th class="px-5 py-3 font-medium">Hạn trả</th>
              <th class="px-5 py-3 font-medium">Phương thức</th>
              <th class="px-5 py-3 font-medium">Trạng thái</th>
              <th class="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="loan in loans" :key="loan._id" class="border-b border-ink-50 hover:bg-ink-50/60">
              <td class="px-5 py-3 text-ink-700">
                {{ loan.MaDocGia?.HoLot }} {{ loan.MaDocGia?.Ten }}
                <span class="text-ink-400">({{ loan.MaDocGia?.MaDocGia }})</span>
              </td>
              <td class="px-5 py-3 text-ink-700">{{ loan.MaSach?.TenSach }}</td>
              <td class="px-5 py-3 text-ink-500">{{ formatDate(loan.NgayMuon) }}</td>
              <td class="px-5 py-3 text-ink-500">{{ formatDate(loan.NgayHenTra) }}</td>
              <td class="px-5 py-3 text-ink-500">
                {{ loan.PhuongThucNhan === "GiaoHang" ? "🚚 Giao hàng" : "🏬 Nhận trực tiếp" }}
              </td>
              <td class="px-5 py-3">
                <StatusBadge v-if="loan.NgayTra" tone="success">Đã trả {{ formatDate(loan.NgayTra) }}</StatusBadge>
                <StatusBadge v-else-if="isOverdue(loan)" tone="danger">Quá hạn {{ Math.abs(daysLeft(loan)) }} ngày</StatusBadge>
                <StatusBadge v-else tone="warning">Chưa trả</StatusBadge>
              </td>
              <td class="px-5 py-3 text-right">
                <button
                  v-if="!loan.NgayTra"
                  class="text-brand-600 hover:text-brand-700 font-medium"
                  @click="askReturn(loan)"
                >
                  Xác nhận trả
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ConfirmDialog
      v-model="showConfirmReturn"
      title="Xác nhận trả sách"
      :message="`Xác nhận độc giả '${selectedLoan?.MaDocGia?.Ten}' đã trả sách '${selectedLoan?.MaSach?.TenSach}'?`"
      confirm-text="Xác nhận"
      :danger="false"
      :loading="returning"
      @confirm="confirmReturn"
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
