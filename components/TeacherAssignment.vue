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

    <a-card v-if="selectedTeacher" title="MÔN HỌC GIẢNG DẠY" class="md:col-span-1">
      <a-table
        :columns="subjectColumns"
        :data-source="subjects"
        :pagination="false"
        size="small"
        row-key="id_mon"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">{{ index + 1 }}</template>
          <template v-if="column.key === 'active'">
            <a-switch v-model:checked="record.trang_thai" size="small" />
          </template>
        </template>
      </a-table>
      <div class="flex justify-end gap-2 mt-2">
        <a-button type="primary" :loading="saving" @click="handleSave">Lưu</a-button>
        <a-button danger @click="reset">Hủy</a-button>
      </div>
    </a-card>
  </div>
</template>
<script setup>
const { RestApi } = useApi();

const teachers = ref([]);
const loading = ref(false);
const selectedTeacher = ref(null);
const subjects = ref([]);
const saving = ref(false);
const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã giáo viên", key: "code" },
  { title: "Họ và tên", key: "name" },
];

const subjectColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Tên môn học", dataIndex: "ten_mon", key: "name" },
  { title: "Giảng dạy", key: "active", width: 100, align: "center" },
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
  selectedTeacher.value = record;
  try {
    const { data } = await RestApi.teacher.get_subjects({ params: { id: record.id } });
    if (data.value?.status === "success") {
      subjects.value = data.value.data.ds_mon || [];
    } else {
      subjects.value = [];
    }
  } catch (err) {
    console.error("Fetch teacher subjects error", err);
  }
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
  selectedTeacher.value = null;
  subjects.value = [];
};

async function handleSave() {
  if (!selectedTeacher.value) return;
  try {
    saving.value = true;
    const payload = {
      id_giao_vien: selectedTeacher.value.id,
      ds_mon: subjects.value.map(mon => ({
        id_mon: mon.id_mon,
        ten_mon: mon.ten_mon,
        trang_thai: mon.trang_thai,
      })),
    };
    const { data, error } = await RestApi.teacher.update_subjects({ body: payload });
    if (data.value?.status === "success") {
      message.success(data.value.message || "Cập nhật thành công");
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Cập nhật không thành công");
    }
  } catch (err) {
    console.error("Update teacher subjects error", err);
    message.error(err.message || "Lỗi cập nhật");
  } finally {
    saving.value = false;
  }
}

defineExpose({
  reset,
});

onMounted(fetchTeachers);
</script>
