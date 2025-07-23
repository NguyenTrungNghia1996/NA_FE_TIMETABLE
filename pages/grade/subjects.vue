<template>
  <div class="p-2 md:p-4 bg-white min-h-full space-y-4">
    <h1 class="text-xl font-bold text-blue-700 uppercase">DANH SÁCH MÔN HỌC CỦA KHỐI</h1>
    <a-form layout="inline" class="flex flex-wrap gap-2">
      <SelectGradeLevel v-model="filters.grade" :rules="[{ required: true, message: 'Bắt buộc' }]" />
      <SelectExpertise v-model="filters.major" label="Ban học" :rules="[{ required: true, message: 'Bắt buộc' }]" />
      <SelectSchoolShift v-model="filters.shift" :rules="[{ required: true, message: 'Bắt buộc' }]" />
    </a-form>

    <div class="flex gap-6">
      <div>Tổng cộng: <span class="font-semibold">{{ summary.total }}</span> tiết/tuần</div>
      <div>Ca sáng: <span class="font-semibold">{{ summary.morning }}</span> tiết/tuần</div>
      <div>Ca chiều: <span class="font-semibold">{{ summary.afternoon }}</span> tiết/tuần</div>
    </div>

    <ClientOnly>
      <a-table :columns="columns" :data-source="subjects" bordered size="small" :pagination="false" :scroll="{ x: 'max-content' }">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">{{ index + 1 }}</template>
          <template v-if="column.key === 'morning'">
            <div v-if="record.selected" class="flex items-center space-x-2">
              <a-input-number v-model:value="record.morning.period" :min="0" />
              <a-input-number v-model:value="record.morning.group" :min="0" />
            </div>
            <template v-else>{{ record.morning.period }} / {{ record.morning.group }}</template>
          </template>
          <template v-if="column.key === 'afternoon'">
            <div v-if="record.selected" class="flex items-center space-x-2">
              <a-input-number v-model:value="record.afternoon.period" :min="0" />
              <a-input-number v-model:value="record.afternoon.group" :min="0" />
            </div>
            <template v-else>{{ record.afternoon.period }} / {{ record.afternoon.group }}</template>
          </template>
          <template v-if="column.key === 'choose'">
            <a-switch v-model:checked="record.selected" />
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <div class="flex justify-end gap-2 mt-4">
      <a-button type="primary" class="bg-green-600 border-green-600 hover:border-green-600 hover:bg-green-600/80" @click="handleAvoid">Tiết tránh xếp</a-button>
      <a-button type="primary" @click="handleUpdate">Cập nhật</a-button>
    </div>
  </div>
</template>

<script setup>
const filters = reactive({
  grade: undefined,
  major: undefined,
  shift: undefined
})

const summary = reactive({ total: 0, morning: 0, afternoon: 0 })

const subjects = ref([
  {
    id: 1,
    name: 'Toán',
    weekly: 4,
    morning: { period: 2, group: 1 },
    afternoon: { period: 2, group: 1 },
    selected: true
  }
])

const columns = [
  { title: 'STT', key: 'stt', width: 60, align: 'center' },
  { title: 'Tên môn học', dataIndex: 'name', key: 'name' },
  { title: 'Số tiết/tuần', dataIndex: 'weekly', key: 'weekly', align: 'center' },
  { title: 'Ca sáng', key: 'morning', align: 'center' },
  { title: 'Ca chiều', key: 'afternoon', align: 'center' },
  { title: 'Chọn', key: 'choose', align: 'center' }
]

const handleAvoid = () => {
  // TODO: implement
}

const handleUpdate = () => {
  // TODO: implement
}
</script>

<style scoped>
</style>
