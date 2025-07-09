<template>
  <a-card class="mb-6">
    <template #title>Thời khóa biểu lớp 6A</template>
    <div class="overflow-x-auto">
      <table class="min-w-full text-center border-collapse table-fixed">
        <tbody>
          <tr>
            <th colspan="6" class="bg-gray-50 text-left px-2">Ca sáng</th>
          </tr>
          <tr>
            <th class="border p-2 w-20 h-12">Tiết\\Ngày</th>
            <th
              v-for="day in days"
              :key="`morning-${day}`"
              class="border p-2 w-32 h-12"
            >
              {{ day }}
            </th>
          </tr>
          <tr
            v-for="(row, rIndex) in timetable.morning"
            :key="`morning-${rIndex}`"
          >
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
                  {{ lesson.subject }}
                </div>
                <div class="text-xs line-clamp-1">
                  {{ teacherMap[lesson.teacher] }}
                </div>
              </template>
              <template v-else-if="lesson.isBreak">Nghỉ</template>
            </td>
          </tr>
        </tbody>
        <tbody>
          <tr>
            <th colspan="6" class="bg-gray-50 text-left px-2">Ca chiều</th>
          </tr>
          <tr>
            <th class="border p-2 w-20 h-12">Tiết\\Ngày</th>
            <th
              v-for="day in days"
              :key="`afternoon-${day}`"
              class="border p-2 w-32 h-12"
            >
              {{ day }}
            </th>
          </tr>
          <tr
            v-for="(row, rIndex) in timetable.afternoon"
            :key="`afternoon-${rIndex}`"
          >
            <th class="border p-2 w-20 h-12">{{ rIndex + 1 }}</th>
            <td
              v-for="(lesson, cIndex) in row"
              :key="cIndex"
              class="border p-2 w-32 h-12 select-none overflow-hidden"
              :class="[
                { 'bg-blue-100': isSelected(rIndex + 5, cIndex) },
                { 'bg-gray-100 text-gray-400 cursor-not-allowed': lesson.isBreak },
                { 'cursor-move': !lesson.isBreak },
                { 'bg-green-100': isValidTarget(rIndex + 5, cIndex) }
              ]"
              :draggable="!lesson.isBreak"
              @dragstart="onDragStart(rIndex + 5, cIndex)"
              @click="startHighlight(rIndex + 5, cIndex)"
              @dragover.prevent
              @drop="onDrop(rIndex + 5, cIndex)"
              @contextmenu.prevent="openMenu($event, rIndex + 5, cIndex)"
            >
              <template v-if="lesson.subject">
                <div class="line-clamp-1">
                  {{ lesson.subject }}
                </div>
                <div class="text-xs line-clamp-1">
                  {{ teacherMap[lesson.teacher] }}
                </div>
              </template>
              <template v-else-if="lesson.isBreak">Nghỉ</template>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-if="contextMenu.show"
        class="fixed bg-white border rounded shadow z-50"
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      >
        <ul>
          <li
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            @click="toggleBreak(contextMenu.row, contextMenu.col)"
          >
            {{
              getCell(contextMenu.row, contextMenu.col).isBreak
                ? 'Bỏ nghỉ'
                : 'Đặt nghỉ'
            }}
          </li>
          <li
            v-if="
              !getCell(contextMenu.row, contextMenu.col).subject &&
              !getCell(contextMenu.row, contextMenu.col).isBreak
            "
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            @click="addLesson(contextMenu.row, contextMenu.col)"
          >
            Thêm tiết học
          </li>
        </ul>
      </div>
    </div>
  </a-card>
</template>

<script setup>

const props = defineProps({
  timetable: Object
})

const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu']
const teacherMap = {
  GV1: 'PT Thoản',
  GV2: 'Thầy An',
  GV3: 'Cô Bình',
  GV4: 'Thầy Cường',
  GV5: 'Cô Dung'
}
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

const selected = ref({ row: null, col: null })
const dragSource = ref({ row: null, col: null })
const contextMenu = ref({ show: false, x: 0, y: 0, row: null, col: null })

function isSelected(row, col) {
  return selected.value.row === row && selected.value.col === col
}

function getCell(row, col) {
  return row < 5
    ? props.timetable.morning[row][col]
    : props.timetable.afternoon[row - 5][col]
}

function setCell(row, col, lesson) {
  if (row < 5) {
    props.timetable.morning[row][col] = lesson
  } else {
    props.timetable.afternoon[row - 5][col] = lesson
  }
}

function startHighlight(row, col) {
  const cell = getCell(row, col)
  if (cell.isBreak) return
  selected.value = { row, col }
  dragSource.value = { row, col }
}

function onDragStart(row, col) {
  const cell = getCell(row, col)
  if (cell.isBreak) return
  dragSource.value = { row, col }
  selected.value = { row, col }
}

function onDrop(row, col) {
  const src = dragSource.value
  if (src.row === null) return
  if (src.row === row && src.col === col) return
  const target = getCell(row, col)
  const source = getCell(src.row, src.col)
  if (target.isBreak || source.isBreak) {
    dragSource.value = { row: null, col: null }
    return
  }
  setCell(row, col, source)
  setCell(src.row, src.col, target)
  dragSource.value = { row: null, col: null }
  selected.value = { row: null, col: null }
}

function isValidTarget(row, col) {
  const src = dragSource.value
  if (src.row === null) return false
  if (src.row === row && src.col === col) return false
  const source = getCell(src.row, src.col)
  const target = getCell(row, col)
  if (source.isBreak || target.isBreak) return false
  return true
}

function openMenu(event, row, col) {
  selected.value = { row, col }
  dragSource.value = { row, col }
  contextMenu.value = { show: true, x: event.clientX, y: event.clientY, row, col }
}

function toggleBreak(row, col) {
  const cell = getCell(row, col)
  if (cell.isBreak) {
    cell.isBreak = false
    if (cell.backup) {
      cell.subject = cell.backup.subject
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
    cell.backup = { subject: cell.subject, teacher: cell.teacher }
    cell.subject = ''
    cell.teacher = ''
  }
  contextMenu.value.show = false
}

function addLesson(row, col) {
  const hint = Object.keys(subjectTeacherMap).join(', ')
  const subject = prompt(`Chọn môn học (${hint}):`)
  if (!subject || !subjectTeacherMap[subject]) {
    contextMenu.value.show = false
    return
  }
  const teacher = subjectTeacherMap[subject]
  const cell = getCell(row, col)
  cell.subject = subject
  cell.teacher = teacher
  cell.isBreak = false
  contextMenu.value.show = false
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
