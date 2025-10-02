<template>
  <!-- <div class="p-6">
    <TimetableView :name="data.name" :timetable="data.timetable" />
  </div> -->
  <div class="p-4">
    <h2 class="text-xl font-semibold mb-2">Thời khóa biểu 11A1</h2>
    
    <TimetableGrid v-model:classId="demoClassId" :timetableId="demoTimetableId" />
  </div>
</template>
<script setup>
const demoClassId = ref(null);
const demoTimetableId = ref(null);
</script>
