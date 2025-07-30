<template>
  <a-table
    :columns="columns"
    :data-source="classes"
    :loading="loading"
    :pagination="pagination"
    size="small"
    row-key="id"
    @change="handleTableChange"
    :customRow="onRow"
  >
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'stt'">
        {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
      </template>
      <template v-else-if="column.key === 'name'">{{ record.ten }}</template>
      <template v-else-if="column.key === 'grade'">{{ record.ten_khoi }}</template>
    </template>
  </a-table>
</template>

<script setup>
const { RestApi } = useApi()
const emit = defineEmits(['select'])

const classes = ref([])
const loading = ref(false)
const columns = [
  { title: 'STT', key: 'stt', width: 60, align: 'center' },
  { title: 'Tên lớp', key: 'name' },
  { title: 'Khối', key: 'grade' },
]
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: total => `Tổng ${total} bản ghi`,
})

async function fetchClasses() {
  try {
    loading.value = true
    const { data } = await RestApi.class.list({
      params: {
        PageIndex: pagination.current,
        PageSize: pagination.pageSize,
      },
    })
    if (data.value?.status === 'success') {
      classes.value = data.value.data.items || []
      pagination.total = data.value.data.totalrecord
    } else {
      classes.value = []
      pagination.total = 0
    }
  } catch (err) {
    console.error('Fetch classes error', err)
  } finally {
    loading.value = false
  }
}

async function handleTableChange(pag) {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  await fetchClasses()
}

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

const reset = () => {
  classes.value = []
  pagination.current = 1
  pagination.pageSize = 10
  pagination.total = 0
}

const refresh = async () => {
  await fetchClasses()
}

defineExpose({ reset, refresh })
onMounted(fetchClasses)
</script>
