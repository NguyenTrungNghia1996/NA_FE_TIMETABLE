<template>
  <div class="space-y-3">
    <!-- Legend -->
    <div class="flex flex-wrap items-center gap-2 text-xs">
      <span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-50 border"> <span class="w-3 h-3 rounded bg-green-200 border"></span> Tiết học </span>
      <span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-50 border"> <span class="w-3 h-3 rounded bg-yellow-200 border"></span> Nghỉ </span>
      <span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-50 border"> <span class="w-3 h-3 rounded bg-slate-200 border"></span> Trống </span>
      <span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 border"> <span class="w-3 h-3 rounded bg-red-200 border"></span> Khóa (isLock) </span>
    </div>

    <!-- Khung scroll theo chiều ngang nếu nhiều cột -->
    <div class="overflow-x-auto rounded-lg border">
      <!-- Header: cột "Ngày / Ca" + 5 tiết -->
      <div class="grid min-w-[720px] grid-cols-[160px_repeat(5,1fr)] bg-gray-100 text-xs font-medium">
        <div class="px-3 py-2 border-r">Ngày / Ca</div>
        <div v-for="p in 5" :key="'head-' + p" class="px-3 py-2 border-l text-center">Tiết {{ p }}</div>
      </div>

      <!-- Body -->
      <div class="divide-y">
        <!-- Mỗi ngày -->
        <div v-for="d in days" :key="'day-' + d.day" class="bg-white">
          <!-- Mỗi ca trong ngày -->
          <div v-for="(c, ci) in d.ca" :key="'day-' + d.day + '-ca-' + c.id_ca" class="grid min-w-[720px] grid-cols-[160px_repeat(5,1fr)]">
            <!-- Cột nhãn ngày/ca (row header) -->
            <div class="px-3 py-2 border-r bg-gray-50 text-sm">
              <div class="font-semibold" v-if="ci === 0">{{ d.label }}</div>
              <div class="text-gray-600">{{ c.label }}</div>
            </div>

            <!-- 5 ô tiết -->
            <button v-for="cell in c.periods" :key="'cell-' + d.day + '-' + c.id_ca + '-' + cell.tiet" type="button" class="px-2 py-2 text-left border-l min-h-16 focus:outline-none focus:ring" :class="cellClass(cell)" :title="cellTitle(cell)" @click="$emit('cell-click', { day: d.day, ca: c.id_ca, tiet: cell.tiet, cell })">
              <div class="text-[11px] opacity-70">Tiết {{ cell.tiet }}</div>

              <template v-if="cell.type === 'lesson'">
                <div class="font-medium leading-tight">
                  {{ cell.data.ten_mon }}
                </div>
                <div class="text-[11px] opacity-70">{{ cell.data.ten_giao_vien }} — Phòng {{ cell.data.id_phong }}</div>
              </template>

              <template v-else-if="cell.type === 'rest'">
                <div class="italic opacity-70">— Nghỉ —</div>
              </template>

              <template v-else>
                <div class="italic opacity-50">Trống</div>
              </template>

              <div v-if="cell.isLock" class="mt-1 inline-block text-[10px] px-1 rounded bg-red-100 text-red-700">Khóa</div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Slot tùy biến (nếu muốn chèn gì thêm) -->
    <slot />
  </div>
</template>

<script setup>
/**
 * Props:
 * - days: mảng từ transformTimetable(...) => [{ day, label, ca: [{ id_ca, label, periods: [...] }] }]
 */
defineProps({
  days: {
    type: Array,
    required: true,
  },
});

/** Class theo loại ô */
const cellClass = cell => {
  return {
    "bg-green-50 hover:bg-green-100": cell.type === "lesson",
    "bg-yellow-50 hover:bg-yellow-100": cell.type === "rest",
    "bg-slate-50 hover:bg-slate-100": cell.type === "blank",
    "ring-1 ring-red-200": !!cell.isLock,
  };
};

/** Tooltip title */
const cellTitle = cell => {
  if (cell.type === "lesson") {
    const s = cell.data;
    return `${s.ten_mon} - ${s.ten_giao_vien} (Phòng ${s.id_phong})`;
  }
  if (cell.type === "rest") return "Tiết nghỉ";
  return "Ô trống";
};
</script>
