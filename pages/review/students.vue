<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm học sinh..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button @click="openImportModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Import học sinh</a-button>
      <a-button @click="reviewStudentDrawerOpen = true" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Học sinh - Lớp ôn tập</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '900' }" row-key="id" @change="handleTableChange" bordered size="small">
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
                <a-popconfirm placement="topRight" title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
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

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa học sinh' : 'Thêm mới học sinh'" @cancel="handleCancel" :width="600">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Mã học sinh" name="ma" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <a-input v-model:value="formState.ma" placeholder="Nhập mã học sinh" :maxlength="50" show-count />
        </a-form-item>
        <a-form-item label="Tên học sinh" name="ten" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên học sinh" :maxlength="50" show-count />
        </a-form-item>
        <SelectClass v-model="formState.id_lop_chinh" name="id_lop_chinh" label="Lớp chính" :rules="rules.id_lop_chinh" />
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

    <a-modal v-model:open="importModal.open" title="Import học sinh" :footer="null" width="520px" :destroyOnClose="true" @cancel="closeImportModal">
      <div class="text-sm text-gray-600 mb-3">Chọn file Excel (.xlsx, .xls) để import danh sách học sinh.</div>
      <a-upload :beforeUpload="beforeImportUpload" :maxCount="1" :file-list="importModal.fileList" @remove="removeImportFile" :accept="'.xlsx,.xls'" :showUploadList="{ showRemoveIcon: true }">
        <a-button>Chọn file</a-button>
      </a-upload>
      <div class="flex justify-end gap-2 mt-4">
        <a-button type="primary" :loading="importModal.uploading" :disabled="!importModal.file" @click="handleImportStudents">Lưu</a-button>
        <a-button danger @click="closeImportModal">Hủy</a-button>
      </div>
    </a-modal>

    <a-drawer v-model:open="reviewStudentDrawerOpen" title="Học sinh - Lớp ôn tập" :footer="null" height="100vh" placement="bottom" :destroyOnClose="true" @close="closeReviewStudentDrawer">
      <ClientOnly>
        <ReviewStudentClass ref="reviewStudentRef" />
      </ClientOnly>
    </a-drawer>
  </div>
</template>

<script setup>
const settingStore = useSettingStore();
const { RestApi } = useApi();

const param = ref({ pageIndex: 1, pageSize: 10, search: "" });

const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã học sinh", dataIndex: "ma", key: "ma", ellipsis: true },
  { title: "Tên học sinh", dataIndex: "ten", key: "ten", ellipsis: true },
  { title: "Lớp chính", dataIndex: "ten_lop", key: "ten_lop", ellipsis: true },
  { title: "Thao tác", key: "action", width: 120, align: "center", fixed: "right" },
];

const dataSource = ref([]);
const loading = ref(false);
const searchText = ref("");
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const formRef = ref();
const reviewStudentDrawerOpen = ref(false);
const reviewStudentRef = ref(null);
const importModal = reactive({
  open: false,
  file: null,
  fileList: [],
  uploading: false,
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const formState = reactive({
  id: null,
  ma: "",
  ten: "",
  id_lop_chinh: null,
});

const rules = reactive({
  ma: [
    { required: true, message: "Vui lòng nhập mã học sinh", trigger: "blur" },
    { max: 50, message: "Mã học sinh tối đa 50 ký tự", trigger: "blur" },
  ],
  ten: [
    { required: true, message: "Vui lòng nhập tên học sinh", trigger: "blur" },
    { max: 50, message: "Tên học sinh tối đa 50 ký tự", trigger: "blur" },
  ],
  id_lop_chinh: [{ required: true, message: "Vui lòng chọn lớp chính", trigger: "change" }],
});

const fetchData = async params => {
  try {
    loading.value = true;
    const { data } = await RestApi.student.list({ params });
    if (data.value?.status === "success") {
      dataSource.value = data.value.data.items || [];
      pagination.total = data.value.data.totalrecord || 0;
    } else {
      dataSource.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    message.error("Lỗi khi tải dữ liệu");
  } finally {
    loading.value = false;
  }
};

const handleTableChange = async pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  param.value.pageIndex = pag.current;
  param.value.pageSize = pag.pageSize;
  await fetchData({ ...param.value });
};

const handleSearch = async () => {
  const search = (searchText.value || "").trim();
  param.value.search = search;
  pagination.current = 1;
  param.value.pageIndex = 1;
  await fetchData({ ...param.value });
};

const openImportModal = () => {
  importModal.open = true;
};

const closeImportModal = () => {
  importModal.open = false;
  importModal.file = null;
  importModal.fileList = [];
  importModal.uploading = false;
};

const beforeImportUpload = file => {
  const originFile = file?.originFileObj || file;
  const extIndex = originFile.name?.lastIndexOf(".") ?? -1;
  const ext = extIndex >= 0 ? originFile.name.slice(extIndex) : "";
  const renamedFile = new File([originFile], `${Date.now()}${ext}`, {
    type: originFile.type,
    lastModified: originFile.lastModified,
  });
  importModal.file = renamedFile;
  importModal.fileList = [{ ...file, name: originFile.name }];
  return false;
};

const removeImportFile = () => {
  importModal.file = null;
  importModal.fileList = [];
};

const handleImportStudents = async () => {
  if (!importModal.file) {
    message.warning("Vui lòng chọn file để import");
    return;
  }
  try {
    importModal.uploading = true;
    const form = new FormData();
    form.append("file", importModal.file);
    const { data, error } = await RestApi.student.import_file({ body: form });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Import thành công");
      closeImportModal();
      await fetchData({ ...param.value });
      if (reviewStudentDrawerOpen.value) {
        reviewStudentRef.value?.refresh();
      }
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Import không thành công");
    }
  } catch (err) {
    message.error(err.message || "Import không thành công");
  } finally {
    importModal.uploading = false;
  }
};

const showModal = () => {
  isEdit.value = false;
  Object.assign(formState, { id: null, ma: "", ten: "", id_lop_chinh: null });
  visible.value = true;
};

const editItem = record => {
  isEdit.value = true;
  Object.assign(formState, {
    id: record.id,
    ma: record.ma,
    ten: record.ten,
    id_lop_chinh: record.id_lop_chinh,
  });
  visible.value = true;
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    const payload = { ...formState };
    let res;
    if (isEdit.value) {
      res = await RestApi.student.update({ body: payload });
    } else {
      delete payload.id;
      res = await RestApi.student.create({ body: payload });
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

const closeReviewStudentDrawer = () => {
  reviewStudentRef.value?.reset();
};

watch(reviewStudentDrawerOpen, val => {
  if (val) {
    reviewStudentRef.value?.refresh();
  }
});

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.student.delete({ params: { id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa thành công");
      pagination.current = 1;
      param.value.pageIndex = 1;
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (error) {
    message.error(error?.message || error?.value?.data?.message || "Xóa không thành công");
  } finally {
    await fetchData({ ...param.value });
  }
};

const resetForm = async () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  searchText.value = "";
  param.value.pageIndex = 1;
  param.value.pageSize = 10;
  param.value.search = "";
  pagination.current = 1;
  pagination.pageSize = 10;
  await fetchData({ ...param.value });
};

await fetchData({ ...param.value });
</script>
