<template>
  <div class="space-y-4">
    <SelectGradeLevel v-model="gradeId" />
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <a-card title="DANH SÁCH GIÁO VIÊN" class="md:col-span-1">
        <a-table
          :columns="columns"
          :data-source="classes"
          :loading="loading"
          :pagination="false"
          size="small"
          row-key="id"
          :customRow="onRow"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'stt'">{{ index + 1 }}</template>
            <template v-else-if="column.key === 'name'">{{ record.ten }}</template>
            <template v-else-if="column.key === 'teacher'">{{ record.ten_giao_vien }}</template>
            <template v-else-if="column.key === 'shift'">{{ record.ten_ca }}</template>
          </template>
        </a-table>
      </a-card>

      <a-card title="Danh sách môn học" class="md:col-span-1">
        <ClientOnly>
          <SubjectList v-if="selectedClassId" ref="subjectRef" :class-id="selectedClassId" />
          <a-empty v-else />
        </ClientOnly>
      </a-card>
    </div>
  </div>
</template>

<script setup>
const { RestApi } = useApi()
import SubjectList from './SubjectList.vue'

const gradeId = ref(null)
const classes = ref([])
const loading = ref(false)
const selectedClassId = ref(null)
const subjectRef = ref(null)

const columns = [
  { title: 'STT', key: 'stt', width: 60, align: 'center' },
  { title: 'Tên lớp', key: 'name' },
  { title: 'Giáo viên chủ nhiệm', key: 'teacher' },
  { title: 'Ca học', key: 'shift' },
]

async function fetchClasses(id) {
  if (!id) {
    classes.value = []
    return
  }
  try {
    loading.value = true
    const { data } = await RestApi.class.list({ params: { id_khoilop: id } })
    if (data.value?.status === 'success') {
      classes.value = data.value.data.items || []
    } else {
      classes.value = []
    }
  } catch (err) {
    console.error('Fetch classes by grade error', err)
  } finally {
    loading.value = false
  }
}

watch(
  gradeId,
  id => {
    fetchClasses(id)
    selectedClassId.value = null
    subjectRef.value?.reset?.()
  },
  { immediate: true },
)

const reset = () => {
  gradeId.value = null
  classes.value = []
  selectedClassId.value = null
  subjectRef.value?.reset?.()
}

const refresh = async () => {
  await fetchClasses(gradeId.value)
  if (selectedClassId.value) {
    await subjectRef.value?.refresh?.()
  }
}

const onRow = record => {
  return {
    onClick: () => {
      selectedClassId.value = record.id
    },
    style: {
      cursor: 'pointer',
    },
  }
}

defineExpose({ reset, refresh })
</script>
