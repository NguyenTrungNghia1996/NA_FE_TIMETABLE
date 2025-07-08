export const useTimetable = () => {
  // constants
  const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu']
  const demoSubjects = ['Toán', 'Văn', 'Anh', 'Lý', 'Hóa', 'Sinh', 'Sử', 'Địa']

  const subjectTeacherMap = {
    Toán: 'GV2',
    Văn: 'GV3',
    Anh: 'GV1',
    Lý: 'GV4',
    Hóa: 'GV5',
    Sinh: 'GV3',
    Sử: 'GV5',
    Địa: 'GV4'
  }

  const teachers = [
    { id: 'GV1', name: 'PT Thoản' },
    { id: 'GV2', name: 'Thầy An' },
    { id: 'GV3', name: 'Cô Bình' },
    { id: 'GV4', name: 'Thầy Cường' },
    { id: 'GV5', name: 'Cô Dung' }
  ]

  const teacherMap = Object.fromEntries(teachers.map(t => [t.id, t.name]))
  const demoTeachers = teachers.map(t => `${t.id}. ${t.name}`)
  const teacherOptions = teachers.map(t => ({ label: `${t.id}. ${t.name}`, value: t.id }))

  const selectedTeacher = ref(teachers[0].id)

  const mainTeacherId = 'GV1'

  const teacherBusyMorning = [
    [
      { class: '', subject: '' },
      { class: '7B', subject: 'AN' },
      { class: '7C', subject: 'AN' },
      { class: '8C', subject: 'AN' },
      { class: '', subject: '' }
    ],
    [
      { class: '', subject: '' },
      { class: '6B', subject: 'AN' },
      { class: '9C', subject: 'AN' },
      { class: '', subject: '' },
      { class: '8A', subject: 'AN' }
    ],
    [
      { class: '9A', subject: 'AN' },
      { class: '', subject: '' },
      { class: '7A', subject: 'AN' },
      { class: '8B', subject: 'AN' },
      { class: '', subject: '' }
    ],
    [
      { class: '', subject: '' },
      { class: '9B', subject: 'AN' },
      { class: '', subject: '' },
      { class: '', subject: '' },
      { class: '9A', subject: 'AN' }
    ],
    [
      { class: '6C', subject: 'AN' },
      { class: '', subject: '' },
      { class: '7B', subject: 'AN' },
      { class: '', subject: '' },
      { class: '', subject: '' }
    ],
    [
      { class: '', subject: '' },
      { class: '', subject: '' },
      { class: '8B', subject: 'AN' },
      { class: '8A', subject: 'AN' },
      { class: '', subject: '' }
    ],
    [
      { class: '7C', subject: 'AN' },
      { class: '', subject: '' },
      { class: '', subject: '' },
      { class: '6C', subject: 'AN' },
      { class: '', subject: '' }
    ],
    [
      { class: '', subject: '' },
      { class: '', subject: '' },
      { class: '', subject: '' },
      { class: '', subject: '' },
      { class: '', subject: '' }
    ],
    [
      { class: '6B', subject: 'AN' },
      { class: '7A', subject: 'AN' },
      { class: '', subject: '' },
      { class: '', subject: '' },
      { class: '7B', subject: 'AN' }
    ],
  ]

  const teacherBusyAfternoon = [
    [
      { class: '', subject: '' },
      { class: '', subject: '' },
      { class: '8B', subject: 'AN' },
      { class: '8A', subject: 'AN' },
      { class: '', subject: '' }
    ],
    [
      { class: '7C', subject: 'AN' },
      { class: '', subject: '' },
      { class: '', subject: '' },
      { class: '6C', subject: 'AN' },
      { class: '', subject: '' }
    ],
    [
      { class: '', subject: '' },
      { class: '', subject: '' },
      { class: '', subject: '' },
      { class: '', subject: '' },
      { class: '', subject: '' }
    ],
    [
      { class: '6B', subject: 'AN' },
      { class: '7A', subject: 'AN' },
      { class: '', subject: '' },
      { class: '', subject: '' },
      { class: '7B', subject: 'AN' }
    ],
    [
      { class: '', subject: '' },
      { class: '', subject: '' },
      { class: '', subject: '' },
      { class: '', subject: '' },
      { class: '8A', subject: 'AN' }
    ],
  ]

  function teacherFree(teacher, row, col, cls, timetables) {
    if (teacher === mainTeacherId) {
      const slot = row < 5 ? teacherBusyMorning[row][col] : teacherBusyAfternoon[row - 5][col]
      if (slot.class && slot.class !== cls) return false
    }
    for (const key of Object.keys(timetables)) {
      if (key === cls) continue
      const other =
        row < 5 ? timetables[key].morning[row][col] : timetables[key].afternoon[row - 5][col]
      if (other.teacher === teacher && !other.isBreak) return false
    }
    return true
  }

  return {
    days,
    demoSubjects,
    demoTeachers,
    teacherOptions,
    selectedTeacher,
    teacherMap,
    subjectTeacherMap,
    teacherFree
  }
}
