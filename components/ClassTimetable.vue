<template>
  <a-card class="mb-6">
    <template #title>{{ title }}</template>
    <div class="overflow-x-auto">
      <table class="min-w-full text-center border-collapse table-fixed">
        <tbody v-for="session in sessions" :key="session.key">
          <tr>
            <th colspan="6" class="bg-gray-50 text-left px-2">
              {{ session.label }}
            </th>
          </tr>
          <tr>
            <th class="border p-2 w-20 h-12">Tiết\\Ngày</th>
            <th
              v-for="day in days"
              :key="`${session.key}-${day}`"
              class="border p-2 w-32 h-12"
            >
              {{ day }}
            </th>
          </tr>
          <tr
            v-for="(row, rIndex) in session.data"
            :key="`${session.key}-${rIndex}`"
          >
            <th class="border p-2 w-20 h-12">{{ rIndex + 1 }}</th>
            <td
              v-for="(lesson, cIndex) in row"
              :key="cIndex"
              class="border p-2 w-32 h-12 select-none overflow-hidden"
              :class="[
                { 'bg-blue-100': isSelected(rIndex + session.offset, cIndex) },
                { 'text-red-500 border-black cursor-not-allowed': lesson.isBreak },
                { 'cursor-move': !lesson.isBreak },
                { 'bg-green-100': isValidTarget(rIndex + session.offset, cIndex) }
              ]"
              :draggable="!lesson.isBreak"
              @dragstart="onDragStart(rIndex + session.offset, cIndex)"
              @click="startHighlight(rIndex + session.offset, cIndex)"
              @dragover.prevent
              @drop="onDrop(rIndex + session.offset, cIndex)"
              @contextmenu.prevent="openMenu($event, rIndex + session.offset, cIndex)"
            >
              <template v-if="lesson.subject">
                <div class="line-clamp-1">
                  {{ lesson.subject }}
                </div>
                <div class="text-xs line-clamp-1">
                  {{ lesson.teacher }}
                </div>
              </template>
              <template v-else-if="lesson.isBreak">
                <span class="text-red-500 font-medium">Nghỉ</span>
              </template>
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
            v-if="getCell(contextMenu.row, contextMenu.col).subject && !getCell(contextMenu.row, contextMenu.col).isBreak"
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            @click="removeLesson(contextMenu.row, contextMenu.col)"
          >
            Xóa tiết
          </li>
        </ul>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { message } from 'ant-design-vue'

const props = defineProps({
  timetable: Array,
  title: {
    type: String,
    default: 'Thời khóa biểu'
  },
  days: {
    type: Array,
    default: () => ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu']
  }
})

const sessions = computed(() => {
  let offset = 0
  return props.timetable.map(session => {
    const withOffset = { ...session, offset }
    offset += session.data.length
    return withOffset
  })
})

const rowMap = computed(() => {
  const map = []
  for (const session of sessions.value) {
    for (let i = 0; i < session.data.length; i++) {
      map[session.offset + i] = { session, index: i }
    }
  }
  return map
})

const selected = ref({ row: null, col: null })
const dragSource = ref({ row: null, col: null })
const contextMenu = ref({ show: false, x: 0, y: 0, row: null, col: null })

function isSelected(row, col) {
  return selected.value.row === row && selected.value.col === col
}

function getCell(row, col) {
  const entry = rowMap.value[row]
  if (!entry) return null
  return entry.session.data[entry.index][col]
}

function setCell(row, col, lesson) {
  const entry = rowMap.value[row]
  if (entry) {
    entry.session.data[entry.index][col] = lesson
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
  } else {
    if (cell.subject) {
      message.error('Không thể đặt nghỉ vì đã có tiết học')
      contextMenu.value.show = false
      return
    }
    cell.isBreak = true
  }
  contextMenu.value.show = false
}

function removeLesson(row, col) {
  const cell = getCell(row, col)
  cell.subject = ''
  cell.teacher = ''
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
