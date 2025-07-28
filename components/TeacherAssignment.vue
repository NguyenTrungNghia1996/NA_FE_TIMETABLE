<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <a-card title="DANH SÁCH GIÁO VIÊN" class="md:col-span-1">
      <a-table :columns="columns" :data-source="teachers" :loading="loading" :pagination="pagination" size="small" row-key="id" @change="handleTableChange" :customRow="onRow">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-if="column.key === 'code'">
            {{ record.ma_giao_vien }}
          </template>
          <template v-if="column.key === 'name'"> {{ record.ho_va_ho_dem }} {{ record.ten }} </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>
<script setup>
const { RestApi } = useApi();

const teachers = ref([]);
const loading = ref(false);
const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã giáo viên", key: "code" },
  { title: "Họ và tên", key: "name" },
];

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

async function fetchTeachers() {
  try {
    loading.value = true;
    const { data } = await RestApi.teacher.list({
      params: {
        PageIndex: pagination.current,
        PageSize: pagination.pageSize,
      },
    });
    if (data.value?.status === "success") {
      teachers.value = data.value.data.items || [];
      pagination.total = data.value.data.totalrecord;
    } else {
      teachers.value = [];
      pagination.total = 0;
    }
  } catch (err) {
    console.error("Fetch teachers error", err);
  } finally {
    loading.value = false;
  }
}

async function handleTableChange(pag) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  await fetchTeachers();
}
async function selectTeacher(record) {
  // TODO: handle teacher selection
}
const onRow = record => {
  return {
    onClick: () => {
      selectTeacher(record);
    },
    style: {
      cursor: "pointer",
    },
  };
};


onMounted(fetchTeachers);
</script>
