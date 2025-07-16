<template>
  <div class="p-4 bg-white space-y-8">
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
    <ClassTimetable :klass="currentClass" :ki="currentClassIndex" />
    <TeacherTimetable :teacher="currentTeacher" />
  </div>
</template>

<script setup>
// import { onMounted } from 'vue'
// import { storeToRefs } from 'pinia'
// import { useTimetableStore } from '~/stores/timetableStore'
// import ClassTimetable from '~/components/ClassTimetable.vue'
// import TeacherTimetable from '~/components/TeacherTimetable.vue'

const timetable = useTimetableStore()
const {
  classes,
  teachers,
  selectedClassId,
  selectedTeacherId,
  currentClass,
  currentClassIndex,
  currentTeacher
} = storeToRefs(timetable)

onMounted(async () => {
  await timetable.init()
})
</script>

<style scoped></style>
