<template>
  <div v-if="classData" class="space-y-2 relative" @click="closeMenu">
    <h2 class="text-xl font-semibold text-gray-800">{{ classData.name }}</h2>
    <div class="flex flex-wrap gap-2 text-sm text-gray-600">
      <span
        v-for="stat in stats"
        :key="stat.subject"
        class="px-2 py-0.5 bg-gray-100 rounded"
      >
        {{ stat.subject }}: {{ stat.count }}/{{ stat.max }}
      </span>
    </div>
    <div
      v-for="(ca, caIndex) in classData.timetable.ds_Ca"
      :key="ca.id"
      class="space-y-3"
    >
      <h3 class="text-base font-medium text-gray-700">Ca {{ ca.id }}</h3>
      <div class="overflow-auto shadow-lg border border-gray-200">
        <table class="min-w-full table-fixed">
          <thead>
            <tr class="bg-gray-50 text-center text-xs font-semibold text-gray-500 uppercase">
              <th class="border p-2 w-32">Tiết / Ngày</th>
              <th v-for="day in ca.ds_Ngay" :key="day.id" class="border p-2">{{ day.ten }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tiet, tIndex) in ca.ds_Ngay[0].ds_Tiet" :key="tiet.id">
              <td class="border bg-gray-50 text-center w-32 h-10 p-2">{{ tiet.ten }}</td>
              <td
                v-for="(day, dIndex) in ca.ds_Ngay"
                :key="day.id"
                class="border relative w-32 h-10 p-2 text-center overflow-hidden transition-colors"
                :class="cellClass(ki, caIndex, dIndex, tIndex)"
                @dragstart="dragStart($event, ki, caIndex, dIndex, tIndex)"
                @dragenter.prevent="dragEnter($event, ki, caIndex, dIndex, tIndex)"
                @dragover.prevent="dragOver($event, ki, caIndex, dIndex, tIndex)"
                @drop.prevent="drop($event, ki, caIndex, dIndex, tIndex)"
                @dragend="dragEnd"
                @contextmenu.prevent="openMenu($event, ki, caIndex, dIndex, tIndex)"
                @click="day.ds_Tiet[tIndex].teacherId && selectTeacherLesson(day.ds_Tiet[tIndex].teacherId)"
                :draggable="!day.ds_Tiet[tIndex].isBreak"
                :data-ki="ki"
                :data-ci="caIndex"
                :data-di="dIndex"
                :data-ti="tIndex"
                @touchstart.prevent="touchStart($event, ki, caIndex, dIndex, tIndex)"
              >
                <template v-if="!day.ds_Tiet[tIndex].isBreak">
                  <div class="line-clamp-1">{{ day.ds_Tiet[tIndex].subject }}</div>
                  <div class="text-xs text-gray-500 line-clamp-1">{{ day.ds_Tiet[tIndex].teacher }}</div>
                </template>
                <span v-else class="text-red-600">Nghỉ</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div
      v-if="contextMenu.visible"
      :style="contextMenu.style"
      class="fixed bg-white border border-gray-200 rounded-md shadow-lg z-50 text-sm"
    >
      <ul>
        <li class="px-4 py-2 hover:bg-gray-50 cursor-pointer" @click.stop="removeLesson()">Xóa tiết học</li>
        <li class="px-4 py-2 hover:bg-gray-50 cursor-pointer" @click.stop="toggleBreak()">
          {{ contextMenu.isBreak ? 'Bỏ tiết nghỉ' : 'Đặt tiết nghỉ' }}
        </li>
        <li class="px-4 py-2 hover:bg-gray-50 cursor-pointer" @click.stop="changeSubject()">Đổi môn học</li>
      </ul>
    </div>
    <a-modal v-model:open="subjectSelect.visible" title="Chọn môn học" @ok="confirmSubject" @cancel="cancelSubject" :footer="null">
      <a-select v-model:value="subjectSelect.value" class="w-full">
        <a-select-option v-for="o in subjectSelect.options" :key="o.id + '-' + o.subject" :value="o.id + '-' + o.subject">
          {{ o.subject }} - {{ o.name }}
        </a-select-option>
      </a-select>
      <div class="flex justify-end gap-2 mt-4">
        <a-button @click="cancelSubject">Hủy</a-button>
        <a-button type="primary" @click="confirmSubject">OK</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTimetableStore } from '~/stores/timetableStore'
import { useTimetableDnD } from '~/composables/useTimetableDnD'

const props = defineProps({
  klass: Object
})

const timetable = useTimetableStore()
const { classes } = storeToRefs(timetable)

const ki = computed(() => classes.value.findIndex(c => c.id === props.klass?.id))
const classData = computed(() => props.klass)

const {
  selectTeacherLesson,
  dragStart,
  touchStart,
  dragEnter,
  dragOver,
  drop,
  dragEnd,
  openMenu,
  closeMenu,
  removeLesson,
  toggleBreak,
  changeSubject,
  confirmSubject,
  cancelSubject,
  cellClass,
  contextMenu,
  subjectSelect
} = useTimetableDnD()

const stats = computed(() => {
  const classVal = props.klass
  if (!classVal) return []
  const counts = {}
  classVal.timetable.ds_Ca.forEach(ca => {
    ca.ds_Ngay.forEach(day => {
      day.ds_Tiet.forEach(t => {
        if (!t.isBreak && t.subject) {
          counts[t.subject] = (counts[t.subject] || 0) + 1
        }
      })
    })
  })
  const limits = classVal.limits || {}
  return Object.keys(limits).map(sub => ({ subject: sub, max: limits[sub], count: counts[sub] || 0 }))
})
</script>

<style scoped></style>
