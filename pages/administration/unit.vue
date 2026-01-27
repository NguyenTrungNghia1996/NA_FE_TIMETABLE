<template>
  <div class="p-4 bg-white rounded shadow min-h-full">
    <!-- Header với tìm kiếm và nút thêm mới -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm đơn vị..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetSearch" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button @click="openImportModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Import</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>

    <!-- Bảng dữ liệu -->
    <ClientOnly>
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: 1000 }" @change="handleTableChange" bordered size="middle">
        <template #bodyCell="{ column, record }">
          <!-- Cột thao tác -->
          <template v-if="column.key === 'action'">
            <div class="flex justify-center gap-2">
              <!-- Desktop view - full buttons -->
              <div class="md:flex space-x-2">
                <a-tooltip title="Sửa">
                  <a-button type="link" size="small" @click="editItem(record)" :disabled="!settingStore.currentPermission">
                    <template #icon>
                      <EditOutlined />
                    </template>
                  </a-button>
                </a-tooltip>
                <a-tooltip title="Import">
                  <a-button type="link" size="small" @click="openImportModal(record)" :disabled="!settingStore.currentPermission">
                    <template #icon>
                      <UploadOutlined />
                    </template>
                  </a-button>
                </a-tooltip>
                <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                  <a-tooltip title="Xóa">
                    <a-button type="link" danger size="small" :disabled="!settingStore.currentPermission">
                      <template #icon>
                        <DeleteOutlined />
                      </template>
                    </a-button>
                  </a-tooltip>
                </a-popconfirm>
              </div>

              <!-- Mobile view - dropdown -->
              <!-- <div class="md:hidden">
                <a-dropdown :trigger="['click']">
                  <a-button type="text" size="small">
                    <MoreOutlined />
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="1" @click="editItem(record)" :disabled="!settingStore.currentPermission">
                        <template #icon>
                          <EditOutlined />
                        </template>
                        Sửa
                      </a-menu-item>
                      <a-menu-item key="2" danger @click="deleteItem(record.id)" :disabled="!settingStore.currentPermission">
                        <template #icon>
                          <DeleteOutlined />
                        </template>
                        Xóa
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div> -->
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <!-- Modal thêm/sửa đơn vị -->
    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa đơn vị' : 'Thêm mới đơn vị'" @cancel="handleCancel" :width="700" :footer="null">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a-form-item label="Tên đơn vị" name="tenDonvi">
            <a-input v-model:value="formState.tenDonvi" placeholder="Nhập tên đơn vị" />
          </a-form-item>
          <SelectSchoolLevel v-model="formState.idCap" name="idCap" :rules="rules.idCap" :multiple="true" />

          <a-form-item label="Địa chỉ" name="diachi">
            <a-input v-model:value="formState.diachi" placeholder="Nhập địa chỉ" />
          </a-form-item>

          <a-form-item label="Số điện thoại" name="sodienthoai">
            <a-input v-model:value="formState.sodienthoai" placeholder="Nhập số điện thoại" />
          </a-form-item>
          <a-form-item label="Email" name="email">
            <a-input v-model:value="formState.email" placeholder="Nhập email" />
          </a-form-item>
          <SelectSchoolShift v-model="formState.id_cahoc" name="id_cahoc" :rules="rules.id_cahoc" :multiple="true" />
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading">
            {{ isEdit ? "Cập nhật" : "Thêm mới" }}
          </a-button>
        </div>
      </a-form>
    </a-modal>

    <a-modal v-model:open="importModal.open" title="Import đơn vị" :footer="null" width="520px" :destroyOnClose="true" @cancel="closeImportModal">
      <div class="text-sm text-gray-600 mb-3">Chọn file Excel (.xlsx, .xls) để import đữ liệu đơn vị.</div>
      <a-form layout="vertical">
        <SelectUnit v-model="importModal.unitId" name="id_don_vi" label="Đơn vị" placeholder="Chọn đơn vị" />
        <a-form-item label="File import">
          <a-upload :beforeUpload="beforeImportUpload" :maxCount="1" :file-list="importModal.fileList" @remove="removeImportFile" :accept="'.xlsx,.xls'" :showUploadList="{ showRemoveIcon: true }">
            <a-button>Chọn file</a-button>
          </a-upload>
        </a-form-item>
      </a-form>
      <div class="flex justify-end gap-2 mt-4">
        <a-button type="primary" :loading="importModal.uploading" :disabled="!importModal.file || !importModal.unitId || !settingStore.currentPermission" @click="handleImport">Import</a-button>
        <a-button danger @click="closeImportModal">Hủy</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
const settingStore = useSettingStore();
const { RestApi } = useApi();
const param = ref({ PageIndex: 1, PageSize: 10, search: "" });
const columns = [
  {
    title: "STT",
    key: "stt",
    width: 70,
    align: "center",
    customRender: ({ index }) => (pagination.current - 1) * pagination.pageSize + index + 1,
  },
  {
    title: "Tên đơn vị",
    dataIndex: "tenDonvi",
    key: "tenDonvi",
    width: 200,
  },
  {
    title: "Địa chỉ",
    dataIndex: "diachi",
    key: "diachi",
    ellipsis: true,
  },
  {
    title: "Số điện thoại",
    dataIndex: "sodienthoai",
    key: "sodienthoai",
    width: 120,
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    width: 150,
  },
  {
    title: "Cấp học",
    dataIndex: "ten_cap",
    key: "ten_cap",
    width: 150,
  },
  {
    title: "Ca Học",
    dataIndex: "ten_ca",
    key: "ten_ca",
    width: 150,
  },
  {
    title: "Thao tác",
    key: "action",
    width: 120,
    align: "center",
    fixed: "right",
  },
];

// State
const dataSource = ref([]);
const loading = ref(false);
const searchText = ref("");
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const formRef = ref();
const importModal = reactive({
  open: false,
  file: null,
  fileList: [],
  uploading: false,
  unitId: null,
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["1", "5", "10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const formState = reactive({
  tenDonvi: "",
  diachi: "",
  sodienthoai: "",
  email: "",
  idCap: undefined,
  id_cahoc: undefined,
});

const rules = {
  idCap: [{ required: true, message: "Vui lòng chọn cấp học", trigger: "blur", type: "array" }],
  id_cahoc: [{ required: true, message: "Vui lòng chọn ca học", trigger: "blur" }],
  tenDonvi: [
    { required: true, message: "Vui lòng chọn đơn vị", trigger: "blur" },
    { max: 100, message: "Tên đơn vị không quá 100 kí tự", trigger: "blur" },
  ],
  diachi: [
    { required: true, message: "Vui lòng nhập địa chỉ", trigger: "blur" },
    { max: 200, message: "Địa chỉ không quá 200 ký tự", trigger: "blur" },
  ],
  email: [
    { required: true, message: "Vui lòng nhập địa chỉ email", trigger: "blur" },
    { type: "email", message: "Email không hợp lệ", trigger: "blur" },
    { max: 200, message: "Email không quá 200 kí tự", trigger: "blur" },
  ],
  sodienthoai: [
    { required: true, message: "Vui lòng nhập số điện thoại", trigger: "blur" },
    {
      pattern: /^(0|\+84)[3|5|7|8|9]\d{8}$/,
      message: "Số điện thoại không hợp lệ (phải là số di động Việt Nam)",
      trigger: "blur",
    },
  ],
};

// Methods
const fetchData = async param => {
  try {
    loading.value = true;
    const { data } = await RestApi.unit.list({ params: param });

    if (data.value?.status === "success") {
      dataSource.value = data.value.data.items;
      pagination.total = data.value.data.totalrecord;
    } else {
      dataSource.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    message.error("Lỗi khi tải danh sách đơn vị");
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
  param.value.PageIndex = 1;
  await fetchData({ ...param.value });
};

const resetSearch = async () => {
  searchText.value = "";
  pagination.current = 1;
  param.value = { PageIndex: 1, PageSize: 10, search: "" };
  await fetchData({ ...param.value });
};

const showModal = () => {
  isEdit.value = false;
  Object.assign(formState, {
    tenDonvi: "",
    diachi: "",
    sodienthoai: "",
    email: "",
    idCap: undefined,
    id_cahoc: undefined,
  });
  visible.value = true;
};

const editItem = async record => {
  try {
    loading.value = true;
    const { data, error } = await RestApi.unit.detail({ params: { id: record.id } });
    if (data.value?.status === "success") {
      const unitData = data.value.data;
      Object.assign(formState, {
        id: unitData.id,
        tenDonvi: unitData.tenDonvi,
        diachi: unitData.diachi,
        sodienthoai: unitData.sodienthoai,
        email: unitData.email,
        idCap: unitData.idCap,
        id_cahoc: unitData.id_cahoc,
      });
      isEdit.value = true;
      visible.value = true;
    } else {
      throw new Error(error.value?.data?.message || "Không thể tải thông tin đơn vị");
    }
  } catch (error) {
    console.error("Error fetching unit detail:", error);
    message.error(error.message || error.response?.data?.message || "Không thể tải thông tin đơn vị");
  } finally {
    loading.value = false;
    formRef.value?.clearValidate();
  }
};

const handleOk = async () => {
  // 1) VALIDATE TRƯỚC – nếu fail thì return sớm, không đóng modal, không fetch
  try {
    await formRef.value?.validate();
  } catch (e) {
    // e của a-form có dạng { errorFields: [{ name, errors: [...] }, ...] }
    const first = e?.errorFields?.[0];
    const msg = first?.errors?.[0] || "Vui lòng kiểm tra lại các trường bắt buộc";
    message.error(msg);
    // cuộn tới field lỗi đầu tiên (nếu dùng a-form v4+)
    try {
      if (first?.name) await formRef.value?.scrollToField(first.name);
    } catch {}
    return; // DỪNG TẠI ĐÂY
  }

  // 2) VALIDATE PASS → gọi API
  confirmLoading.value = true;
  try {
    if (isEdit.value) {
      const payload = { ...formState };
      const { data, error } = await RestApi.unit.update({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật thành công");
      } else {
        throw new Error(error.value?.data?.message || "Cập nhật không thành công");
      }
    } else {
      const payload = { ...formState };
      if ("id" in payload) delete payload.id;
      const { data, error } = await RestApi.unit.create({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Thêm mới thành công");
      } else {
        throw new Error(error.value?.data?.message || "Thêm mới không thành công");
      }
    }

    // 3) THÀNH CÔNG → đóng modal + reload data
    visible.value = false;
    await fetchData({ ...param.value });
  } catch (err) {
    message.error(err?.message || err?.response?.data?.message || "Đã xảy ra lỗi khi lưu thông tin");
  } finally {
    confirmLoading.value = false;
  }
};
const handleCancel = () => {
  formRef.value?.resetFields();
  visible.value = false;
};

const openImportModal = record => {
  importModal.file = null;
  importModal.fileList = [];
  importModal.uploading = false;
  importModal.unitId = record?.id ?? null;
  importModal.open = true;
};

const closeImportModal = () => {
  importModal.open = false;
  importModal.file = null;
  importModal.fileList = [];
  importModal.uploading = false;
  importModal.unitId = null;
};

const beforeImportUpload = file => {
  const origin = file?.originFileObj || file;
  importModal.file = origin;
  importModal.fileList = [{ ...file, name: origin?.name || file.name }];
  return false;
};

const removeImportFile = () => {
  importModal.file = null;
  importModal.fileList = [];
};

const handleImport = async () => {
  if (!importModal.unitId) {
    message.warning("Vui lòng chọn đơn vị");
    return;
  }
  if (!importModal.file) {
    message.warning("Vui lòng chọn file để import");
    return;
  }
  try {
    importModal.uploading = true;
    const form = new FormData();
    form.append("file", importModal.file);
    form.append("id_don_vi", String(importModal.unitId));
    const { data, error } = await RestApi.unit.import_file({ body: form });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Import thành công");
      closeImportModal();
      await fetchData({ ...param.value });
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Import không thành công");
    }
  } catch (err) {
    message.error(err?.message || err?.response?.data?.message || "Import không thành công");
  } finally {
    importModal.uploading = false;
  }
};

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.unit.delete({ params: { id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa người đơn vị thành công");
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (error) {
    message.error(error.message || error.response?.data?.message || "Đã xảy ra lỗi khi xóa thông tin đơn vị");
  } finally {
    await fetchData({ ...param.value });
  }
};

// Lifecycle
await fetchData({ ...param.value });
</script>

<style scoped>
/* Responsive table */
@media (max-width: 768px) {
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 8px !important;
    font-size: 13px;
  }

  .ant-table-content {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

/* Fix for sticky column */
.ant-table-cell-fix-left,
.ant-table-cell-fix-right {
  z-index: 1;
  background: white;
}

.ant-table-cell-fix-right {
  box-shadow: -5px 0 5px -5px rgba(0, 0, 0, 0.1);
}
</style>
