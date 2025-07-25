<template>
  <div class="p-4">
    <div class="grid grid-cols-3 gap-4">
      <div class="w-full">
        <a-form layout="vertical" :model="form" :rules="rules">
          <SelectGradeLevel v-model="form.grade" class="mb-3" name="grade" label="Khối lớp" />
          <SelectSchoolship v-model="form.major" class="mb-3" name="major" label="Ban học" />
          <a-form-item label="Tên tổ hợp" name="name" class="mb-3" :rules="rules.name">
            <a-input v-model:value="form.name" class="w-full h-8" />
          </a-form-item>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SelectSubject v-model="form.subject1" label="Môn 1" name="subject1" />
            <SelectSubject v-model="form.subject2" label="Môn 2" name="subject2" />
            <SelectSubject v-model="form.subject3" label="Môn 3" name="subject3" />
          </div>
          <div class="grid grid-cols-2">
            <a-form-item label="Số tiết tối đa một ca học" name="maxPeriod" :rules="rules.maxPeriod">
              <a-input-number v-model:value="form.maxPeriod" class="w-full h-8" :min="0" />
            </a-form-item>
            <a-form-item label="Số tiết 2 ca">
              <a-input-number v-model:value="form.period2" class="w-full h-8" :min="0" />
            </a-form-item>
          </div>
          <div class="flex flex-wrap gap-2 mt-4">
            <a-button type="primary" class="bg-green-500 border-green-500 hover:bg-green-600">Lưu</a-button>
            <a-button danger>Hủy</a-button>
          </div>
        </a-form>
      </div>
      <div class="w-full col-span-2">
        <a-table :columns="columns" :data-source="data" bordered size="small" :pagination="pagination" :scroll="{ x: 'max-content' }" class="w-full">
          <template #bodyCell="{ column, index }">
            <template v-if="column.key === 'stt'">
              {{ index + 1 }}
            </template>
            <template v-else-if="column.key === 'action'">
              <div class="flex justify-center space-x-2">
                <a-button type="link" size="small">
                  <template #icon><EditOutlined /></template>
                </a-button>
                <a-button type="link" danger size="small">
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup>
const form = reactive({
  grade: undefined,
  major: undefined,
  name: '',
  subject1: undefined,
  subject2: undefined,
  subject3: undefined,
  maxPeriod: undefined,
  period2: undefined,
})

const rules = {
  name: [{ required: true, message: 'Vui lòng nhập tên tổ hợp' }],
  maxPeriod: [{ required: true, message: 'Vui lòng nhập số tiết tối đa' }],
}

const columns = [
  { title: 'STT', key: 'stt', width: 60, align: 'center' },
  { title: 'Khối lớp', dataIndex: 'khoi', key: 'khoi', align: 'center' },
  { title: 'Ban học', dataIndex: 'ban', key: 'ban', align: 'center' },
  { title: 'Tên tổ hợp', dataIndex: 'ten', key: 'ten' },
  { title: 'Môn 1', dataIndex: 'mon1', key: 'mon1' },
  { title: 'Môn 2', dataIndex: 'mon2', key: 'mon2' },
  { title: 'Môn 3', dataIndex: 'mon3', key: 'mon3' },
  { title: 'Số tiết 1 ca', dataIndex: 'soTiet1', key: 'soTiet1', align: 'center' },
  { title: 'Số tiết 2 ca', dataIndex: 'soTiet2', key: 'soTiet2', align: 'center' },
  { title: 'Thao tác', key: 'action', width: 100, align: 'center' }
]

const data = ref([
  { khoi: '10', ban: 'A', ten: 'Tổ hợp A', mon1: 'Toán', mon2: 'Lý', mon3: 'Hóa', soTiet1: 3, soTiet2: 4 },
  { khoi: '11', ban: 'B', ten: 'Tổ hợp B', mon1: 'Toán', mon2: 'Hóa', mon3: 'Anh', soTiet1: 2, soTiet2: 3 }
])

const pagination = { position: ['bottomCenter'], pageSize: 5 }
</script>

<style scoped></style>
