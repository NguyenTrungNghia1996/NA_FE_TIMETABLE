<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm ban học..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '800' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-if="column.key === 'ghichu'">
            <span v-if="record.ghichu">{{ record.ghichu }}</span>
            <span v-else class="text-gray-400">Trống</span>
          </template>
          <template v-if="column.key === 'action'">
            <div class="flex justify-center">
              <div class="md:flex space-x-2">
                <a-button type="link" size="small" @click="editItem(record.id)" :disabled="!settingStore.currentPermission">
                  <template #icon>
                    <EditOutlined />
                  </template>
                </a-button>
                <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                  <a-button type="link" danger size="small" :disabled="!settingStore.currentPermission">
                    <template #icon>
                      <DeleteOutlined />
                    </template>
                  </a-button>
                </a-popconfirm>
              </div>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa ban học' : 'Thêm mới ban học'" @cancel="handleCancel" :width="600">
      <a-form ref="formRef" :model="formState" layout="vertical">
        <a-form-item label="Tên ban học" name="ten" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" :rules="rules.ten">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên ban học" :maxlength="50" show-count />
        </a-form-item>
        <SelectSchoolLevelByUnit v-model="formState.id_cap_hoc" name="id_cap_hoc" :rules="rules.id_cap_hoc" />
        <a-form-item label="Ghi chú" name="ghichu" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <a-textarea v-model:value="formState.ghichu" :rows="4" placeholder="Nhập ghi chú (nếu có)" :maxlength="200" show-count />
        </a-form-item>
      </a-form>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading">
            {{ isEdit ? "Cập nhật" : "Thêm mới" }}
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
const settingStore = useSettingStore();
const { RestApi } = useApi();

const searchText = ref("");
const loading = ref(false);
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const formRef = ref();

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["1", "10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const columns = [
  { title: "STT", key: "stt", width: 50, align: "center" },
  { title: "Tên ban học", dataIndex: "ten", key: "ten", ellipsis: true },
  { title: "Tên cấp học", dataIndex: "ten_cap", key: "ten_cap", ellipsis: true },
  { title: "Ghi chú", dataIndex: "ghichu", key: "ghichu", ellipsis: true },
  { title: "Thao tác", key: "action", width: 80, align: "center", fixed: "right" },
];

const formState = reactive({
  id: null,
  ten: "",
  ghichu: "",
  id_cap_hoc: undefined,
});

const rules = reactive({
  ten: [
    { required: true, message: "Vui lòng nhập tên ban học", trigger: "blur" },
    { min: 2, message: "Tên phải có ít nhất 2 ký tự", trigger: "blur" },
    { max: 50, message: "Tên nhiều nhất có 50 ký tự", trigger: "blur" },
  ],
  id_cap_hoc: [{ required: true, message: "Vui lòng chọn cấp học", trigger: "blur" }],
});

const param = ref({ PageIndex: 1, PageSize: 10, search: "" });
const dataSource = ref([]);

const fetchData = async param => {
  try {
    loading.value = true;
    const { data, error } = await RestApi.school_ship.list({ params: param });
    if (data.value?.status === "success") {
      dataSource.value = data.value.data.items || [];
      pagination.total = data.value.data.totalrecord;
    } else {
      throw new Error(error.value?.data?.message);
    }
  } catch (err) {
    message.error(err.message);
    dataSource.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const handleTableChange = async pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  param.value.PageIndex = pag.current;
  param.value.PageSize = pag.pageSize;
  await fetchData({ ...param.value });
};

const handleSearch = async () => {
  const search = (searchText.value || "").trim();
  if (search) {
    param.value.search = search;
  } else {
    delete param.value.search;
  }
  pagination.current = 1;
  await fetchData({ ...param.value });
};

const showModal = async () => {
  isEdit.value = false;
  Object.assign(formState, { id: null, ten: "", ghichu: "", id_cap_hoc: undefined });
  visible.value = true;
};

const editItem = async id => {
  isEdit.value = true;
  try {
    const { data } = await RestApi.school_ship.detail({ params: { id } });
    if (data.value?.status === "success") {
      Object.assign(formState, { ...data.value.data });
      visible.value = true;
    }
  } catch (err) {
    message.error("Không thể lấy dữ liệu chi tiết");
  }
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    const payload = { ...formState };
    let res;
    if (isEdit.value) {
      res = await RestApi.school_ship.update({ body: payload });
    } else {
      delete payload.id;
      res = await RestApi.school_ship.create({ body: payload });
    }
    if (res.data.value?.status === "success") {
      message.success(res.data.value?.message || "Thành công");
      await fetchData({ ...param.value });
      visible.value = false;
      formRef.value.resetFields();
    } else {
      throw new Error(res.error?.value?.data?.message || "Lỗi không xác định");
    }
  } catch (err) {
    message.error(err.message || "Lỗi khi lưu thông tin");
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  formRef.value.resetFields();
  visible.value = false;
};

const deleteItem = async id => {
  try {
    const { data } = await RestApi.school_ship.delete({ params: { id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Đã xóa");
      pagination.current = 1;
      param.value.PageIndex = 1;
      await fetchData({ ...param.value });
    } else {
      message.error(data.value?.message || "Không thể xóa");
    }
  } catch (err) {
    message.error("Lỗi khi xóa");
  }
};

const resetForm = async () => {
  if (formRef.value) formRef.value.resetFields();
  searchText.value = "";
  param.value = { PageIndex: 1, PageSize: 10, search: "" };
  pagination.current = 1;
  pagination.pageSize = 10;
  await fetchData({ ...param.value });
};

await fetchData({ ...param.value });
</script>
