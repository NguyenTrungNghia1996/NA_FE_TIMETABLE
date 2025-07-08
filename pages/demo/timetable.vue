<template>
  <div class="max-w-6xl mx-auto p-6 space-y-4">
    <h1 class="text-2xl font-bold mb-2">Demo xếp thời khóa biểu liên kết</h1>
    <a-select
      v-model:value="selectedTeacher"
      :options="teacherOptions"
      class="mb-4 w-48"
    />
    <div class="grid gap-6 md:grid-cols-2">
      <ClassTimetable
        cls="6A"
        :timetable="timetables['6A']"
        :days="days"
        :selected-teacher="selectedTeacher"
        :teacher-map="teacherMap"
        :on-drag-start="onDragStart"
        :on-drop="onDrop"
        :open-menu="openMenu"
        :start-highlight="startHighlight"
        :is-selected="isSelected"
        :is-valid-target="isValidTarget"
      />
      <ClassTimetable
        cls="6B"
        :timetable="timetables['6B']"
        :days="days"
        :selected-teacher="selectedTeacher"
        :teacher-map="teacherMap"
        :on-drag-start="onDragStart"
        :on-drop="onDrop"
        :open-menu="openMenu"
        :start-highlight="startHighlight"
        :is-selected="isSelected"
        :is-valid-target="isValidTarget"
      />
    </div>

    <div v-if="contextMenu.show" class="fixed bg-white border rounded shadow z-50" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
      <ul>
        <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="toggleBreak(contextMenu.cls, contextMenu.row, contextMenu.col)">
          {{ getCell(contextMenu.cls, contextMenu.row, contextMenu.col).isBreak ? 'Bỏ nghỉ' : 'Đặt nghỉ' }}
        </li>
        <li
          v-if="!getCell(contextMenu.cls, contextMenu.row, contextMenu.col).subject && !getCell(contextMenu.cls, contextMenu.row, contextMenu.col).isBreak"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          @click="addLesson(contextMenu.cls, contextMenu.row, contextMenu.col)"
        >
          Thêm tiết học
        </li>
      </ul>
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

const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu']
const demoSubjects = [
  'Toán',
  'Văn',
  'Anh',
  'Lý',
  'Hóa',
  'Sinh',
  'Sử',
  'Địa'
]
// môn học đi kèm giáo viên
const subjectTeacherMap = {
  Toán: 'GV2',
  Văn: 'GV3',
  Anh: 'GV1',
  Lý: 'GV4',
  Hóa: 'GV5',
  Sinh: 'GV3',
  Sử: 'GV5',
  Địa: 'GV4'
}

const teachers = [
  { id: 'GV1', name: 'PT Thoản' },
  { id: 'GV2', name: 'Thầy An' },
  { id: 'GV3', name: 'Cô Bình' },
  { id: 'GV4', name: 'Thầy Cường' },
  { id: 'GV5', name: 'Cô Dung' }
]
const teacherMap = Object.fromEntries(teachers.map(t => [t.id, t.name]))
const demoTeachers = teachers.map(t => `${t.id}. ${t.name}`)
const mainTeacherId = 'GV1'
const teacherName = teacherMap[mainTeacherId]

// lịch cơ bản của giáo viên (không bao gồm lớp 6A)
const teacherBusyMorning = [
  [
    { class: '', subject: '' },
    { class: '7B', subject: 'AN' },
    { class: '7C', subject: 'AN' },
    { class: '8C', subject: 'AN' },
    { class: '', subject: '' }
  ],
  [
    { class: '', subject: '' },
    { class: '6B', subject: 'AN' },
    { class: '9C', subject: 'AN' },
    { class: '', subject: '' },
    { class: '8A', subject: 'AN' }
  ],
  [
    { class: '9A', subject: 'AN' },
    { class: '', subject: '' },
    { class: '7A', subject: 'AN' },
    { class: '8B', subject: 'AN' },
    { class: '', subject: '' }
  ],
  [
    { class: '', subject: '' },
    { class: '9B', subject: 'AN' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '9A', subject: 'AN' }
  ],
  [
    { class: '6C', subject: 'AN' },
    { class: '', subject: '' },
    { class: '7B', subject: 'AN' },
    { class: '', subject: '' },
    { class: '', subject: '' }
  ],
  [
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '8B', subject: 'AN' },
    { class: '8A', subject: 'AN' },
    { class: '', subject: '' }
  ],
  [
    { class: '7C', subject: 'AN' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '6C', subject: 'AN' },
    { class: '', subject: '' }
  ],
  [
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' }
  ],
  [
    { class: '6B', subject: 'AN' },
    { class: '7A', subject: 'AN' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '7B', subject: 'AN' }
  ],
]

const teacherBusyAfternoon = [
  [
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '8B', subject: 'AN' },
    { class: '8A', subject: 'AN' },
    { class: '', subject: '' }
  ],
  [
    { class: '7C', subject: 'AN' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '6C', subject: 'AN' },
    { class: '', subject: '' }
  ],
  [
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' }
  ],
  [
    { class: '6B', subject: 'AN' },
    { class: '7A', subject: 'AN' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '7B', subject: 'AN' }
  ],
  [
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '8A', subject: 'AN' }
  ]
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
  '6A': { morning: emptySession('6A'), afternoon: emptySession('6A') },
  '6B': { morning: emptySession('6B'), afternoon: emptySession('6B') }
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

function shiftRows(rows, cls) {
  return rows.map(row =>
    row.map((_, i) => {
      const src = row[(i + 1) % row.length]
      return { ...src, class: cls }
    })
  )
}

timetables['6A'] = JSON.parse(JSON.stringify(baseTimetable6A))
timetables['6B'] = {
  morning: shiftRows(baseTimetable6A.morning, '6B'),
  afternoon: shiftRows(baseTimetable6A.afternoon, '6B')
}

const selectedTeacher = ref(teachers[0].id)
const teacherOptions = teachers.map(t => ({ label: `${t.id}. ${t.name}`, value: t.id }))

function getCell(cls, row, col) {
  return row < 5
    ? timetables[cls].morning[row][col]
    : timetables[cls].afternoon[row - 5][col]
}

function setCell(cls, row, col, lesson) {
  if (row < 5) {
    timetables[cls].morning[row][col] = lesson
  } else {
    timetables[cls].afternoon[row - 5][col] = lesson
  }
}


const selected = ref({ cls: '', row: null, col: null })
const dragSource = ref({ cls: '', row: null, col: null })
const contextMenu = ref({ show: false, x: 0, y: 0, cls: '', row: null, col: null })

function teacherFree(teacher, row, col, cls) {
  if (teacher === mainTeacherId) {
    const slot =
      row < 5
        ? teacherBusyMorning[row][col]
        : teacherBusyAfternoon[row - 5][col]
    if (slot.class && slot.class !== cls) return false
  }
  for (const key of Object.keys(timetables)) {
    if (key === cls) continue
    const other =
      row < 5
        ? timetables[key].morning[row][col]
        : timetables[key].afternoon[row - 5][col]
    if (other.teacher === teacher && !other.isBreak) return false
  }
  return true
}

function onDragStart(cls, row, col) {
  const cell = getCell(cls, row, col)
  if (cell.isBreak || cell.teacher !== selectedTeacher.value) return
  dragSource.value = { cls, row, col }
  selected.value = { cls, row, col }
}

function onDrop(cls, row, col) {
  const src = dragSource.value
  if (!src.cls) return
  if (src.cls === cls && src.row === row && src.col === col) return
  const target = getCell(cls, row, col)
  const source = getCell(src.cls, src.row, src.col)
  if (source.teacher !== selectedTeacher.value) {
    dragSource.value = { cls: '', row: null, col: null }
    selected.value = { cls: '', row: null, col: null }
    return
  }
  if (target.isBreak || source.isBreak) {
    dragSource.value = { cls: '', row: null, col: null }
    return
  }
  if (!teacherFree(source.teacher, row, col, cls)) {
    message.error(`Giáo viên ${teacherMap[source.teacher] || source.teacher} đang bận tiết đó`)
    dragSource.value = { cls: '', row: null, col: null }
    return
  }
  if (!teacherFree(target.teacher, src.row, src.col, src.cls)) {
    message.error(`Giáo viên ${teacherMap[target.teacher] || target.teacher} đang bận tiết đó`)
    dragSource.value = { cls: '', row: null, col: null }
    return
  }
  setCell(cls, row, col, source)
  setCell(src.cls, src.row, src.col, target)
  dragSource.value = { cls: '', row: null, col: null }
}

function openMenu(event, cls, row, col) {
  selected.value = { cls, row, col }
  dragSource.value = { cls, row, col }
  contextMenu.value = { show: true, x: event.clientX, y: event.clientY, cls, row, col }
}

function toggleBreak(cls, row, col) {
  const cell = getCell(cls, row, col)
  if (cell.isBreak) {
    cell.isBreak = false
    if (cell.backup) {
      if (!teacherFree(cell.backup.teacher, row, col, cls)) {
        message.error(`Giáo viên ${teacherMap[cell.backup.teacher] || cell.backup.teacher} đang bận tiết đó`)
        return
      }
      cell.subject = cell.backup.subject
      cell.class = cell.backup.class
      cell.teacher = cell.backup.teacher
      cell.backup = undefined
    }
  } else {
    if (cell.subject) {
      message.error('Không thể đặt nghỉ vì đã có tiết học')
      contextMenu.value.show = false
      return
    }
    cell.isBreak = true
    cell.backup = { subject: cell.subject, class: cell.class, teacher: cell.teacher }
    cell.subject = ''
    cell.class = ''
    cell.teacher = ''
  }
  contextMenu.value.show = false
}

function addLesson(cls, row, col) {
  const hint = Object.keys(subjectTeacherMap).join(', ')
  const subject = prompt(`Chọn môn học (${hint}):`)
  if (!subject || !subjectTeacherMap[subject]) {
    contextMenu.value.show = false
    return
  }
  const teacher = subjectTeacherMap[subject]
  if (!teacherFree(teacher, row, col, cls)) {
    message.error(`Giáo viên ${teacherMap[teacher] || teacher} đang bận tiết đó`)
    contextMenu.value.show = false
    return
  }
  const cell = getCell(cls, row, col)
  cell.subject = subject
  cell.teacher = teacher
  cell.class = cls
  cell.isBreak = false
  contextMenu.value.show = false
}

function isSelected(cls, row, col) {
  return (
    selected.value.cls === cls &&
    selected.value.row === row &&
    selected.value.col === col
  )
}

function startHighlight(cls, row, col) {
  const cell = getCell(cls, row, col)
  if (cell.isBreak || cell.teacher !== selectedTeacher.value) return
  selected.value = { cls, row, col }
  dragSource.value = { cls, row, col }
}

function isValidTarget(cls, row, col) {
  const src = dragSource.value
  if (!src.cls) return false
  if (src.cls === cls && src.row === row && src.col === col) return false
  const source = getCell(src.cls, src.row, src.col)
  if (source.teacher !== selectedTeacher.value) return false
  const target = getCell(cls, row, col)
  if (source.isBreak || target.isBreak) return false
  return (
    teacherFree(source.teacher, row, col, cls) &&
    teacherFree(target.teacher, src.row, src.col, src.cls)
  )
}

function closeMenu() {
  contextMenu.value.show = false
  selected.value = { cls: '', row: null, col: null }
  dragSource.value = { cls: '', row: null, col: null }
}

onMounted(() => {
  window.addEventListener('click', closeMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeMenu)
})
</script>

<style scoped>
</style>
