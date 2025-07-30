<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <a-card title="DANH SÁCH LỚP" class="md:col-span-1">
      <ClassList ref="classRef" @select="handleSelectClass" />
    </a-card>
    <a-card v-if="selectedClassId" title="DANH SÁCH MÔN HỌC" class="md:col-span-1">
      <SubjectList ref="subjectRef" :class-id="selectedClassId" @select="handleSubjectClass" />
    </a-card>
    {{ selectedClassId }}/{{ selectedSubjectId }}
  </div>
</template>

<script setup>
const selectedClassId = ref(null);
const selectedSubjectId = ref(null);

const classRef = ref(null);
const subjectRef = ref(null);

const handleSelectClass = record => {
  selectedClassId.value = record.id;
};
const handleSubjectClass = record => {
  selectedSubjectId.value = record.id_mon;
};

const reset = () => {
  selectedId.value = null;
  classRef.value?.reset?.();
  subjectRef.value?.reset?.();
};

const refresh = async () => {
  await classRef.value?.refresh?.();
  if (selectedId.value) {
    await subjectRef.value?.refresh?.();
  }
};

defineExpose({ reset, refresh });
</script>
