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
  onDragStart: Function,
  onDrop: Function,
  openMenu: Function,
  startHighlight: Function,
  isSelected: Function,
  isValidTarget: Function
})
</script>
