import { ref, reactive } from 'vue'
import { notification } from 'ant-design-vue'
import { useTimetableStore } from '~/stores/timetableStore'
import { storeToRefs } from 'pinia'

const dragging = ref(null)
const lastHover = ref(null)
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
    const timetable = useTimetableStore()
    const { classes } = storeToRefs(timetable)
    const lesson = classes.value[this.ki]?.timetable.ds_Ca[this.ci]?.ds_Ngay[this.di]?.ds_Tiet[this.ti]
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

export const useTimetableDnD = () => {
  const timetable = useTimetableStore()
  const { classes, teachers, teacherOptions, selectedTeacherId } = storeToRefs(timetable)

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
    const ki = classes.value.findIndex(c => c.name === className)
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
    lastHover.value = null
    const lesson = classes.value[ki].timetable.ds_Ca[ci].ds_Ngay[di].ds_Tiet[ti]
    highlightedTeacherId.value = lesson.teacherId
    highlightValidCells()
  }

  let touchMoveHandler
  let touchEndHandler

  function touchStart(e, ki, ci, di, ti) {
    dragStart(e, ki, ci, di, ti)
    touchMoveHandler = evt => touchMove(evt)
    touchEndHandler = evt => touchEnd(evt)
    document.addEventListener('touchmove', touchMoveHandler, { passive: false })
    document.addEventListener('touchend', touchEndHandler)
  }

  function touchMove(e) {
    const touch = e.touches[0]
    if (!touch) return
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    const cell = el && el.closest('td[data-ki]')
    if (cell) {
      const ki = Number(cell.dataset.ki)
      const ci = Number(cell.dataset.ci)
      const di = Number(cell.dataset.di)
      const ti = Number(cell.dataset.ti)
      dragEnter(e, ki, ci, di, ti)
      dragOver(e, ki, ci, di, ti)
    }
    e.preventDefault()
  }

  function touchEnd(e) {
    document.removeEventListener('touchmove', touchMoveHandler)
    document.removeEventListener('touchend', touchEndHandler)
    const touch = e.changedTouches[0]
    if (!touch) {
      dragEnd()
      return
    }
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    const cell = el && el.closest('td[data-ki]')
    if (cell) {
      const ki = Number(cell.dataset.ki)
      const ci = Number(cell.dataset.ci)
      const di = Number(cell.dataset.di)
      const ti = Number(cell.dataset.ti)
      drop(e, ki, ci, di, ti)
    } else {
      dragEnd()
    }
  }

  function dragOver(e, ki, ci, di, ti) {
    e.dataTransfer.dropEffect = validCells.has(key(ki, ci, di, ti)) ? 'move' : 'none'
  }

  function dragEnter(e, ki, ci, di, ti) {
    lastHover.value = { ki, ci, di, ti }
  }

  function drop(e, ki, ci, di, ti) {
    if (!dragging.value) return
    const destKey = key(ki, ci, di, ti)
    const destLesson = getLesson({ ki, ci, di, ti })
    if (!validCells.has(destKey)) {
      if (destLesson.isBreak) {
        showWarning('Không thể di chuyển vào tiết nghỉ')
      } else {
        const srcLesson = getLesson(dragging.value)
        const conflict = findConflictClass(srcLesson.teacherId, ci, di, ti, dragging.value)
        if (conflict) {
          showWarning(`Trùng tiết với lớp ${conflict}`)
        } else {
          showWarning('Không thể di chuyển tiết học vào ô này')
        }
      }
      dragging.value = null
      validCells.clear()
      return
    }
    const src = getLesson(dragging.value)
    const dest = destLesson
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
    teachers.value.splice(0, teachers.value.length, ...timetable.buildTeacherSchedules())
    if (!teachers.value.find(t => t.id === selectedTeacherId.value) && teachers.value.length) {
      selectedTeacherId.value = teachers.value[0].id
    }
  }

  function dragEnd() {
    if (!dragging.value) return
    if (lastHover.value) {
      const destKey = key(lastHover.value.ki, lastHover.value.ci, lastHover.value.di, lastHover.value.ti)
      const destLesson = getLesson(lastHover.value)
      if (!validCells.has(destKey)) {
        if (destLesson.isBreak) {
          showWarning('Không thể di chuyển vào tiết nghỉ')
        } else {
          const srcLesson = getLesson(dragging.value)
          const conflict = findConflictClass(srcLesson.teacherId, lastHover.value.ci, lastHover.value.di, lastHover.value.ti, dragging.value)
          if (conflict) {
            showWarning(`Trùng tiết với lớp ${conflict}`)
          } else {
            showWarning('Không thể di chuyển tiết học vào ô này')
          }
        }
      }
    } else {
      showWarning('Không thể di chuyển tiết học vào ô này')
    }
    dragging.value = null
    validCells.clear()
    lastHover.value = null
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
    teachers.value.splice(0, teachers.value.length, ...timetable.buildTeacherSchedules())
    if (!teachers.value.find(t => t.id === selectedTeacherId.value) && teachers.value.length) {
      selectedTeacherId.value = teachers.value[0].id
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
    teachers.value.splice(0, teachers.value.length, ...timetable.buildTeacherSchedules())
    if (!teachers.value.find(t => t.id === selectedTeacherId.value) && teachers.value.length) {
      selectedTeacherId.value = teachers.value[0].id
    }
    closeMenu()
  }

  function changeSubject() {
    const lesson = getLesson(contextMenu)
    const options = teacherOptions.value.filter(t => {
      if (t.id === lesson.teacherId) return true
      for (let k = 0; k < classes.value.length; k++) {
        const slot = classes.value[k].timetable.ds_Ca[contextMenu.ci].ds_Ngay[contextMenu.di].ds_Tiet[contextMenu.ti]
        if (slot.teacherId === t.id && !(k === contextMenu.ki && slot === lesson)) {
          return false
        }
      }
      const limit = classes.value[contextMenu.ki].limits?.[t.subject]
      if (limit !== undefined) {
        const count = subjectCount(contextMenu.ki, t.subject)
        const inc = t.subject === lesson.subject ? 0 : 1
        if (count + inc > limit) return false
      }
      return true
    })
    options.sort((a, b) => {
      const aSame = a.subject === lesson.subject
      const bSame = b.subject === lesson.subject
      if (aSame === bSame) return 0
      return aSame ? -1 : 1
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
      const lesson = classes.value[subjectSelect.ki].timetable.ds_Ca[subjectSelect.ci].ds_Ngay[subjectSelect.di].ds_Tiet[subjectSelect.ti]
      lesson.isBreak = false
      lesson.subject = option.subject
      lesson.teacher = option.name
      lesson.teacherId = option.id
      teachers.value.splice(0, teachers.value.length, ...timetable.buildTeacherSchedules())
      if (!teachers.value.find(t => t.id === selectedTeacherId.value) && teachers.value.length) {
        selectedTeacherId.value = teachers.value[0].id
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
    return classes.value[ki].timetable.ds_Ca[ci].ds_Ngay[di].ds_Tiet[ti]
  }

  function subjectCount(ki, subject) {
    let count = 0
    classes.value[ki].timetable.ds_Ca.forEach(ca => {
      ca.ds_Ngay.forEach(day => {
        day.ds_Tiet.forEach(p => {
          if (p.subject === subject) count++
        })
      })
    })
    return count
  }

  function findConflictClass(teacherId, ci, di, ti, src) {
    for (let k = 0; k < classes.value.length; k++) {
      const slot = classes.value[k].timetable.ds_Ca[ci].ds_Ngay[di].ds_Tiet[ti]
      if (slot.teacherId === teacherId && !(src && k === src.ki && ci === src.ci && di === src.di && ti === src.ti)) {
        return classes.value[k].name
      }
    }
    return null
  }

  function canSwap(src, dest) {
    if (src.ki === dest.ki) return true
    const srcLesson = getLesson(src)
    const destLesson = getLesson(dest)
    const destLimit = classes.value[dest.ki].limits?.[srcLesson.subject]
    if (destLimit !== undefined) {
      const destCount = subjectCount(dest.ki, srcLesson.subject)
      const inc = destLesson.subject === srcLesson.subject ? 0 : 1
      if (destCount + inc > destLimit) return false
    }
    const srcLimit = classes.value[src.ki].limits?.[destLesson.subject]
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
    for (let k = 0; k < classes.value.length; k++) {
      for (let c = 0; c < classes.value[k].timetable.ds_Ca.length; c++) {
        const days = classes.value[k].timetable.ds_Ca[c].ds_Ngay
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
    const lesson = classes.value[ki].timetable.ds_Ca[ci].ds_Ngay[di].ds_Tiet[ti]
    if (lesson.isBreak) base.push('bg-gray-100 text-red-600 border-black')
    if (validCells.has(key(ki, ci, di, ti))) base.push('bg-green-50')
    if (highlightedTeacherId.value && lesson.teacherId === highlightedTeacherId.value) {
      base.push('bg-yellow-100')
    }
    return base.join(' ')
  }

  function teacherCellClass(id, ci, di, ti, className) {
    const classIndex = className ? classes.value.findIndex(c => c.name === className) : -1
    const base = []
    if (classIndex >= 0 && validCells.has(key(classIndex, ci, di, ti))) {
      base.push('bg-green-50')
    }
    if (highlightedTeacherId.value === id && className) {
      base.push('bg-yellow-100')
    }
    return base.join(' ')
  }

  return {
    dragging,
    validCells,
    highlightedTeacherId,
    contextMenu,
    subjectSelect,
    selectTeacherLesson,
    teacherCellClick,
    dragStart,
    touchStart,
    touchMove,
    touchEnd,
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
    teacherCellClass
  }
}
