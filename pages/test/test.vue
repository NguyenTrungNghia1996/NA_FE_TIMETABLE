<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm bài kiểm tra..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">Đặt lại</a-button>
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
                <a-tooltip title="Kết quả kiểm tra">
                  <a-button type="link" size="small" @click="openResultModal(record)" :disabled="!settingStore.currentPermission">
                    <template #icon>
                      <FileSearchOutlined />
                    </template>
                  </a-button>
                </a-tooltip>
                <a-button type="link" size="small" @click="openImportModal(record)" :disabled="!settingStore.currentPermission">
                  <template #icon>
                    <UploadOutlined />
                  </template>
                </a-button>
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

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa bài kiểm tra' : 'Thêm mới bài kiểm tra'" @cancel="handleCancel" :width="720">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tên bài kiểm tra" name="ten" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên bài kiểm tra" :maxlength="50" show-count />
        </a-form-item>

        <SelectReviewTestType v-model="formState.id_loai_kiem_tra" label="Loại bài kiểm tra" name="id_loai_kiem_tra" :rules="rules.id_loai_kiem_tra" />

        <SelectReviewClass v-model="formState.id_lop_on" label="Lớp ôn tập" name="id_lop_on" :rules="rules.id_lop_on" />
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

    <a-modal v-model:open="importModal.open" title="IMPORT ĐIỂM KIỂM TRA" :footer="null" width="520px" :destroyOnClose="true" @cancel="closeImportModal">
      <div class="flex justify-end mb-2">
        <a-button type="link" class="p-0" :loading="importModal.downloading" @click="downloadTemplate">Tải file mẫu</a-button>
      </div>
      <div class="space-y-2 text-sm text-gray-700 mb-4">
        <div><span class="font-medium">Tên bài kiểm tra:</span> {{ importModal.record?.ten || "-" }}</div>
        <div><span class="font-medium">Loại bài kiểm tra:</span> {{ importModal.record?.ten_loai_kiem_tra || "-" }}</div>
        <div><span class="font-medium">Lớp ôn tập:</span> {{ importModal.record?.ten_lop_on || "-" }}</div>
      </div>
      <a-upload :beforeUpload="beforeImportUpload" :maxCount="1" :file-list="importModal.fileList" @remove="removeImportFile" :accept="'.xlsx,.xls'" :showUploadList="{ showRemoveIcon: true }">
        <a-button>Chọn file</a-button>
      </a-upload>
      <div class="flex justify-end gap-2 mt-4">
        <a-button type="primary" :loading="importModal.uploading" :disabled="!importModal.file || !settingStore.currentPermission" @click="handleImportScores">Import</a-button>
        <a-button danger @click="closeImportModal">Hủy</a-button>
      </div>
    </a-modal>

    <a-modal v-model:open="resultModal.open" title="KẾT QUẢ KIỂM TRA" :footer="null" width="760px" :destroyOnClose="true" @cancel="closeResultModal">
      <div class="space-y-2 text-sm text-gray-700 mb-4">
        <div>
          <span class="font-medium">Bài kiểm tra:</span>
          {{ `${resultModal.record?.ten || "-"} - ${resultModal.record?.ten_loai_kiem_tra || "-"} - ${resultModal.record?.ten_lop_on || "-"}` }}
        </div>
      </div>
      <ClientOnly>
        <a-table :columns="resultColumns" :data-source="resultModal.data" :loading="resultModal.loading" :pagination="false" row-key="id" bordered size="small">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'stt'">
              {{ index + 1 }}
            </template>
            <template v-if="column.key === 'diem'">
              <a-input-number v-model:value="record.diem" :min="0" :max="10" :step="0.1" class="!w-full" />
            </template>
          </template>
        </a-table>
      </ClientOnly>
      <div class="flex justify-end gap-2 mt-4">
        <a-button type="primary" :loading="resultModal.saving" :disabled="!settingStore.currentPermission" @click="saveResultScores">Lưu</a-button>
        <a-button danger @click="closeResultModal">Hủy</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
const settingStore = useSettingStore();
const { RestApi } = useApi();
const param = ref({ pageIndex: 1, pageSize: 10, search: "" });

const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Tên bài kiểm tra", dataIndex: "ten", key: "ten", ellipsis: true },
  { title: "Loại bài kiểm tra", dataIndex: "ten_loai_kiem_tra", key: "ten_loai_kiem_tra", ellipsis: true },
  { title: "Lớp ôn tập", dataIndex: "ten_lop_on", key: "ten_lop_on", ellipsis: true },
  { title: "Thao tác", key: "action", width: 150, align: "center", fixed: "right" },
];

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
  downloading: false,
  record: null,
});
const resultModal = reactive({
  open: false,
  loading: false,
  saving: false,
  record: null,
  data: [],
});

const resultColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã học sinh", dataIndex: "ma_hoc_sinh", key: "ma_hoc_sinh", width: 160 },
  { title: "Họ và tên học sinh", dataIndex: "ten_hoc_sinh", key: "ten_hoc_sinh" },
  { title: "Điểm", key: "diem", width: 140, align: "center" },
];

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const formState = reactive({
  id: undefined,
  ten: "",
  id_loai_kiem_tra: undefined,
  id_lop_on: undefined,
});

const rules = reactive({
  ten: [
    { required: true, message: "Vui lòng nhập tên bài kiểm tra", trigger: "blur" },
    { max: 50, message: "Tên bài kiểm tra tối đa 50 ký tự", trigger: "blur" },
  ],
  id_loai_kiem_tra: [{ required: true, message: "Vui lòng chọn loại bài kiểm tra", trigger: "change" }],
  id_lop_on: [{ required: true, message: "Vui lòng chọn lớp ôn tập", trigger: "change" }],
});

const fetchData = async p => {
  try {
    loading.value = true;
    const { data, error } = await RestApi.review_test.list({ params: p });
    if (data.value?.status === "success") {
      dataSource.value = data.value.data.items || [];
      pagination.total = data.value.data.totalrecord || 0;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được dữ liệu");
    }
  } catch (err) {
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
  param.value.pageIndex = pag.current;
  param.value.pageSize = pag.pageSize;
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
  param.value.pageIndex = 1;
  await fetchData({ ...param.value });
};

const showModal = () => {
  isEdit.value = false;
  Object.assign(formState, {
    id: undefined,
    ten: "",
    id_loai_kiem_tra: undefined,
    id_lop_on: undefined,
  });
  visible.value = true;
};

const editItem = record => {
  isEdit.value = true;
  Object.assign(formState, {
    id: record.id,
    ten: record.ten || "",
    id_loai_kiem_tra: record.id_loai_kiem_tra ?? undefined,
    id_lop_on: record.id_lop_on ?? undefined,
  });
  visible.value = true;
};

const handleOk = async () => {
  let shouldClose = false;
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;
    const payload = { ...formState };
    if (isEdit.value) {
      const { data, error } = await RestApi.review_test.update({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật thành công");
        shouldClose = true;
      } else {
        throw new Error(error.value?.data?.message || "Cập nhật không thành công");
      }
    } else {
      delete payload.id;
      const { data, error } = await RestApi.review_test.create({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Thêm mới thành công");
        shouldClose = true;
      } else {
        throw new Error(error.value?.data?.message || "Thêm mới không thành công");
      }
    }
  } catch (error) {
    message.error(error.message || error?.response?.data?.message || "Đã xảy ra lỗi khi lưu");
  } finally {
    confirmLoading.value = false;
    if (shouldClose) {
      await fetchData({ ...param.value });
      visible.value = false;
      formRef.value?.resetFields?.();
    }
  }
};

const handleCancel = () => {
  formRef.value?.resetFields?.();
  visible.value = false;
};

const openImportModal = record => {
  importModal.record = record ? { ...record } : null;
  importModal.open = true;
};

const closeImportModal = () => {
  importModal.open = false;
  importModal.file = null;
  importModal.fileList = [];
  importModal.uploading = false;
  importModal.downloading = false;
  importModal.record = null;
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

const downloadTemplate = async () => {
  // console.log(importModal.record);
  const classId = importModal.record?.id_lop_on;
  if (!classId) {
    message.warning("Vui lòng chọn lớp ôn tập để tải file mẫu");
    return;
  }
  try {
    importModal.downloading = true;
    const { data, error } = await RestApi.review_test.download_result_template({ params: { idlop: classId } });
    if (error.value) {
      throw new Error(error.value?.data?.message || "Không tải được file mẫu");
    }
    const { blob: blobData, headers } = data.value || {};
    if (!blobData) {
      throw new Error("Không tải được file mẫu");
    }
    const blob = blobData instanceof Blob ? blobData : new Blob([blobData]);
    const cd = headers && (headers["content-disposition"] || headers["Content-Disposition"]);
    const filename = (cd && (decodeURIComponent(/filename\*=UTF-8''([^;]+)/.exec(cd)?.[1] || "") || /filename=\"([^"]+)\"/.exec(cd)?.[1])) || "mau-import.xlsx";
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    message.error(err.message || "Không tải được file mẫu");
  } finally {
    importModal.downloading = false;
  }
};

const handleImportScores = async () => {
  const testId = importModal.record?.id;
  if (!testId) {
    message.warning("Vui lòng chọn bài kiểm tra để import");
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
    form.append("idbai", String(testId));
    const { data, error } = await RestApi.review_test.import_result({ body: form });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Import thành công");
      closeImportModal();
      await fetchData({ ...param.value });
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Import không thành công");
    }
  } catch (err) {
    message.error(err.message || "Import không thành công");
  } finally {
    importModal.uploading = false;
  }
};

const openResultModal = async record => {
  if (!record?.id) {
    message.warning("Vui lòng chọn bài kiểm tra");
    return;
  }
  resultModal.record = { ...record };
  resultModal.open = true;
  await fetchResultScores(record.id);
};

const closeResultModal = () => {
  resultModal.open = false;
  resultModal.loading = false;
  resultModal.saving = false;
  resultModal.record = null;
  resultModal.data = [];
};

const fetchResultScores = async testId => {
  try {
    resultModal.loading = true;
    const { data, error } = await RestApi.review_test.list_results({ params: { idbai: testId } });
    if (data.value?.status === "success") {
      resultModal.data = (data.value.data || []).map(item => ({ ...item }));
    } else {
      throw new Error(error.value?.data?.message || "Không tải được kết quả kiểm tra");
    }
  } catch (err) {
    resultModal.data = [];
    message.error(err.message || "Không tải được kết quả kiểm tra");
  } finally {
    resultModal.loading = false;
  }
};

const saveResultScores = async () => {
  if (!resultModal.record?.id) {
    message.warning("Vui lòng chọn bài kiểm tra");
    return;
  }
  try {
    resultModal.saving = true;
    const payload = resultModal.data.map(item => ({
      id: item.id,
      ma_hoc_sinh: item.ma_hoc_sinh,
      ten_hoc_sinh: item.ten_hoc_sinh,
      diem: item.diem,
    }));
    const { data, error } = await RestApi.review_test.save_results({ body: payload });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Lưu kết quả thành công");
      closeResultModal();
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Lưu kết quả không thành công");
    }
  } catch (err) {
    message.error(err.message || "Lưu kết quả không thành công");
  } finally {
    resultModal.saving = false;
  }
};

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.review_test.delete({ params: { id } });
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
  formRef.value?.resetFields?.();
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
