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

    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-4 rounded w-72">
        <h3 class="font-semibold mb-2">Chọn tiết học</h3>
        <select v-model="selectedIdx" class="border w-full mb-4">
          <option v-for="(lesson, idx) in rawUnscheduled" :key="idx" :value="idx">
            {{ lesson.ten_mon }} - {{ lesson.ten_giao_vien }}
          </option>
        </select>
        <div class="flex justify-end gap-2">
          <button class="px-3 py-1 border rounded" @click="showAddModal = false">Hủy</button>
          <button class="px-3 py-1 bg-blue-500 text-white rounded" @click="confirmAdd">Thêm</button>
        </div>
      </div>
    </div>
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
  if (selectedIdx.value == null) return;
  const lesson = rawUnscheduled.value.splice(selectedIdx.value, 1)[0];
  Object.assign(targetCell.value, lesson);
  showAddModal.value = false;
  targetCell.value = null;
  console.log("Lesson added", lesson);
}

function onCellClear(record) {
  rawUnscheduled.value.push({ ...record });
  console.log("Unscheduled added", record);
}
</script>
