<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-1 space-y-4">
    <div>
      <SelectGradeLevel v-model="gradeId" />
      <a-card title="DANH SÁCH LỚP">
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
            <template v-else-if="column.key === 'teacher'">{{ record.ten_giao_vien }}</template>
            <template v-else-if="column.key === 'shift'">{{ record.ten_ca }}</template>
          </template>
        </a-table>
      </a-card>
    </div>
    <div>
      <a-card title="DANH SÁCH MÔN HỌC">
        <a-table
          :columns="subjectColumns"
          :data-source="subjects"
          :loading="subjectLoading"
          :pagination="false"
          size="small"
          row-key="id"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'stt'">{{ index + 1 }}</template>
            <template v-else-if="column.key === 'action'">
              <a-switch v-model:checked="record.selected" size="small" />
            </template>
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
const selectedClassId = ref(null)
const subjects = ref([])
const subjectLoading = ref(false)

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

const subjectColumns = [
  { title: 'STT', key: 'stt', width: 60, align: 'center' },
  { title: 'Tên môn', dataIndex: 'ten_mon', key: 'name' },
  { title: 'Giáo viên', dataIndex: 'ten_giao_vien', key: 'teacher' },
  { title: 'Số tiết/tuần', dataIndex: 'so_tiet_tuan', key: 'weekly', align: 'center' },
  {
    title: 'Phòng học truyền thống',
    children: [
      { title: 'Phòng học', dataIndex: 'phong_truyen_thong', key: 'tradRoom', align: 'center' },
      { title: 'Ca sáng', dataIndex: 'sang_trad', key: 'tradMorning', align: 'center' },
      { title: 'Ca chiều', dataIndex: 'chieu_trad', key: 'tradAfternoon', align: 'center' },
    ],
  },
  {
    title: 'Phòng bộ môn',
    children: [
      { title: 'Phòng học', dataIndex: 'phong_bo_mon', key: 'specRoom', align: 'center' },
      { title: 'Ca sáng', dataIndex: 'sang_spec', key: 'specMorning', align: 'center' },
      { title: 'Ca chiều', dataIndex: 'chieu_spec', key: 'specAfternoon', align: 'center' },
    ],
  },
  { title: 'Chọn', key: 'action', width: 80, align: 'center' },
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
  selectedClassId.value = null
  subjects.value = []
  pagination.current = 1
  pagination.total = 0
}

const refresh = async () => {
  await fetchClasses(gradeId.value)
  if (selectedClassId.value) {
    await fetchSubjects(selectedClassId.value)
  }
}

async function fetchSubjects(id) {
  if (!id) {
    subjects.value = []
    return
  }
  try {
    subjectLoading.value = true
    const { data } = await RestApi.class.get_subjects({ params: { idLop: id } })
    if (data.value?.status === 'success') {
      subjects.value = data.value.data || []
    } else {
      subjects.value = []
    }
  } catch (err) {
    console.error('Fetch subjects error', err)
  } finally {
    subjectLoading.value = false
  }
}

async function handleTableChange(pag) {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  await fetchClasses(gradeId.value)
}

defineExpose({ reset, refresh })
const onRow = record => {
  return {
    onClick: () => {
      selectedClassId.value = record.id
      fetchSubjects(record.id)
    },
    style: {
      cursor: 'pointer',
    },
  }
}
</script>
