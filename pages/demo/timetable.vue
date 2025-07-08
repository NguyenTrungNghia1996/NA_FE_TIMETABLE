<template>
  <div class="max-w-5xl mx-auto p-6 space-y-8">
    <h1 class="text-2xl font-bold">Demo xếp thời khóa biểu liên kết</h1>
    <a-card class="mb-6">
      <template #title>Thời khóa biểu lớp 6A</template>
      <div class="overflow-x-auto">
        <table class="min-w-full text-center border-collapse table-fixed">
          <thead>
            <tr>
              <th class="border p-2 w-20 h-12">Tiết\\Ngày</th>
              <th v-for="day in days" :key="day" class="border p-2 w-32 h-12">
                {{ day }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rIndex) in classTimetable" :key="rIndex">
              <th class="border p-2 w-20 h-12">{{ rIndex + 1 }}</th>
              <td
                v-for="(lesson, cIndex) in row"
                :key="cIndex"
                class="border p-2 w-32 h-12 select-none overflow-hidden"
                :class="[
                  { 'bg-blue-100': isSelected(rIndex, cIndex) },
                  { 'bg-gray-100 text-gray-400 cursor-not-allowed': lesson.isBreak },
                  { 'cursor-move': !lesson.isBreak },
                  { 'bg-green-100': isValidTarget(rIndex, cIndex) }
                ]"
                :draggable="!lesson.isBreak"
                @dragstart="onDragStart(rIndex, cIndex)"
                @click="startHighlight(rIndex, cIndex)"
                @dragover.prevent
                @drop="onDrop(rIndex, cIndex)"
                @contextmenu.prevent="openMenu($event, rIndex, cIndex)"
              >
                <template v-if="lesson.subject">
                  <div class="line-clamp-1">
                    {{ lesson.subject }} - {{ lesson.class }}
                  </div>
                  <div class="text-xs line-clamp-1">
                    {{ lesson.teacher }}
                  </div>
                </template>
                <template v-else-if="lesson.isBreak">Nghỉ</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </a-card>


    <div v-if="contextMenu.show" class="fixed bg-white border rounded shadow z-50" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
      <ul>
        <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="toggleBreak(contextMenu.row, contextMenu.col)">
          {{ classTimetable[contextMenu.row][contextMenu.col].isBreak ? 'Bỏ nghỉ' : 'Đặt nghỉ' }}
        </li>
      </ul>
    </div>

    <div class="mt-10 border-t pt-6">
      <h2 class="text-xl font-bold mb-4">📓 Hướng dẫn sử dụng</h2>
      <ul class="list-disc pl-6 space-y-2">
        <li>Nhấn chuột phải để đặt hoặc bỏ nghỉ.</li>
        <li>Kéo thả các tiết để hoán đổi vị trí.</li>
        <li>Không thể kéo thả vào tiết nghỉ.</li>
        <li>Không thể đặt nghỉ ở ô đã có tiết học.</li>
      </ul>
    </div>

    <div class="mt-6">
      <h2 class="text-xl font-bold mb-2">📦 Dữ liệu hiện tại</h2>
      <pre class="bg-gray-100 p-4 text-xs overflow-auto">{{ JSON.stringify(classTimetable, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { message } from 'ant-design-vue'

interface Lesson {
  id: number
  subject: string
  class: string
  teacher: string
  isBreak: boolean
  backup?: {
    subject: string
    class: string
    teacher: string
  }
}

interface TeacherSlot {
  class: string
  subject: string
}

const teacherName = 'PT Thoản'
const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu']

// lịch cơ bản của giáo viên (không bao gồm lớp 6A)
const teacherBusy: TeacherSlot[][] = [
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
  [
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '', subject: '' },
    { class: '8A', subject: 'AN' }
  ]
]

// thời khóa biểu lớp 6A (10 tiết - 2 ca, 5 ngày)
const classTimetable = ref<Lesson[][]>([
  [
    { id: 1, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false },
    { id: 2, subject: 'Văn', class: '6A', teacher: 'Nguyễn Thị Bình', isBreak: false },
    { id: 3, subject: 'Anh', class: '6A', teacher: 'Trần Thu Hà', isBreak: false },
    { id: 4, subject: 'Lý', class: '6A', teacher: 'Lê Đức Thắng', isBreak: false },
    { id: 5, subject: 'Âm nhạc', class: '6A', teacher: teacherName, isBreak: false }
  ],
  [
    { id: 6, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false },
    { id: 7, subject: 'Địa', class: '6A', teacher: 'Lê Mai Hoa', isBreak: false },
    { id: 8, subject: 'Sinh', class: '6A', teacher: 'Nguyễn Thị Minh', isBreak: false },
    { id: 9, subject: 'Âm nhạc', class: '6A', teacher: teacherName, isBreak: false },
    { id: 10, subject: 'Sử', class: '6A', teacher: 'Lê Văn Quý', isBreak: false }
  ],
  [
    { id: 11, subject: 'Văn', class: '6A', teacher: 'Nguyễn Thị Bình', isBreak: false },
    { id: 12, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false },
    { id: 13, subject: '', class: '', teacher: '', isBreak: true },
    { id: 14, subject: 'Công nghệ', class: '6A', teacher: 'Phạm Văn Khang', isBreak: false },
    { id: 15, subject: 'Anh', class: '6A', teacher: 'Trần Thu Hà', isBreak: false }
  ],
  [
    { id: 16, subject: 'Tin học', class: '6A', teacher: 'Trần Minh Tân', isBreak: false },
    { id: 17, subject: 'Mỹ thuật', class: '6A', teacher: 'Đỗ Lan Hương', isBreak: false },
    { id: 18, subject: 'Thể dục', class: '6A', teacher: 'Nguyễn Văn Mạnh', isBreak: false },
    { id: 19, subject: 'Địa', class: '6A', teacher: 'Lê Mai Hoa', isBreak: false },
    { id: 20, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false }
  ],
  [
    { id: 21, subject: 'Văn', class: '6A', teacher: 'Nguyễn Thị Bình', isBreak: false },
    { id: 22, subject: 'Âm nhạc', class: '6A', teacher: teacherName, isBreak: false },
    { id: 23, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false },
    { id: 24, subject: 'Công nghệ', class: '6A', teacher: 'Phạm Văn Khang', isBreak: false },
    { id: 25, subject: 'Sử', class: '6A', teacher: 'Lê Văn Quý', isBreak: false }
  ],
  [
    { id: 26, subject: 'Văn', class: '6A', teacher: 'Nguyễn Thị Bình', isBreak: false },
    { id: 27, subject: 'Sinh', class: '6A', teacher: 'Nguyễn Thị Minh', isBreak: false },
    { id: 28, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false },
    { id: 29, subject: 'Tin học', class: '6A', teacher: 'Trần Minh Tân', isBreak: false },
    { id: 30, subject: 'Anh', class: '6A', teacher: 'Trần Thu Hà', isBreak: false }
  ],
  [
    { id: 31, subject: 'Lý', class: '6A', teacher: 'Lê Đức Thắng', isBreak: false },
    { id: 32, subject: 'Địa', class: '6A', teacher: 'Lê Mai Hoa', isBreak: false },
    { id: 33, subject: 'Âm nhạc', class: '6A', teacher: teacherName, isBreak: false },
    { id: 34, subject: 'Văn', class: '6A', teacher: 'Nguyễn Thị Bình', isBreak: false },
    { id: 35, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false }
  ],
  [
    { id: 36, subject: 'Thể dục', class: '6A', teacher: 'Nguyễn Văn Mạnh', isBreak: false },
    { id: 37, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false },
    { id: 38, subject: '', class: '', teacher: '', isBreak: true },
    { id: 39, subject: 'Mỹ thuật', class: '6A', teacher: 'Đỗ Lan Hương', isBreak: false },
    { id: 40, subject: 'Sinh', class: '6A', teacher: 'Nguyễn Thị Minh', isBreak: false }
  ],
  [
    { id: 41, subject: 'Anh', class: '6A', teacher: 'Trần Thu Hà', isBreak: false },
    { id: 42, subject: 'Văn', class: '6A', teacher: 'Nguyễn Thị Bình', isBreak: false },
    { id: 43, subject: 'Lý', class: '6A', teacher: 'Lê Đức Thắng', isBreak: false },
    { id: 44, subject: 'Thể dục', class: '6A', teacher: 'Nguyễn Văn Mạnh', isBreak: false },
    { id: 45, subject: 'Công nghệ', class: '6A', teacher: 'Phạm Văn Khang', isBreak: false }
  ],
  [
    { id: 46, subject: 'Tin học', class: '6A', teacher: 'Trần Minh Tân', isBreak: false },
    { id: 47, subject: 'Âm nhạc', class: '6A', teacher: teacherName, isBreak: false },
    { id: 48, subject: 'Toán', class: '6A', teacher: 'Phan Văn Lương', isBreak: false },
    { id: 49, subject: 'Địa', class: '6A', teacher: 'Lê Mai Hoa', isBreak: false },
    { id: 50, subject: 'Văn', class: '6A', teacher: 'Nguyễn Thị Bình', isBreak: false }
  ]
])


const selected = ref({ row: null as number | null, col: null as number | null })
const dragSource = ref({ row: null as number | null, col: null as number | null })
const contextMenu = ref({ show: false, x: 0, y: 0, row: null as number | null, col: null as number | null })

function teacherFree(teacher: string, row: number, col: number) {
  if (teacher !== teacherName) return true
  const slot = teacherBusy[row][col]
  return !slot.class || slot.class === '6A'
}

function onDragStart(row: number, col: number) {
  const cell = classTimetable.value[row][col]
  if (cell.isBreak) return
  dragSource.value = { row, col }
  selected.value = { row, col }
}

function onDrop(row: number, col: number) {
  const src = dragSource.value
  if (src.row === null) return
  if (src.row === row && src.col === col) return
  const target = classTimetable.value[row][col]
  const source = classTimetable.value[src.row][src.col]
  if (target.isBreak || source.isBreak) {
    dragSource.value = { row: null, col: null }
    return
  }
  if (!teacherFree(source.teacher, row, col) || !teacherFree(target.teacher, src.row, src.col)) {
    message.error(`Giáo viên ${teacherName} đang bận tiết đó`)
    dragSource.value = { row: null, col: null }
    return
  }
  classTimetable.value[row][col] = source
  classTimetable.value[src.row][src.col] = target
  dragSource.value = { row: null, col: null }
}

function openMenu(event: MouseEvent, row: number, col: number) {
  selected.value = { row, col }
  dragSource.value = { row, col }
  contextMenu.value = { show: true, x: event.clientX, y: event.clientY, row, col }
}

function toggleBreak(row: number, col: number) {
  const cell = classTimetable.value[row][col]
  if (cell.isBreak) {
    cell.isBreak = false
    if (cell.backup) {
      if (!teacherFree(cell.backup.teacher, row, col)) {
        message.error(`Giáo viên ${teacherName} đang bận tiết đó`)
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

function isSelected(row: number, col: number) {
  return selected.value.row === row && selected.value.col === col
}

function startHighlight(row: number, col: number) {
  const cell = classTimetable.value[row][col]
  if (cell.isBreak) return
  selected.value = { row, col }
  dragSource.value = { row, col }
}

function isValidTarget(row: number, col: number) {
  const src = dragSource.value
  if (src.row === null) return false
  if (src.row === row && src.col === col) return false
  const source = classTimetable.value[src.row][src.col]
  const target = classTimetable.value[row][col]
  if (source.isBreak || target.isBreak) return false
  return (
    teacherFree(source.teacher, row, col) &&
    teacherFree(target.teacher, src.row, src.col)
  )
}

function closeMenu() {
  contextMenu.value.show = false
  selected.value = { row: null, col: null }
  dragSource.value = { row: null, col: null }
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
