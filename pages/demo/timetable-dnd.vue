<template>
  <div class="p-4 bg-white space-y-8" @click="closeMenu">
    <div class="flex space-x-4">
      <select v-model="selectedClassId" class="border p-1">
        <option v-for="k in classes" :key="k.id" :value="k.id">{{ k.name }}</option>
      </select>
      <select v-model="selectedTeacherId" class="border p-1">
        <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
    </div>
    <div v-if="currentClass" class="space-y-4">
      <h2 class="text-lg font-bold">{{ currentClass.name }}</h2>
      <div v-for="(ca, caIndex) in currentClass.timetable.ds_Ca" :key="ca.id" class="space-y-2">
        <h3 class="font-semibold">Ca {{ ca.id }}</h3>
        <table class="min-w-full table-fixed border border-gray-200">
          <thead>
            <tr>
              <th class="border p-2">Tiết / Ngày</th>
              <th v-for="day in ca.ds_Ngay" :key="day.id" class="border p-2">
                {{ day.ten }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tiet, tIndex) in ca.ds_Ngay[0].ds_Tiet" :key="tiet.id">
              <td class="border p-2 text-center">{{ tiet.ten }}</td>
              <td v-for="(day, dIndex) in ca.ds_Ngay" :key="day.id"
                  class="border p-2 text-center relative"
                  :class="cellClass(currentClassIndex, caIndex, dIndex, tIndex)"
                  @dragstart="dragStart($event, currentClassIndex, caIndex, dIndex, tIndex)"
                  @dragover.prevent="dragOver($event, currentClassIndex, caIndex, dIndex, tIndex)"
                  @drop.prevent="drop($event, currentClassIndex, caIndex, dIndex, tIndex)"
                  @contextmenu.prevent="openMenu($event, currentClassIndex, caIndex, dIndex, tIndex)"
                  :draggable="!day.ds_Tiet[tIndex].isBreak"
              >
                <template v-if="!day.ds_Tiet[tIndex].isBreak">
                  <div>{{ day.ds_Tiet[tIndex].subject }}</div>
                  <div class="text-xs text-gray-500">{{ day.ds_Tiet[tIndex].teacher }}</div>
                </template>
                <span v-else class="text-red-600">Nghỉ</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="currentTeacher" class="mt-10 space-y-4">
      <h2 class="text-lg font-bold">Bảng lịch giáo viên</h2>
      <div class="space-y-2">
        <h3 class="font-semibold">{{ currentTeacher.name }}</h3>
        <div v-for="(ca, ci) in currentTeacher.ds_Ca" :key="ci" class="space-y-1">
          <h4 class="font-medium">Ca {{ ca.id }}</h4>
          <table class="min-w-full table-fixed border border-gray-200 text-sm">
            <thead>
              <tr>
                <th class="border p-1">Tiết / Ngày</th>
                <th v-for="day in ca.ds_Ngay" :key="day.id" class="border p-1">{{ day.ten }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tiet, ti) in ca.ds_Ngay[0].ds_Tiet" :key="ti">
                <td class="border p-1 text-center">Tiết {{ ti + 1 }}</td>
                <td v-for="(day, di) in ca.ds_Ngay" :key="di" class="border p-1 text-center">
                  <span v-if="day.ds_Tiet[ti].className">
                    {{ day.ds_Tiet[ti].className }} - {{ day.ds_Tiet[ti].subject }}
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div v-if="contextMenu.visible" :style="contextMenu.style" class="absolute bg-white border rounded shadow z-50 text-sm">
      <ul>
        <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" @click.stop="removeLesson()">Xóa tiết học</li>
        <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" @click.stop="toggleBreak()">
          {{ contextMenu.isBreak ? 'Bỏ tiết nghỉ' : 'Đặt tiết nghỉ' }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import timetableData from '~/public/data/timetable.json'

const classes = reactive([])
const teachers = reactive([])
const selectedClassId = ref(null)
const selectedTeacherId = ref(null)
const currentClass = computed(() => classes.find(k => k.id === selectedClassId.value))
const currentClassIndex = computed(() => classes.findIndex(k => k.id === selectedClassId.value))
const currentTeacher = computed(() => teachers.find(t => t.id === selectedTeacherId.value))

const dragging = ref(null)
const validCells = reactive(new Set())

const contextMenu = reactive({
  visible: false,
  style: { top: '0px', left: '0px' },
  ki: 0,
  ci: 0,
  di: 0,
  ti: 0,
  get isBreak() {
    const lesson = classes[this.ki]?.timetable.ds_Ca[this.ci]?.ds_Ngay[this.di]?.ds_Tiet[this.ti]
    return lesson?.isBreak
  }
})

function dragStart(e, ki, ci, di, ti) {
  dragging.value = { ki, ci, di, ti }
  highlightValidCells()
}

function dragOver(e, ki, ci, di, ti) {
  e.dataTransfer.dropEffect = validCells.has(key(ki, ci, di, ti)) ? 'move' : 'none'
}

function drop(e, ki, ci, di, ti) {
  if (!dragging.value) return
  const destKey = key(ki, ci, di, ti)
  if (!validCells.has(destKey)) return
  const src = getLesson(dragging.value)
  const dest = getLesson({ ki, ci, di, ti })
  if (!canSwap(dragging.value, { ki, ci, di, ti })) {
    dragging.value = null
    validCells.clear()
    return
  }
  ;[src.subject, dest.subject] = [dest.subject, src.subject]
  ;[src.teacher, dest.teacher] = [dest.teacher, src.teacher]
  ;[src.teacherId, dest.teacherId] = [dest.teacherId, src.teacherId]
  dragging.value = null
  validCells.clear()
  teachers.splice(0, teachers.length, ...buildTeacherSchedules())
  if (!teachers.find(t => t.id === selectedTeacherId.value) && teachers.length) {
    selectedTeacherId.value = teachers[0].id
  }
}

function openMenu(e, ki, ci, di, ti) {
  contextMenu.visible = true
  contextMenu.style = { top: `${e.clientY}px`, left: `${e.clientX}px` }
  contextMenu.ki = ki
  contextMenu.ci = ci
  contextMenu.di = di
  contextMenu.ti = ti
}

function closeMenu() {
  contextMenu.visible = false
}

function removeLesson() {
  const lesson = getLesson(contextMenu)
  Object.assign(lesson, { subject: '', teacher: '', teacherId: null, isBreak: false })
  teachers.splice(0, teachers.length, ...buildTeacherSchedules())
  if (!teachers.find(t => t.id === selectedTeacherId.value) && teachers.length) {
    selectedTeacherId.value = teachers[0].id
  }
  closeMenu()
}

function toggleBreak() {
  const lesson = getLesson(contextMenu)
  if (!lesson.isBreak && (lesson.subject || lesson.teacherId)) {
    alert('Không thể đặt tiết nghỉ vì đã có tiết học')
    closeMenu()
    return
  }
  if (lesson.isBreak) {
    lesson.isBreak = false
    lesson.subject = ''
    lesson.teacher = ''
    lesson.teacherId = null
  } else {
    lesson.isBreak = true
    lesson.subject = ''
    lesson.teacher = ''
    lesson.teacherId = null
  }
  teachers.splice(0, teachers.length, ...buildTeacherSchedules())
  if (!teachers.find(t => t.id === selectedTeacherId.value) && teachers.length) {
    selectedTeacherId.value = teachers[0].id
  }
  closeMenu()
}

function key(ki, ci, di, ti) {
  return `${ki}-${ci}-${di}-${ti}`
}

function getLesson({ ki, ci, di, ti }) {
  return classes[ki].timetable.ds_Ca[ci].ds_Ngay[di].ds_Tiet[ti]
}

function subjectCount(ki, subject) {
  let count = 0
  classes[ki].timetable.ds_Ca.forEach(ca => {
    ca.ds_Ngay.forEach(day => {
      day.ds_Tiet.forEach(p => {
        if (p.subject === subject) count++
      })
    })
  })
  return count
}

function canSwap(src, dest) {
  if (src.ki === dest.ki) return true
  const srcLesson = getLesson(src)
  const destLesson = getLesson(dest)
  const destLimit = classes[dest.ki].limits?.[srcLesson.subject]
  if (destLimit !== undefined) {
    const destCount = subjectCount(dest.ki, srcLesson.subject)
    const inc = destLesson.subject === srcLesson.subject ? 0 : 1
    if (destCount + inc > destLimit) return false
  }
  const srcLimit = classes[src.ki].limits?.[destLesson.subject]
  if (srcLimit !== undefined) {
    const srcCount = subjectCount(src.ki, destLesson.subject)
    const inc = destLesson.subject === srcLesson.subject ? 0 : 1
    if (srcCount + inc > srcLimit) return false
  }
  return true
}

function highlightValidCells() {
  validCells.clear()
  if (!dragging.value) return
  for (let k = 0; k < classes.length; k++) {
    for (let c = 0; c < classes[k].timetable.ds_Ca.length; c++) {
      const days = classes[k].timetable.ds_Ca[c].ds_Ngay
      for (let d = 0; d < days.length; d++) {
        const periods = days[d].ds_Tiet
        for (let t = 0; t < periods.length; t++) {
          if (periods[t].isBreak) continue
          const other = getLesson({ ki: k, ci: c, di: d, ti: t })
          const srcLesson = getLesson(dragging.value)
          if (other.teacherId === srcLesson.teacherId && !(k === dragging.value.ki && c === dragging.value.ci && d === dragging.value.di && t === dragging.value.ti)) continue
          let conflict = false
          for (let ck = 0; ck < classes.length; ck++) {
            const slot = classes[ck].timetable.ds_Ca[c].ds_Ngay[d].ds_Tiet[t]
            if (slot.teacherId === srcLesson.teacherId && !(ck === dragging.value.ki && c === dragging.value.ci && d === dragging.value.di && t === dragging.value.ti)) {
              conflict = true
              break
            }
          }
          if (!conflict && canSwap(dragging.value, { ki: k, ci: c, di: d, ti: t })) {
            validCells.add(key(k, c, d, t))
          }
        }
      }
    }
  }
}

function cellClass(ki, ci, di, ti) {
  const base = []
  const lesson = classes[ki].timetable.ds_Ca[ci].ds_Ngay[di].ds_Tiet[ti]
  if (lesson.isBreak) base.push('bg-gray-100 text-red-600 border-black')
  if (validCells.has(key(ki, ci, di, ti))) base.push('bg-green-50')
  return base.join(' ')
}

onMounted(() => {
  classes.push(...getData())
  teachers.push(...buildTeacherSchedules())
  if (classes.length) selectedClassId.value = classes[0].id
  if (teachers.length) selectedTeacherId.value = teachers[0].id
})

function getData() {
  return timetableData
}

function buildTeacherSchedules() {
  const result = {}
  const sampleCa = classes[0]?.timetable.ds_Ca[0]
  const daysCount = sampleCa ? sampleCa.ds_Ngay.length : 0
  const periodsCount = sampleCa ? sampleCa.ds_Ngay[0].ds_Tiet.length : 0
  function initTeacher(id, name) {
    const teacher = {
      id,
      name,
      ds_Ca: [
        { id: 1, ds_Ngay: [] },
        { id: 2, ds_Ngay: [] }
      ]
    }
    for (let c = 0; c < 2; c++) {
      for (let d = 0; d < daysCount; d++) {
        const day = { id: d + 1, ten: `Thứ ${d + 2}`, ds_Tiet: [] }
        for (let t = 0; t < periodsCount; t++) {
          day.ds_Tiet.push({ subject: '', className: '', isBreak: false })
        }
        teacher.ds_Ca[c].ds_Ngay.push(day)
      }
    }
    result[id] = teacher
  }

  classes.forEach(klass => {
    klass.timetable.ds_Ca.forEach((ca, ci) => {
      ca.ds_Ngay.forEach((day, di) => {
        day.ds_Tiet.forEach((tiet, ti) => {
          if (!result[tiet.teacherId]) {
            initTeacher(tiet.teacherId, tiet.teacher)
          }
          const target = result[tiet.teacherId].ds_Ca[ci].ds_Ngay[di].ds_Tiet[ti]
          Object.assign(target, { subject: tiet.subject, className: klass.name, isBreak: tiet.isBreak })
        })
      })
    })
  })

  return Object.values(result)
}
</script>

<style scoped>
</style>
