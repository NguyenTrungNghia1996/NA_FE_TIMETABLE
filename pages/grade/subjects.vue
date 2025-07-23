<template>
  <div class="p-2 md:p-4 bg-white min-h-full space-y-4">
    <h1 class="text-xl font-bold text-blue-700 uppercase">DANH SÁCH MÔN HỌC CỦA KHỐI</h1>
    <a-form
      :model="filters"
      layout="vertical"
      class="grid grid-cols-3 gap-2"
    >
      <SelectGradeLevel
        v-model="filters.grade"
        :rules="[{ required: true, message: 'Bắt buộc' }]"
        class="w-full"
      />
      <SelectExpertise
        v-model="filters.major"
        label="Ban học"
        :rules="[{ required: true, message: 'Bắt buộc' }]"
        class="w-full"
      />
      <SelectSchoolShift
        v-model="filters.shift"
        :rules="[{ required: true, message: 'Bắt buộc' }]"
        class="w-full"
      />
    </a-form>

    <div class="flex gap-2 mt-4">
      <a-button
        type="primary"
        class="bg-green-600 border-green-600 hover:border-green-600 hover:bg-green-600/80"
        @click="handleAvoid"
      >
        Tiết tránh xếp
      </a-button>
      <a-button type="primary" @click="handleUpdate">Cập nhật</a-button>
    </div>

    <ClientOnly>
      <a-table
        row-key="index"
        :columns="summaryColumns"
        :data-source="summaryData"
        bordered
        size="small"
        :pagination="false"
        title="TỔNG SỐ TIẾT HỌC"
        class="mb-4"
      />

      <a-table
        row-key="id"
        :columns="columns"
        :data-source="subjects"
        bordered
        size="small"
        :pagination="false"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">{{ index + 1 }}</template>

          <template v-if="column.key === 'morningPeriod'">
            <a-input-number
              v-if="record.selected"
              v-model:value="record.morning.period"
              :min="0"
            />
            <template v-else>{{ record.morning.period }}</template>
          </template>

          <template v-if="column.key === 'morningGroup'">
            <a-input-number
              v-if="record.selected"
              v-model:value="record.morning.group"
              :min="0"
            />
            <template v-else>{{ record.morning.group }}</template>
          </template>

          <template v-if="column.key === 'afternoonPeriod'">
            <a-input-number
              v-if="record.selected"
              v-model:value="record.afternoon.period"
              :min="0"
            />
            <template v-else>{{ record.afternoon.period }}</template>
          </template>

          <template v-if="column.key === 'afternoonGroup'">
            <a-input-number
              v-if="record.selected"
              v-model:value="record.afternoon.group"
              :min="0"
            />
            <template v-else>{{ record.afternoon.group }}</template>
          </template>

          <template v-if="column.key === 'choose'">
            <a-switch v-model:checked="record.selected" />
          </template>
        </template>
      </a-table>
    </ClientOnly>

  </div>
</template>

<script setup>
const filters = reactive({
  grade: undefined,
  major: undefined,
  shift: undefined
})

const summary = reactive({ total: 0, morning: 0, afternoon: 0 })
const summaryData = ref([{ total: 29, morning: 18, afternoon: 11 }])

const summaryColumns = [
  { title: 'Tổng số tiết/tuần', dataIndex: 'total', key: 'total', align: 'center' },
  { title: 'Ca sáng', dataIndex: 'morning', key: 'morning', align: 'center' },
  { title: 'Ca chiều', dataIndex: 'afternoon', key: 'afternoon', align: 'center' }
]

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

watch(
  subjects,
  (val) => {
    summary.total = val.reduce((s, r) => s + (r.weekly || 0), 0)
    summary.morning = val.reduce((s, r) => s + (r.morning.period || 0), 0)
    summary.afternoon = val.reduce((s, r) => s + (r.afternoon.period || 0), 0)
    summaryData.value = [
      {
        total: summary.total,
        morning: summary.morning,
        afternoon: summary.afternoon
      }
    ]
  },
  { deep: true, immediate: true }
)

const columns = [
  { title: 'STT', key: 'stt', width: 60, align: 'center' },
  { title: 'Tên môn học', dataIndex: 'name', key: 'name' },
  { title: 'Số tiết/tuần', dataIndex: 'weekly', key: 'weekly', align: 'center' },
  {
    title: 'Ca sáng',
    children: [
      { title: 'Số tiết', key: 'morningPeriod', align: 'center', width: 100 },
      { title: 'Số nhóm', key: 'morningGroup', align: 'center', width: 100 }
    ]
  },
  {
    title: 'Ca chiều',
    children: [
      { title: 'Số tiết', key: 'afternoonPeriod', align: 'center', width: 100 },
      { title: 'Số nhóm', key: 'afternoonGroup', align: 'center', width: 100 }
    ]
  },
  { title: 'Chọn', key: 'choose', align: 'center', width: 80 }
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
