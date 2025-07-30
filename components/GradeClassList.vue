<template>
  <div class="space-y-4">
    <SelectGradeLevel v-model="gradeId" />
    <a-table
      :columns="columns"
      :data-source="classes"
      :loading="loading"
      :pagination="false"
      size="small"
      row-key="id"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'stt'">{{ index + 1 }}</template>
        <template v-else-if="column.key === 'name'">{{ record.ten }}</template>
        <template v-else-if="column.key === 'teacher'">{{ record.ten_giao_vien }}</template>
        <template v-else-if="column.key === 'shift'">{{ record.ten_ca }}</template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
const { RestApi } = useApi()

const gradeId = ref(null)
const classes = ref([])
const loading = ref(false)

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
  },
  { immediate: true },
)

const reset = () => {
  gradeId.value = null
  classes.value = []
}

const refresh = async () => {
  await fetchClasses(gradeId.value)
}

defineExpose({ reset, refresh })
</script>
