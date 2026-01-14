<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <a-card title="DANH SÁCH LỚP ÔN TẬP" class="md:col-span-1">
      <div class="mb-2">
        <SelectGradeLevelByUnit v-model="gradeId" />
      </div>
      <a-table :columns="columns" :data-source="classes" :loading="loading" :pagination="pagination" size="small" row-key="id" @change="handleTableChange" :customRow="onRow" :row-class-name="rowClassName">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-else-if="column.key === 'ma'">{{ record.ma }}</template>
          <template v-else-if="column.key === 'ten'">{{ record.ten }}</template>
          <template v-else-if="column.key === 'ten_khoi'">{{ record.ten_khoi }}</template>
        </template>
      </a-table>
    </a-card>

    <a-card v-if="selectedId" :title="'Các tiết tránh xếp của lớp ôn tập: ' + selectedClass.ten" class="md:col-span-2">
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
const { RestApi } = useApi();

const classes = ref([]);
const selectedClass = ref({});
const loading = ref(false);
const selectedId = ref(null);
const schedule = ref();
const saving = ref(false);
const gradeId = ref(null);

const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã lớp ôn tập", dataIndex: "ma", key: "ma" },
  { title: "Tên lớp ôn tập", dataIndex: "ten", key: "ten" },
  { title: "Khối", dataIndex: "ten_khoi", key: "ten_khoi" },
];

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

async function fetchClasses() {
  try {
    loading.value = true;
    const params = {
      pageIndex: pagination.current,
      pageSize: pagination.pageSize,
    };
    if (gradeId.value) {
      params.id_khoi = gradeId.value;
    }
    const { data } = await RestApi.review_class.list({ params });
    if (data.value?.status === "success") {
      classes.value = data.value.data.items || [];
      pagination.total = data.value.data.totalrecord || 0;
    } else {
      classes.value = [];
      pagination.total = 0;
    }
  } catch (err) {
    message.error(err.message || "Fetch review classes error");
  } finally {
    loading.value = false;
  }
}

async function selectClass(record) {
  if (!record) return;
  selectedClass.value = record;
  selectedId.value = record.id;
  schedule.value = undefined;
  try {
    const { data } = await RestApi.review_class.get_break({ params: { id: record.id } });
    if (data.value?.status === "success") {
      schedule.value = data.value.data;
    } else {
      schedule.value = undefined;
    }
  } catch (err) {
    message.error(err.message || "Fetch review class avoid error");
  }
}

async function handleSave() {
  if (!selectedId.value) return;
  try {
    saving.value = true;
    const payload = {
      id: selectedId.value,
      ds_Ca: schedule.value?.ds_Ca || [],
    };
    const { data, error } = await RestApi.review_class.update_break({ body: payload });
    if (data.value?.status === "success") {
      message.success(data.value.message || "Cập nhật thành công");
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Cập nhật không thành công");
    }
  } catch (err) {
    // console.error("Update review class avoid error", err);
    message.error(err.message || "Lỗi cập nhật");
  } finally {
    saving.value = false;
  }
}

async function handleTableChange(pag) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  await fetchClasses();
}

const onRow = record => {
  return {
    onClick: () => {
      selectClass(record);
    },
    style: {
      cursor: "pointer",
    },
  };
};

const rowClassName = record => (record.id === selectedId.value ? "active-row" : "");

const reset = () => {
  selectedId.value = null;
  selectedClass.value = {};
  schedule.value = undefined;
};

const refresh = async () => {
  await fetchClasses();
};

defineExpose({
  reset,
  refresh,
});

watch(gradeId, async () => {
  pagination.current = 1;
  reset();
  await fetchClasses();
});

onMounted(fetchClasses);
</script>

<style scoped>
:deep(.active-row > td) {
  background-color: #e6f7ff !important;
}
</style>
