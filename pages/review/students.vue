<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm học sinh..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button @click="openImportModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Import học sinh</a-button>
      <a-button @click="openCombinationImportModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Import tổ hợp</a-button>
      <!-- <a-button @click="reviewStudentDrawerOpen = true" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Học sinh - Lớp ôn tập</a-button>s -->
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
                <a-button type="link" size="small" @click="openStudentCombinationModal(record)" :disabled="!settingStore.currentPermission">
                  <template #icon>
                    <AppstoreOutlined />
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
      <div class="flex justify-end mb-3">
        <a-button type="primary" ghost @click="downloadStudentTemplate">Tải file mẫu</a-button>
      </div>
      <a-upload :beforeUpload="beforeImportUpload" :maxCount="1" :file-list="importModal.fileList" @remove="removeImportFile" :accept="'.xlsx,.xls'" :showUploadList="{ showRemoveIcon: true }">
        <a-button>Chọn file</a-button>
      </a-upload>
      <div class="flex justify-end gap-2 mt-4">
        <a-button type="primary" :loading="importModal.uploading" :disabled="!importModal.file" @click="handleImportStudents">Lưu</a-button>
        <a-button danger @click="closeImportModal">Hủy</a-button>
      </div>
    </a-modal>

    <a-modal v-model:open="combinationImportModal.open" title="Import tổ hợp môn" :footer="null" width="520px" :destroyOnClose="true" @cancel="closeCombinationImportModal">
      <div class="text-sm text-gray-600 mb-3">Chọn file Excel (.xlsx, .xls) để import tổ hợp môn học sinh.</div>
      <div class="mb-2">
        <SelectClass v-model="combinationImportModal.classId" label="Lớp chính khóa (tải mẫu)" name="lop_chinh_khoa" :noFormItem="true" />
      </div>
      <div class="flex justify-end mb-3">
        <a-button type="primary" ghost :loading="combinationImportModal.downloading" :disabled="!combinationImportModal.classId" @click="downloadCombinationTemplate">Tải file mẫu</a-button>
      </div>
      <a-upload :beforeUpload="beforeCombinationImportUpload" :maxCount="1" :file-list="combinationImportModal.fileList" @remove="removeCombinationImportFile" :accept="'.xlsx,.xls'" :showUploadList="{ showRemoveIcon: true }">
        <a-button>Chọn file</a-button>
      </a-upload>
      <div class="flex justify-end gap-2 mt-4">
        <a-button type="primary" :loading="combinationImportModal.uploading" :disabled="!combinationImportModal.file" @click="handleImportCombinations">Lưu</a-button>
        <a-button danger @click="closeCombinationImportModal">Hủy</a-button>
      </div>
    </a-modal>

    <a-modal v-model:open="combinationModal.open" title="Tổ hợp môn học sinh" :width="720" :destroyOnClose="true" @cancel="closeCombinationModal">
      <div class="text-sm text-gray-600 mb-3">
        Học sinh: <span class="font-medium text-gray-900">{{ combinationModal.studentName || "N/A" }}</span>
      </div>
      <a-table :columns="combinationColumns" :data-source="combinationList" :pagination="false" :loading="combinationLoading || combinationModal.loading" row-key="id" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-switch :checked="isCombinationSelected(record.id)" size="small" @change="checked => toggleCombination(record.id, checked)" />
          </template>
        </template>
      </a-table>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <a-button @click="closeCombinationModal">Hủy</a-button>
          <a-button type="primary" :loading="combinationModal.saving" :disabled="combinationModal.loading || combinationLoading" @click="saveStudentCombinations">Lưu</a-button>
        </div>
      </template>
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

const combinationImportModal = reactive({
  open: false,
  file: null,
  fileList: [],
  uploading: false,
  downloading: false,
  classId: null,
});

const combinationModal = reactive({
  open: false,
  loading: false,
  saving: false,
  studentId: null,
  studentName: "",
  selectedIds: [],
});

const combinationList = ref([]);
const combinationLoading = ref(false);

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

const combinationColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã tổ hợp", dataIndex: "ma", key: "ma", width: 140, ellipsis: true },
  { title: "Tên tổ hợp", dataIndex: "ten", key: "ten", width: 200, ellipsis: true },
  { title: "Môn trong tổ hợp", dataIndex: "ten_mon", key: "ten_mon", ellipsis: true },
  { title: "Lựa chọn", key: "action", width: 110, align: "center" },
];

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

const openCombinationImportModal = () => {
  combinationImportModal.open = true;
};

const closeCombinationImportModal = () => {
  combinationImportModal.open = false;
  combinationImportModal.file = null;
  combinationImportModal.fileList = [];
  combinationImportModal.uploading = false;
  combinationImportModal.downloading = false;
  combinationImportModal.classId = null;
};

const openStudentCombinationModal = async record => {
  combinationModal.open = true;
  combinationModal.studentId = record?.id ?? null;
  combinationModal.studentName = record?.ten || "";
  combinationModal.selectedIds = [];
  await Promise.all([fetchCombinationList(), fetchStudentCombinations(record?.id)]);
  sanitizeSelectedCombinationIds();
};

const closeCombinationModal = () => {
  combinationModal.open = false;
  combinationModal.loading = false;
  combinationModal.saving = false;
  combinationModal.studentId = null;
  combinationModal.studentName = "";
  combinationModal.selectedIds = [];
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

const downloadStudentTemplate = () => {
  const link = document.createElement("a");
  link.href = encodeURI("/Import Học sinh.xlsx");
  link.download = "Import Học sinh.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const beforeCombinationImportUpload = file => {
  const originFile = file?.originFileObj || file;
  const extIndex = originFile.name?.lastIndexOf(".") ?? -1;
  const ext = extIndex >= 0 ? originFile.name.slice(extIndex) : "";
  const renamedFile = new File([originFile], `${Date.now()}${ext}`, {
    type: originFile.type,
    lastModified: originFile.lastModified,
  });
  combinationImportModal.file = renamedFile;
  combinationImportModal.fileList = [{ ...file, name: originFile.name }];
  return false;
};

const removeCombinationImportFile = () => {
  combinationImportModal.file = null;
  combinationImportModal.fileList = [];
};

const fetchCombinationList = async () => {
  try {
    combinationLoading.value = true;
    const pageSize = 10;
    let pageIndex = 1;
    let total = 0;
    const items = [];
    do {
      const { data, error } = await RestApi.review_subject_combination.list({ params: { pageIndex, pageSize, search: "" } });
      if (data.value?.status !== "success") {
        throw new Error(error.value?.data?.message || "Không tải được danh sách tổ hợp môn");
      }
      const payload = data.value.data || {};
      const pageItems = Array.isArray(payload.items) ? payload.items : [];
      total = Number(payload.totalrecord || 0);
      items.push(...pageItems);
      pageIndex += 1;
    } while (items.length < total && pageIndex < 200);
    combinationList.value = items;
  } catch (err) {
    combinationList.value = [];
    message.error(err.message || "Không tải được danh sách tổ hợp môn");
  } finally {
    combinationLoading.value = false;
  }
};

const fetchStudentCombinations = async studentId => {
  if (!studentId) return;
  try {
    combinationModal.loading = true;
    const { data, error } = await RestApi.student.get_subject_combination({ params: { Id_hoc_sinh: studentId } });
    if (data.value?.status === "success") {
      const detail = data.value.data || {};
      combinationModal.selectedIds = Array.isArray(detail.to_hop_mon) ? detail.to_hop_mon : [];
    } else {
      throw new Error(error.value?.data?.message || "Không tải được tổ hợp môn");
    }
  } catch (err) {
    combinationModal.selectedIds = [];
    message.error(err.message || "Không tải được tổ hợp môn");
  } finally {
    combinationModal.loading = false;
  }
};

const sanitizeSelectedCombinationIds = () => {
  const validIdMap = new Map(
    combinationList.value
      .filter(item => item?.id !== undefined && item?.id !== null)
      .map(item => [String(item.id), item.id])
  );
  const uniqueValidIds = [];
  const seen = new Set();
  for (const id of combinationModal.selectedIds) {
    const key = String(id);
    if (!validIdMap.has(key) || seen.has(key)) continue;
    uniqueValidIds.push(validIdMap.get(key));
    seen.add(key);
  }
  combinationModal.selectedIds = uniqueValidIds;
};

const isCombinationSelected = id => combinationModal.selectedIds.includes(id);

const toggleCombination = (id, checked) => {
  const next = new Set(combinationModal.selectedIds);
  if (checked) {
    next.add(id);
  } else {
    next.delete(id);
  }
  combinationModal.selectedIds = Array.from(next);
};

const saveStudentCombinations = async () => {
  if (!combinationModal.studentId) {
    message.warning("Không tìm thấy học sinh");
    return;
  }
  try {
    combinationModal.saving = true;
    sanitizeSelectedCombinationIds();
    const payload = {
      id_hoc_sinh: combinationModal.studentId,
      to_hop_mon: combinationModal.selectedIds,
    };
    const { data, error } = await RestApi.student.save_subject_combination({ body: payload });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Lưu thành công");
      closeCombinationModal();
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Lưu không thành công");
    }
  } catch (err) {
    message.error(err.message || "Lưu không thành công");
  } finally {
    combinationModal.saving = false;
  }
};

const downloadCombinationTemplate = async () => {
  const classId = combinationImportModal.classId;
  if (!classId) {
    message.warning("Vui lòng chọn lớp chính khóa để tải file mẫu");
    return;
  }
  try {
    combinationImportModal.downloading = true;
    const { data, error } = await RestApi.student.download_subject_combination_template({ params: { idlop: classId } });
    if (error.value) {
      throw new Error(error.value?.data?.message || "Không tải được file mẫu");
    }
    const { blob: blobData, headers } = data.value || {};
    if (!blobData) {
      throw new Error("Không tải được file mẫu");
    }
    const blob = blobData instanceof Blob ? blobData : new Blob([blobData]);
    const cd = headers && (headers["content-disposition"] || headers["Content-Disposition"]);
    const filename = (cd && (decodeURIComponent(/filename\*=UTF-8''([^;]+)/.exec(cd)?.[1] || "") || /filename=\"([^"]+)\"/.exec(cd)?.[1])) || "mau-tohopmon.xlsx";
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
    combinationImportModal.downloading = false;
  }
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

const handleImportCombinations = async () => {
  if (!combinationImportModal.file) {
    message.warning("Vui lòng chọn file để import");
    return;
  }
  try {
    combinationImportModal.uploading = true;
    const form = new FormData();
    form.append("file", combinationImportModal.file);
    const { data, error } = await RestApi.student.import_subject_combination({ body: form });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Import thành công");
      closeCombinationImportModal();
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
    combinationImportModal.uploading = false;
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
