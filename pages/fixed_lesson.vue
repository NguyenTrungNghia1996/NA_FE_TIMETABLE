<template>
  <div class="p-2 md:p-4 bg-white min-h-full grid grid-cols-3 md:grid-cols-4 gap-4">
    <a-card title="Thông tin tiết học cố định">
      <a-form layout="vertical">
        <a-form-item label="Môn học" required>
          <a-select v-model:value="form.subject" :options="subjectOptions" placeholder="Chọn môn học" />
        </a-form-item>
        <a-form-item label="Ngày học" required>
          <a-select v-model:value="form.day" :options="dayOptions" placeholder="Chọn ngày học" />
        </a-form-item>
        <a-form-item label="Ca học" required>
          <a-select v-model:value="form.shift" :options="shiftOptions" placeholder="Chọn ca học" />
        </a-form-item>
        <a-form-item label="Tiết học" required>
          <a-select v-model:value="form.period" :options="periodOptions" placeholder="Chọn tiết" />
        </a-form-item>
        <a-form-item label="Khối lớp" required>
          <a-select v-model:value="form.grade" :options="gradeOptions" placeholder="Chọn khối lớp" />
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="form.applyAll">Áp dụng cho tất cả các khối</a-checkbox>
        </a-form-item>
        <div class="flex gap-2 mt-4">
          <a-button type="primary" @click="save">Lưu</a-button>
          <a-button danger @click="reset">Hủy</a-button>
        </div>
      </a-form>
    </a-card>
    <a-card class="col-span-3" title="Danh sách tiết học cố định">
      <a-table :columns="columns" :data-source="paginatedData" :pagination="false" bordered size="small">
        <template #bodyCell="{ column, index }">
          <template v-if="column.key === 'stt'">
            {{ index + 1 }}
          </template>
          <template v-if="column.key === 'action'">
            <div class="flex justify-center space-x-2">
              <a-button type="link" size="small">
                <template #icon>
                  <EditOutlined />
                </template>
              </a-button>
              <a-button type="link" danger size="small">
                <template #icon>
                  <DeleteOutlined />
                </template>
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
      <div class="flex justify-center mt-4">
        <a-pagination :total="data.length" :page-size="5" v-model:current="page" />
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'

const form = reactive({
  subject: undefined,
  day: undefined,
  shift: undefined,
  period: undefined,
  grade: undefined,
  applyAll: false
})

const subjectOptions = [
  { label: 'Toán', value: 'Toán' },
  { label: 'Văn', value: 'Văn' },
  { label: 'Tiếng Anh', value: 'Tiếng Anh' }
]

const dayOptions = [
  { label: 'Thứ 2', value: 'Thứ 2' },
  { label: 'Thứ 3', value: 'Thứ 3' },
  { label: 'Thứ 4', value: 'Thứ 4' },
  { label: 'Thứ 5', value: 'Thứ 5' },
  { label: 'Thứ 6', value: 'Thứ 6' },
  { label: 'Thứ 7', value: 'Thứ 7' }
]

const shiftOptions = [
  { label: 'Ca sáng', value: 'Ca sáng' },
  { label: 'Ca chiều', value: 'Ca chiều' }
]

const periodOptions = [
  { label: 'Tiết 1', value: 1 },
  { label: 'Tiết 2', value: 2 },
  { label: 'Tiết 3', value: 3 },
  { label: 'Tiết 4', value: 4 },
  { label: 'Tiết 5', value: 5 }
]

const gradeOptions = [
  { label: 'Khối 7', value: 'Khối 7' },
  { label: 'Khối 8', value: 'Khối 8' },
  { label: 'Khối 9', value: 'Khối 9' }
]

const data = ref([
  { subject: 'Toán', grade: 'Khối 7', shift: 'Ca sáng', day: 'Thứ 2', period: 1 },
  { subject: 'Văn', grade: 'Khối 8', shift: 'Ca chiều', day: 'Thứ 3', period: 2 }
])

const page = ref(1)

const paginatedData = computed(() => data.value.slice((page.value - 1) * 5, page.value * 5))

const columns = [
  { title: 'STT', key: 'stt', width: 60, align: 'center' },
  { title: 'Môn học', dataIndex: 'subject', key: 'subject' },
  { title: 'Khối', dataIndex: 'grade', key: 'grade', align: 'center' },
  { title: 'Ca học', dataIndex: 'shift', key: 'shift', align: 'center' },
  { title: 'Ngày học', dataIndex: 'day', key: 'day', align: 'center' },
  { title: 'Tiết', dataIndex: 'period', key: 'period', align: 'center' },
  { title: 'Thao tác', key: 'action', width: 90, align: 'center' }
]

function save() {
  if (form.subject && form.day && form.shift && form.period && (form.grade || form.applyAll)) {
    data.value.push({
      subject: form.subject,
      day: form.day,
      shift: form.shift,
      period: form.period,
      grade: form.applyAll ? 'Tất cả' : form.grade
    })
    reset()
  }
}

function reset() {
  Object.assign(form, {
    subject: undefined,
    day: undefined,
    shift: undefined,
    period: undefined,
    grade: undefined,
    applyAll: false
  })
}
</script>
