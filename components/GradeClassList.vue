<template>
  <div class="space-y-4">
    <SelectGradeLevel v-model="gradeId" />
    <div>
      <a-card title="DANH SÁCH GIÁO VIÊN">
        <a-table
          :columns="columns"
          :data-source="classes"
          :loading="loading"
          :pagination="pagination"
          size="small"
          row-key="id"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'stt'">
              {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
            </template>
            <template v-else-if="column.key === 'name'">{{ record.ten }}</template>
            <template v-else-if="column.key === 'teacher'">{{ record.ten_giao_vien }}</template>
            <template v-else-if="column.key === 'shift'">{{ record.ten_ca }}</template>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup>
const { RestApi } = useApi()

const gradeId = ref(null)
const classes = ref([])
const loading = ref(false)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: total => `Tổng ${total} bản ghi`,
})

const columns = [
  { title: 'STT', key: 'stt', width: 60, align: 'center' },
  { title: 'Tên lớp', key: 'name' },
  { title: 'Giáo viên chủ nhiệm', key: 'teacher' },
  { title: 'Ca học', key: 'shift' },
]

async function fetchClasses(id) {
  if (!id) {
    classes.value = []
    pagination.total = 0
    return
  }
  try {
    loading.value = true
    const { data } = await RestApi.class.list({
      params: {
        id_khoilop: id,
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
    console.error('Fetch classes by grade error', err)
  } finally {
    loading.value = false
  }
}

watch(
  gradeId,
  id => {
    pagination.current = 1
    fetchClasses(id)
  },
  { immediate: true },
)

const reset = () => {
  gradeId.value = null
  classes.value = []
  pagination.current = 1
  pagination.total = 0
}

const refresh = async () => {
  await fetchClasses(gradeId.value)
}

async function handleTableChange(pag) {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  await fetchClasses(gradeId.value)
}

defineExpose({ reset, refresh })
</script>
