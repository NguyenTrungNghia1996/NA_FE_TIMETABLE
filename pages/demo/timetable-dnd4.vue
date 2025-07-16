<template>
  <div class="p-4 bg-white space-y-8">
    <div class="flex space-x-4">
      <a-select v-model:value="selectedClassId" class="w-40" id="class-select">
        <a-select-option v-for="k in classes" :key="k.id" :value="k.id">
          {{ k.name }}
        </a-select-option>
      </a-select>
    </div>
    <ClassTimetable :klass="currentClass" />
  </div>
</template>

<script setup>

const timetable = useTimetableStore()
const {
  classes,
  selectedClassId,
  currentClass
} = storeToRefs(timetable)

onMounted(async () => {
  await timetable.init()
})
</script>

<style scoped></style>
