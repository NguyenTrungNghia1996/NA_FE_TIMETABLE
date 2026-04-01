<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="space-y-4">
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div class="flex flex-col xl:flex-row xl:items-end gap-3">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
            <SelectYear
              v-model="filterForm.id_nam"
              label=""
              name="assign_room_filter_year"
              :no-form-item="true"
              placeholder="-- Chọn năm học --"
            />

            <SelectExamBoard
              v-model="filterForm.id_hoi_dong"
              label=""
              name="assign_room_filter_board"
              :no-form-item="true"
              placeholder="-- Chọn hội đồng thi --"
              :id-nam="filterForm.id_nam || null"
            />

            <SelectExamLocation
              v-model="filterForm.id_diem_thi"
              label=""
              name="assign_room_filter_location"
              :no-form-item="true"
              placeholder="-- Chọn điểm thi --"
              :id-hoi-dong="filterForm.id_hoi_dong || null"
            />
          </div>
          <div class="flex items-center gap-2">
            <a-button @click="resetFilters">Đặt lại</a-button>
            <a-button type="primary" :disabled="!settingStore.currentPermission" @click="openAssignModal">
              Xếp phòng thi
            </a-button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-4 items-start">
        <a-card title="DANH SÁCH PHÒNG THI">
          <div class="mb-3">
            <a-input-search
              v-model:value="roomSearchText"
              placeholder="Nhập thông tin tìm kiếm phòng thi"
              enter-button
              @search="handleRoomSearch"
            />
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
              :customRow="onRoomRow"
              :row-class-name="roomRowClassName"
              @change="handleRoomTableChange"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'stt'">
                  {{ (roomPagination.current - 1) * roomPagination.pageSize + index + 1 }}
                </template>

                <template v-else-if="column.key === 'so_phong'">
                  {{ formatRoomNumber(record.so_phong) }}
                </template>
              </template>
            </a-table>
          </ClientOnly>
        </a-card>

        <a-card :title="contestantTitle">
          <template #extra>
            <span v-if="selectedRoom" class="text-xs text-slate-500">Đang xem phòng {{ formatRoomNumber(selectedRoom.so_phong) }}</span>
          </template>

          <div class="mb-3">
            <a-input-search
              v-model:value="contestantSearchText"
              placeholder="Nhập thông tin tìm kiếm thí sinh"
              enter-button
              @search="handleContestantSearch"
            />
          </div>

          <ClientOnly>
            <a-table
              :columns="contestantColumns"
              :data-source="contestantDataSource"
              :pagination="contestantPagination"
              :loading="contestantLoading"
              row-key="id"
              size="small"
              bordered
              :scroll="{ x: '1100' }"
              @change="handleContestantTableChange"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'stt'">
                  {{ (contestantPagination.current - 1) * contestantPagination.pageSize + index + 1 }}
                </template>

                <template v-else-if="column.key === 'ngay_sinh'">
                  {{ formatDate(record.ngay_sinh) }}
                </template>
              </template>
            </a-table>
          </ClientOnly>
        </a-card>
      </div>
    </div>

    <a-modal
      v-model:open="assignModal.open"
      title="Xếp phòng thi"
      :confirm-loading="assignModal.submitting"
      :destroy-on-close="true"
      @ok="submitAssignRoom"
      @cancel="closeAssignModal"
    >
      <a-form ref="assignFormRef" :model="assignModal.form" :rules="assignRules" layout="vertical">
        <SelectYear
          v-model="assignModal.form.id_nam"
          label="Năm học"
          name="id_nam"
          :rules="assignRules.id_nam"
          placeholder="-- Chọn năm học --"
        />

        <SelectExamBoard
          v-model="assignModal.form.id_hoi_dong"
          label="Hội đồng thi"
          name="id_hoi_dong"
          :rules="assignRules.id_hoi_dong"
          placeholder="-- Chọn hội đồng thi --"
          :id-nam="assignModal.form.id_nam || null"
        />

        <SelectExamLocation
          v-model="assignModal.form.id_diem_thi"
          label="Điểm thi"
          name="id_diem_thi"
          :rules="assignRules.id_diem_thi"
          placeholder="-- Chọn điểm thi --"
          :id-hoi-dong="assignModal.form.id_hoi_dong || null"
        />
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
const settingStore = useSettingStore();
const { RestApi } = useApi();

const roomColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Số phòng thi", key: "so_phong", width: 110, align: "center" },
  { title: "Tòa nhà", dataIndex: "toa", key: "toa", width: 100, align: "center" },
  { title: "Tầng", dataIndex: "tang", key: "tang", width: 80, align: "center" },
];

const contestantColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Số báo danh", dataIndex: "so_bao_danh", key: "so_bao_danh", width: 120, align: "center" },
  { title: "Họ và tên", dataIndex: "ho_va_ten", key: "ho_va_ten", width: 200, ellipsis: true },
  { title: "CCCD", dataIndex: "cccd", key: "cccd", width: 140, align: "center" },
  { title: "Ngày sinh", key: "ngay_sinh", width: 120, align: "center" },
  { title: "Nơi sinh", dataIndex: "ten_noi_sinh", key: "ten_noi_sinh", width: 180, ellipsis: true },
  { title: "Nơi thường trú", dataIndex: "ten_thuong_tru", key: "ten_thuong_tru", width: 180, ellipsis: true },
  { title: "Dân tộc", dataIndex: "ten_dan_toc", key: "ten_dan_toc", width: 100, align: "center" },
  { title: "Môn thi 1", dataIndex: "ten_mon_1", key: "ten_mon_1", width: 120, align: "center" },
  { title: "Môn thi 2", dataIndex: "ten_mon_2", key: "ten_mon_2", width: 120, align: "center" },
];

const roomSearchText = ref("");
const contestantSearchText = ref("");
const selectedRoom = ref(null);
const roomDataSource = ref([]);
const contestantDataSource = ref([]);
const roomLoading = ref(false);
const contestantLoading = ref(false);
const assignFormRef = ref();

const filterForm = reactive({
  id_nam: undefined,
  id_hoi_dong: undefined,
  id_diem_thi: undefined,
});

const roomParam = ref({
  pageIndex: 1,
  pageSize: 10,
  search: "",
});

const contestantParam = ref({
  pageIndex: 1,
  pageSize: 10,
  search: "",
});

const roomPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const contestantPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const assignModal = reactive({
  open: false,
  submitting: false,
  form: {
    id_nam: undefined,
    id_hoi_dong: undefined,
    id_diem_thi: undefined,
  },
});

const resetAssignModalForm = () => {
  assignModal.form.id_nam = undefined;
  assignModal.form.id_hoi_dong = undefined;
  assignModal.form.id_diem_thi = undefined;
};

const assignRules = reactive({
  id_nam: [],
  id_hoi_dong: [
    {
      validator: () => {
        if (assignModal.form.id_hoi_dong || assignModal.form.id_diem_thi) {
          return Promise.resolve();
        }
        return Promise.reject("Vui lòng chọn hội đồng thi hoặc điểm thi");
      },
      trigger: "change",
    },
  ],
  id_diem_thi: [
    {
      validator: () => {
        if (assignModal.form.id_hoi_dong || assignModal.form.id_diem_thi) {
          return Promise.resolve();
        }
        return Promise.reject("Vui lòng chọn hội đồng thi hoặc điểm thi");
      },
      trigger: "change",
    },
  ],
});

const contestantTitle = computed(() => {
  if (!selectedRoom.value) return "DANH SÁCH THÍ SINH";
  return `DANH SÁCH THÍ SINH - PHÒNG ${formatRoomNumber(selectedRoom.value.so_phong)}`;
});

const formatDate = value => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatRoomNumber = value => {
  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 0) {
    return String(numeric).padStart(2, "0");
  }
  return value ?? "";
};

const hasValue = value => value !== undefined && value !== null && value !== "";

const buildBaseParams = () => {
  const params = {};
  if (hasValue(filterForm.id_hoi_dong)) {
    params.idHoiDong = filterForm.id_hoi_dong;
  }
  if (hasValue(filterForm.id_diem_thi)) {
    params.idDiemThi = filterForm.id_diem_thi;
  }
  return params;
};

const fetchRooms = async params => {
  try {
    roomLoading.value = true;
    const previousSelectedId = selectedRoom.value?.id;
    const { data, error } = await RestApi.exam_room.list({
      params: {
        ...params,
        ...buildBaseParams(),
      },
    });

    if (data.value?.status !== "success") {
      throw new Error(error?.value?.data?.message || "Không tải được danh sách phòng thi");
    }

    const items = data.value?.data?.items || [];
    roomDataSource.value = items;
    roomPagination.total = data.value?.data?.totalrecord || 0;

    const matchedRoom = items.find(item => item.id === previousSelectedId);
    selectedRoom.value = matchedRoom || null;
  } catch (err) {
    roomDataSource.value = [];
    roomPagination.total = 0;
    selectedRoom.value = null;
    message.error(err?.message || "Không tải được danh sách phòng thi");
  } finally {
    roomLoading.value = false;
  }
};

const fetchContestants = async params => {
  try {
    contestantLoading.value = true;
    const requestParams = {
      ...params,
      ...buildBaseParams(),
    };

    if (selectedRoom.value?.id) {
      requestParams.idPhong = selectedRoom.value.id;
    }

    const { data, error } = await RestApi.contestant.list({ params: requestParams });
    if (data.value?.status !== "success") {
      throw new Error(error?.value?.data?.message || "Không tải được danh sách thí sinh");
    }

    contestantDataSource.value = data.value?.data?.items || [];
    contestantPagination.total = data.value?.data?.totalrecord || 0;
  } catch (err) {
    contestantDataSource.value = [];
    contestantPagination.total = 0;
    message.error(err?.message || "Không tải được danh sách thí sinh");
  } finally {
    contestantLoading.value = false;
  }
};

const refreshData = async () => {
  await fetchRooms({ ...roomParam.value });
  await fetchContestants({ ...contestantParam.value });
};

const onRoomRow = record => ({
  onClick: async () => {
    selectedRoom.value = record;
    contestantPagination.current = 1;
    contestantParam.value.pageIndex = 1;
    await fetchContestants({ ...contestantParam.value });
  },
  style: {
    cursor: "pointer",
  },
});

const roomRowClassName = record => (record.id === selectedRoom.value?.id ? "active-row" : "");

const handleRoomSearch = async () => {
  const search = (roomSearchText.value || "").trim();
  roomParam.value.search = search;
  roomPagination.current = 1;
  roomParam.value.pageIndex = 1;
  await fetchRooms({ ...roomParam.value });
};

const handleContestantSearch = async () => {
  const search = (contestantSearchText.value || "").trim();
  contestantParam.value.search = search;
  contestantPagination.current = 1;
  contestantParam.value.pageIndex = 1;
  await fetchContestants({ ...contestantParam.value });
};

const handleRoomTableChange = async pag => {
  roomPagination.current = pag.current;
  roomPagination.pageSize = pag.pageSize;
  roomParam.value.pageIndex = pag.current;
  roomParam.value.pageSize = pag.pageSize;
  await fetchRooms({ ...roomParam.value });
};

const handleContestantTableChange = async pag => {
  contestantPagination.current = pag.current;
  contestantPagination.pageSize = pag.pageSize;
  contestantParam.value.pageIndex = pag.current;
  contestantParam.value.pageSize = pag.pageSize;
  await fetchContestants({ ...contestantParam.value });
};

const resetFilters = () => {
  roomSearchText.value = "";
  contestantSearchText.value = "";
  filterForm.id_nam = undefined;
  filterForm.id_hoi_dong = undefined;
  filterForm.id_diem_thi = undefined;
  selectedRoom.value = null;
  roomParam.value = { pageIndex: 1, pageSize: roomPagination.pageSize, search: "" };
  contestantParam.value = { pageIndex: 1, pageSize: contestantPagination.pageSize, search: "" };
  roomPagination.current = 1;
  contestantPagination.current = 1;
  roomDataSource.value = [];
  contestantDataSource.value = [];
  roomPagination.total = 0;
  contestantPagination.total = 0;
};

const openAssignModal = () => {
  resetAssignModalForm();
  assignModal.open = true;
};

const closeAssignModal = () => {
  assignFormRef.value?.resetFields?.();
  resetAssignModalForm();
  assignModal.open = false;
};

const submitAssignRoom = async () => {
  try {
    await assignFormRef.value?.validate();
    assignModal.submitting = true;
    const submittedBoardId = assignModal.form.id_hoi_dong;
    const submittedLocationId = assignModal.form.id_diem_thi;

    const { data, error } = await RestApi.exam_room.assign_contestants({
      params: {
        idHoiDong: submittedBoardId,
        idDiemThi: submittedLocationId,
      },
      body: {},
    });

    if (data.value?.status !== "success") {
      throw new Error(error?.value?.data?.message || data.value?.message || "Xếp phòng thi không thành công");
    }

    message.success(data.value?.message || "Xếp phòng thi thành công");
    closeAssignModal();

    if (
      filterForm.id_hoi_dong === submittedBoardId &&
      filterForm.id_diem_thi === submittedLocationId
    ) {
      roomPagination.current = 1;
      contestantPagination.current = 1;
      roomParam.value.pageIndex = 1;
      contestantParam.value.pageIndex = 1;
      await refreshData();
    }
  } catch (err) {
    message.error(err?.message || "Xếp phòng thi không thành công");
  } finally {
    assignModal.submitting = false;
  }
};

const handleFilterChange = async (value, oldValue) => {
  if (value === oldValue) return;
  selectedRoom.value = null;
  roomPagination.current = 1;
  contestantPagination.current = 1;
  roomParam.value.pageIndex = 1;
  contestantParam.value.pageIndex = 1;
  await refreshData();
};

watch(() => filterForm.id_nam, handleFilterChange);
watch(() => filterForm.id_hoi_dong, handleFilterChange);
watch(() => filterForm.id_diem_thi, handleFilterChange);

watch(() => assignModal.form.id_nam, (value, oldValue) => {
  if (value !== oldValue) {
    assignModal.form.id_hoi_dong = undefined;
    assignModal.form.id_diem_thi = undefined;
  }
});

watch(() => assignModal.form.id_hoi_dong, (value, oldValue) => {
  if (value !== oldValue) {
    assignModal.form.id_diem_thi = undefined;
    nextTick(() => {
      assignFormRef.value?.validateFields?.(["id_hoi_dong", "id_diem_thi"]);
    });
  }
});

watch(() => assignModal.form.id_diem_thi, (value, oldValue) => {
  if (value !== oldValue) {
    nextTick(() => {
      assignFormRef.value?.validateFields?.(["id_hoi_dong", "id_diem_thi"]);
    });
  }
});
</script>

<style scoped>
:deep(.active-row > td) {
  background-color: #e6f7ff !important;
}
</style>
