<template>
  <!-- <div class="p-6">
    <TimetableView :name="data.name" :timetable="data.timetable" />
  </div> -->
  <div class="p-4">
    <h2 class="text-xl font-semibold mb-2">Thời khóa biểu 11A1</h2>
    <details class="border rounded">
      <summary class="cursor-pointer px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-t">Xem dữ liệu JSON</summary>
      <div class="max-h-64 overflow-auto p-3 text-xs grid gap-4 md:grid-cols-2">
        <div>
          <h4 class="font-semibold mb-1">Thời khóa biểu</h4>
          <pre>{{ rawTimetable.length }} /{{ JSON.stringify(rawTimetable, null, 2) }}</pre>
        </div>
        <div>
          <h4 class="font-semibold mb-1">Tiết chưa xếp</h4>
          <pre>{{ JSON.stringify(rawUnscheduled, null, 2) }}</pre>
        </div>
      </div>
    </details>
    <TimetableGrid :rawTimetable="rawTimetable" :rawUnscheduled="rawUnscheduled" />
  </div>
</template>
<script setup>
const rawTimetable = ref([]);
const rawUnscheduled = ref([]);

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
});
</script>
