<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top,_#f3fbff,_#eaf5f7_48%,_#dcecef)] px-4 py-8 text-slate-800">
    <div class="mx-auto max-w-7xl space-y-6">
      <section class="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_70px_rgba(22,105,122,0.12)] backdrop-blur">
        <div class="bg-[linear-gradient(135deg,_#16697a,_#1f8ea3)] px-6 py-8 text-white md:px-8">
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100">Preview Demo</p>
          <h1 class="mt-3 text-3xl font-bold md:text-4xl">Kéo thả đổi thứ tự và cập nhật seed</h1>
          <p class="mt-3 max-w-4xl text-sm leading-6 text-cyan-50 md:text-base">
            Demo này dùng `seed` để mã hóa trực tiếp thứ tự hiện tại của danh sách. Khi bạn kéo thả đổi vị trí UUID, `seed` sẽ
            thay đổi theo ngay và có thể dùng để khôi phục lại đúng thứ tự đó.
          </p>
        </div>

        <div class="grid gap-6 px-6 py-6 md:grid-cols-2 xl:grid-cols-3 md:px-8">
          <section class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-semibold text-slate-700">Danh sách gốc</h2>
                <p class="text-xs leading-5 text-slate-500">
                  Đây là ngân hàng câu hỏi đầu vào cố định.
                </p>
              </div>
              <span class="rounded-full bg-[#16697a]/10 px-3 py-1 text-xs font-semibold text-[#16697a]">
                {{ baseQuestions.length }} UUID
              </span>
            </div>

            <div class="mt-4 space-y-3">
              <div
                v-for="(questionId, index) in baseQuestions"
                :key="`base-${questionId}`"
                class="rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Vị trí gốc {{ index }}</div>
                <div class="mt-1 break-all font-mono text-sm text-slate-700">{{ questionId }}</div>
              </div>
            </div>
          </section>

          <section class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-semibold text-slate-700">Thứ tự đề hiện tại</h2>
                <p class="text-xs leading-5 text-slate-500">
                  Bạn có thể kéo thả tự do để đổi vị trí UUID. `Seed` sẽ tự cập nhật theo thứ tự mới.
                </p>
              </div>
              <button
                class="rounded-xl bg-[#16697a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#125564]"
                @click="shuffleExam"
              >
                Xáo trộn ngẫu nhiên
              </button>
              <button
                class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                @click="applyCurrentSeed"
              >
                Shuffle lại từ seed
              </button>
              <button
                class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                @click="resetExam"
              >
                Về thứ tự gốc
              </button>
            </div>

            <div class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 class="text-sm font-semibold text-amber-800">Kéo thả tự do</h3>
              <p class="mt-1 text-xs leading-5 text-amber-900">
                Kéo từng UUID để tráo đổi vị trí thủ công. Sau mỗi lần đổi thứ tự, `seed` sẽ được tính lại từ chính thứ tự mới.
              </p>
            </div>

            <div class="mt-4 space-y-3">
              <div
                v-for="(questionId, index) in examQuestions"
                :key="`exam-${questionId}`"
                draggable="true"
                class="cursor-move rounded-xl border bg-white px-4 py-3 transition"
                :class="[
                  draggedIndex === index
                    ? 'border-[#16697a] bg-cyan-50 opacity-60'
                    : 'border-slate-200',
                  dragOverIndex === index ? 'ring-2 ring-[#16697a]/20' : '',
                ]"
                @dragstart="handleDragStart(index)"
                @dragover.prevent="handleDragOver(index)"
                @drop.prevent="handleDrop(index)"
                @dragend="handleDragEnd"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <div class="text-slate-400">⋮⋮</div>
                    <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Câu {{ index + 1 }}</div>
                  </div>
                  <div class="text-xs font-semibold text-[#16697a]">
                    index gốc: {{ permutationIndexes[index] }}
                  </div>
                </div>
                <div class="mt-1 break-all font-mono text-sm text-slate-700">{{ questionId }}</div>
              </div>
            </div>
          </section>

          <section class="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-1 md:col-span-2">
            <h2 class="text-sm font-semibold text-slate-700">Seed ngắn</h2>
            <p class="mt-1 text-xs leading-5 text-slate-500">
              `Seed` được tính từ thứ tự hiện tại của danh sách. Dán lại `seed` này sẽ khôi phục đúng thứ tự tương ứng.
            </p>

            <div class="mt-4 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm break-all text-slate-700">
              {{ shuffleSeed }}
            </div>

            <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label class="text-sm font-semibold text-slate-700">Nhập seed để khôi phục</label>
              <p class="mt-1 text-xs leading-5 text-slate-500">
                Dán một seed đã lưu trước đó rồi nhấn nút khôi phục để dựng lại đúng thứ tự danh sách.
              </p>
              <input
                v-model="inputSeed"
                class="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm outline-none transition focus:border-[#16697a] focus:ring-4 focus:ring-[#16697a]/10"
                placeholder="Nhập seed, ví dụ: k3d91qxp"
              />
              <div class="mt-3 flex flex-wrap gap-3">
                <button
                  class="rounded-xl bg-[#16697a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#125564]"
                  @click="restoreFromInputSeed"
                >
                  Khôi phục từ seed nhập
                </button>
                <button
                  class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                  @click="inputSeed = shuffleSeed"
                >
                  Dùng seed hiện tại
                </button>
              </div>
            </div>

            <div class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <h3 class="text-sm font-semibold text-emerald-800">Permutation index</h3>
              <div class="mt-2 break-all font-mono text-sm text-emerald-900">
                {{ JSON.stringify(permutationIndexes) }}
              </div>
            </div>

            <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 class="text-sm font-semibold text-slate-700">Khôi phục từ seed</h3>
              <p class="mt-1 text-xs leading-5 text-slate-500">
                Cùng danh sách gốc + cùng `seed` => khôi phục đúng thứ tự đã được mã hóa.
              </p>

              <div class="mt-4 space-y-3">
                <div
                  v-for="(questionId, index) in restoredQuestions"
                  :key="`restored-${questionId}`"
                  class="rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Khôi phục {{ index + 1 }}</div>
                  <div class="mt-1 break-all font-mono text-sm text-slate-700">{{ questionId }}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section class="grid gap-4 md:grid-cols-3">
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-700">Ý tưởng cốt lõi</h3>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Thay vì lưu cả mảng đã xáo, bạn chỉ lưu một `seed` đại diện cho thứ tự hiện tại của 50 UUID.
          </p>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-700">Điều kiện bắt buộc</h3>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Danh sách câu hỏi gốc phải ổn định và cùng thứ tự gốc. Nếu đổi dữ liệu đầu vào, cùng seed có thể ra kết quả khác.
          </p>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-700">Đổi lại điều gì?</h3>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Seed sẽ dài hơn kiểu random seed ngắn, nhưng đổi lại nó khôi phục được chính xác cả những thay đổi kéo-thả thủ công.
          </p>
        </article>
      </section>
    </div>
  </div>
</template>

<script setup>
import {
  decodePermutation,
  encodePermutation,
  shuffleItems,
} from "~/composables/usePermutation";

const baseQuestions = Array.from({ length: 50 }, (_, index) => makeDemoUuid(index + 1));

const examQuestions = ref([...baseQuestions]);
const draggedIndex = ref(null);
const dragOverIndex = ref(null);
const inputSeed = ref("");
const permutationIndexes = computed(() => {
  const sourceIndexMap = new Map(baseQuestions.map((item, index) => [item, index]));

  return examQuestions.value
    .map(item => sourceIndexMap.get(item))
    .filter(index => Number.isInteger(index));
});
const shuffleSeed = computed(() => encodePermutation(baseQuestions, examQuestions.value));
const restoredQuestions = computed(() => {
  const normalizedSeed = inputSeed.value.trim() || shuffleSeed.value;
  return decodePermutation(baseQuestions, normalizedSeed);
});

function shuffleExam() {
  examQuestions.value = shuffleItems(examQuestions.value);
}

function resetExam() {
  examQuestions.value = [...baseQuestions];
}

function applyCurrentSeed() {
  examQuestions.value = decodePermutation(baseQuestions, shuffleSeed.value);
}

function restoreFromInputSeed() {
  const normalizedSeed = inputSeed.value.trim();

  if (!normalizedSeed) return;

  examQuestions.value = decodePermutation(baseQuestions, normalizedSeed);
}

function handleDragStart(index) {
  draggedIndex.value = index;
  dragOverIndex.value = index;
}

function handleDragOver(index) {
  dragOverIndex.value = index;
}

function handleDrop(dropIndex) {
  const startIndex = draggedIndex.value;

  if (startIndex === null || startIndex === dropIndex) {
    handleDragEnd();
    return;
  }

  const reorderedQuestions = [...examQuestions.value];
  const [movedQuestion] = reorderedQuestions.splice(startIndex, 1);
  reorderedQuestions.splice(dropIndex, 0, movedQuestion);
  examQuestions.value = reorderedQuestions;
  handleDragEnd();
}

function handleDragEnd() {
  draggedIndex.value = null;
  dragOverIndex.value = null;
}

function makeDemoUuid(index) {
  const paddedIndex = index.toString(16).padStart(12, "0");
  return `550e8400-e29b-41d4-a716-${paddedIndex}`;
}
</script>
