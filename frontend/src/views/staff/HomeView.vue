<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToastStore, extractErrorMessage } from "../../stores/toast";
import { getBooks } from "../../api/book.api";
import { getReaders } from "../../api/reader.api";
import { getLoans } from "../../api/monitorLoan.api";
import { formatDate, daysLeft } from "../../utils/date";
import Spinner from "../../components/ui/Spinner.vue";
import EmptyState from "../../components/ui/EmptyState.vue";
import StatusBadge from "../../components/ui/StatusBadge.vue";

const router = useRouter();
const toast = useToastStore();

const loading = ref(true);
const stats = ref({ totalBooks: 0, totalReaders: 0, activeLoans: 0, overdueLoans: 0 });
const overdueList = ref([]);

async function loadDashboard() {
  loading.value = true;
  try {
    const [booksRes, readers, activeLoans, overdue] = await Promise.all([
      getBooks({ page: 1, limit: 1 }),
      getReaders(),
      getLoans({ returned: "false" }),
      getLoans({ quaHan: "true" }),
    ]);

    stats.value = {
      totalBooks: booksRes.pagination?.total ?? booksRes.data.length,
      totalReaders: readers.length,
      activeLoans: activeLoans.length,
      overdueLoans: overdue.length,
    };
    overdueList.value = overdue.slice(0, 8);
  } catch (err) {
    toast.error(extractErrorMessage(err, "Không tải được dữ liệu trang chủ"));
  } finally {
    loading.value = false;
  }
}

onMounted(loadDashboard);

const cards = [
  { key: "totalBooks", label: "Tổng số sách", icon: "📚", tone: "brand" },
  { key: "totalReaders", label: "Tổng số độc giả", icon: "🧑‍🤝‍🧑", tone: "neutral" },
  { key: "activeLoans", label: "Đang được mượn", icon: "🧾", tone: "warning" },
  { key: "overdueLoans", label: "Quá hạn chưa trả", icon: "⏰", tone: "danger" },
];

const cardTone = {
  brand: "bg-brand-50 text-brand-700",
  neutral: "bg-ink-100 text-ink-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
};
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold text-ink-800">Trang chủ</h1>
    <p class="text-sm text-ink-400 mt-0.5 mb-6">Tổng quan hoạt động thư viện</p>

    <div v-if="loading" class="flex justify-center py-16">
      <Spinner />
    </div>

    <template v-else>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div
          v-for="c in cards"
          :key="c.key"
          class="bg-white rounded-2xl border border-ink-100 shadow-sm p-5"
        >
          <div :class="[cardTone[c.tone], 'h-10 w-10 rounded-xl flex items-center justify-center text-lg mb-3']">
            {{ c.icon }}
          </div>
          <p class="text-2xl font-semibold text-ink-800">{{ stats[c.key] }}</p>
          <p class="text-sm text-ink-400 mt-0.5">{{ c.label }}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-ink-100 shadow-sm">
        <div class="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 class="text-sm font-semibold text-ink-700">Phiếu mượn quá hạn gần đây</h2>
          <button
            class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200/50 hover:border-brand-200 shadow-2xs transition-all duration-200 cursor-pointer"
            @click="router.push({ name: 'staff-loans', query: { tab: 'quaHan' } })"
          >
            Xem tất cả
          </button>
        </div>

        <EmptyState v-if="!overdueList.length" title="Không có phiếu mượn quá hạn 🎉" />

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-ink-400 border-b border-ink-100">
                <th class="px-5 py-3 font-medium">Độc giả</th>
                <th class="px-5 py-3 font-medium">Sách</th>
                <th class="px-5 py-3 font-medium">Ngày mượn</th>
                <th class="px-5 py-3 font-medium">Hạn trả</th>
                <th class="px-5 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loan in overdueList" :key="loan._id" class="border-b border-ink-50">
                <td class="px-5 py-3 text-ink-700">
                  {{ loan.MaDocGia?.HoLot }} {{ loan.MaDocGia?.Ten }}
                  <span class="text-ink-400">({{ loan.MaDocGia?.MaDocGia }})</span>
                </td>
                <td class="px-5 py-3 text-ink-700">{{ loan.MaSach?.TenSach }}</td>
                <td class="px-5 py-3 text-ink-500">{{ formatDate(loan.NgayMuon) }}</td>
                <td class="px-5 py-3 text-ink-500">{{ formatDate(loan.NgayHenTra) }}</td>
                <td class="px-5 py-3">
                  <StatusBadge tone="danger">Quá hạn {{ Math.abs(daysLeft(loan)) }} ngày</StatusBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
