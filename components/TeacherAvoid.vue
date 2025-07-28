<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <a-card title="DANH SÁCH GIÁO VIÊN" class="md:col-span-1">
      <a-table
        :columns="columns"
        :data-source="teachers"
        :loading="loading"
        :pagination="pagination"
        size="small"
        row-key="id"
        @change="handleTableChange"
        @rowClick="selectTeacher"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-if="column.key === 'code'">
            {{ record.ma_giao_vien }}
          </template>
          <template v-if="column.key === 'name'">
            {{ record.ho_va_ho_dem }} {{ record.ten }}
          </template>
        </template>
      </a-table>
    </a-card>

    <a-card title="CÁC TIẾT HỌC TRÁNH XẾP" class="md:col-span-1">
      <div class="mb-4 flex items-center gap-2">
        <a-checkbox v-model:checked="onlyOneShift">Chỉ dạy 1 buổi/ngày</a-checkbox>
      </div>
      <div class="mb-4 flex items-center gap-2">
        <span>Số tiết tối đa/ngày:</span>
        <a-input-number v-model:value="maxPeriod" :min="1" />
      </div>
      <div v-if="schedule" class="space-y-4">
        <div v-for="block in schedule.ds_Ca" :key="block.id">
          <Timetable :block="block" />
        </div>
      </div>
      <div class="text-right">
        <a-button type="primary" :loading="saving" @click="handleSave">Lưu</a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import Timetable from './Timetable.vue'
const { RestApi } = useApi()

const teachers = ref([])
const loading = ref(false)
const selectedId = ref(null)
const schedule = ref()
const onlyOneShift = ref(false)
const maxPeriod = ref(10)
const saving = ref(false)

const columns = [
  { title: 'STT', key: 'stt', width: 60, align: 'center' },
  { title: 'Mã giáo viên', key: 'code' },
  { title: 'Họ và tên', key: 'name' }
]

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: total => `Tổng ${total} bản ghi`
})

async function fetchTeachers() {
  try {
    loading.value = true
    const { data } = await RestApi.teacher.list({
      params: {
        PageIndex: pagination.current,
        PageSize: pagination.pageSize
      }
    })
    if (data.value?.status === 'success') {
      teachers.value = data.value.data.items || []
      pagination.total = data.value.data.totalrecord
    } else {
      teachers.value = []
      pagination.total = 0
    }
  } catch (err) {
    console.error('Fetch teachers error', err)
  } finally {
    loading.value = false
  }
}

async function selectTeacher(record) {
  if (!record) return
  selectedId.value = record.id
  try {
    const { data } = await RestApi.teacher.get_avoid({ params: { Id: record.id } })
    if (data.value?.status === 'success') {
      schedule.value = data.value.data
      onlyOneShift.value = !!data.value.data.chi_day_mot_buoi
      maxPeriod.value = data.value.data.so_tiet_toi_da || 0
    }
  } catch (err) {
    console.error('Fetch teacher detail error', err)
  }
}

async function handleSave() {
  if (!selectedId.value) return
  try {
    saving.value = true
    const payload = {
      id_giao_vien: selectedId.value,
      chi_day_mot_buoi: onlyOneShift.value,
      so_tiet_toi_da: maxPeriod.value,
      ds_Ca: schedule.value?.ds_Ca || []
    }
    await RestApi.teacher.update_avoid({ body: payload })
    message.success('Cập nhật thành công')
  } catch (err) {
    console.error('Update teacher error', err)
    message.error('Lỗi cập nhật')
  } finally {
    saving.value = false
  }
}

async function handleTableChange(pag) {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  await fetchTeachers()
}

onMounted(fetchTeachers)
</script>

<style scoped>
</style>
