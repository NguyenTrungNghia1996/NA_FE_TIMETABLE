<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <a-card title="Thông tin tiết học cố định" class="md:col-span-1">
      <a-form layout="vertical">
        <SelectSubject v-model="form.id_mon" />
        <SelectSchoolDay v-model="form.ngay" />
        <SelectSchoolShiftByUnit v-model="form.id_ca" />
        <SelectSchoolPeriod v-model="form.tiet" />
        <SelectGradeLevel v-if="!form.ap_dung_cho_tat_ca_cac_khoi" v-model="form.id_khoi_lop" />
        <a-form-item>
          <a-checkbox v-model:checked="form.ap_dung_cho_tat_ca_cac_khoi">Áp dụng cho tất cả các khối</a-checkbox>
        </a-form-item>
        <div class="flex gap-2 mt-4">
          <a-button type="primary" @click="handleSave" :loading="saving">{{ isEdit ? "Cập nhật" : "Lưu" }}</a-button>
          <a-button danger @click="reset">Hủy</a-button>
        </div>
      </a-form>
    </a-card>

    <a-card class="md:col-span-3" title="Danh sách tiết học cố định">
      <ClientOnly>
        <div class="overflow-x-auto">
          <a-table :columns="columns" :data-source="lessons" :pagination="pagination" :loading="loading" bordered size="small" @change="handleTableChange" :scroll="{ x: 'max-content' }">
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'stt'">
                {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
              </template>
              <template v-if="column.key === 'action'">
                <div class="flex justify-center space-x-2">
                  <a-button type="link" size="small" @click="editItem(record)">
                    <template #icon><EditOutlined /></template>
                  </a-button>
                  <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                    <a-button type="link" danger size="small">
                      <template #icon><DeleteOutlined /></template>
                    </a-button>
                  </a-popconfirm>
                </div>
              </template>
            </template>
          </a-table>
        </div>
      </ClientOnly>
    </a-card>
  </div>
</template>
<script setup>
const { RestApi } = useApi();

const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Môn học", dataIndex: "ten_mon_hoc", key: "ten_mon_hoc", width: 150 },
  { title: "Khối", dataIndex: "ten_khoi_lop", key: "ten_khoi_lop", width: 100, align: "center" },
  { title: "Ca học", dataIndex: "ten_ca_hoc", key: "ten_ca_hoc", width: 100, align: "center" },
  { title: "Ngày học", dataIndex: "ten_ngay", key: "ten_ngay_hoc", width: 100, align: "center" },
  { title: "Tiết", dataIndex: "ten_tiet", key: "ten_tiet_hoc", width: 100, align: "center" },
  { title: "Thao tác", key: "action", width: 100, align: "center", fixed: "right" },
];

const lessons = ref([]);
const loading = ref(false);
const saving = ref(false);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const form = reactive({
  id: null,
  id_mon: undefined,
  ngay: undefined,
  id_ca: undefined,
  tiet: undefined,
  id_khoi_lop: undefined,
  ap_dung_cho_tat_ca_cac_khoi: false,
});

const isEdit = ref(false);

const fetchData = async () => {
  try {
    loading.value = true;
    const { data } = await RestApi.fixed_lesson.list({
      params: { pageIndex: pagination.current, pageSize: pagination.pageSize },
    });
    if (data.value?.status === "success") {
      lessons.value = data.value.data.items;
      pagination.total = data.value.data.totalrecord;
    } else {
      lessons.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error("Fetch fixed lessons error:", error);
    message.error("Không thể tải danh sách tiết cố định");
  } finally {
    loading.value = false;
  }
};

const handleTableChange = async pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  await fetchData();
};

const handleSave = async () => {
  try {
    saving.value = true;
    let send_data = {
      id: form.id,
      id_mon: form.id_mon,
      id_ngay: form.ngay,
      id_ca: form.id_ca,
      id_tiet: form.tiet,
      id_khoi_lop: form.id_khoi_lop,
      ap_dung_cho_tat_ca_cac_khoi: form.ap_dung_cho_tat_ca_cac_khoi,
    };
    if (isEdit.value) {
      const { data, error } = await RestApi.fixed_lesson.update({ body: { ...send_data } });
      if (data.value?.status === "success") {
        message.success(data.value.message || "Cập nhật thành công");
      } else {
        throw new Error(error.value?.data?.message || "Cập nhật không thành công");
      }
    } else {
      const payload = { ...send_data };
      delete payload.id;
      const { data, error } = await RestApi.fixed_lesson.create({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value.message || "Thêm mới thành công");
      } else {
        throw new Error(error.value?.data?.message || "Thêm mới không thành công");
      }
    }
    await fetchData();
    reset();
  } catch (err) {
    message.error(err.message || "Có lỗi xảy ra");
  } finally {
    saving.value = false;
  }
};

const editItem = async record => {
  try {
    loading.value = true;
    const { data } = await RestApi.fixed_lesson.detail({ params: { id: record.id } });
    if (data.value?.status === "success") {
      Object.assign(form, data.value.data);
      isEdit.value = true;
    } else {
      message.error(data.value?.message || "Không thể tải chi tiết");
    }
  } catch (err) {
    console.error("Detail error:", err);
    message.error("Không thể tải chi tiết");
  } finally {
    loading.value = false;
  }
};

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.fixed_lesson.delete({ params: { id } });
    if (data.value?.status === "success") {
      message.success(data.value.message || "Xóa thành công");
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (err) {
    message.error(err.message || "Có lỗi xảy ra");
  } finally {
    await fetchData();
  }
};

const reset = () => {
  Object.assign(form, {
    id: null,
    id_mon: undefined,
    ngay: undefined,
    id_ca: undefined,
    tiet: undefined,
    id_khoi_lop: undefined,
    ap_dung_cho_tat_ca_cac_khoi: false,
  });
  isEdit.value = false;
};

defineExpose({
  reset,
});
await fetchData();
</script>
