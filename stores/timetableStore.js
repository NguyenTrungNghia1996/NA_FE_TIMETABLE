import { defineStore } from 'pinia'

const teachers = [
  { id: 1, name: 'Cô Bình', subject: 'Văn' },
  { id: 2, name: 'PT Thoản', subject: 'Anh' },
  { id: 3, name: 'Thầy An', subject: 'Toán' },
  { id: 4, name: 'Thầy Cường', subject: 'Lý' },
  { id: 5, name: 'Cô Dung', subject: 'Hóa' }
]

const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6']
const periods = [1, 2, 3, 4, 5]

function generateTimetable(offset) {
  const ds_Ca = [1, 2].map(caId => ({
    id: caId,
    ds_Ngay: days.map((day, dIndex) => ({
      id: dIndex + 1,
      ten: day,
      ds_Tiet: periods.map(p => {
        const teacher = teachers[(dIndex + p + offset - 1) % teachers.length]
        return {
          id: p,
          ten: `Tiết ${p}`,
          subject: teacher.subject,
          teacher: teacher.name,
          teacherId: teacher.id,
          isBreak: false
        }
      })
    }))
  }))
  return { ds_Ca }
}

function getTimetableForClass(index) {
  return generateTimetable(index)
}

function findSlot(tt, caId, dayId, periodId) {
  return tt.ds_Ca
    .find(ca => ca.id === caId)?.ds_Ngay
    .find(day => day.id === dayId)?.ds_Tiet
    .find(tiet => tiet.id === periodId)
}

export const useTimetableStore = defineStore('timetable', {
  state: () => ({
    currentClassId: 1,
    classes: [
      { id: 1, name: 'Lớp 11A1', timetable: getTimetableForClass(0) },
      { id: 2, name: 'Lớp 11A2', timetable: getTimetableForClass(1) },
      { id: 3, name: 'Lớp 11A3', timetable: getTimetableForClass(2) }
    ]
  }),
  getters: {
    currentTimetable: state =>
      state.classes.find(c => c.id === state.currentClassId)?.timetable
  },
  actions: {
    setCurrentClass(id) {
      this.currentClassId = id
    },
    isTeacherBusy(teacherId, caId, dayId, periodId, excludeClassId) {
      return this.classes.some(cls => {
        if (excludeClassId && cls.id === excludeClassId) return false
        const slot = findSlot(cls.timetable, caId, dayId, periodId)
        return slot && slot.teacherId === teacherId
      })
    },
    assignLesson(classId, caId, dayId, periodId, teacher) {
      if (this.isTeacherBusy(teacher.id, caId, dayId, periodId, classId))
        return false
      const cls = this.classes.find(c => c.id === classId)
      if (!cls) return false
      const slot = findSlot(cls.timetable, caId, dayId, periodId)
      if (!slot) return false
      slot.subject = teacher.subject
      slot.teacher = teacher.name
      slot.teacherId = teacher.id
      slot.isBreak = false
      return true
    }
  }
})
