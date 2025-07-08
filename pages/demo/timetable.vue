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
      <h2 class="text-xl font-bold mb-2">📦 Dữ liệu hiện tại</h2>
      <pre class="bg-gray-100 p-4 text-xs overflow-auto">{{ timetablesJson }}</pre>
    </div>
  </div>
</template>

<script setup>


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

// dữ liệu thời khóa biểu lưu dưới dạng chuỗi JSON
const timetablesJson = ref(
  JSON.stringify({
    '6A': { morning: emptySession('6A'), afternoon: emptySession('6A') }
  }, null, 2)
)

// đối tượng reactive để thao tác trong giao diện
const timetables = reactive(JSON.parse(timetablesJson.value))

watch(
  timetables,
  val => {
    timetablesJson.value = JSON.stringify(val, null, 2)
  },
  { deep: true }
)

const baseTimetable6A = {
  morning: [
    [
      { subject: 'Anh', teacher: 'GV1', class: '6A', isBreak: false },
      { subject: 'Toán', teacher: 'GV2', class: '6A', isBreak: false },
      { subject: 'Văn', teacher: 'GV3', class: '6A', isBreak: false },
      { subject: 'Lý', teacher: 'GV4', class: '6A', isBreak: false },
      { subject: '', teacher: '', class: '6A', isBreak: false }
    ],
    [
      { subject: 'Hóa', teacher: 'GV5', class: '6A', isBreak: false },
      { subject: 'Toán', teacher: 'GV2', class: '6A', isBreak: false },
      { subject: '', teacher: '', class: '6A', isBreak: true },
      { subject: 'Anh', teacher: 'GV1', class: '6A', isBreak: false },
      { subject: 'Văn', teacher: 'GV3', class: '6A', isBreak: false }
    ],
    [
      { subject: 'Văn', teacher: 'GV3', class: '6A', isBreak: false },
      { subject: '', teacher: '', class: '6A', isBreak: false },
      { subject: 'Toán', teacher: 'GV2', class: '6A', isBreak: false },
      { subject: 'Lý', teacher: 'GV4', class: '6A', isBreak: false },
      { subject: '', teacher: '', class: '6A', isBreak: false }
    ],
    [
      { subject: 'Anh', teacher: 'GV1', class: '6A', isBreak: false },
      { subject: 'Lý', teacher: 'GV4', class: '6A', isBreak: false },
      { subject: 'Văn', teacher: 'GV3', class: '6A', isBreak: false },
      { subject: '', teacher: '', class: '6A', isBreak: false },
      { subject: 'Toán', teacher: 'GV2', class: '6A', isBreak: false }
    ],
    [
      { subject: '', teacher: '', class: '6A', isBreak: true },
      { subject: 'Toán', teacher: 'GV2', class: '6A', isBreak: false },
      { subject: 'Hóa', teacher: 'GV5', class: '6A', isBreak: false },
      { subject: 'Anh', teacher: 'GV1', class: '6A', isBreak: false },
      { subject: 'Lý', teacher: 'GV4', class: '6A', isBreak: false }
    ]
  ],
  afternoon: [
    [
      { subject: '', teacher: '', class: '6A', isBreak: true },
      { subject: 'Anh', teacher: 'GV1', class: '6A', isBreak: false },
      { subject: 'Toán', teacher: 'GV2', class: '6A', isBreak: false },
      { subject: 'Văn', teacher: 'GV3', class: '6A', isBreak: false },
      { subject: '', teacher: '', class: '6A', isBreak: false }
    ],
    [
      { subject: 'Toán', teacher: 'GV2', class: '6A', isBreak: false },
      { subject: '', teacher: '', class: '6A', isBreak: true },
      { subject: 'Hóa', teacher: 'GV5', class: '6A', isBreak: false },
      { subject: '', teacher: '', class: '6A', isBreak: false },
      { subject: 'Anh', teacher: 'GV1', class: '6A', isBreak: false }
    ],
    [
      { subject: 'Văn', teacher: 'GV3', class: '6A', isBreak: false },
      { subject: 'Lý', teacher: 'GV4', class: '6A', isBreak: false },
      { subject: '', teacher: '', class: '6A', isBreak: true },
      { subject: 'Toán', teacher: 'GV2', class: '6A', isBreak: false },
      { subject: 'Hóa', teacher: 'GV5', class: '6A', isBreak: false }
    ],
    [
      { subject: '', teacher: '', class: '6A', isBreak: false },
      { subject: 'Lý', teacher: 'GV4', class: '6A', isBreak: false },
      { subject: 'Anh', teacher: 'GV1', class: '6A', isBreak: false },
      { subject: 'Văn', teacher: 'GV3', class: '6A', isBreak: false },
      { subject: 'Lý', teacher: 'GV4', class: '6A', isBreak: false }
    ],
    [
      { subject: 'Hóa', teacher: 'GV5', class: '6A', isBreak: false },
      { subject: 'Văn', teacher: 'GV3', class: '6A', isBreak: false },
      { subject: 'Toán', teacher: 'GV2', class: '6A', isBreak: false },
      { subject: 'Lý', teacher: 'GV4', class: '6A', isBreak: false },
      { subject: '', teacher: '', class: '6A', isBreak: false }
    ]
  ]
}

timetables['6A'] = JSON.parse(JSON.stringify(baseTimetable6A))
timetablesJson.value = JSON.stringify(timetables, null, 2)
</script>

<style scoped>
</style>
