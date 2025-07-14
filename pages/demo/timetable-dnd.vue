<template>
  <div class="p-4 space-y-8">
    <div v-for="klass in classes" :key="klass.id" class="space-y-4">
      <h2 class="text-lg font-bold">{{ klass.name }}</h2>
      <div v-for="(ca, caIndex) in klass.timetable.ds_Ca" :key="ca.id" class="space-y-2">
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
                  class="border p-2 text-center"
                  :class="cellClass(klassIndex(klass), caIndex, dIndex, tIndex)"
                  @dragstart="dragStart($event, klassIndex(klass), caIndex, dIndex, tIndex)"
                  @dragover.prevent="dragOver($event, klassIndex(klass), caIndex, dIndex, tIndex)"
                  @drop.prevent="drop($event, klassIndex(klass), caIndex, dIndex, tIndex)"
                  :draggable="!day.ds_Tiet[tIndex].isBreak"
              >
                <span v-if="!day.ds_Tiet[tIndex].isBreak">{{ day.ds_Tiet[tIndex].subject }}</span>
                <span v-else class="text-red-600">Nghỉ</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-10 space-y-4">
      <h2 class="text-lg font-bold">Bảng lịch giáo viên</h2>
      <div v-for="teacher in teachers" :key="teacher.id" class="space-y-2">
        <h3 class="font-semibold">{{ teacher.name }}</h3>
        <div v-for="(ca, ci) in teacher.ds_Ca" :key="ci" class="space-y-1">
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
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import timetableData from '~/public/data/timetable.json'

const classes = reactive([])
const teachers = reactive([])

function klassIndex(klass) {
  return classes.findIndex(k => k.id === klass.id)
}

const dragging = ref(null)
const validCells = reactive(new Set())

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
  ;[src.subject, dest.subject] = [dest.subject, src.subject]
  ;[src.teacher, dest.teacher] = [dest.teacher, src.teacher]
  ;[src.teacherId, dest.teacherId] = [dest.teacherId, src.teacherId]
  dragging.value = null
  validCells.clear()
  teachers.splice(0, teachers.length, ...buildTeacherSchedules())
}

function key(ki, ci, di, ti) {
  return `${ki}-${ci}-${di}-${ti}`
}

function getLesson({ ki, ci, di, ti }) {
  return classes[ki].timetable.ds_Ca[ci].ds_Ngay[di].ds_Tiet[ti]
}

function highlightValidCells() {
  validCells.clear()
  if (!dragging.value) return
  const lesson = getLesson(dragging.value)
  for (let k = 0; k < classes.length; k++) {
    for (let c = 0; c < classes[k].timetable.ds_Ca.length; c++) {
      const days = classes[k].timetable.ds_Ca[c].ds_Ngay
      for (let d = 0; d < days.length; d++) {
        const periods = days[d].ds_Tiet
        for (let t = 0; t < periods.length; t++) {
          if (periods[t].isBreak) continue
          const other = getLesson({ ki: k, ci: c, di: d, ti: t })
          if (other.teacherId === lesson.teacherId && !(k === dragging.value.ki && c === dragging.value.ci && d === dragging.value.di && t === dragging.value.ti)) continue
          let conflict = false
          for (let ck = 0; ck < classes.length; ck++) {
            const slot = classes[ck].timetable.ds_Ca[c].ds_Ngay[d].ds_Tiet[t]
            if (slot.teacherId === lesson.teacherId && !(ck === dragging.value.ki && c === dragging.value.ci && d === dragging.value.di && t === dragging.value.ti)) {
              conflict = true
              break
            }
          }
          if (!conflict) validCells.add(key(k, c, d, t))
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
