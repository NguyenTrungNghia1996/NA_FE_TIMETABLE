<template>
  <a-card class="mb-6">
    <template #title>Thời khóa biểu lớp {{ cls }}</template>
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
                !lesson.isBreak && lesson.teacher === selectedTeacher && 'bg-yellow-50',
                { 'bg-blue-100': isSelected(cls, rIndex, cIndex) },
                { 'bg-gray-100 text-gray-400 cursor-not-allowed': lesson.isBreak },
                { 'cursor-move': !lesson.isBreak && lesson.teacher === selectedTeacher },
                { 'bg-green-100': isValidTarget(cls, rIndex, cIndex) }
              ]"
              :draggable="!lesson.isBreak && lesson.teacher === selectedTeacher"
              @dragstart="onDragStart(cls, rIndex, cIndex)"
              @click="startHighlight(cls, rIndex, cIndex)"
              @dragover.prevent
              @drop="onDrop(cls, rIndex, cIndex)"
              @contextmenu.prevent="openMenu($event, cls, rIndex, cIndex)"
            >
              <template v-if="lesson.subject">
                <div class="line-clamp-1">
                  {{ lesson.subject }} - {{ lesson.class }}
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
                !lesson.isBreak && lesson.teacher === selectedTeacher && 'bg-yellow-50',
                { 'bg-blue-100': isSelected(cls, rIndex + 5, cIndex) },
                { 'bg-gray-100 text-gray-400 cursor-not-allowed': lesson.isBreak },
                { 'cursor-move': !lesson.isBreak && lesson.teacher === selectedTeacher },
                { 'bg-green-100': isValidTarget(cls, rIndex + 5, cIndex) }
              ]"
              :draggable="!lesson.isBreak && lesson.teacher === selectedTeacher"
              @dragstart="onDragStart(cls, rIndex + 5, cIndex)"
              @click="startHighlight(cls, rIndex + 5, cIndex)"
              @dragover.prevent
              @drop="onDrop(cls, rIndex + 5, cIndex)"
              @contextmenu.prevent="openMenu($event, cls, rIndex + 5, cIndex)"
            >
              <template v-if="lesson.subject">
                <div class="line-clamp-1">
                  {{ lesson.subject }} - {{ lesson.class }}
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
              getCell(cls, contextMenu.row, contextMenu.col).isBreak
                ? 'Bỏ nghỉ'
                : 'Đặt nghỉ'
            }}
          </li>
          <li
            v-if="
              !getCell(cls, contextMenu.row, contextMenu.col).subject &&
              !getCell(cls, contextMenu.row, contextMenu.col).isBreak
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
  cls: String,
  timetable: Object,
  days: Array,
  selectedTeacher: String,
  teacherMap: Object,
  subjectTeacherMap: Object,
  getCell: Function,
  setCell: Function,
  teacherFree: Function
})

const { selected, dragSource } = useDrag()
const contextMenu = ref({ show: false, x: 0, y: 0, row: null, col: null })

function isSelected(cls, row, col) {
  return (
    selected.value.cls === cls &&
    selected.value.row === row &&
    selected.value.col === col
  )
}

function startHighlight(cls, row, col) {
  const cell = props.getCell(cls, row, col)
  if (cell.isBreak || cell.teacher !== props.selectedTeacher) return
  selected.value = { cls, row, col }
  dragSource.value = { cls, row, col }
}

function onDragStart(cls, row, col) {
  const cell = props.getCell(cls, row, col)
  if (cell.isBreak || cell.teacher !== props.selectedTeacher) return
  dragSource.value = { cls, row, col }
  selected.value = { cls, row, col }
}

function onDrop(cls, row, col) {
  const src = dragSource.value
  if (!src.cls) return
  if (src.cls === cls && src.row === row && src.col === col) return
  const target = props.getCell(cls, row, col)
  const source = props.getCell(src.cls, src.row, src.col)
  if (source.teacher !== props.selectedTeacher) {
    dragSource.value = { cls: '', row: null, col: null }
    selected.value = { cls: '', row: null, col: null }
    return
  }
  if (target.isBreak || source.isBreak) {
    dragSource.value = { cls: '', row: null, col: null }
    return
  }
  if (!props.teacherFree(source.teacher, row, col, cls)) {
    message.error(`Giáo viên ${props.teacherMap[source.teacher] || source.teacher} đang bận tiết đó`)
    dragSource.value = { cls: '', row: null, col: null }
    return
  }
  if (!props.teacherFree(target.teacher, src.row, src.col, src.cls)) {
    message.error(`Giáo viên ${props.teacherMap[target.teacher] || target.teacher} đang bận tiết đó`)
    dragSource.value = { cls: '', row: null, col: null }
    return
  }
  props.setCell(cls, row, col, source)
  props.setCell(src.cls, src.row, src.col, target)
  dragSource.value = { cls: '', row: null, col: null }
}

function isValidTarget(cls, row, col) {
  const src = dragSource.value
  if (!src.cls) return false
  if (src.cls === cls && src.row === row && src.col === col) return false
  const source = props.getCell(src.cls, src.row, src.col)
  if (source.teacher !== props.selectedTeacher) return false
  const target = props.getCell(cls, row, col)
  if (source.isBreak || target.isBreak) return false
  return (
    props.teacherFree(source.teacher, row, col, cls) &&
    props.teacherFree(target.teacher, src.row, src.col, src.cls)
  )
}

function openMenu(event, cls, row, col) {
  selected.value = { cls, row, col }
  dragSource.value = { cls, row, col }
  contextMenu.value = { show: true, x: event.clientX, y: event.clientY, row, col }
}

function toggleBreak(row, col) {
  const cell = props.getCell(props.cls, row, col)
  if (cell.isBreak) {
    cell.isBreak = false
    if (cell.backup) {
      if (!props.teacherFree(cell.backup.teacher, row, col, props.cls)) {
        message.error(`Giáo viên ${props.teacherMap[cell.backup.teacher] || cell.backup.teacher} dang bận tiết đó`)
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

function addLesson(row, col) {
  const hint = Object.keys(subjectTeacherMap).join(', ')
  const subject = prompt(`Chọn môn học (${hint}):`)
  if (!subject || !subjectTeacherMap[subject]) {
    contextMenu.value.show = false
    return
  }
  const teacher = subjectTeacherMap[subject]
  if (!props.teacherFree(teacher, row, col, props.cls)) {
    message.error(`Giáo viên ${props.teacherMap[teacher] || teacher} dang bận tiết đó`)
    contextMenu.value.show = false
    return
  }
  const cell = props.getCell(props.cls, row, col)
  cell.subject = subject
  cell.teacher = teacher
  cell.class = props.cls
  cell.isBreak = false
  contextMenu.value.show = false
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
