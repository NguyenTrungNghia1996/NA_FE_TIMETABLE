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
  openMenu: Function,
  getCell: Function,
  setCell: Function,
  teacherFree: Function
})

const { selected, dragSource } = useDrag()

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
</script>
