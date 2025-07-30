<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <a-card title="DANH SÁCH LỚP" class="md:col-span-1">
      <a-table :columns="columns" :data-source="classes" :loading="loading" :pagination="pagination" size="small" row-key="id" @change="handleTableChange" :customRow="onRow">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-else-if="column.key === 'name'">{{ record.ten }}</template>
          <template v-else-if="column.key === 'grade'">{{ record.ten_khoi }}</template>
        </template>
      </a-table>
    </a-card>

    <a-card v-if="selectedId" title="DANH SÁCH MÔN HỌC" class="md:col-span-1">
      <a-table
        :columns="subjectColumns"
        :data-source="subjects"
        :pagination="false"
        size="small"
        row-key="id_mon"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">{{ index + 1 }}</template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
const { RestApi } = useApi();

const classes = ref([]);
const loading = ref(false);
const selectedId = ref(null);
const subjects = ref([]);
const subjectColumns = [
  { title: 'STT', key: 'stt', width: 60, align: 'center' },
  { title: 'Tên môn học', dataIndex: 'ten_mon', key: 'name' },
];
const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Tên lớp", key: "name" },
  { title: "Khối", key: "grade" },
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
    const { data } = await RestApi.class.list({
      params: {
        PageIndex: pagination.current,
        PageSize: pagination.pageSize,
      },
    });
    if (data.value?.status === "success") {
      classes.value = data.value.data.items || [];
      pagination.total = data.value.data.totalrecord;
    } else {
      classes.value = [];
      pagination.total = 0;
    }
  } catch (err) {
    console.error("Fetch classes error", err);
  } finally {
    loading.value = false;
  }
}

async function fetchSubjects(id) {
  try {
    const { data } = await RestApi.class.get_subjects({ params: { idLop: id } });
    if (data.value?.status === 'success') {
      subjects.value = data.value.data.items?.ds_mon || [];
    } else {
      subjects.value = [];
    }
  } catch (err) {
    console.error('Fetch class subjects error', err);
  }
}
async function handleTableChange(pag) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  await fetchClasses();
}
async function selectClass(record) {
  if (!record) return;
  selectedId.value = record.id;
  await fetchSubjects(record.id);
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

const reset = () => {
  classes.value = [];
  pagination.current = 1;
  pagination.pageSize = 10;
  pagination.total = 0;
  selectedId.value = null;
  subjects.value = [];
};

const refresh = async () => {
  await fetchClasses();
  if (selectedId.value) {
    await fetchSubjects(selectedId.value);
  }
};

defineExpose({
  reset,
  refresh,
});
onMounted(fetchClasses)
</script>
