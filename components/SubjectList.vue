<template>
  <a-table
    :columns="columns"
    :data-source="subjects"
    :pagination="false"
    size="small"
    row-key="id_mon"
    :customRow="onRow"
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
const emit = defineEmits(['select'])

const subjects = ref([])
// const selectedRowKeys = ref([])
// const rowSelection = reactive({
//   selectedRowKeys: selectedRowKeys.value,
//   onChange: keys => {
//     rowSelection.selectedRowKeys = keys
//     selectedRowKeys.value = keys
//   },
// })

// watch(
//   selectedRowKeys,
//   keys => {
//     rowSelection.selectedRowKeys = keys
//   },
//   { immediate: true },
// )
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
      subjects.value = data.value.data?.ds_mon || []
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

const onRow = record => {
  return {
    onClick: () => {
      emit('select', record)
    },
    style: {
      cursor: 'pointer',
    },
  }
}

</script>
