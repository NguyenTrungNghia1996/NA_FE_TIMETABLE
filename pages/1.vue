<template>
  <div class="p-6 space-y-4">
    <div class="flex gap-4 items-center">
      <div>
        <label class="block font-medium mb-1">Số tiết / ngày</label>
        <a-input-number v-model:value="soTiet" :min="1" @change="updateTimeTable" class="w-24" />
      </div>
      <div>
        <label class="block font-medium mb-1">Số ngày học</label>
        <a-input-number v-model:value="soNgay" :min="1" :max="7" @change="updateTimeTable" class="w-24" />
      </div>
    </div>

    <h1 class="text-xl font-bold">Thời khóa biểu: {{ block.name }}</h1>
    <Timetable2 :data="block.time_table" :key="key" />
    {{ block }}
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Timetable2 from '~/components/Timetable2.vue'
const key = ref(0)
const soTiet = ref(5)
const soNgay = ref(5)

const block = reactive({
  name: 'Ca sáng',
  time_table: []
})

// Tạo hoặc cập nhật time_table
function updateTimeTable() {
  const newTable = []

  for (let t = 0; t < soTiet.value; t++) {
    const row = []
    for (let n = 0; n < soNgay.value; n++) {
      const oldValue = block.time_table?.[t]?.[n]
      row.push(oldValue !== undefined ? oldValue : true)
    }
    newTable.push(row)
  }
  block.time_table = newTable
  key.value++
}

// Lần đầu render
updateTimeTable()
</script>
