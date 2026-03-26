<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <a-card title="DANH SÁCH ĐIỂM THI" class="xl:col-span-4">
        <div class="flex flex-col sm:flex-row gap-2 mb-3">
          <a-input-search v-model:value="locationSearchText" placeholder="Nhập thông tin tìm kiếm" enter-button @search="handleLocationSearch" class="flex-1" />
          <a-button @click="resetLocationSearch">Đặt lại</a-button>
        </div>

        <ClientOnly>
          <a-table
            :columns="locationColumns"
            :data-source="locationDataSource"
            :pagination="locationPagination"
            :loading="locationLoading"
            row-key="id"
            size="small"
            bordered
            :customRow="onLocationRow"
            :row-class-name="locationRowClassName"
            @change="handleLocationTableChange"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'stt'">
                {{ (locationPagination.current - 1) * locationPagination.pageSize + index + 1 }}
              </template>

              <template v-else-if="column.key === 'action'">
                <div class="flex justify-center">
                  <a-button type="link" size="small" :disabled="!settingStore.currentPermission" @click.stop="openTeacherAssignModal(record)">
                    <template #icon>
                      <UserAddOutlined />
                    </template>
                  </a-button>
                </div>
              </template>
            </template>
          </a-table>
        </ClientOnly>
      </a-card>

      <a-card :title="supervisoryTitle" class="xl:col-span-8">
        <template #extra>
          <a-button @click="openImportModal" :disabled="!settingStore.currentPermission || !selectedLocation">
            Import giám thị
          </a-button>
        </template>

        <div class="flex flex-col sm:flex-row gap-2 mb-3">
          <a-input-search
            v-model:value="supervisorySearchText"
            placeholder="Tìm kiếm mã hoặc tên giám thị..."
            enter-button
            @search="handleSupervisorySearch"
            class="flex-1"
            :disabled="!selectedLocation"
          />
          <a-button @click="resetSupervisorySearch" :disabled="!selectedLocation">Đặt lại</a-button>
        </div>

        <div v-if="!selectedLocation" class="text-gray-500 min-h-[160px] flex items-center justify-center">
          Vui lòng chọn một điểm thi ở bảng bên trái.
        </div>

        <ClientOnly v-else>
          <a-table
            :columns="supervisoryColumns"
            :data-source="supervisoryDataSource"
            :pagination="supervisoryPagination"
            :loading="supervisoryLoading"
            row-key="id"
            size="small"
            bordered
            :scroll="{ x: '900' }"
            @change="handleSupervisoryTableChange"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'stt'">
                {{ (supervisoryPagination.current - 1) * supervisoryPagination.pageSize + index + 1 }}
              </template>

              <template v-else-if="column.key === 'action'">
                <div class="flex justify-center">
                  <div class="md:flex space-x-2">
                    <a-button type="link" size="small" @click="editSupervisory(record)" :disabled="!settingStore.currentPermission || detailLoading">
                      <template #icon>
                        <EditOutlined />
                      </template>
                    </a-button>

                    <a-popconfirm placement="topRight" title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteSupervisory(record.id)">
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
      </a-card>
    </div>

    <a-modal v-model:open="visible" title="Chỉnh sửa giám thị" :width="680" @cancel="handleCancel">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules" class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <!-- <a-form-item label="Điểm thi">
          <a-input :value="selectedLocation?.ten || ''" disabled />
        </a-form-item> -->

        <a-form-item label="Mã giám thị" name="ma" class="md:col-span-2">
          <a-input v-model:value="formState.ma" placeholder="Nhập mã giám thị" :maxlength="50" show-count />
        </a-form-item>

        <a-form-item label="Tên giám thị" name="ho_va_ten" class="md:col-span-2">
          <a-input v-model:value="formState.ho_va_ten" placeholder="Nhập tên giám thị" :maxlength="255" show-count />
        </a-form-item>
      </a-form>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" :loading="confirmLoading || detailLoading" @click="handleOk">Cập nhật</a-button>
        </div>
      </template>
    </a-modal>

    <a-modal v-model:open="importModal.open" title="Import giám thị" :footer="null" width="520px" :destroyOnClose="true" @cancel="closeImportModal">
      <div class="space-y-3">
        <!-- <a-alert v-if="selectedLocation" type="info" show-icon :message="`Điểm thi đang chọn: ${selectedLocation.ten || selectedLocation.ma || selectedLocation.id}`" /> -->

        <a-upload :beforeUpload="beforeImportUpload" :maxCount="1" :file-list="importModal.fileList" @remove="removeImportFile" :accept="'.xlsx,.xls'" :showUploadList="{ showRemoveIcon: true }">
          <a-button>Chọn file</a-button>
        </a-upload>

        <div class="flex justify-end gap-2">
          <a-button type="primary" :loading="importModal.uploading" :disabled="!importModal.file || !settingStore.currentPermission" @click="handleImport">
            Import
          </a-button>
          <a-button danger @click="closeImportModal">Hủy</a-button>
        </div>
      </div>
    </a-modal>

    <a-modal
      v-model:open="teacherAssignModal.open"
      title="THÊM GIÁM THỊ TỪ GIÁO VIÊN"
      :width="900"
      :confirm-loading="teacherAssignModal.saving"
      @cancel="closeTeacherAssignModal"
    >
      <div class="space-y-3">
        <a-alert
          v-if="teacherAssignModal.location"
          type="info"
          show-icon
          :message="`Đang thiết lập giám thị cho điểm thi: ${teacherAssignModal.location.ten || teacherAssignModal.location.ma || teacherAssignModal.location.id}`"
        />

        <div class="flex flex-col sm:flex-row gap-2">
          <a-input-search
            v-model:value="teacherAssignModal.searchText"
            placeholder="Tìm kiếm giáo viên..."
            enter-button
            class="flex-1"
            @search="handleTeacherSearch"
          />
          <a-button @click="resetTeacherSearch">Đặt lại</a-button>
        </div>

        <a-table
          :columns="teacherAssignColumns"
          :data-source="teacherAssignModal.dataSource"
          :pagination="teacherAssignPagination"
          :loading="teacherAssignModal.loading"
          row-key="id"
          size="small"
          bordered
          :row-selection="teacherRowSelection"
          :customRow="onTeacherRow"
          @change="handleTeacherTableChange"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'stt'">
              {{ (teacherAssignPagination.current - 1) * teacherAssignPagination.pageSize + index + 1 }}
            </template>

            <template v-else-if="column.key === 'ma_giao_vien'">
              {{ record.ma_giao_vien || record.ma || "" }}
            </template>

            <template v-else-if="column.key === 'teacher_name'">
              {{ `${record.ho_va_ho_dem || ""} ${record.ten || ""}`.trim() || record.ho_va_ten || "" }}
            </template>
          </template>
        </a-table>
      </div>

      <template #footer>
        <div class="flex justify-center gap-2">
          <a-button type="primary" :loading="teacherAssignModal.saving" @click="saveTeacherAssignment">Lưu</a-button>
          <a-button danger @click="closeTeacherAssignModal">Hủy</a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
const settingStore = useSettingStore();
const { RestApi } = useApi();

const locationParam = ref({ pageIndex: 1, pageSize: 10, search: "" });
const supervisoryParam = ref({ pageIndex: 1, pageSize: 10, search: "" });

const locationColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã điểm thi", dataIndex: "ma", key: "ma", width: 120, align: "center" },
  { title: "Tên điểm thi", dataIndex: "ten", key: "ten", ellipsis: true },
  { title: "Thao tác", key: "action", width: 90, align: "center" },
];

const supervisoryColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã giám thị", dataIndex: "ma", key: "ma", width: 140, align: "center" },
  { title: "Tên giám thị", dataIndex: "ho_va_ten", key: "ho_va_ten", ellipsis: true },
  { title: "Thao tác", key: "action", width: 110, align: "center", fixed: "right" },
];

const locationDataSource = ref([]);
const supervisoryDataSource = ref([]);
const selectedLocation = ref(null);

const locationLoading = ref(false);
const supervisoryLoading = ref(false);
const detailLoading = ref(false);
const confirmLoading = ref(false);

const locationSearchText = ref("");
const supervisorySearchText = ref("");

const visible = ref(false);
const formRef = ref();

const importModal = reactive({
  open: false,
  file: null,
  fileList: [],
  uploading: false,
});

const teacherAssignModal = reactive({
  open: false,
  loading: false,
  saving: false,
  dataSource: [],
  selectedIds: [],
  searchText: "",
  location: null,
});

const locationPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const supervisoryPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const teacherAssignPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const defaultFormState = () => ({
  id: undefined,
  ma: "",
  ho_va_ten: "",
  id_diem_thi: undefined,
});

const formState = reactive(defaultFormState());

const rules = reactive({
  ma: [
    { required: true, message: "Vui lòng nhập mã giám thị", trigger: "blur" },
    { max: 50, message: "Mã giám thị không quá 50 ký tự", trigger: "blur" },
  ],
  ho_va_ten: [
    { required: true, message: "Vui lòng nhập tên giám thị", trigger: "blur" },
    { max: 255, message: "Tên giám thị không quá 255 ký tự", trigger: "blur" },
  ],
});

const teacherAssignParam = ref({ PageIndex: 1, PageSize: 10, search: "" });

const teacherAssignColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã giáo viên", key: "ma_giao_vien", width: 160, align: "center" },
  { title: "Họ và tên giáo viên", key: "teacher_name", ellipsis: true },
];

const supervisoryTitle = computed(() => {
  if (!selectedLocation.value) return "DANH SÁCH GIÁM THỊ";
  return `DANH SÁCH GIÁM THỊ - ${selectedLocation.value.ten || selectedLocation.value.ma || ""}`;
});

const resetFormState = () => {
  Object.assign(formState, defaultFormState());
};

const syncSelectedLocation = items => {
  if (!Array.isArray(items) || !items.length) {
    selectedLocation.value = null;
    supervisoryDataSource.value = [];
    supervisoryPagination.total = 0;
    return;
  }

  const matched = items.find(item => item.id === selectedLocation.value?.id);
  selectedLocation.value = matched || items[0];
};

const fetchLocations = async params => {
  try {
    locationLoading.value = true;
    const previousSelectedId = selectedLocation.value?.id;
    const { data, error } = await RestApi.exam_location.list({ params });
    if (data.value?.status === "success") {
      const items = data.value?.data?.items || [];
      locationDataSource.value = items;
      locationPagination.total = data.value?.data?.totalrecord || 0;
      syncSelectedLocation(items);
      if (selectedLocation.value?.id !== previousSelectedId) {
        supervisoryPagination.current = 1;
        supervisoryParam.value.pageIndex = 1;
        await refreshSupervisoryList();
      }
    } else {
      throw new Error(error.value?.data?.message || "Không tải được dữ liệu điểm thi");
    }
  } catch (err) {
    locationDataSource.value = [];
    selectedLocation.value = null;
    locationPagination.total = 0;
    message.error(err?.message || "Lỗi tải dữ liệu điểm thi");
  } finally {
    locationLoading.value = false;
  }
};

const fetchSupervisories = async params => {
  if (!selectedLocation.value?.id) {
    supervisoryDataSource.value = [];
    supervisoryPagination.total = 0;
    return;
  }

  try {
    supervisoryLoading.value = true;
    const { data, error } = await RestApi.supervisory.list({
      params: {
        ...params,
        idDiemThi: selectedLocation.value.id,
      },
    });

    if (data.value?.status === "success") {
      supervisoryDataSource.value = data.value?.data?.items || [];
      supervisoryPagination.total = data.value?.data?.totalrecord || 0;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được dữ liệu giám thị");
    }
  } catch (err) {
    supervisoryDataSource.value = [];
    supervisoryPagination.total = 0;
    message.error(err?.message || "Lỗi tải dữ liệu giám thị");
  } finally {
    supervisoryLoading.value = false;
  }
};

const fetchTeachers = async params => {
  try {
    teacherAssignModal.loading = true;
    const idDonVi = teacherAssignModal.location?.id_don_vi ?? selectedLocation.value?.id_don_vi;
    const teacherParams = { ...params };
    if (idDonVi !== undefined && idDonVi !== null && idDonVi !== "") {
      teacherParams.idDonVi = idDonVi;
    }

    const { data, error } = await RestApi.teacher.list({ params: teacherParams });
    if (data.value?.status === "success") {
      teacherAssignModal.dataSource = data.value?.data?.items || [];
      teacherAssignPagination.total = data.value?.data?.totalrecord || 0;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được danh sách giáo viên");
    }
  } catch (err) {
    teacherAssignModal.dataSource = [];
    teacherAssignPagination.total = 0;
    message.error(err?.message || "Không tải được danh sách giáo viên");
  } finally {
    teacherAssignModal.loading = false;
  }
};

const fetchAssignedTeacherIds = async idDiemThi => {
  try {
    const { data, error } = await RestApi.supervisory.list_teacher_ids({ params: { idDiemThi } });
    if (data.value?.status === "success") {
      teacherAssignModal.selectedIds = (data.value?.data?.id_giao_vien || []).filter(id => Number.isInteger(id) && id > 0);
    } else {
      throw new Error(error.value?.data?.message || "Không tải được danh sách giáo viên đã chọn");
    }
  } catch (err) {
    teacherAssignModal.selectedIds = [];
    message.error(err?.message || "Không tải được danh sách giáo viên đã chọn");
  }
};

const refreshSupervisoryList = async () => {
  await fetchSupervisories({ ...supervisoryParam.value });
};

const selectLocation = async record => {
  if (!record?.id) return;
  selectedLocation.value = record;
  supervisoryPagination.current = 1;
  supervisoryParam.value.pageIndex = 1;
  await refreshSupervisoryList();
};

const onLocationRow = record => ({
  onClick: () => {
    selectLocation(record);
  },
  style: {
    cursor: "pointer",
  },
});

const locationRowClassName = record => (record.id === selectedLocation.value?.id ? "active-row" : "");

const teacherRowSelection = computed(() => ({
  selectedRowKeys: teacherAssignModal.selectedIds,
  onChange: keys => {
    teacherAssignModal.selectedIds = keys;
  },
  type: "checkbox",
}));

const onTeacherRow = record => ({
  onClick: () => {
    const exists = teacherAssignModal.selectedIds.includes(record.id);
    if (exists) {
      teacherAssignModal.selectedIds = teacherAssignModal.selectedIds.filter(id => id !== record.id);
    } else {
      teacherAssignModal.selectedIds = [...teacherAssignModal.selectedIds, record.id];
    }
  },
  style: {
    cursor: "pointer",
  },
});

const handleLocationTableChange = async pag => {
  locationPagination.current = pag.current;
  locationPagination.pageSize = pag.pageSize;
  locationParam.value.pageIndex = pag.current;
  locationParam.value.pageSize = pag.pageSize;
  await fetchLocations({ ...locationParam.value });
};

const handleTeacherTableChange = async pag => {
  teacherAssignPagination.current = pag.current;
  teacherAssignPagination.pageSize = pag.pageSize;
  teacherAssignParam.value.PageIndex = pag.current;
  teacherAssignParam.value.PageSize = pag.pageSize;
  await fetchTeachers({ ...teacherAssignParam.value });
};

const handleSupervisoryTableChange = async pag => {
  supervisoryPagination.current = pag.current;
  supervisoryPagination.pageSize = pag.pageSize;
  supervisoryParam.value.pageIndex = pag.current;
  supervisoryParam.value.pageSize = pag.pageSize;
  await refreshSupervisoryList();
};

const handleLocationSearch = async () => {
  const search = (locationSearchText.value || "").trim();
  if (search) {
    locationParam.value.search = search;
  } else {
    delete locationParam.value.search;
  }
  locationPagination.current = 1;
  locationParam.value.pageIndex = 1;
  await fetchLocations({ ...locationParam.value });
};

const resetLocationSearch = async () => {
  locationSearchText.value = "";
  locationParam.value = { pageIndex: 1, pageSize: locationPagination.pageSize, search: "" };
  locationPagination.current = 1;
  await fetchLocations({ ...locationParam.value });
};

const handleTeacherSearch = async () => {
  const search = (teacherAssignModal.searchText || "").trim();
  if (search) {
    teacherAssignParam.value.search = search;
  } else {
    delete teacherAssignParam.value.search;
  }
  teacherAssignPagination.current = 1;
  teacherAssignParam.value.PageIndex = 1;
  await fetchTeachers({ ...teacherAssignParam.value });
};

const resetTeacherSearch = async () => {
  teacherAssignModal.searchText = "";
  teacherAssignParam.value = { PageIndex: 1, PageSize: teacherAssignPagination.pageSize, search: "" };
  teacherAssignPagination.current = 1;
  await fetchTeachers({ ...teacherAssignParam.value });
};

const handleSupervisorySearch = async () => {
  const search = (supervisorySearchText.value || "").trim();
  if (search) {
    supervisoryParam.value.search = search;
  } else {
    delete supervisoryParam.value.search;
  }
  supervisoryPagination.current = 1;
  supervisoryParam.value.pageIndex = 1;
  await refreshSupervisoryList();
};

const resetSupervisorySearch = async () => {
  supervisorySearchText.value = "";
  supervisoryParam.value = { pageIndex: 1, pageSize: supervisoryPagination.pageSize, search: "" };
  supervisoryPagination.current = 1;
  await refreshSupervisoryList();
};

const editSupervisory = async record => {
  try {
    detailLoading.value = true;
    const { data, error } = await RestApi.supervisory.detail({ params: { Id: record.id } });
    if (data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || "Không tải được chi tiết giám thị");
    }

    Object.assign(formState, {
      id: data.value?.data?.id,
      ma: data.value?.data?.ma || "",
      ho_va_ten: data.value?.data?.ho_va_ten || "",
      id_diem_thi: data.value?.data?.id_diem_thi ?? selectedLocation.value?.id,
    });
    visible.value = true;
  } catch (err) {
    message.error(err?.message || "Không tải được chi tiết giám thị");
  } finally {
    detailLoading.value = false;
  }
};

const buildPayload = () => ({
  id: formState.id,
  ma: (formState.ma || "").trim(),
  Ho_va_ten: (formState.ho_va_ten || "").trim(),
  id_diem_thi: formState.id_diem_thi ?? selectedLocation.value?.id,
});

const handleOk = async () => {
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;
    const { data, error } = await RestApi.supervisory.update({ body: buildPayload() });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Cập nhật giám thị thành công");
      visible.value = false;
      formRef.value?.resetFields?.();
      resetFormState();
      await refreshSupervisoryList();
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Cập nhật không thành công");
    }
  } catch (err) {
    message.error(err?.message || err?.response?.data?.message || "Đã xảy ra lỗi khi lưu");
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  formRef.value?.resetFields?.();
  resetFormState();
  visible.value = false;
};

const deleteSupervisory = async id => {
  try {
    const { data, error } = await RestApi.supervisory.delete({ params: { Id: id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa giám thị thành công");
      supervisoryPagination.current = 1;
      supervisoryParam.value.pageIndex = 1;
      await refreshSupervisoryList();
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (err) {
    message.error(err?.message || err?.response?.data?.message || "Đã xảy ra lỗi khi xóa giám thị");
  }
};

const openTeacherAssignModal = async record => {
  const location = record || selectedLocation.value;
  if (!location?.id) {
    message.warning("Vui lòng chọn điểm thi");
    return;
  }

  selectedLocation.value = location;
  teacherAssignModal.location = location;
  teacherAssignModal.open = true;
  teacherAssignModal.searchText = "";
  teacherAssignModal.selectedIds = [];
  teacherAssignParam.value = { PageIndex: 1, PageSize: teacherAssignPagination.pageSize, search: "" };
  teacherAssignPagination.current = 1;

  await Promise.all([
    fetchTeachers({ ...teacherAssignParam.value }),
    fetchAssignedTeacherIds(location.id),
  ]);
};

const closeTeacherAssignModal = () => {
  teacherAssignModal.open = false;
  teacherAssignModal.loading = false;
  teacherAssignModal.saving = false;
  teacherAssignModal.dataSource = [];
  teacherAssignModal.selectedIds = [];
  teacherAssignModal.searchText = "";
  teacherAssignModal.location = null;
};

const saveTeacherAssignment = async () => {
  if (!teacherAssignModal.location?.id) {
    message.warning("Vui lòng chọn điểm thi");
    return;
  }

  try {
    teacherAssignModal.saving = true;
    const payload = {
      id_diem_thi: teacherAssignModal.location.id,
      id_giao_vien: [...teacherAssignModal.selectedIds],
    };
    const { data, error } = await RestApi.supervisory.save_teacher_ids({ body: payload });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Lưu giám thị thành công");
      closeTeacherAssignModal();
      if (selectedLocation.value?.id === payload.id_diem_thi) {
        supervisoryPagination.current = 1;
        supervisoryParam.value.pageIndex = 1;
        await refreshSupervisoryList();
      }
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Lưu không thành công");
    }
  } catch (err) {
    message.error(err?.message || "Lưu không thành công");
  } finally {
    teacherAssignModal.saving = false;
  }
};

const openImportModal = () => {
  if (!selectedLocation.value) {
    message.warning("Vui lòng chọn điểm thi");
    return;
  }
  importModal.file = null;
  importModal.fileList = [];
  importModal.uploading = false;
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

const handleImport = async () => {
  if (!importModal.file) {
    message.warning("Vui lòng chọn file để import");
    return;
  }

  try {
    importModal.uploading = true;
    const form = new FormData();
    form.append("file", importModal.file);
    const { data, error } = await RestApi.supervisory.import_file({ body: form });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Import thành công");
      closeImportModal();
      supervisoryPagination.current = 1;
      supervisoryParam.value.pageIndex = 1;
      await refreshSupervisoryList();
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Import không thành công");
    }
  } catch (err) {
    message.error(err?.message || "Import không thành công");
  } finally {
    importModal.uploading = false;
  }
};

await fetchLocations({ ...locationParam.value });
await refreshSupervisoryList();
</script>

<style scoped>
:deep(.active-row > td) {
  background-color: #e6f7ff !important;
}
</style>
