import { defineStore } from 'pinia'

let nextId = 0

export const useTimetableStore = defineStore('timetable', {
  state: () => ({
    timetables: {}
  }),
  actions: {
    register(timetable) {
      const id = nextId++
      this.timetables[id] = timetable
      return id
    },
    unregister(id) {
      delete this.timetables[id]
    },
    getCell(tb, row, col) {
      let offset = 0
      for (const session of tb) {
        if (row >= offset && row < offset + session.data.length) {
          return session.data[row - offset][col]
        }
        offset += session.data.length
      }
      return null
    },
    checkTeacherConflict(row, col, teacher, id) {
      if (!teacher) return false
      for (const key in this.timetables) {
        if (Number(key) === id) continue
        const cell = this.getCell(this.timetables[key], row, col)
        if (cell && cell.teacher === teacher) return true
      }
      return false
    }
  }
})
