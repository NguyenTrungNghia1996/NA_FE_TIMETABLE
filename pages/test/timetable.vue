<template>
  <div class="max-w-6xl mx-auto p-6 space-y-4">
    <h1 class="text-2xl font-bold mb-2">Demo xếp thời khóa biểu liên kết</h1>
    <div class="grid gap-6 md:grid-cols-1">
      <ClassTimetable :timetable="timetable" />
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

const baseTimetable = {
  ds_Ca: [
    {
      id: 1,
      ds_Ngay: [
        {
          id: 1,
          ten: 'Thứ 2',
          ds_Tiet: [
            { id: 1, ten: 'Tiết 1', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 2, ten: 'Tiết 2', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 3, ten: 'Tiết 3', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 4, ten: 'Tiết 4', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 5, ten: 'Tiết 5', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false }
          ]
        },
        {
          id: 2,
          ten: 'Thứ 3',
          ds_Tiet: [
            { id: 1, ten: 'Tiết 1', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 2, ten: 'Tiết 2', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 3, ten: 'Tiết 3', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 4, ten: 'Tiết 4', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 5, ten: 'Tiết 5', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false }
          ]
        },
        {
          id: 3,
          ten: 'Thứ 4',
          ds_Tiet: [
            { id: 1, ten: 'Tiết 1', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: true },
            { id: 2, ten: 'Tiết 2', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: true },
            { id: 3, ten: 'Tiết 3', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: true },
            { id: 4, ten: 'Tiết 4', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: true },
            { id: 5, ten: 'Tiết 5', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: true }
          ]
        },
        {
          id: 4,
          ten: 'Thứ 5',
          ds_Tiet: [
            { id: 1, ten: 'Tiết 1', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: true },
            { id: 2, ten: 'Tiết 2', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: true },
            { id: 3, ten: 'Tiết 3', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: true },
            { id: 4, ten: 'Tiết 4', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: true },
            { id: 5, ten: 'Tiết 5', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: true }
          ]
        },
        {
          id: 5,
          ten: 'Thứ 6',
          ds_Tiet: [
            { id: 1, ten: 'Tiết 1', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: true },
            { id: 2, ten: 'Tiết 2', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: true },
            { id: 3, ten: 'Tiết 3', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: true },
            { id: 4, ten: 'Tiết 4', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: true },
            { id: 5, ten: 'Tiết 5', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: true }
          ]
        },
        {
          id: 6,
          ten: 'Thứ 7',
          ds_Tiet: [
            { id: 1, ten: 'Tiết 1', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 2, ten: 'Tiết 2', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 3, ten: 'Tiết 3', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 4, ten: 'Tiết 4', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 5, ten: 'Tiết 5', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false }
          ]
        },
        {
          id: 7,
          ten: 'Chủ nhật',
          ds_Tiet: [
            { id: 1, ten: 'Tiết 1', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 2, ten: 'Tiết 2', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 3, ten: 'Tiết 3', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 4, ten: 'Tiết 4', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 5, ten: 'Tiết 5', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false }
          ]
        }
      ]
    },
    {
      id: 2,
      ds_Ngay: [
        {
          id: 1,
          ten: 'Thứ 2',
          ds_Tiet: [
            { id: 1, ten: 'Tiết 1', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 2, ten: 'Tiết 2', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 3, ten: 'Tiết 3', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 4, ten: 'Tiết 4', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false },
            { id: 5, ten: 'Tiết 5', subject: 'Anh', teacher: 'PT Thoản', teacherId: 2, isBreak: false }
          ]
        }
      ]
    }
  ]
}

const timetable = reactive(JSON.parse(JSON.stringify(baseTimetable)))

const timetableJson = computed(() => JSON.stringify(timetable, null, 2))
</script>

<style scoped>
</style>
