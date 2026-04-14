<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top,_#f3fbff,_#eaf5f7_48%,_#dcecef)] px-4 py-8 text-slate-800">
    <div class="mx-auto max-w-7xl space-y-6">
      <section class="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_70px_rgba(22,105,122,0.12)] backdrop-blur">
        <div class="bg-[linear-gradient(135deg,_#16697a,_#1f8ea3)] px-6 py-8 text-white md:px-8">
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100">Preview Demo</p>
          <h1 class="mt-3 text-3xl font-bold md:text-4xl">Mã hóa thứ tự hoán vị thành seed</h1>
          <p class="mt-3 max-w-4xl text-sm leading-6 text-cyan-50 md:text-base">
            `Seed` chỉ chứa thông tin thứ tự hoán vị, không chứa lại toàn bộ UUID. Muốn khôi phục được đề, bạn cần có danh sách
            câu hỏi gốc ổn định và `seed` của permutation. Demo này dùng Lehmer code để mã hóa permutation thành một số rồi đổi
            sang chuỗi base36.
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
                  Bạn có thể đổi thứ tự để thấy `seed` thay đổi theo permutation.
                </p>
              </div>
              <button
                class="rounded-xl bg-[#16697a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#125564]"
                @click="shuffleExam"
              >
                Xáo trộn thứ tự
              </button>
              <button
                class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                @click="resetExam"
              >
                Khôi phục thứ tự gốc
              </button>
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
            <h2 class="text-sm font-semibold text-slate-700">Seed permutation</h2>
            <p class="mt-1 text-xs leading-5 text-slate-500">
              `Seed` được tạo từ Lehmer code của permutation, rồi chuyển sang chuỗi base36.
            </p>

            <div class="mt-4 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm break-all text-slate-700">
              {{ permutationSeed }}
            </div>

            <div class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <h3 class="text-sm font-semibold text-emerald-800">Permutation index</h3>
              <div class="mt-2 break-all font-mono text-sm text-emerald-900">
                {{ JSON.stringify(permutationIndexes) }}
              </div>
            </div>

            <div class="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 class="text-sm font-semibold text-amber-800">Lehmer digits</h3>
              <div class="mt-2 break-all font-mono text-sm text-amber-900">
                {{ JSON.stringify(lehmerDigits) }}
              </div>
            </div>

            <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 class="text-sm font-semibold text-slate-700">Khôi phục từ seed</h3>
              <p class="mt-1 text-xs leading-5 text-slate-500">
                Giải mã `seed` thành Lehmer code, đổi ra permutation, rồi map vào danh sách gốc.
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
            Thay vì lưu lại cả mảng UUID đã xáo, bạn chỉ lưu permutation order, ví dụ `[2, 0, 3, 1]`.
          </p>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-700">Điều kiện bắt buộc</h3>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Danh sách câu hỏi gốc phải ổn định và cùng thứ tự gốc. Nếu danh sách gốc đổi, seed permutation cũ sẽ không còn đúng.
          </p>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-700">Có thể nén thêm</h3>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Lehmer code đã nén permutation thành một số duy nhất. Với nhiều câu hơn nữa, bạn vẫn có thể lưu dưới dạng chuỗi
            base36 hoặc base62.
          </p>
        </article>
      </section>
    </div>
  </div>
</template>

<script setup>
import {
  decodePermutationLehmer,
  encodePermutationLehmer,
  getPermutationIndexes,
} from "~/composables/usePermutationLehmer";

const baseQuestions = [
  "a3f1c9e2-1a2b-4c3d-8e9f-111111111111",
  "b7d2e4f6-2b3c-5d6e-9f0a-222222222222",
  "c8e3f5a7-3c4d-6e7f-0a1b-333333333333",
  "d9f4a6b8-4d5e-7f8a-1b2c-444444444444",
  "e1a5b7c9-5e6f-8a9b-2c3d-555555555555",
  "f2b6c8d0-6f7a-9b0c-3d4e-666666666666",
  "07c7d9e1-7a8b-0c1d-4e5f-777777777777",
  "18d8e0f2-8b9c-1d2e-5f6a-888888888888",
];

const examQuestions = ref([...baseQuestions]);
const draggedIndex = ref(null);
const dragOverIndex = ref(null);

const permutationIndexes = computed(() => getPermutationIndexes(baseQuestions, examQuestions.value));
const permutationSeed = computed(() => encodePermutationLehmer(baseQuestions, examQuestions.value));
const restoredQuestions = computed(() => decodePermutationLehmer(baseQuestions, permutationSeed.value));
const lehmerDigits = computed(() => {
  const availableIndexes = Array.from({ length: permutationIndexes.value.length }, (_, index) => index);

  return permutationIndexes.value.map(index => {
    const digit = availableIndexes.indexOf(index);
    availableIndexes.splice(digit, 1);
    return digit;
  });
});

function shuffleExam() {
  const shuffledQuestions = [...examQuestions.value];

  for (let index = shuffledQuestions.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledQuestions[index], shuffledQuestions[randomIndex]] = [shuffledQuestions[randomIndex], shuffledQuestions[index]];
  }

  examQuestions.value = shuffledQuestions;
}

function resetExam() {
  examQuestions.value = [...baseQuestions];
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
</script>
