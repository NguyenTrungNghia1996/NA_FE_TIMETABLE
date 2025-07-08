<template>
  <div class="max-w-6xl mx-auto p-6 space-y-4">
    <h1 class="text-2xl font-bold mb-2">Demo xếp thời khóa biểu liên kết</h1>
    <!-- Bỏ chọn giáo viên -->
    <div class="grid gap-6 md:grid-cols-1">
      <ClassTimetable
        cls="6A"
        :timetable="timetables['6A']"
      />
    </div>


    <div class="mt-10 border-t pt-6">
      <h2 class="text-xl font-bold mb-4">📓 Hướng dẫn sử dụng</h2>
      <ul class="list-disc pl-6 space-y-2">
        <li>Nhấn chuột phải để đặt hoặc bỏ nghỉ.</li>
        <li>Nhấn chuột phải ở ô trống để thêm tiết học (chọn môn, giáo viên tự gán).</li>
        <li>Kéo thả các tiết để hoán đổi vị trí.</li>
        <li>Không thể kéo thả vào tiết nghỉ.</li>
        <li>Không thể đặt nghỉ ở ô đã có tiết học.</li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-xl font-bold mb-2">📚 Danh sách môn học</h2>
      <ul class="list-disc pl-6 space-y-1">
        <li v-for="subject in demoSubjects" :key="subject">{{ subject }}</li>
      </ul>
      <h2 class="text-xl font-bold mt-4 mb-2">👩‍🏫 Danh sách giáo viên</h2>
      <ul class="list-disc pl-6 space-y-1">
        <li v-for="teacher in demoTeachers" :key="teacher">{{ teacher }}</li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-xl font-bold mb-2">📦 Dữ liệu hiện tại</h2>
      <pre class="bg-gray-100 p-4 text-xs overflow-auto">{{
        JSON.stringify(timetables, null, 2)
      }}</pre>
    </div>
  </div>
</template>

<script setup>

const demoSubjects = ['Toán', 'Văn', 'Anh', 'Lý', 'Hóa', 'Sinh', 'Sử', 'Địa']
const demoTeachers = [
  'GV1. PT Thoản',
  'GV2. Thầy An',
  'GV3. Cô Bình',
  'GV4. Thầy Cường',
  'GV5. Cô Dung'
]

// tạo thời khóa biểu trống cho hai ca, mỗi ca 5 tiết
function emptySession(cls) {
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => ({
      subject: '',
      class: cls,
      teacher: '',
      isBreak: false
    }))
  )
}

// thời khóa biểu các lớp tách thành 2 ca (mặc định trống)
const timetables = reactive({
  '6A': { morning: emptySession('6A'), afternoon: emptySession('6A') }
})

function lesson(subject, teacher, cls) {
  return { subject, teacher, class: cls, isBreak: false }
}
function empty(cls) {
  return { subject: '', teacher: '', class: cls, isBreak: false }
}
function brk(cls) {
  return { subject: '', teacher: '', class: cls, isBreak: true }
}

const baseTimetable6A = {
  morning: [
    [
      lesson('Anh', 'GV1', '6A'),
      lesson('Toán', 'GV2', '6A'),
      lesson('Văn', 'GV3', '6A'),
      lesson('Lý', 'GV4', '6A'),
      empty('6A')
    ],
    [
      lesson('Hóa', 'GV5', '6A'),
      lesson('Toán', 'GV2', '6A'),
      brk('6A'),
      lesson('Anh', 'GV1', '6A'),
      lesson('Văn', 'GV3', '6A')
    ],
    [
      lesson('Văn', 'GV3', '6A'),
      empty('6A'),
      lesson('Toán', 'GV2', '6A'),
      lesson('Lý', 'GV4', '6A'),
      empty('6A')
    ],
    [
      lesson('Anh', 'GV1', '6A'),
      lesson('Lý', 'GV4', '6A'),
      lesson('Văn', 'GV3', '6A'),
      empty('6A'),
      lesson('Toán', 'GV2', '6A')
    ],
    [
      brk('6A'),
      lesson('Toán', 'GV2', '6A'),
      lesson('Hóa', 'GV5', '6A'),
      lesson('Anh', 'GV1', '6A'),
      lesson('Lý', 'GV4', '6A')
    ]
  ],
  afternoon: [
    [
      brk('6A'),
      lesson('Anh', 'GV1', '6A'),
      lesson('Toán', 'GV2', '6A'),
      lesson('Văn', 'GV3', '6A'),
      empty('6A')
    ],
    [
      lesson('Toán', 'GV2', '6A'),
      brk('6A'),
      lesson('Hóa', 'GV5', '6A'),
      empty('6A'),
      lesson('Anh', 'GV1', '6A')
    ],
    [
      lesson('Văn', 'GV3', '6A'),
      lesson('Lý', 'GV4', '6A'),
      brk('6A'),
      lesson('Toán', 'GV2', '6A'),
      lesson('Hóa', 'GV5', '6A')
    ],
    [
      empty('6A'),
      lesson('Lý', 'GV4', '6A'),
      lesson('Anh', 'GV1', '6A'),
      lesson('Văn', 'GV3', '6A'),
      lesson('Lý', 'GV4', '6A')
    ],
    [
      lesson('Hóa', 'GV5', '6A'),
      lesson('Văn', 'GV3', '6A'),
      lesson('Toán', 'GV2', '6A'),
      lesson('Lý', 'GV4', '6A'),
      empty('6A')
    ]
  ]
}

timetables['6A'] = JSON.parse(JSON.stringify(baseTimetable6A))
</script>

<style scoped>
</style>
