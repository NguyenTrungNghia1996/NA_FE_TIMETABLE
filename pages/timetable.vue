<template>
  <!-- <div class="p-6">
    <TimetableView :name="data.name" :timetable="data.timetable" />
  </div> -->
  <div class="p-4">
    <h2 class="text-xl font-semibold mb-2">Thời khóa biểu 11A1</h2>
    <details class="border rounded">
      <summary class="cursor-pointer px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-t">Xem dữ liệu JSON</summary>
      <div class="max-h-64 overflow-auto p-3 text-xs grid gap-4 md:grid-cols-4">
        <div>
          <h4 class="font-semibold mb-1">Dữ liệu đầu vào</h4>
          <pre>{{ rawTimetable.length }} /{{ JSON.stringify(rawTimetable, null, 2) }}</pre>
        </div>
        <div>
          <h4 class="font-semibold mb-1">Sau chuyển đổi</h4>
          <pre>{{ JSON.stringify(dsCa, null, 2) }}</pre>
        </div>
        <div>
          <h4 class="font-semibold mb-1">Chuyển ngược</h4>
          <pre>{{ reverted.length }} /{{ JSON.stringify(reverted, null, 2) }}</pre>
        </div>
        <div>
          <h4 class="font-semibold mb-1">Tiết chưa xếp</h4>
          <pre>{{ JSON.stringify(rawUnscheduled, null, 2) }}</pre>
        </div>
      </div>
    </details>
    <TimetableGrid :dsCa="dsCa" @cell-clear="onCellClear" @cell-add="onCellAdd" />

    <a-modal
      v-model:open="showAddModal"
      title="Chọn tiết học"
      ok-text="Thêm"
      cancel-text="Hủy"
      @ok="confirmAdd"
      @cancel="showAddModal = false"
    >
      <a-select v-model:value="selectedIdx" class="w-full mb-4">
        <a-select-option v-for="(lesson, idx) in rawUnscheduled" :key="idx" :value="idx">
          {{ lesson.ten_mon }} - {{ lesson.ten_giao_vien }}
        </a-select-option>
      </a-select>
    </a-modal>
  </div>
</template>
<script setup>
import { transformTimetable, gridToFlat } from "@/composables/useTimetable";

const rawTimetable = ref([]);
const rawUnscheduled = ref([]);
const dsCa = ref([]);
const reverted = computed(() => gridToFlat(dsCa.value, rawUnscheduled.value));
const showAddModal = ref(false);
const selectedIdx = ref(0);
const targetCell = ref(null);

onMounted(async () => {
  const raw = await $fetch("/data.json");
  rawTimetable.value = raw.data.timetable;
  rawUnscheduled.value = raw.data.ds_chua_xep.map(
    ({
      id_mon,
      ten_mon,
      id_giao_vien,
      ten_giao_vien,
      id_phong,
      ten_phong,
      tiet_thu_may,
    }) => ({
      id_mon,
      ten_mon,
      id_giao_vien,
      ten_giao_vien,
      id_phong,
      ten_phong,
      tiet_thu_may,
    })
  );
  const { ds_Ca } = transformTimetable(rawTimetable.value, {
    daysCount: 7,
    shifts: [1, 2],
    periodsPerShift: 5,
    dayNames: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
  });
  dsCa.value = ds_Ca;
});

function onCellAdd({ record }) {
  if (rawUnscheduled.value.length === 0) return;
  targetCell.value = record;
  selectedIdx.value = 0;
  showAddModal.value = true;
}

  function confirmAdd() {
    if (selectedIdx.value == null || !targetCell.value) return;
    const lesson = rawUnscheduled.value.splice(selectedIdx.value, 1)[0];
    if (!lesson) return;
    const cell = targetCell.value;
    cell.id_mon = lesson.id_mon;
    cell.ten_mon = lesson.ten_mon;
    cell.id_giao_vien = lesson.id_giao_vien;
    cell.ten_giao_vien = lesson.ten_giao_vien;
    cell.id_phong = lesson.id_phong;
    cell.ten_phong = lesson.ten_phong;
    cell.tiet_thu_may = lesson.tiet_thu_may;
    showAddModal.value = false;
    targetCell.value = null;
    console.log("Lesson added", { cell: { ...cell }, lesson });
  }

function onCellClear(record) {
  rawUnscheduled.value.push({ ...record });
  console.log("Unscheduled added", record);
}
</script>
