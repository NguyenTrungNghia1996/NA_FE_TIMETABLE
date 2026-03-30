<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="mb-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-slate-700">Bộ lọc dữ liệu</div>
          <div class="text-xs text-slate-500">Chọn hội đồng thi để lọc đồng thời danh sách điểm thi và phòng thi.</div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-end gap-2 lg:min-w-[480px]">
          <div class="flex-1 min-w-0">
            <SelectExamBoard
              v-model="listFilter.id_hoi_dong"
              label="Hội đồng thi"
              name="list_filter_id_hoi_dong"
              no-form-item
              placeholder="Lọc theo hội đồng thi"
            />
          </div>
          <a-button @click="listFilter.id_hoi_dong = undefined" :disabled="!listFilter.id_hoi_dong">
            Xóa lọc
          </a-button>
        </div>
      </div>
    </div>

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
            </template>
          </a-table>
        </ClientOnly>
      </a-card>

      <a-card :title="roomTitle" class="xl:col-span-8">
        <template #extra>
          <div class="flex items-center gap-2">
            <a-button :disabled="!settingStore.currentPermission" @click="openImportModal">
              Import phòng thi
            </a-button>
            <a-button type="primary" :disabled="!settingStore.currentPermission" @click="showModal">
              Thêm mới
            </a-button>
          </div>
        </template>

        <div v-if="!selectedLocation" class="text-gray-500 min-h-[160px] flex items-center justify-center">
          Vui lòng chọn một điểm thi ở bảng bên trái.
        </div>

        <template v-else>
          <div class="flex flex-col sm:flex-row gap-2 mb-3">
            <a-input-search v-model:value="roomSearchText" placeholder="Tìm kiếm phòng thi..." enter-button @search="handleRoomSearch" class="flex-1" />
            <a-button @click="resetRoomSearch">Đặt lại</a-button>
          </div>

          <ClientOnly>
            <a-table
              :columns="roomColumns"
              :data-source="roomDataSource"
              :pagination="roomPagination"
              :loading="roomLoading"
              row-key="id"
              size="small"
              bordered
              :scroll="{ x: '900' }"
              @change="handleRoomTableChange"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'stt'">
                  {{ (roomPagination.current - 1) * roomPagination.pageSize + index + 1 }}
                </template>

                <template v-else-if="column.key === 'so_phong'">
                  {{ record.so_phong ?? "" }}
                </template>

                <template v-else-if="column.key === 'action'">
                  <div class="flex justify-center">
                    <div class="md:flex space-x-2">
                      <a-button type="link" size="small" :disabled="!settingStore.currentPermission || detailLoading" @click="editRoom(record)">
                        <template #icon>
                          <EditOutlined />
                        </template>
                      </a-button>

                      <a-popconfirm placement="topRight" title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteRoom(record.id)">
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
        </template>
      </a-card>
    </div>

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa phòng thi' : 'Thêm mới phòng thi'" :width="720" :destroyOnClose="true" @cancel="handleCancel">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules" class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SelectYear v-model="formState.id_nam" label="Năm học" name="id_nam" :rules="rules.id_nam" />
        <SelectExamBoard
          v-model="formState.id_hoi_dong"
          label="Hội đồng thi"
          name="id_hoi_dong"
          :rules="rules.id_hoi_dong"
          :id-nam="formState.id_nam"
        />

        <SelectExamLocation
          v-model="formState.id_diem_thi"
          label="Điểm thi"
          name="id_diem_thi"
          :rules="rules.id_diem_thi"
          :id-hoi-dong="formState.id_hoi_dong"
          class="md:col-span-2"
        />

        <a-form-item label="Tòa nhà" name="toa">
          <a-input v-model:value="formState.toa" placeholder="Nhập tòa nhà" :maxlength="255" show-count />
        </a-form-item>

        <a-form-item label="Tầng" name="tang">
          <a-input-number v-model:value="formState.tang" :min="1" :precision="0" class="!w-full" placeholder="Nhập tầng" />
        </a-form-item>
      </a-form>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" :loading="confirmLoading || detailLoading" @click="handleOk">
            {{ isEdit ? "Cập nhật" : "Thêm mới" }}
          </a-button>
        </div>
      </template>
    </a-modal>

    <a-modal v-model:open="importModal.open" title="Import phòng thi" :footer="null" width="520px" :destroyOnClose="true" @cancel="closeImportModal">
      <div class="space-y-3">
        <div class="flex justify-end">
          <a-button type="primary" ghost @click="downloadRoomTemplate">Tải file mẫu</a-button>
        </div>

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
  </div>
</template>

<script setup>
const settingStore = useSettingStore();
const { RestApi } = useApi();

const locationParam = ref({ pageIndex: 1, pageSize: 10, search: "" });
const roomParam = ref({ pageIndex: 1, pageSize: 10, search: "" });

const locationColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã điểm thi", dataIndex: "ma", key: "ma", width: 120, align: "center" },
  { title: "Tên điểm thi", dataIndex: "ten", key: "ten", ellipsis: true },
];

const roomColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Số phòng thi", key: "so_phong", width: 140, align: "center" },
  { title: "Tòa nhà", dataIndex: "toa", key: "toa", width: 180, align: "center" },
  { title: "Tầng", dataIndex: "tang", key: "tang", width: 120, align: "center" },
  { title: "Thao tác", key: "action", width: 110, align: "center", fixed: "right" },
];

const locationDataSource = ref([]);
const roomDataSource = ref([]);
const selectedLocation = ref(null);

const locationLoading = ref(false);
const roomLoading = ref(false);
const detailLoading = ref(false);
const confirmLoading = ref(false);

const locationSearchText = ref("");
const roomSearchText = ref("");
const listFilter = reactive({
  id_hoi_dong: undefined,
});

const visible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const syncingFormFilters = ref(false);
const importModal = reactive({
  open: false,
  file: null,
  fileList: [],
  uploading: false,
});

const locationPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const roomPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const defaultFormState = () => ({
  id: undefined,
  toa: "",
  tang: 1,
  id_nam: undefined,
  id_hoi_dong: undefined,
  id_diem_thi: undefined,
});

const formState = reactive(defaultFormState());

const rules = reactive({
  id_nam: [{ required: true, message: "Vui lòng chọn năm học", trigger: "change" }],
  id_hoi_dong: [{ required: true, message: "Vui lòng chọn hội đồng thi", trigger: "change" }],
  id_diem_thi: [{ required: true, message: "Vui lòng chọn điểm thi", trigger: "change" }],
  toa: [
    { required: true, message: "Vui lòng nhập tòa nhà", trigger: "blur" },
    { max: 255, message: "Tòa nhà không quá 255 ký tự", trigger: "blur" },
  ],
  tang: [
    { required: true, message: "Vui lòng nhập tầng", trigger: "blur" },
    {
      validator: (_rule, value) => {
        if (value === undefined || value === null || value === "") {
          return Promise.reject("Vui lòng nhập tầng");
        }
        if (!Number.isInteger(value)) {
          return Promise.reject("Tầng phải là số nguyên");
        }
        if (value < 1 || value > 100) {
          return Promise.reject("Tầng phải từ 1 đến 100");
        }
        return Promise.resolve();
      },
      trigger: ["blur", "change"],
    },
  ],
});

const roomTitle = computed(() => {
  if (!selectedLocation.value) return "DANH SÁCH PHÒNG THI";
  return `DANH SÁCH PHÒNG THI - ${selectedLocation.value.ten || selectedLocation.value.ma || ""}`;
});

const resetFormState = () => {
  Object.assign(formState, defaultFormState());
};

watch(
  () => listFilter.id_hoi_dong,
  async value => {
    if (value) {
      locationParam.value.idHoiDong = value;
    } else {
      delete locationParam.value.idHoiDong;
    }

    locationPagination.current = 1;
    roomPagination.current = 1;
    locationParam.value.pageIndex = 1;
    roomParam.value.pageIndex = 1;
    await fetchLocations({ ...locationParam.value });
  },
);

watch(() => formState.id_nam, (value, oldValue) => {
  if (syncingFormFilters.value) return;
  if (value !== oldValue) {
    formState.id_hoi_dong = undefined;
    formState.id_diem_thi = undefined;
  }
});

watch(
  () => formState.id_hoi_dong,
  (value, oldValue) => {
    if (syncingFormFilters.value) return;
    if (value !== oldValue) {
      formState.id_diem_thi = undefined;
    }
  },
);

const syncSelectedLocation = items => {
  if (!Array.isArray(items) || !items.length) {
    selectedLocation.value = null;
    roomDataSource.value = [];
    roomPagination.total = 0;
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
        roomPagination.current = 1;
        roomParam.value.pageIndex = 1;
        await refreshRooms();
      }
    } else {
      throw new Error(error.value?.data?.message || "Không tải được dữ liệu điểm thi");
    }
  } catch (err) {
    locationDataSource.value = [];
    selectedLocation.value = null;
    locationPagination.total = 0;
    roomDataSource.value = [];
    roomPagination.total = 0;
    message.error(err?.message || "Lỗi tải dữ liệu điểm thi");
  } finally {
    locationLoading.value = false;
  }
};

const fetchRooms = async params => {
  if (!selectedLocation.value?.id && !listFilter.id_hoi_dong) {
    roomDataSource.value = [];
    roomPagination.total = 0;
    return;
  }

  try {
    roomLoading.value = true;
    const requestParams = {
      ...params,
    };

    if (selectedLocation.value?.id) {
      requestParams.idDiemThi = selectedLocation.value.id;
    }

    if (listFilter.id_hoi_dong) {
      requestParams.idHoiDong = listFilter.id_hoi_dong;
    }

    const { data, error } = await RestApi.exam_room.list({
      params: requestParams,
    });

    if (data.value?.status === "success") {
      roomDataSource.value = data.value?.data?.items || [];
      roomPagination.total = data.value?.data?.totalrecord || 0;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được dữ liệu phòng thi");
    }
  } catch (err) {
    roomDataSource.value = [];
    roomPagination.total = 0;
    message.error(err?.message || "Lỗi tải dữ liệu phòng thi");
  } finally {
    roomLoading.value = false;
  }
};

const refreshRooms = async () => {
  await fetchRooms({ ...roomParam.value });
};

const selectLocation = async record => {
  if (!record?.id) return;
  selectedLocation.value = record;
  roomPagination.current = 1;
  roomParam.value.pageIndex = 1;
  await refreshRooms();
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

const handleLocationTableChange = async pag => {
  locationPagination.current = pag.current;
  locationPagination.pageSize = pag.pageSize;
  locationParam.value.pageIndex = pag.current;
  locationParam.value.pageSize = pag.pageSize;
  await fetchLocations({ ...locationParam.value });
};

const handleRoomTableChange = async pag => {
  roomPagination.current = pag.current;
  roomPagination.pageSize = pag.pageSize;
  roomParam.value.pageIndex = pag.current;
  roomParam.value.pageSize = pag.pageSize;
  await refreshRooms();
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
  if (listFilter.id_hoi_dong) {
    locationParam.value.idHoiDong = listFilter.id_hoi_dong;
  }
  locationPagination.current = 1;
  await fetchLocations({ ...locationParam.value });
};

const handleRoomSearch = async () => {
  const search = (roomSearchText.value || "").trim();
  if (search) {
    roomParam.value.search = search;
  } else {
    delete roomParam.value.search;
  }
  roomPagination.current = 1;
  roomParam.value.pageIndex = 1;
  await refreshRooms();
};

const resetRoomSearch = async () => {
  roomSearchText.value = "";
  roomParam.value = { pageIndex: 1, pageSize: roomPagination.pageSize, search: "" };
  roomPagination.current = 1;
  await refreshRooms();
};

const showModal = () => {
  isEdit.value = false;
  resetFormState();
  visible.value = true;
};

const openImportModal = () => {
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

const downloadRoomTemplate = () => {
  const link = document.createElement("a");
  link.href = encodeURI("/Import Phòng thi.xlsx");
  link.download = "Import Phòng thi.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
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
    const { data, error } = await RestApi.exam_room.import_file({ body: form });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Import phòng thi thành công");
      closeImportModal();
      roomPagination.current = 1;
      roomParam.value.pageIndex = 1;
      await refreshRooms();
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Import không thành công");
    }
  } catch (err) {
    message.error(err?.message || "Import không thành công");
  } finally {
    importModal.uploading = false;
  }
};

const syncSelectedLocationAfterSave = async idDiemThi => {
  if (!idDiemThi) return;

  const matched = locationDataSource.value.find(item => item.id === idDiemThi);
  if (matched) {
    selectedLocation.value = matched;
  } else {
    try {
      const { data, error } = await RestApi.exam_location.detail({ params: { Id: idDiemThi } });
      if (data.value?.status === "success") {
        selectedLocation.value = data.value?.data || { id: idDiemThi };
      } else {
        throw new Error(error.value?.data?.message || "Không tải được điểm thi");
      }
    } catch (_err) {
      selectedLocation.value = { id: idDiemThi };
    }
  }

  roomPagination.current = 1;
  roomParam.value.pageIndex = 1;
  await refreshRooms();
};

const editRoom = async record => {
  try {
    detailLoading.value = true;
    const { data, error } = await RestApi.exam_room.detail({ params: { Id: record.id } });
    if (data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || "Không tải được chi tiết phòng thi");
    }

    isEdit.value = true;
    syncingFormFilters.value = true;
    Object.assign(formState, {
      id: data.value?.data?.id,
      toa: data.value?.data?.toa || "",
      tang: data.value?.data?.tang ?? 1,
      id_nam: data.value?.data?.id_nam ?? undefined,
      id_hoi_dong: data.value?.data?.id_hoi_dong ?? undefined,
      id_diem_thi: data.value?.data?.id_diem_thi ?? selectedLocation.value?.id,
    });
    visible.value = true;
    await nextTick();
  } catch (err) {
    message.error(err?.message || "Không tải được chi tiết phòng thi");
  } finally {
    syncingFormFilters.value = false;
    detailLoading.value = false;
  }
};

const buildPayload = () => ({
  ...(isEdit.value ? { id: formState.id } : {}),
  toa: (formState.toa || "").trim(),
  tang: formState.tang,
  id_diem_thi: formState.id_diem_thi ?? selectedLocation.value?.id,
});

const handleOk = async () => {
  let shouldClose = false;
  let savedLocationId;
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;
    const payload = buildPayload();
    savedLocationId = payload.id_diem_thi;

    if (!payload.id_diem_thi) {
      throw new Error("Vui lòng chọn điểm thi");
    }

    if (isEdit.value) {
      const { data, error } = await RestApi.exam_room.update({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật phòng thi thành công");
        shouldClose = true;
      } else {
        throw new Error(error.value?.data?.message || "Cập nhật không thành công");
      }
    } else {
      const { data, error } = await RestApi.exam_room.create({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Thêm mới phòng thi thành công");
        shouldClose = true;
      } else {
        throw new Error(error.value?.data?.message || "Thêm mới không thành công");
      }
    }
  } catch (err) {
    message.error(err?.message || err?.response?.data?.message || "Đã xảy ra lỗi khi lưu");
  } finally {
    confirmLoading.value = false;
    if (shouldClose) {
      visible.value = false;
      formRef.value?.resetFields?.();
      resetFormState();
      await syncSelectedLocationAfterSave(savedLocationId);
    }
  }
};

const handleCancel = () => {
  formRef.value?.resetFields?.();
  resetFormState();
  visible.value = false;
};

const deleteRoom = async id => {
  try {
    const { data, error } = await RestApi.exam_room.delete({ params: { Id: id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa phòng thi thành công");
      roomPagination.current = 1;
      roomParam.value.pageIndex = 1;
      await refreshRooms();
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (err) {
    message.error(err?.message || "Không thể xóa phòng thi");
  }
};

await fetchLocations({ ...locationParam.value });
await refreshRooms();
</script>

<style scoped>
:deep(.active-row > td) {
  background-color: #e6f7ff !important;
}
</style>
