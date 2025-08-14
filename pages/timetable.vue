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
    <TimetableGrid :dsCa="dsCa" @cell-click="onCellClick" />
  </div>
</template>
<script setup>
import { transformTimetable, gridToFlat } from "@/composables/useTimetable";

const rawTimetable = ref([]);
const rawUnscheduled = ref([]);
const dsCa = ref([]);
const reverted = computed(() => gridToFlat(dsCa.value));

onMounted(async () => {
  const raw = await $fetch("/data.json");
  rawTimetable.value = raw.data.timetable;
  rawUnscheduled.value = raw.data.ds_chua_xep;
  const { ds_Ca } = transformTimetable(rawTimetable.value, {
    daysCount: 7,
    shifts: [1, 2],
    periodsPerShift: 5,
    dayNames: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
  });
  dsCa.value = ds_Ca;
});

function onCellClick(payload) {
  console.log("Cell clicked", payload.record);
}
</script>
