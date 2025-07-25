<template>
  <div class="p-4 bg-white rounded shadow min-h-full">
    <h1 class="text-2xl font-bold mb-6">THIẾT LẬP MÔN HỌC - TỔ HỢP MÔN HỌC</h1>
    <div class="grid grid-cols-3">
      <div class="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 class="text-xl font-semibold mb-4">THIẾT LẬP TỔ HỢP MÔN</h2>
        <a-form layout="vertical">
          <div class="grid gap-6">
            <!-- Khối lớp -->
            <a-form-item label="Khối lớp *" class="mb-0">
              <a-select placeholder="Chọn khối lớp..." class="w-full">
                <a-select-option value="6">Khối 6</a-select-option>
                <a-select-option value="7">Khối 7</a-select-option>
                <a-select-option value="8">Khối 8</a-select-option>
                <a-select-option value="9">Khối 9</a-select-option>
              </a-select>
            </a-form-item>

            <!-- Ban học -->
            <a-form-item label="Ban học *" class="mb-0">
              <a-select placeholder="- Chọn ban học" class="w-full">
                <a-select-option value="tunhien">Ban tự nhiên</a-select-option>
                <a-select-option value="xahoi">Ban xã hội</a-select-option>
              </a-select>
            </a-form-item>

            <!-- Tên tổ hợp -->
            <a-form-item label="Tên tổ hợp *" class="mb-0">
              <a-input placeholder="Nhập tên tổ hợp môn" class="w-full" />
            </a-form-item>

            <!-- Các môn học -->
            <a-form-item label="Môn 1 *" class="mb-0">
              <a-select placeholder="- Chọn môn học" class="w-full">
                <a-select-option value="van">Văn</a-select-option>
                <a-select-option value="toan">Toán</a-select-option>
                <a-select-option value="ly">Lý</a-select-option>
                <a-select-option value="anh">Anh</a-select-option>
                <a-select-option value="hoa">Hóa</a-select-option>
                <a-select-option value="sinh">Sinh</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="Môn 2 *" class="mb-0">
              <a-select placeholder="- Chọn môn học" class="w-full">
                <a-select-option value="van">Văn</a-select-option>
                <a-select-option value="toan">Toán</a-select-option>
                <a-select-option value="ly">Lý</a-select-option>
                <a-select-option value="anh">Anh</a-select-option>
                <a-select-option value="hoa">Hóa</a-select-option>
                <a-select-option value="sinh">Sinh</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="Môn 3 *" class="mb-0">
              <a-select placeholder="- Chọn môn học" class="w-full">
                <a-select-option value="van">Văn</a-select-option>
                <a-select-option value="toan">Toán</a-select-option>
                <a-select-option value="ly">Lý</a-select-option>
                <a-select-option value="anh">Anh</a-select-option>
                <a-select-option value="hoa">Hóa</a-select-option>
                <a-select-option value="sinh">Sinh</a-select-option>
              </a-select>
            </a-form-item>

            <!-- Số tiết tối đa -->
            <a-form-item label="Số tiết tối đa 1 ca học *" class="mb-0">
              <a-input-number placeholder="Nhập số tiết tối đa" class="w-full" :min="1" :max="8" />
            </a-form-item>

            <a-form-item label="Số tiết tối đa 2 ca học *" class="mb-0">
              <a-input-number placeholder="Nhập số tiết tối đa" class="w-full" :min="1" :max="8" />
            </a-form-item>
          </div>

          <div class="mt-6 flex justify-end">
            <a-button type="primary" class="mr-2">Lưu</a-button>
            <a-button>Hủy</a-button>
          </div>
        </a-form>
      </div>
      <div class="bg-red-500 p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">DANH SÁCH TỔ HỢP MÔN</h2>
        <a-table :columns="columns" :data-source="data" bordered>
          <template #bodyCell="{ column }">
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="primary" size="small">
                  <template #icon>
                    <EditOutlined />
                  </template>
                </a-button>
                <a-button type="danger" size="small">
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                </a-button>
              </a-space>
            </template>
            <template v-else-if="column.key === 'status'">
              <check-circle-outlined style="color: #52c41a" />
            </template>
          </template>
        </a-table>
      </div>
    </div>

  </div>
</template>

<script setup>
const columns = [
  {
    title: 'STT',
    dataIndex: 'stt',
    key: 'stt',
    align: 'center',
  },
  {
    title: 'Khối lớp',
    dataIndex: 'grade',
    key: 'grade',
    align: 'center',
  },
  {
    title: 'Ban học',
    dataIndex: 'program',
    key: 'program',
    align: 'center',
  },
  {
    title: 'Tên tổ hợp môn',
    dataIndex: 'combination',
    key: 'combination',
    align: 'center',
  },
  {
    title: 'Môn 1',
    dataIndex: 'subject1',
    key: 'subject1',
    align: 'center',
  },
  {
    title: 'Môn 2',
    dataIndex: 'subject2',
    key: 'subject2',
    align: 'center',
  },
  {
    title: 'Môn 3',
    dataIndex: 'subject3',
    key: 'subject3',
    align: 'center',
  },
  {
    title: 'Số tiết tối đa 1 ca học',
    dataIndex: 'maxSession1',
    key: 'maxSession1',
    align: 'center',
  },
  {
    title: 'Số tiết tối đa 2 ca học',
    dataIndex: 'maxSession2',
    key: 'maxSession2',
    align: 'center',
  },
  {
    title: 'Thao tác',
    key: 'action',
    align: 'center',
  },
];

const data = [
  {
    stt: 1,
    grade: 'Khối 6',
    program: 'Ban tự nhiên',
    combination: 'Văn - Toán - Lý',
    subject1: 'Văn',
    subject2: 'Toán',
    subject3: 'Lý',
    maxSession1: 4,
    maxSession2: 4,
  },
  {
    stt: 2,
    grade: 'Khối 6',
    program: 'Ban xã hội',
    combination: 'Anh - Hóa - Sinh',
    subject1: 'Anh',
    subject2: 'Hóa',
    subject3: 'Sinh',
    maxSession1: 4,
    maxSession2: 4,
  },
  {
    stt: 3,
    grade: 'Khối 7',
    program: 'Ban tự nhiên',
    combination: 'Văn - Toán - Lý',
    subject1: 'Văn',
    subject2: 'Toán',
    subject3: 'Lý',
    maxSession1: 4,
    maxSession2: 4,
  },
  {
    stt: 4,
    grade: 'Khối 8',
    program: 'Ban tự nhiên',
    combination: 'Văn - Toán - Lý',
    subject1: 'Văn',
    subject2: 'Toán',
    subject3: 'Lý',
    maxSession1: 4,
    maxSession2: 4,
  },
  {
    stt: 5,
    grade: 'Khối 9',
    program: 'Ban tự nhiên',
    combination: 'Văn - Toán - Lý',
    subject1: 'Văn',
    subject2: 'Toán',
    subject3: 'Lý',
    maxSession1: 4,
    maxSession2: 4,
  },
];
</script>

<style scoped>
/* Bạn có thể thêm các tùy chỉnh CSS tại đây nếu cần */
</style>