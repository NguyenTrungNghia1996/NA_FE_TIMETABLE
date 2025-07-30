<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <a-card title="DANH SÁCH LỚP" class="md:col-span-1">
      <ClassList ref="classRef" @select="handleSelect" />
    </a-card>

    <a-card v-if="selectedId" title="DANH SÁCH MÔN HỌC" class="md:col-span-1">
      <SubjectList ref="subjectRef" :class-id="selectedId" />
    </a-card>
  </div>
</template>

<script setup>
import ClassList from './ClassList.vue'
import SubjectList from './SubjectList.vue'

const selectedId = ref(null)
const classRef = ref(null)
const subjectRef = ref(null)

const handleSelect = record => {
  selectedId.value = record.id
}

const reset = () => {
  selectedId.value = null
  classRef.value?.reset?.()
  subjectRef.value?.reset?.()
}

const refresh = async () => {
  await classRef.value?.refresh?.()
  if (selectedId.value) {
    await subjectRef.value?.refresh?.()
  }
}

defineExpose({ reset, refresh })
</script>
