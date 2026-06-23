<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useToastStore, extractErrorMessage } from "../../stores/toast";
import { getLoansByReaderId } from "../../api/monitorLoan.api";
import { formatDate, isOverdue, daysLeft } from "../../utils/date";
import Spinner from "../../components/ui/Spinner.vue";
import EmptyState from "../../components/ui/EmptyState.vue";
import StatusBadge from "../../components/ui/StatusBadge.vue";

const auth = useAuthStore();
const toast = useToastStore();

const loading = ref(true);
const loans = ref([]);
const tab = ref("chuaTra"); // "chuaTra" | "daTra"

async function loadLoans() {
  loading.value = true;
  try {
    const result = await getLoansByReaderId(auth.user?._id);
    console.log(result);
    loans.value = result.data;
  } catch (err) {
    toast.error(extractErrorMessage(err, "Không tải được phiếu mượn"));
  } finally {
    loading.value = false;
  }
}
onMounted(loadLoans);

const unreturned = computed(() => loans.value.filter((l) => !l.NgayTra));
const returned = computed(() => loans.value.filter((l) => l.NgayTra));
const displayList = computed(() =>
  tab.value === "chuaTra" ? unreturned.value : returned.value,
);
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold text-ink-800">Sách đang mượn</h1>
    <p class="text-sm text-ink-400 mt-0.5 mb-5">
      Theo dõi trạng thái các phiếu mượn của bạn
    </p>

    <!-- Tab switcher with counts -->
    <div class="flex gap-2 mb-5">
      <button
        class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        :class="
          tab === 'chuaTra'
            ? 'bg-brand-600 text-white'
            : 'bg-white border border-ink-200 text-ink-600 hover:bg-ink-50'
        "
        @click="tab = 'chuaTra'"
      >
        Chưa trả
        <span
          v-if="!loading"
          class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
          :class="
            tab === 'chuaTra'
              ? 'bg-white/20 text-white'
              : 'bg-ink-100 text-ink-600'
          "
          >{{ unreturned.length }}</span
        >
      </button>
      <button
        class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        :class="
          tab === 'daTra'
            ? 'bg-brand-600 text-white'
            : 'bg-white border border-ink-200 text-ink-600 hover:bg-ink-50'
        "
        @click="tab = 'daTra'"
      >
        Đã trả
        <span
          v-if="!loading"
          class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
          :class="
            tab === 'daTra'
              ? 'bg-white/20 text-white'
              : 'bg-ink-100 text-ink-600'
          "
          >{{ returned.length }}</span
        >
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-16"><Spinner /></div>

    <template v-else>
      <EmptyState
        v-if="!displayList.length"
        :title="
          tab === 'chuaTra'
            ? 'Bạn chưa mượn quyển nào'
            : 'Chưa có lịch sử trả sách'
        "
        :description="
          tab === 'chuaTra'
            ? 'Ghé trang Mượn sách để tìm và mượn sách bạn thích.'
            : ''
        "
      />

      <div v-else class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="loan in displayList"
          :key="loan._id"
          class="bg-white rounded-2xl border border-ink-100 shadow-sm p-5 flex flex-col gap-3"
          :class="isOverdue(loan) ? 'border-rose-200 bg-rose-50/30' : ''"
        >
          <div class="flex items-start justify-between gap-2">
            <h3 class="text-sm font-semibold text-ink-800 leading-snug">
              {{ loan.MaSach?.TenSach }}
            </h3>
            <div class="shrink-0">
              <StatusBadge v-if="loan.NgayTra" tone="success"
                >Đã trả</StatusBadge
              >
              <StatusBadge v-else-if="isOverdue(loan)" tone="danger"
                >Quá hạn {{ Math.abs(daysLeft(loan)) }} ngày</StatusBadge
              >
              <StatusBadge v-else tone="warning">Chưa trả</StatusBadge>
            </div>
          </div>

          <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt class="text-xs text-ink-400">Ngày mượn</dt>
              <dd class="text-ink-700 font-medium mt-0.5">
                {{ formatDate(loan.NgayMuon) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-ink-400">Hạn trả</dt>
              <dd
                class="font-medium mt-0.5"
                :class="isOverdue(loan) ? 'text-rose-600' : 'text-ink-700'"
              >
                {{ formatDate(loan.NgayHenTra) }}
              </dd>
            </div>
            <div v-if="loan.NgayTra">
              <dt class="text-xs text-ink-400">Ngày trả thực tế</dt>
              <dd class="text-ink-700 font-medium mt-0.5">
                {{ formatDate(loan.NgayTra) }}
              </dd>
            </div>
            <div v-if="!loan.NgayTra">
              <dt class="text-xs text-ink-400">Còn lại</dt>
              <dd
                class="font-medium mt-0.5"
                :class="
                  isOverdue(loan)
                    ? 'text-rose-600'
                    : daysLeft(loan) <= 3
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                "
              >
                {{
                  isOverdue(loan)
                    ? `Quá hạn ${Math.abs(daysLeft(loan))} ngày`
                    : `${daysLeft(loan)} ngày`
                }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-ink-400">Phương thức nhận</dt>
              <dd class="text-ink-700 mt-0.5">
                {{
                  loan.PhuongThucNhan === "GiaoHang"
                    ? "🚚 Giao hàng"
                    : "🏬 Nhận trực tiếp"
                }}
              </dd>
            </div>
          </dl>

          <!-- cảnh báo quá hạn -->
          <div
            v-if="isOverdue(loan)"
            class="text-xs text-rose-600 bg-rose-100 rounded-lg px-3 py-2 leading-relaxed"
          >
            ⚠️ Sách quá hạn trả. Vui lòng liên hệ thư viện để hoàn trả sớm nhất
            có thể.
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
