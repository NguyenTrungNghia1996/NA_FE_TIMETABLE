<template>
  <div class="max-w-6xl mx-auto p-6 space-y-4">
    <h1 class="text-2xl font-bold mb-2">Demo xếp thời khóa biểu liên kết</h1>
    <a-select v-model:value="timetableStore.currentClassId" class="mb-4 w-48">
      <a-select-option
        v-for="cls in timetableStore.classes"
        :key="cls.id"
        :value="cls.id"
      >
        {{ cls.name }}
      </a-select-option>
    </a-select>
    <div class="grid gap-6 md:grid-cols-1">
      <ClassTimetable :timetable="timetableStore.currentTimetable" />
    </div>


    <div class="mt-10 border-t pt-6">
      <h2 class="text-xl font-bold mb-4">📓 Hướng dẫn sử dụng</h2>
      <ul class="list-disc pl-6 space-y-2">
        <li>Nhấn chuột phải để đặt hoặc bỏ nghỉ.</li>
        <li>Chọn "Xóa tiết" để làm trống ô đã có môn học.</li>
        <li>Kéo thả các tiết để hoán đổi vị trí.</li>
        <li>Không thể kéo thả vào tiết nghỉ.</li>
        <li>Không thể đặt nghỉ ở ô đã có tiết học.</li>
      </ul>
    </div>


    <div class="mt-6">
      <h2 class="text-xl font-bold mb-2">📦 Dữ liệu hiện tại</h2>
      <pre class="bg-gray-100 p-4 text-xs overflow-auto">{{ timetableJson }}</pre>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTimetableStore } from '~/stores/timetableStore'

const timetableStore = useTimetableStore()

const timetableJson = computed(() =>
  JSON.stringify(timetableStore.currentTimetable, null, 2)
)
</script>

<style scoped>
</style>
