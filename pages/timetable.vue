<template>
  <!-- <div class="p-6">
    <TimetableView :name="data.name" :timetable="data.timetable" />
  </div> -->
  <div class="p-4">
    <h2 class="text-xl font-semibold mb-2">Thời khóa biểu 11A1</h2>
    <details class="border rounded">
      <summary class="cursor-pointer px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-t">Xem dữ liệu JSON</summary>
      <div class="max-h-64 overflow-auto p-3 text-xs">
        <pre>{{ JSON.stringify(dsCa, null, 2) }}</pre>
      </div>
    </details>
    <TimetableGrid :dsCa="dsCa" />
  </div>
</template>
<script setup>
import { transformTimetable } from "@/composables/useTimetable";
const raw = ref();
raw.value = await $fetch("/data.json");
const dsCa = ref([]);
onMounted(() => {
  const { ds_Ca } = transformTimetable(raw.value.data.timetable, {
    daysCount: 7,
    shifts: [1, 2],
    periodsPerShift: 5,
    dayNames: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
  });
  dsCa.value = ds_Ca;
});
</script>
