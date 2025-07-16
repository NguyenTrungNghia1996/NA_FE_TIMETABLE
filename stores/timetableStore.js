import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'

export const useTimetableStore = defineStore('timetable', {
  state: () => ({
    classes: [],
    teachers: [],
    teacherOptions: [],
    selectedClassId: null,
    selectedTeacherId: null
  }),
  getters: {
    currentClass: state => state.classes.find(c => c.id === state.selectedClassId)
  },
  actions: {
    async init() {
      const data = await $fetch('/data/timetable.json')
      this.classes = data
      this.teachers = this.buildTeacherSchedules()
      this.teacherOptions = this.buildTeacherOptions()
      if (this.classes.length) this.selectedClassId = this.classes[0].id
      if (this.teachers.length) this.selectedTeacherId = this.teachers[0].id
    },
    buildTeacherOptions() {
      const map = {}
      this.classes.forEach(klass => {
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
    },
    buildTeacherSchedules() {
      const result = {}
      const sampleCa = this.classes[0]?.timetable.ds_Ca[0]
      const daysCount = sampleCa ? sampleCa.ds_Ngay.length : 0
      const periodsCount = sampleCa ? sampleCa.ds_Ngay[0].ds_Tiet.length : 0
      function initTeacher(id, name) {
        const teacher = { id, name, ds_Ca: [{ id: 1, ds_Ngay: [] }, { id: 2, ds_Ngay: [] }] }
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
      this.classes.forEach(klass => {
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
  }
})
