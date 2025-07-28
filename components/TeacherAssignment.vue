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
  console.log("🚀 ~ selectTeacher ~ record:", record)
  // if (!record) return;
  // selectedId.value = record.id;
  // try {
  //   const { data } = await RestApi.teacher.get_avoid({ params: { Id: record.id } });
  //   if (data.value?.status === "success") {
  //     schedule.value = data.value.data;
  //     onlyOneShift.value = !!data.value.data.chi_day_mot_buoi;
  //     maxPeriod.value = data.value.data.so_tiet_toi_da || 0;
  //     teaching_session.value = data.value.data.id_buoi_day || 0;
  //   }
  // } catch (err) {
  //   console.error("Fetch teacher detail error", err);
  // }
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

const reset = () => {
  selectedId.value = null;
  schedule.value = undefined;
  onlyOneShift.value = false;
  maxPeriod.value = 0;
  teaching_session.value = null;
};

defineExpose({
  reset,
});

onMounted(fetchTeachers);
</script>
