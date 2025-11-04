<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">
        <span class="md:inline">Đặt lại</span>
      </a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">
        <span class="md:inline">Thêm mới</span>
      </a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '1000' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-if="column.key === 'action'">
            <div class="flex justify-center">
              <div class="md:flex space-x-2">
                <a-button type="link" size="small" @click="editItem(record)" :disabled="!settingStore.currentPermission">
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

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa' : 'Thêm mới'" @cancel="handleCancel" :width="600">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tên" name="ten" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên" :maxlength="255" show-count />
        </a-form-item>
        <SelectYear v-model="formState.id_nam_hoc" name="id_nam_hoc" :rules="rules.id_nam_hoc" />
        <SelectGradeLevel v-model="formState.id_khoi" name="id_khoi" :rules="rules.id_khoi" />
        <SelectSchoolship v-model="formState.id_ban" name="id_ban" :rules="rules.id_ban" />
        <SelectSubject v-model="formState.id_mon" name="id_mon" :rules="rules.id_mon" />
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
const param = ref({ PageIndex: 1, PageSize: 10, search: "" });

const columns = [
  { title: "STT", key: "stt", width: 50, align: "center" },
  { title: "Tên", dataIndex: "ten", key: "ten", ellipsis: true },
  { title: "Năm học", dataIndex: "ten_nam_hoc", key: "ten_nam_hoc", ellipsis: true },
  { title: "Khối", dataIndex: "ten_khoi", key: "ten_khoi", ellipsis: true },
  { title: "Ban", dataIndex: "ten_ban", key: "ten_ban", ellipsis: true },
  { title: "Môn", dataIndex: "ten_mon", key: "ten_mon", ellipsis: true },
  { title: "Thao tác", key: "action", width: 80, align: "center", fixed: "right" },
];

const dataSource = ref([]);
const loading = ref(false);
const searchText = ref("");
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

const formState = reactive({
  id: null,
  ten: "",
  id_nam_hoc: null,
  id_khoi: null,
  id_ban: null,
  id_mon: null,
});

const rules = reactive({
  ten: [
    { required: true, message: "Vui lòng nhập tên", trigger: "blur" },
    { max: 255, message: "Tối đa 255 ký tự", trigger: "blur" },
  ],
  id_nam_hoc: [{ required: true, message: "Vui lòng chọn năm học", trigger: "change" }],
  id_khoi: [{ required: true, message: "Vui lòng chọn khối", trigger: "change" }],
  id_ban: [{ required: true, message: "Vui lòng chọn ban", trigger: "change" }],
  id_mon: [{ required: true, message: "Vui lòng chọn môn", trigger: "change" }],
});

const fetchData = async param => {
  try {
    loading.value = true;
    const { data } = await RestApi.phanphoi_chuongtrinh.list({ params: param });
    if (data.value?.status === "success") {
      dataSource.value = data.value.data.items || [];
      pagination.total = data.value.data.totalrecord;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được dữ liệu");
    }
  } catch (error) {
    dataSource.value = [];
    pagination.total = 0;
    message.error(err.message || "Lỗi tải dữ liệu");
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

const showModal = () => {
  isEdit.value = false;
  Object.assign(formState, { id: null, ten: "", id_nam_hoc: null, id_khoi: null, id_ban: null, id_mon: null });
  visible.value = true;
};

const editItem = async record => {
  isEdit.value = true;
  Object.assign(formState, record);
  visible.value = true;
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    const payload = { ...formState };
    let res;
    if (isEdit.value) {
      res = await RestApi.phanphoi_chuongtrinh.update({ body: payload });
    } else {
      delete payload.id;
      res = await RestApi.phanphoi_chuongtrinh.create({ body: payload });
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
    const { data, error } = await RestApi.phanphoi_chuongtrinh.delete({ params: { Id: id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa thành công");
      pagination.current = 1;
      param.value.PageIndex = 1;
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (error) {
    message.error(error?.message || error?.value?.data?.message || "Xóa không thành công ");
  } finally {
    await fetchData({ ...param.value });
  }
};

const resetForm = async () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  searchText.value = "";
  param.value.PageIndex = 1;
  param.value.PageSize = 10;
  param.value.search = "";
  pagination.current = 1;
  pagination.pageSize = 10;
  await fetchData({ ...param.value });
};

await fetchData({ ...param.value });
</script>
