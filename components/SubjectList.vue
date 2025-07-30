<template>
  <a-table
    :columns="columns"
    :data-source="subjects"
    :pagination="false"
    size="small"
    row-key="id_mon"
  >
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'stt'">
        {{ index + 1 }}
      </template>
      <template v-else-if="column.key === 'trad'">
        {{
          (record.so_tiet_ca_sang_truyen_thong || 0) +
            (record.so_tiet_ca_chieu_truyen_thong || 0)
        }}
      </template>
      <template v-else-if="column.key === 'spec'">
        {{
          (record.so_tiet_ca_sang_phong_chuyen_dung || 0) +
            (record.so_tiet_ca_chieu_phong_chuyen_dung || 0)
        }}
      </template>
      <template v-else-if="column.key === 'period'">
        {{
          (record.so_tiet_ca_sang_truyen_thong || 0) +
            (record.so_tiet_ca_chieu_truyen_thong || 0) +
            (record.so_tiet_ca_sang_phong_chuyen_dung || 0) +
            (record.so_tiet_ca_chieu_phong_chuyen_dung || 0)
        }}
      </template>
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
  {
    title: 'Tổng số tiết',
    children: [
      { title: 'Phòng truyền thống', key: 'trad', align: 'center' },
      { title: 'Phòng chuyên dụng', key: 'spec', align: 'center' },
    ],
  },
  { title: 'Số tiết', key: 'period', align: 'center' },
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
