<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <a-card title="DANH SÁCH LỚP" class="md:col-span-1">
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
    </a-card>

    <a-card v-if="selectedId" title="CÁC TIẾT NGHỈ" class="md:col-span-1">
      <div v-if="schedule" class="space-y-4">
        <div v-for="block in schedule.ds_Ca" :key="block.id">
          <Timetable :block="block" />
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-2">
        <a-button type="primary" :loading="saving" @click="handleSave">Lưu</a-button>
        <a-button danger @click="reset">Hủy</a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup>
const { RestApi } = useApi()

const classes = ref([])
const loading = ref(false)
const selectedId = ref(null)
const schedule = ref()
const saving = ref(false)

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

async function selectClass(record) {
  if (!record) return
  selectedId.value = record.id
  try {
    const { data } = await RestApi.class.get_break({ params: { Id: record.id } })
    if (data.value?.status === 'success') {
      schedule.value = data.value.data
    }
  } catch (err) {
    console.error('Fetch class detail error', err)
  }
}

async function handleSave() {
  if (!selectedId.value) return
  try {
    saving.value = true
    const payload = {
      id_lop: selectedId.value,
      ds_Ca: schedule.value?.ds_Ca || [],
    }
    const { data, error } = await RestApi.class.update_break({ body: payload })
    if (data.value?.status === 'success') {
      message.success(data.value.message || 'Cập nhật thành công')
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || 'Cập nhật không thành công')
    }
  } catch (err) {
    console.error('Update class error', err)
    message.error(err.message || 'Lỗi cập nhật')
  } finally {
    saving.value = false
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
      selectClass(record)
    },
    style: {
      cursor: 'pointer',
    },
  }
}

const reset = () => {
  selectedId.value = null
  schedule.value = undefined
}

const refresh = async () => {
  await fetchClasses()
}

defineExpose({
  reset,
  refresh,
})

onMounted(fetchClasses)
</script>

<style scoped></style>
