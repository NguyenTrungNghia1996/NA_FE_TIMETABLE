<template>
  <div class="p-4" style="font-family: Arial, sans-serif;">
    <div class="flex flex-col lg:flex-row lg:space-x-5">
      <div class="w-full lg:w-1/3">
        <a-form layout="vertical">
          <a-form-item label="Khối lớp" class="mb-3">
            <a-select class="w-full h-8" :options="gradeOptions" />
          </a-form-item>
          <a-form-item label="Ban học" class="mb-3">
            <a-select class="w-full h-8" :options="banOptions" />
          </a-form-item>
          <a-form-item label="Tên tổ hợp" class="mb-3">
            <a-input class="w-full h-8" />
          </a-form-item>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a-form-item label="Môn 1">
              <a-select class="w-full h-8" :options="subjectOptions" />
            </a-form-item>
            <a-form-item label="Môn 2">
              <a-select class="w-full h-8" :options="subjectOptions" />
            </a-form-item>
            <a-form-item label="Môn 3">
              <a-select class="w-full h-8" :options="subjectOptions" />
            </a-form-item>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <a-form-item label="Số tiết 1 ca">
              <a-input-number class="w-full h-8" :min="0" />
            </a-form-item>
            <a-form-item label="Số tiết 2 ca">
              <a-input-number class="w-full h-8" :min="0" />
            </a-form-item>
          </div>
          <div class="flex flex-wrap gap-2 mt-4">
            <a-button type="primary" class="bg-green-500 border-green-500 hover:bg-green-600">Lưu</a-button>
            <a-button danger>Hủy</a-button>
          </div>
        </a-form>
      </div>
      <div class="w-full lg:w-2/3 mt-4 lg:mt-0">
        <a-table :columns="columns" :data-source="data" bordered size="small" :pagination="pagination" :scroll="{ x: 'max-content' }">
          <template #bodyCell="{ column, record, index }">
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
import { ref } from 'vue'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'

const gradeOptions = [
  { label: 'Khối 10', value: 10 },
  { label: 'Khối 11', value: 11 },
  { label: 'Khối 12', value: 12 }
]

const banOptions = [
  { label: 'Ban A', value: 'A' },
  { label: 'Ban B', value: 'B' },
  { label: 'Ban C', value: 'C' }
]

const subjectOptions = [
  { label: 'Toán', value: 'toan' },
  { label: 'Lý', value: 'ly' },
  { label: 'Hóa', value: 'hoa' },
  { label: 'Anh', value: 'anh' }
]

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
