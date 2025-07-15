<template>
  <div class="p-4 bg-white space-y-8" @click="closeMenu">
    <div class="flex space-x-4">
      <a-select v-model:value="selectedClassId" class="w-40" id="class-select">
        <a-select-option v-for="k in classes" :key="k.id" :value="k.id">
          {{ k.name }}
        </a-select-option>
      </a-select>
      <a-select v-model:value="selectedTeacherId" class="w-40" id="teacher-select">
        <a-select-option v-for="t in teachers" :key="t.id" :value="t.id">
          {{ t.name }}
        </a-select-option>
      </a-select>
    </div>
    <div v-if="currentClass" class="space-y-4">
      <h2 class="text-lg font-bold">{{ currentClass.name }}</h2>
      <div class="flex flex-wrap gap-2 text-sm">
        <span v-for="stat in subjectStats" :key="stat.subject">
          {{ stat.subject }}: {{ stat.count }}/{{ stat.max }}
        </span>
      </div>
      <div v-for="(ca, caIndex) in currentClass.timetable.ds_Ca" :key="ca.id" class="space-y-2">
        <h3 class="font-semibold">Ca {{ ca.id }}</h3>
        <table class="min-w-full table-fixed border border-gray-200">
          <thead>
            <tr>
              <th class="border p-2 w-32">Tiết / Ngày</th>
              <th v-for="day in ca.ds_Ngay" :key="day.id" class="border p-2">
                {{ day.ten }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tiet, tIndex) in ca.ds_Ngay[0].ds_Tiet" :key="tiet.id">
              <td class="border p-2 text-center w-32 h-20">{{ tiet.ten }}</td>
              <td v-for="(day, dIndex) in ca.ds_Ngay" :key="day.id"
                  class="border p-2 text-center relative w-32 h-20 overflow-hidden"
                  :class="cellClass(currentClassIndex, caIndex, dIndex, tIndex)"
                  @dragstart="dragStart($event, currentClassIndex, caIndex, dIndex, tIndex)"
                  @dragover.prevent="dragOver($event, currentClassIndex, caIndex, dIndex, tIndex)"
                  @drop.prevent="drop($event, currentClassIndex, caIndex, dIndex, tIndex)"
                  @contextmenu.prevent="openMenu($event, currentClassIndex, caIndex, dIndex, tIndex)"
                  @click="day.ds_Tiet[tIndex].teacherId && selectTeacherLesson(day.ds_Tiet[tIndex].teacherId)"
                  :draggable="!day.ds_Tiet[tIndex].isBreak"
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

    <div v-if="currentTeacher" class="mt-10 space-y-4">
      <h2 class="text-lg font-bold">Bảng lịch giáo viên</h2>
      <div class="space-y-2">
        <h3 class="font-semibold">{{ currentTeacher.name }}</h3>
        <div v-for="(ca, ci) in currentTeacher.ds_Ca" :key="ci" class="space-y-1">
          <h4 class="font-medium">Ca {{ ca.id }}</h4>
          <table class="min-w-full table-fixed border border-gray-200 text-sm">
            <thead>
              <tr>
                <th class="border p-1 w-32">Tiết / Ngày</th>
                <th v-for="day in ca.ds_Ngay" :key="day.id" class="border p-1">{{ day.ten }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tiet, ti) in ca.ds_Ngay[0].ds_Tiet" :key="ti">
                <td class="border p-1 text-center w-32 h-20">Tiết {{ ti + 1 }}</td>
                <td v-for="(day, di) in ca.ds_Ngay" :key="di" class="border p-1 text-center w-32 h-20 overflow-hidden"
                    :class="teacherCellClass(currentTeacher.id, ci, di, ti, day.ds_Tiet[ti].className)"
                    @click="teacherCellClick(ci, di, ti, day.ds_Tiet[ti].className, currentTeacher.id)">
                  <span v-if="day.ds_Tiet[ti].className" class="line-clamp-2 block">
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
        <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" @click.stop="changeSubject()">Đổi môn học</li>
      </ul>
    </div>
    <a-modal
      v-model:open="subjectSelect.visible"
      title="Chọn môn học"
      @ok="confirmSubject"
      @cancel="cancelSubject"
      :footer="null"
    >
      <a-select v-model:value="subjectSelect.value" class="w-full">
        <a-select-option
          v-for="o in subjectSelect.options"
          :key="o.id + '-' + o.subject"
          :value="o.id + '-' + o.subject"
        >
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
import { reactive, ref, onMounted, computed } from 'vue'
import { notification } from 'ant-design-vue'
import timetableData from '~/public/data/timetable.json'

const classes = reactive([])
const teachers = reactive([])
const teacherOptions = ref([])
const selectedClassId = ref(null)
const selectedTeacherId = ref(null)
const currentClass = computed(() => classes.find(k => k.id === selectedClassId.value))
const currentClassIndex = computed(() => classes.findIndex(k => k.id === selectedClassId.value))
const currentTeacher = computed(() => teachers.find(t => t.id === selectedTeacherId.value))

const subjectStats = computed(() => {
  const klass = currentClass.value
  if (!klass) return []
  const counts = {}
  klass.timetable.ds_Ca.forEach(ca => {
    ca.ds_Ngay.forEach(day => {
      day.ds_Tiet.forEach(t => {
        if (!t.isBreak && t.subject) {
          counts[t.subject] = (counts[t.subject] || 0) + 1
        }
      })
    })
  })
  const limits = klass.limits || {}
  return Object.keys(limits).map(sub => ({ subject: sub, max: limits[sub], count: counts[sub] || 0 }))
})

const dragging = ref(null)
const validCells = reactive(new Set())
const highlightedTeacherId = ref(null)

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

const subjectSelect = reactive({
  visible: false,
  options: [],
  value: '',
  ki: 0,
  ci: 0,
  di: 0,
  ti: 0
})

function showWarning(content) {
  notification.warning({ message: 'Thông báo', description: content })
}

function selectTeacherLesson(id) {
  highlightedTeacherId.value = id
}

function teacherCellClick(ci, di, ti, className, teacherId) {
  highlightedTeacherId.value = teacherId
  if (!className) {
    dragging.value = null
    validCells.clear()
    return
  }
  const ki = classes.findIndex(c => c.name === className)
  if (ki === -1) {
    dragging.value = null
    validCells.clear()
    return
  }
  dragging.value = { ki, ci, di, ti }
  highlightValidCells()
}

function dragStart(e, ki, ci, di, ti) {
  dragging.value = { ki, ci, di, ti }
  const lesson = classes[ki].timetable.ds_Ca[ci].ds_Ngay[di].ds_Tiet[ti]
  highlightedTeacherId.value = lesson.teacherId
  highlightValidCells()
}

function dragOver(e, ki, ci, di, ti) {
  e.dataTransfer.dropEffect = validCells.has(key(ki, ci, di, ti)) ? 'move' : 'none'
}

function drop(e, ki, ci, di, ti) {
  if (!dragging.value) return
  const destKey = key(ki, ci, di, ti)
  if (!validCells.has(destKey)) {
    const srcLesson = getLesson(dragging.value)
    const conflict = findConflictClass(srcLesson.teacherId, ci, di, ti, dragging.value)
    if (conflict) {
      showWarning(`Trùng tiết với lớp ${conflict}`)
    } else {
      showWarning('Không thể di chuyển tiết học vào ô này')
    }
    dragging.value = null
    validCells.clear()
    return
  }
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
  subjectSelect.visible = false
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
    showWarning('Không thể đặt tiết nghỉ vì đã có tiết học')
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

function changeSubject() {
  const lesson = getLesson(contextMenu)
  const options = teacherOptions.value.filter(t => {
    if (t.id === lesson.teacherId) return true
    for (let k = 0; k < classes.length; k++) {
      const slot = classes[k].timetable.ds_Ca[contextMenu.ci].ds_Ngay[contextMenu.di].ds_Tiet[contextMenu.ti]
      if (slot.teacherId === t.id && !(k === contextMenu.ki && slot === lesson)) {
        return false
      }
    }
    const limit = classes[contextMenu.ki].limits?.[t.subject]
    if (limit !== undefined) {
      const count = subjectCount(contextMenu.ki, t.subject)
      const inc = t.subject === lesson.subject ? 0 : 1
      if (count + inc > limit) return false
    }
    return true
  })
  if (!options.length) {
    showWarning('Không có môn học phù hợp')
    closeMenu()
    return
  }
  subjectSelect.options = options
  subjectSelect.value = options[0].id + '-' + options[0].subject
  subjectSelect.ki = contextMenu.ki
  subjectSelect.ci = contextMenu.ci
  subjectSelect.di = contextMenu.di
  subjectSelect.ti = contextMenu.ti
  subjectSelect.visible = true
  contextMenu.visible = false
}

function confirmSubject() {
  const [idStr, subject] = subjectSelect.value.split('-')
  const id = Number(idStr)
  const option = subjectSelect.options.find(o => o.id === id && o.subject === subject)
  if (option) {
    const lesson = classes[subjectSelect.ki].timetable.ds_Ca[subjectSelect.ci].ds_Ngay[subjectSelect.di].ds_Tiet[subjectSelect.ti]
    lesson.isBreak = false
    lesson.subject = option.subject
    lesson.teacher = option.name
    lesson.teacherId = option.id
    teachers.splice(0, teachers.length, ...buildTeacherSchedules())
    if (!teachers.find(t => t.id === selectedTeacherId.value) && teachers.length) {
      selectedTeacherId.value = teachers[0].id
    }
  }
  subjectSelect.visible = false
}

function cancelSubject() {
  subjectSelect.visible = false
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

function findConflictClass(teacherId, ci, di, ti, src) {
  for (let k = 0; k < classes.length; k++) {
    const slot = classes[k].timetable.ds_Ca[ci].ds_Ngay[di].ds_Tiet[ti]
    if (slot.teacherId === teacherId && !(src && k === src.ki && ci === src.ci && di === src.di && ti === src.ti)) {
      return classes[k].name
    }
  }
  return null
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
          const conflict = findConflictClass(srcLesson.teacherId, c, d, t, dragging.value)
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
  if (highlightedTeacherId.value && lesson.teacherId === highlightedTeacherId.value) {
    base.push('bg-yellow-100')
  }
  return base.join(' ')
}

function teacherCellClass(id, ci, di, ti, className) {
  const classesIndex = className ? classes.findIndex(c => c.name === className) : -1
  const base = []
  if (classesIndex >= 0 && validCells.has(key(classesIndex, ci, di, ti))) {
    base.push('bg-green-50')
  }
  if (highlightedTeacherId.value === id && className) {
    base.push('bg-yellow-100')
  }
  return base.join(' ')
}

onMounted(() => {
  classes.push(...getData())
  teachers.push(...buildTeacherSchedules())
  teacherOptions.value = buildTeacherOptions()
  if (classes.length) selectedClassId.value = classes[0].id
  if (teachers.length) selectedTeacherId.value = teachers[0].id
})

function getData() {
  return timetableData
}

function buildTeacherOptions() {
  const map = {}
  classes.forEach(klass => {
    klass.timetable.ds_Ca.forEach(ca => {
      ca.ds_Ngay.forEach(day => {
        day.ds_Tiet.forEach(t => {
          if (!t.teacherId) return
          if (!map[t.teacherId]) {
            map[t.teacherId] = { id: t.teacherId, name: t.teacher, subject: t.subject }
          }
        })
      })
    })
  })
  return Object.values(map)
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
