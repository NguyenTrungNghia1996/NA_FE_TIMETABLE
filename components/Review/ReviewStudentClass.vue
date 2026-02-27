<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <a-card title="DANH SÁCH LỚP ÔN TẬP" class="md:col-span-1">
      <div class="mb-2">
        <SelectGradeLevelByUnit v-model="gradeId" />
      </div>
      <a-table :columns="classColumns" :data-source="classes" :loading="classLoading" :pagination="classPagination" size="small" row-key="id" @change="handleClassTableChange" :customRow="onClassRow">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (classPagination.current - 1) * classPagination.pageSize + index + 1 }}
          </template>
          <template v-else-if="column.key === 'ma'">
            {{ record.ma }}
          </template>
          <template v-else-if="column.key === 'ten'">
            {{ record.ten }}
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex justify-center">
              <a-tooltip title="Thêm học sinh vào lớp ôn tập">
                <a-button type="link" size="small" @click="openAssignModal(record)">
                  <template #icon>
                    <PlusOutlined />
                  </template>
                </a-button>
              </a-tooltip>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-card class="md:col-span-2" title="Học sinh - Lớp ôn tập">
      <div class="flex flex-col md:flex-row gap-2 mb-2">
        <a-input-search v-model:value="searchText" placeholder="Tìm kiếm học sinh..." enter-button @search="handleSearch" class="w-full md:w-1/2" />
        <a-button @click="resetSearch">Đặt lại</a-button>
        <a-button @click="openImportModal">Import học sinh - lớp ôn tập</a-button>
      </div>

      <a-table :columns="studentColumns" :data-source="students" :loading="studentLoading" :pagination="studentPagination" size="small" row-key="id" @change="handleStudentTableChange">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (studentPagination.current - 1) * studentPagination.pageSize + index + 1 }}
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex justify-center gap-2">
              <a-button type="link" size="small" @click="openEditModal(record)">
                <template #icon>
                  <EditOutlined />
                </template>
              </a-button>
              <a-popconfirm placement="topRight" title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteStudent(record.id)">
                <a-button type="link" danger size="small">
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="importModal.open" title="Import học sinh - lớp ôn tập" :footer="null" width="520px" :destroyOnClose="true" @cancel="closeImportModal">
      <div class="text-sm text-gray-600 mb-3">Chọn file Excel (.xlsx, .xls) để import danh sách học sinh - lớp ôn tập.</div>
      <div class="flex justify-end mb-3">
        <a-button type="primary" ghost @click="downloadStudentReviewTemplate">Tải file mẫu</a-button>
      </div>
      <a-upload :beforeUpload="beforeImportUpload" :maxCount="1" :file-list="importModal.fileList" @remove="removeImportFile" :accept="'.xlsx,.xls'" :showUploadList="{ showRemoveIcon: true }">
        <a-button>Chọn file</a-button>
      </a-upload>
      <div class="flex justify-end gap-2 mt-4">
        <a-button type="primary" :loading="importModal.uploading" :disabled="!importModal.file" @click="handleImportStudents">Lưu</a-button>
        <a-button danger @click="closeImportModal">Hủy</a-button>
      </div>
    </a-modal>

    <a-modal v-model:open="assignModal.visible" title="Thêm học sinh vào lớp ôn tập" :footer="null" width="720px" :destroyOnClose="true" @cancel="closeAssignModal">
      <div class="text-center text-sm text-gray-600 mb-3">
        Đang thiết lập học sinh cho lớp:
        <span class="font-semibold ml-1">{{ assignModal.classRecord?.ten || "--" }}</span>
      </div>
      <div class="flex flex-col md:flex-row gap-2 mb-2">
        <a-input-search v-model:value="assignModal.search" placeholder="Tìm kiếm học sinh..." enter-button @search="handleAssignSearch" class="w-full md:w-1/2" />
        <a-button @click="resetAssignSearch">Đặt lại</a-button>
      </div>
      <a-table :columns="assignStudentColumns" :data-source="assignModal.students" :loading="assignModal.loading" :pagination="assignModal.pagination" size="small" row-key="id" :row-selection="assignRowSelection" :customRow="onAssignRow" @change="handleAssignTableChange">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (assignModal.pagination.current - 1) * assignModal.pagination.pageSize + index + 1 }}
          </template>
        </template>
      </a-table>
      <div class="flex justify-end gap-2 mt-4">
        <a-button type="primary" :loading="assignModal.saving" @click="saveAssignStudents">Lưu</a-button>
        <a-button danger @click="closeAssignModal">Hủy</a-button>
      </div>
    </a-modal>

    <a-modal v-model:open="editModal.visible" title="Sửa học sinh - lớp" :footer="null" width="520px" :destroyOnClose="true" @cancel="closeEditModal">
      <a-form ref="editFormRef" :model="editModal.form" layout="vertical" :rules="editRules">
        <a-form-item label="Mã học sinh">
          <a-input :value="editModal.record?.ma_hoc_sinh || ''" disabled />
        </a-form-item>
        <a-form-item label="Họ và tên học sinh">
          <a-input :value="editModal.record?.ten_hoc_sinh || ''" disabled />
        </a-form-item>
        <a-form-item label="Lớp chính khóa">
          <a-input :value="editModal.record?.ten_lop_chinh || ''" disabled />
        </a-form-item>
        <SelectReviewClass v-model="editModal.form.id_lop_on" :id_khoi="editModal.record.id_khoi" name="id_lop_on" label="Lớp ôn tập" :rules="editRules.id_lop_on" />
      </a-form>
      <div class="flex justify-end gap-2 mt-4">
        <a-button type="primary" :loading="editModal.saving" @click="saveEditStudent">Lưu</a-button>
        <a-button danger @click="closeEditModal">Hủy</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
const { RestApi } = useApi();

const gradeId = ref(null);
const classes = ref([]);
const classLoading = ref(false);

const students = ref([]);
const studentLoading = ref(false);
const searchText = ref("");
const editFormRef = ref();
const importModal = reactive({
  open: false,
  file: null,
  fileList: [],
  uploading: false,
});
const assignModal = reactive({
  visible: false,
  loading: false,
  saving: false,
  classRecord: null,
  students: [],
  selectedIds: [],
  search: "",
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50"],
    showTotal: total => `Tổng ${total} bản ghi`,
  },
});
const editModal = reactive({
  visible: false,
  saving: false,
  record: null,
  form: {
    id: null,
    id_hoc_sinh: null,
    id_lop_on: null,
  },
});
const id_review_class = ref(null);
const onClassRow = record => ({
  onClick: async () => {
    id_review_class.value = record.id;
    await fetchStudents();
  },
  style: {
    cursor: "pointer",
  },
});
const classPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const studentPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const classColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã lớp ôn tập", dataIndex: "ma", key: "ma", ellipsis: true },
  { title: "Tên lớp ôn tập", dataIndex: "ten", key: "ten", ellipsis: true },
  { title: "Thao tác", key: "action", width: 90, align: "center" },
];

const studentColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã học sinh", dataIndex: "ma_hoc_sinh", key: "ma_hoc_sinh", ellipsis: true },
  { title: "Họ và tên học sinh", dataIndex: "ten_hoc_sinh", key: "ten_hoc_sinh", ellipsis: true },
  { title: "Lớp ôn tập", dataIndex: "ten_lop", key: "ten_lop", ellipsis: true },
  { title: "Lớp chính khóa", dataIndex: "ten_lop_chinh", key: "ten_lop_chinh", ellipsis: true },
  { title: "Thao tác", key: "action", width: 90, align: "center" },
];

const editRules = reactive({
  id_lop_on: [{ required: true, message: "Vui lòng chọn lớp ôn tập", trigger: "change" }],
});

const assignStudentColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã học sinh", dataIndex: "ma", key: "ma", ellipsis: true },
  { title: "Họ và tên học sinh", dataIndex: "ten", key: "ten", ellipsis: true },
];

const assignRowSelection = computed(() => ({
  selectedRowKeys: assignModal.selectedIds,
  onChange: keys => {
    assignModal.selectedIds = keys;
  },
}));

const fetchClasses = async () => {
  try {
    classLoading.value = true;
    const params = {
      pageIndex: classPagination.current,
      pageSize: classPagination.pageSize,
    };
    if (gradeId.value) {
      params.id_khoi = gradeId.value;
    }
    const { data } = await RestApi.review_class.list({ params });
    if (data.value?.status === "success") {
      classes.value = data.value.data.items || [];
      classPagination.total = data.value.data.totalrecord || 0;
    } else {
      classes.value = [];
      classPagination.total = 0;
    }
  } catch (err) {
    classes.value = [];
    classPagination.total = 0;
    message.error(err.message || "Không thể tải danh sách lớp ôn tập");
  } finally {
    classLoading.value = false;
  }
};

const fetchStudents = async () => {
  try {
    studentLoading.value = true;
    const params = {
      pageIndex: studentPagination.current,
      pageSize: studentPagination.pageSize
    };
    if (id_review_class.value) {
      params.Id_lop_on = id_review_class.value;
    }
    if(searchText.value) {
      params.search = searchText.value.trim();
    }
    const { data } = await RestApi.review_class.list_students({ params });
    if (data.value?.status === "success") {
      students.value = data.value.data.items || [];
      studentPagination.total = data.value.data.totalrecord || 0;
    } else {
      students.value = [];
      studentPagination.total = 0;
    }
  } catch (err) {
    students.value = [];
    studentPagination.total = 0;
    message.error(err.message || "Không thể tải danh sách học sinh");
  } finally {
    studentLoading.value = false;
  }
};

const handleClassTableChange = async pag => {
  classPagination.current = pag.current;
  classPagination.pageSize = pag.pageSize;
  await fetchClasses();
};

const handleStudentTableChange = async pag => {
  studentPagination.current = pag.current;
  studentPagination.pageSize = pag.pageSize;
  await fetchStudents();
};

const handleSearch = async () => {
  studentPagination.current = 1;
  await fetchStudents();
};

const resetSearch = async () => {
  searchText.value = "";
  studentPagination.current = 1;
  await fetchStudents();
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

const downloadStudentReviewTemplate = () => {
  const link = document.createElement("a");
  link.href = encodeURI("/Import Học sinh ôn tập.xlsx");
  link.download = "Import Học sinh ôn tập.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
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
    const { data, error } = await RestApi.review_class.import_students({ body: form });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Import thành công");
      closeImportModal();
      studentPagination.current = 1;
      await fetchStudents();
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Import không thành công");
    }
  } catch (err) {
    message.error(err.message || "Import không thành công");
  } finally {
    importModal.uploading = false;
  }
};

const fetchAssignStudentIds = async () => {
  if (!assignModal.classRecord?.id) return;
  try {
    const { data, error } = await RestApi.review_class.list_student_ids({ params: { idLop: assignModal.classRecord.id } });
    if (data.value?.status === "success") {
      assignModal.selectedIds = data.value.data?.hoc_sinh || [];
    } else {
      throw new Error(error.value?.data?.message || "Không thể tải danh sách học sinh đã chọn");
    }
  } catch (err) {
    assignModal.selectedIds = [];
    message.error(err.message || "Không thể tải danh sách học sinh đã chọn");
  }
};

const fetchAssignStudents = async () => {
  try {
    assignModal.loading = true;
    const params = {
      pageIndex: assignModal.pagination.current,
      pageSize: assignModal.pagination.pageSize,
      search: (assignModal.search || "").trim(),
      id_khoi: assignModal.classRecord?.id_khoi || null,
    };
    const { data } = await RestApi.student.list({ params });
    if (data.value?.status === "success") {
      assignModal.students = data.value.data.items || [];
      assignModal.pagination.total = data.value.data.totalrecord || 0;
    } else {
      assignModal.students = [];
      assignModal.pagination.total = 0;
    }
  } catch (err) {
    assignModal.students = [];
    assignModal.pagination.total = 0;
    message.error(err.message || "Không thể tải danh sách học sinh");
  } finally {
    assignModal.loading = false;
  }
};

const openAssignModal = async record => {
  assignModal.classRecord = record || null;
  assignModal.visible = true;
  assignModal.search = "";
  assignModal.pagination.current = 1;
  assignModal.selectedIds = [];
  await fetchAssignStudentIds();
  await fetchAssignStudents();
};

const closeAssignModal = () => {
  assignModal.visible = false;
  assignModal.classRecord = null;
  assignModal.students = [];
  assignModal.selectedIds = [];
  assignModal.search = "";
  assignModal.pagination.current = 1;
  assignModal.pagination.total = 0;
  assignModal.loading = false;
  assignModal.saving = false;
};

const handleAssignTableChange = async pag => {
  assignModal.pagination.current = pag.current;
  assignModal.pagination.pageSize = pag.pageSize;
  await fetchAssignStudents();
};

const handleAssignSearch = async () => {
  assignModal.pagination.current = 1;
  await fetchAssignStudents();
};

const resetAssignSearch = async () => {
  assignModal.search = "";
  assignModal.pagination.current = 1;
  await fetchAssignStudents();
};

const onAssignRow = record => ({
  onClick: () => {
    const key = record?.id;
    if (key === undefined || key === null) return;
    const idx = assignModal.selectedIds.findIndex(id => id === key);
    if (idx >= 0) {
      assignModal.selectedIds.splice(idx, 1);
    } else {
      assignModal.selectedIds.push(key);
    }
  },
  style: {
    cursor: "pointer",
  },
});

const saveAssignStudents = async () => {
  if (!assignModal.classRecord?.id) return;
  try {
    assignModal.saving = true;
    const payload = {
      id_lop: assignModal.classRecord.id,
      hoc_sinh: assignModal.selectedIds || [],
    };
    const { data, error } = await RestApi.review_class.update_students({ body: payload });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Cập nhật thành công");
      closeAssignModal();
      studentPagination.current = 1;
      await fetchStudents();
    } else {
      throw new Error(error.value?.data?.message || "Cập nhật không thành công");
    }
  } catch (err) {
    message.error(err.message || "Cập nhật không thành công");
  } finally {
    assignModal.saving = false;
  }
};

const deleteStudent = async id => {
  if (!id) return;
  try {
    const { data, error } = await RestApi.review_class.delete_student({ params: { id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa thành công");
      await fetchStudents();
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (err) {
    message.error(err.message || "Xóa không thành công");
  }
};

const openEditModal = record => {
  if (!record) return;
  editModal.record = record;
  editModal.form = {
    id: record.id,
    id_hoc_sinh: record.id_hoc_sinh,
    id_lop_on: record.id_lop_on,
  };
  editModal.visible = true;
};

const closeEditModal = () => {
  editModal.visible = false;
  editModal.saving = false;
  editModal.record = null;
  editModal.form = {
    id: null,
    id_hoc_sinh: null,
    id_lop_on: null,
  };
  editFormRef.value?.resetFields?.();
};

const saveEditStudent = async () => {
  try {
    await editFormRef.value?.validate();
    editModal.saving = true;
    const payload = {
      id: editModal.form.id,
      id_hoc_sinh: editModal.form.id_hoc_sinh,
      id_lop_on: editModal.form.id_lop_on,
    };
    const { data, error } = await RestApi.review_class.update_student({ body: payload });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Cập nhật thành công");
      closeEditModal();
      await fetchStudents();
    } else {
      throw new Error(error.value?.data?.message || "Cập nhật không thành công");
    }
  } catch (err) {
    message.error(err.message || "Cập nhật không thành công");
  } finally {
    editModal.saving = false;
  }
};

const reset = () => {
  students.value = [];
  studentPagination.current = 1;
  studentPagination.total = 0;
  searchText.value = "";
  closeImportModal();
  closeAssignModal();
  closeEditModal();
};

const refresh = async () => {
  await fetchClasses();
  await fetchStudents();
};

defineExpose({
  reset,
  refresh,
});

watch(gradeId, async () => {
  classPagination.current = 1;
  await fetchClasses();
});

onMounted(() => {
  fetchClasses();
  fetchStudents();
});
</script>
