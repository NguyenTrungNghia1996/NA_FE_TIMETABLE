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
        <li>Mỗi ô đều có thuộc tính <code>locked</code>; khi đặt <code>true</code> sẽ không thể kéo thả nhưng màu sắc vẫn như bình thường.</li>
      </ul>
    </div>


    <div class="mt-6">
      <h2 class="text-xl font-bold mb-2">📦 Dữ liệu hiện tại</h2>
      <pre class="bg-gray-100 p-4 text-xs overflow-auto">{{ timetableJson }}</pre>
    </div>
  </div>
</template>

<script setup>


const baseTimetable = [
  {
    key: 'morning',
    label: 'Ca sáng',
    data: [
      [
        { subject: 'Anh', teacher: 'PT Thoản', isBreak: false, locked: false },
        { subject: 'Toán', teacher: 'Thầy An', isBreak: false, locked: true },
        { subject: 'Văn', teacher: 'Cô Bình', isBreak: false, locked: false },
        { subject: 'Lý', teacher: 'Thầy Cường', isBreak: false, locked: false },
        { subject: '', teacher: '', isBreak: false, locked: false }
      ],
      [
        { subject: 'Hóa', teacher: 'Cô Dung', isBreak: false, locked: false },
        { subject: 'Toán', teacher: 'Thầy An', isBreak: false, locked: true },
        { subject: '', teacher: '', isBreak: true, locked: false },
        { subject: 'Anh', teacher: 'PT Thoản', isBreak: false, locked: false },
        { subject: 'Văn', teacher: 'Cô Bình', isBreak: false, locked: false }
      ],
      [
        { subject: 'Văn', teacher: 'Cô Bình', isBreak: false, locked: false },
        { subject: '', teacher: '', isBreak: false, locked: false },
        { subject: 'Toán', teacher: 'Thầy An', isBreak: false, locked: true },
        { subject: 'Lý', teacher: 'Thầy Cường', isBreak: false, locked: false },
        { subject: '', teacher: '', isBreak: false, locked: false }
      ],
      [
        { subject: 'Anh', teacher: 'PT Thoản', isBreak: false, locked: false },
        { subject: 'Lý', teacher: 'Thầy Cường', isBreak: false, locked: false },
        { subject: 'Văn', teacher: 'Cô Bình', isBreak: false, locked: false },
        { subject: '', teacher: '', isBreak: false, locked: false },
        { subject: 'Toán', teacher: 'Thầy An', isBreak: false, locked: true }
      ],
      [
        { subject: '', teacher: '', isBreak: true, locked: false },
        { subject: 'Toán', teacher: 'Thầy An', isBreak: false, locked: true },
        { subject: 'Hóa', teacher: 'Cô Dung', isBreak: false, locked: false },
        { subject: 'Anh', teacher: 'PT Thoản', isBreak: false, locked: false },
        { subject: 'Lý', teacher: 'Thầy Cường', isBreak: false, locked: false }
      ]
    ]
  },
  {
    key: 'afternoon',
    label: 'Ca chiều',
    data: [
      [
        { subject: '', teacher: '', isBreak: true, locked: false },
        { subject: 'Anh', teacher: 'PT Thoản', isBreak: false, locked: false },
        { subject: 'Toán', teacher: 'Thầy An', isBreak: false, locked: true },
        { subject: 'Văn', teacher: 'Cô Bình', isBreak: false, locked: false },
        { subject: '', teacher: '', isBreak: false, locked: false }
      ],
      [
        { subject: 'Toán', teacher: 'Thầy An', isBreak: false, locked: true },
        { subject: '', teacher: '', isBreak: true, locked: false },
        { subject: 'Hóa', teacher: 'Cô Dung', isBreak: false, locked: false },
        { subject: '', teacher: '', isBreak: false, locked: false },
        { subject: 'Anh', teacher: 'PT Thoản', isBreak: false, locked: false }
      ],
      [
        { subject: 'Văn', teacher: 'Cô Bình', isBreak: false, locked: false },
        { subject: 'Lý', teacher: 'Thầy Cường', isBreak: false, locked: false },
        { subject: '', teacher: '', isBreak: true, locked: false },
        { subject: 'Toán', teacher: 'Thầy An', isBreak: false, locked: true },
        { subject: 'Hóa', teacher: 'Cô Dung', isBreak: false, locked: false }
      ],
      [
        { subject: '', teacher: '', isBreak: false, locked: false },
        { subject: 'Lý', teacher: 'Thầy Cường', isBreak: false, locked: false },
        { subject: 'Anh', teacher: 'PT Thoản', isBreak: false, locked: false },
        { subject: 'Văn', teacher: 'Cô Bình', isBreak: false, locked: false },
        { subject: 'Lý', teacher: 'Thầy Cường', isBreak: false, locked: false }
      ],
      [
        { subject: 'Hóa', teacher: 'Cô Dung', isBreak: false, locked: false },
        { subject: 'Văn', teacher: 'Cô Bình', isBreak: false, locked: false },
        { subject: 'Toán', teacher: 'Thầy An', isBreak: false, locked: true },
        { subject: 'Lý', teacher: 'Thầy Cường', isBreak: false, locked: false },
        { subject: '', teacher: '', isBreak: false, locked: false }
      ]
    ]
  }
]

const timetable = reactive(JSON.parse(JSON.stringify(baseTimetable)))

const timetableJson = computed(() => JSON.stringify(timetable, null, 2))
</script>

<style scoped>
</style>
