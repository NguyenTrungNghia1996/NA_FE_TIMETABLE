<template>
  <a-table
    :columns="columns"
    :data-source="subjects"
    :pagination="false"
    size="small"
    row-key="id_mon"
  >
    <template #bodyCell="{ column, index }">
      <template v-if="column.key === 'stt'">{{ index + 1 }}</template>
    </template>
  </a-table>
</template>

<script setup>
const props = defineProps({ classId: Number })
const { RestApi } = useApi()

const subjects = ref([])
const columns = [
  { title: 'STT', key: 'stt', width: 60, align: 'center' },
  { title: 'Tên môn học', dataIndex: 'ten_mon', key: 'name' },
]

async function fetchSubjects(id) {
  try {
    const { data } = await RestApi.class.get_subjects({ params: { idLop: id } })
    if (data.value?.status === 'success') {
      subjects.value = data.value.data.items?.ds_mon || []
    } else {
      subjects.value = []
    }
  } catch (err) {
    console.error('Fetch class subjects error', err)
  }
}

watch(
  () => props.classId,
  async id => {
    if (id) await fetchSubjects(id)
    else subjects.value = []
  },
  { immediate: true },
)

const reset = () => {
  subjects.value = []
}

const refresh = async () => {
  if (props.classId) await fetchSubjects(props.classId)
}

defineExpose({ reset, refresh })
</script>
