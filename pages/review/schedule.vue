<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm lịch ôn tập..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '900' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>

          <template v-if="column.key === 'trang_thai'">
            <a-tag :color="record.trang_thai ? 'green' : 'red'">
              {{ record.trang_thai ? "Hoạt động" : "Không hoạt động" }}
            </a-tag>
          </template>

          <template v-if="column.key === 'action'">
            <div class="flex justify-center">
              <div class="md:flex space-x-2">
                <a-tooltip title="Chi tiết">
                  <a-button type="link" size="small" @click="openDetailDrawer(record)">
                    <template #icon>
                      <InfoCircleOutlined />
                    </template>
                  </a-button>
                </a-tooltip>
                <a-tooltip title="Tinh chỉnh lịch">
                  <a-button type="link" size="small" @click="openAdjustDrawer(record)" :disabled="!settingStore.currentPermission">
                    <template #icon>
                      <SettingOutlined />
                    </template>
                  </a-button>
                </a-tooltip>
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

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa lịch ôn tập' : 'Thêm mới lịch ôn tập'" @cancel="handleCancel" :width="640">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tên lịch ôn tập" name="ten" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên lịch ôn tập" :maxlength="50" show-count />
        </a-form-item>
        <a-form-item label="Trạng thái" name="trang_thai">
          <a-switch v-model:checked="formState.trang_thai" checked-children="Hoạt động" un-checked-children="Không hoạt động" />
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
    <a-drawer v-model:open="adjustDrawerOpen" title="Tinh chỉnh lịch ôn tập" :footer="null" height="100vh" placement="bottom" :header-style="{ padding: '0px 0px' }" :body-style="{ padding: '4px 4px' }" :destroyOnClose="true" @close="closeAdjustDrawer">
      <ClientOnly>
        <ReviewTimetableGrid v-model:classId="adjustClassId" :timetableId="adjustScheduleId" />
      </ClientOnly>
    </a-drawer>

    <a-drawer v-model:open="detailDrawerOpen" title="Chi tiết lịch ôn tập" :footer="null" height="100vh" placement="bottom" @close="closeDetailDrawer">
      <template #extra>
        <div class="flex items-center gap-2">
          <a-button type="primary" @click="openAdjustFromInfo" :disabled="!settingStore.currentPermission || !infoScheduleId">Tinh chỉnh lịch ôn tập</a-button>
          <a-popconfirm placement="topRight" title="Bạn chắc chắn muốn hủy kết quả xếp?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="cancelArrange">
            <a-button danger :loading="cancelArrangeLoading" :disabled="!settingStore.currentPermission || !infoScheduleId">Hủy kết quả xếp</a-button>
          </a-popconfirm>
        </div>
      </template>
      <a-spin :spinning="detailLoading">
        <div v-if="detailData" class="space-y-6">
          <div class="bg-white p-4 rounded-md shadow-lg">
            <p class="mb-2">
              <span class="font-semibold">Tên lịch ôn tập:</span>
              <span class="ml-2">{{ detailData.ten }}</span>
            </p>
            <!-- <p class="mb-2">
              <span class="font-semibold">Trạng thái:</span>
              <a-tag class="ml-2" :color="detailData.trang_thai ? 'green' : 'red'">
                {{ detailData.trang_thai ? "Hoạt động" : "Không hoạt động" }}
              </a-tag>
            </p> -->
            <p class="mb-2">
              <span class="font-semibold">Tổng số tiết:</span>
              <span class="ml-2 text-blue-500">{{ detailData.tong_tat_ca_tiet }} tiết</span>
            </p>
            <p class="mb-2">
              <span class="font-semibold">Tiết đã xếp:</span>
              <span class="ml-2 text-green-500">{{ detailData.tong_tiet_da_xep }} tiết</span>
            </p>
            <p>
              <span class="font-semibold">Tiết chưa xếp:</span>
              <span class="ml-2 text-red-500">{{ detailData.tong_tiet_chua_xep }} tiết</span>
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white p-4 rounded-md shadow-lg flex flex-col items-center">
              <h2 class="text-lg font-semibold mb-4 text-gray-700">Xếp toàn trường <span class="text-sm text-gray-500">(Xếp tự động)</span></h2>
              <a-button type="primary" class="bg-blue-600 border-blue-600" :loading="arrangeLoading" @click="arrangeAll">Xếp Thời khóa biểu</a-button>
            </div>
            <div class="bg-white p-4 rounded-md shadow-lg col-span-2">
              <h2 class="text-lg font-semibold mb-4 text-gray-700">Xếp cục bộ <span class="text-sm text-gray-500">(Xếp từng phần)</span></h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <a-button type="primary" class="bg-blue-600 border-blue-600" :disabled="!settingStore.currentPermission || !infoScheduleId" @click="openArrangeClassModal">
                  Xếp theo lớp
                </a-button>
                <a-button type="primary" class="bg-blue-600 border-blue-600" :disabled="!settingStore.currentPermission || !infoScheduleId" @click="openArrangeRoomModal">
                  Xếp theo phòng
                </a-button>
                <a-button type="primary" class="bg-blue-600 border-blue-600" :disabled="!settingStore.currentPermission || !infoScheduleId" @click="openArrangeTeacherModal">
                  Xếp theo giáo viên
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </a-drawer>

    <a-modal v-model:open="arrangeClassModal.visible" title="Xếp theo lớp" :confirm-loading="arrangeClassModal.loading" @ok="confirmArrangeClass" @cancel="arrangeClassModal.visible = false" width="800px">
      <a-input-search v-model:value="arrangeClassModal.search" placeholder="Tìm lớp ôn tập..." enter-button class="mb-3" @search="handleArrangeClassSearch" />
      <a-table :columns="arrangeClassColumns" :data-source="arrangeClassModal.data" :row-selection="arrangeClassRowSelection" row-key="id" :pagination="arrangeClassModal.pagination" :loading="arrangeClassModal.loading" size="small" @change="handleArrangeClassTableChange" />
    </a-modal>

    <a-modal v-model:open="arrangeRoomModal.visible" title="Xếp theo phòng" :confirm-loading="arrangeRoomModal.loading" @ok="confirmArrangeRoom" @cancel="arrangeRoomModal.visible = false" width="800px">
      <a-input-search v-model:value="arrangeRoomModal.search" placeholder="Tìm phòng học..." enter-button class="mb-3" @search="handleArrangeRoomSearch" />
      <a-table :columns="arrangeRoomColumns" :data-source="arrangeRoomModal.data" :row-selection="arrangeRoomRowSelection" row-key="id" :pagination="arrangeRoomModal.pagination" :loading="arrangeRoomModal.loading" size="small" @change="handleArrangeRoomTableChange" />
    </a-modal>

    <a-modal v-model:open="arrangeTeacherModal.visible" title="Xếp theo giáo viên" :confirm-loading="arrangeTeacherModal.loading" @ok="confirmArrangeTeacher" @cancel="arrangeTeacherModal.visible = false" width="800px">
      <a-input-search v-model:value="arrangeTeacherModal.search" placeholder="Tìm giáo viên..." enter-button class="mb-3" @search="handleArrangeTeacherSearch" />
      <a-table :columns="arrangeTeacherColumns" :data-source="arrangeTeacherModal.data" :row-selection="arrangeTeacherRowSelection" row-key="id" :pagination="arrangeTeacherModal.pagination" :loading="arrangeTeacherModal.loading" size="small" @change="handleArrangeTeacherTableChange" />
    </a-modal>
  </div>
</template>
<script setup>
const settingStore = useSettingStore();
const { RestApi } = useApi();

const param = ref({ pageIndex: 1, pageSize: 10, search: "" });

const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Tên lịch ôn tập", dataIndex: "ten", key: "ten", ellipsis: true },
  { title: "Trạng thái", dataIndex: "trang_thai", key: "trang_thai", width: 140, align: "center" },
  { title: "Thao tác", key: "action", width: 170, align: "center", fixed: "right" },
];

const dataSource = ref([]);
const loading = ref(false);
const searchText = ref("");
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const formRef = ref();
const adjustDrawerOpen = ref(false);
const adjustScheduleId = ref(null);
const adjustClassId = ref(null);
const detailDrawerOpen = ref(false);
const detailLoading = ref(false);
const detailData = ref(null);
const infoScheduleId = ref(null);
const arrangeLoading = ref(false);
const cancelArrangeLoading = ref(false);
const arrangeClassModal = reactive({
  visible: false,
  loading: false,
  data: [],
  selectedRowKeys: [],
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
const arrangeRoomModal = reactive({
  visible: false,
  loading: false,
  data: [],
  selectedRowKeys: [],
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
const arrangeTeacherModal = reactive({
  visible: false,
  loading: false,
  data: [],
  selectedRowKeys: [],
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

const arrangeClassColumns = [
  { title: "Tên lớp", dataIndex: "ten", key: "ten", ellipsis: true },
  { title: "Mã lớp", dataIndex: "ma", key: "ma", ellipsis: true },
];
const arrangeRoomColumns = [
  { title: "Tên phòng học", dataIndex: "ten", key: "ten", ellipsis: true },
  { title: "Sức chứa", dataIndex: "suc_chua", key: "suc_chua", align: "center" },
];
const arrangeTeacherColumns = [
  { title: "Mã giáo viên", dataIndex: "ma_giao_vien", key: "ma_giao_vien", ellipsis: true },
  { title: "Tên giáo viên", dataIndex: "ho_ten", key: "ho_ten", ellipsis: true },
];

const arrangeClassRowSelection = computed(() => ({
  selectedRowKeys: arrangeClassModal.selectedRowKeys,
  onChange: keys => (arrangeClassModal.selectedRowKeys = keys),
  preserveSelectedRowKeys: true,
}));
const arrangeRoomRowSelection = computed(() => ({
  selectedRowKeys: arrangeRoomModal.selectedRowKeys,
  onChange: keys => (arrangeRoomModal.selectedRowKeys = keys),
  preserveSelectedRowKeys: true,
}));
const arrangeTeacherRowSelection = computed(() => ({
  selectedRowKeys: arrangeTeacherModal.selectedRowKeys,
  onChange: keys => (arrangeTeacherModal.selectedRowKeys = keys),
  preserveSelectedRowKeys: true,
}));

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
  trang_thai: true,
});

const rules = reactive({
  ten: [
    { required: true, message: "Vui lòng nhập tên lịch ôn tập", trigger: "blur" },
    { max: 50, message: "Tên lịch ôn tập không quá 50 ký tự", trigger: "blur" },
  ],
});

const fetchData = async p => {
  try {
    loading.value = true;
    const { data, error } = await RestApi.review_schedule.list({ params: p });
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
  Object.assign(formState, { id: undefined, ten: "", trang_thai: true });
  visible.value = true;
};

const editItem = record => {
  isEdit.value = true;
  Object.assign(formState, {
    id: record.id,
    ten: record.ten || "",
    trang_thai: Boolean(record.trang_thai),
  });
  visible.value = true;
};

const openAdjustDrawer = record => {
  adjustScheduleId.value = record?.id ?? null;
  adjustDrawerOpen.value = true;
};

const openAdjustFromInfo = () => {
  if (!infoScheduleId.value) return;
  openAdjustDrawer({ id: infoScheduleId.value });
};

const closeAdjustDrawer = () => {
  adjustDrawerOpen.value = false;
  adjustClassId.value = null;
  adjustScheduleId.value = null;
};

const fetchDetail = async id => {
  if (!id) return;
  detailLoading.value = true;
  detailData.value = null;
  try {
    const { data, error } = await RestApi.review_schedule.detail({ params: { Id: id } });
    if (data.value?.status === "success") {
      detailData.value = data.value?.data || null;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được chi tiết");
    }
  } catch (err) {
    message.error(err?.message || "Không tải được chi tiết");
  } finally {
    detailLoading.value = false;
  }
};

const openDetailDrawer = async record => {
  detailDrawerOpen.value = true;
  infoScheduleId.value = record?.id ?? null;
  resetArrangeSelections();
  await fetchDetail(infoScheduleId.value);
};

const closeDetailDrawer = () => {
  detailDrawerOpen.value = false;
  detailData.value = null;
  infoScheduleId.value = null;
  resetArrangeSelections();
};

const arrangeAll = async () => {
  if (!infoScheduleId.value) return;
  try {
    arrangeLoading.value = true;
    const { data, error } = await RestApi.review_timetable.arrange_all({ params: { Idlich: infoScheduleId.value } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xếp thời khóa biểu thành công");
      await fetchDetail(infoScheduleId.value);
    } else {
      throw new Error(error.value?.data?.message || "Xếp thời khóa biểu không thành công");
    }
  } catch (err) {
    message.error(err?.message || "Xếp thời khóa biểu không thành công");
  } finally {
    arrangeLoading.value = false;
  }
};

const cancelArrange = async () => {
  if (!infoScheduleId.value) return;
  const scheduleId = infoScheduleId.value;
  try {
    cancelArrangeLoading.value = true;
    const { data, error } = await RestApi.review_schedule.cancel_result({
      params: { id: scheduleId },
    });
    if (error.value || data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || data.value?.message || "Hủy kết quả xếp không thành công");
    }
    message.success(data.value?.message || "Hủy kết quả xếp thành công");
  } catch (err) {
    message.error(err?.message || "Hủy kết quả xếp không thành công");
  } finally {
    cancelArrangeLoading.value = false;
    await fetchDetail(scheduleId);
  }
};

const resetArrangeSelections = () => {
  arrangeClassModal.visible = false;
  arrangeRoomModal.visible = false;
  arrangeTeacherModal.visible = false;
  arrangeClassModal.selectedRowKeys = [];
  arrangeRoomModal.selectedRowKeys = [];
  arrangeTeacherModal.selectedRowKeys = [];
  arrangeClassModal.search = "";
  arrangeRoomModal.search = "";
  arrangeTeacherModal.search = "";
  arrangeClassModal.data = [];
  arrangeRoomModal.data = [];
  arrangeTeacherModal.data = [];
  arrangeClassModal.pagination.current = 1;
  arrangeRoomModal.pagination.current = 1;
  arrangeTeacherModal.pagination.current = 1;
  arrangeClassModal.pagination.total = 0;
  arrangeRoomModal.pagination.total = 0;
  arrangeTeacherModal.pagination.total = 0;
};

const fetchArrangeClasses = async () => {
  arrangeClassModal.loading = true;
  try {
    const params = {
      pageIndex: arrangeClassModal.pagination.current,
      pageSize: arrangeClassModal.pagination.pageSize,
    };
    const searchTerm = (arrangeClassModal.search || "").trim();
    if (searchTerm) params.search = searchTerm;
    const { data, error } = await RestApi.review_class.list({ params });
    if (data.value?.status === "success") {
      arrangeClassModal.data = data.value?.data?.items || [];
      arrangeClassModal.pagination.total = data.value?.data?.totalrecord || 0;
    } else {
      throw new Error(error.value?.data?.message || "Không thể tải danh sách lớp ôn tập");
    }
  } catch (err) {
    arrangeClassModal.data = [];
    arrangeClassModal.pagination.total = 0;
    message.error(err?.message || "Không thể tải danh sách lớp ôn tập");
  } finally {
    arrangeClassModal.loading = false;
  }
};

const fetchArrangeRooms = async () => {
  arrangeRoomModal.loading = true;
  try {
    const params = {
      PageIndex: arrangeRoomModal.pagination.current,
      PageSize: arrangeRoomModal.pagination.pageSize,
    };
    const searchTerm = (arrangeRoomModal.search || "").trim();
    if (searchTerm) params.search = searchTerm;
    const { data, error } = await RestApi.classroom.list({ params });
    if (data.value?.status === "success") {
      arrangeRoomModal.data = data.value?.data?.items || [];
      arrangeRoomModal.pagination.total = data.value?.data?.totalrecord || 0;
    } else {
      throw new Error(error.value?.data?.message || "Không thể tải danh sách phòng học");
    }
  } catch (err) {
    arrangeRoomModal.data = [];
    arrangeRoomModal.pagination.total = 0;
    message.error(err?.message || "Không thể tải danh sách phòng học");
  } finally {
    arrangeRoomModal.loading = false;
  }
};

const fetchArrangeTeachers = async () => {
  arrangeTeacherModal.loading = true;
  try {
    const params = {
      PageIndex: arrangeTeacherModal.pagination.current,
      PageSize: arrangeTeacherModal.pagination.pageSize,
    };
    const searchTerm = (arrangeTeacherModal.search || "").trim();
    if (searchTerm) params.search = searchTerm;
    const { data, error } = await RestApi.teacher.list({ params });
    if (data.value?.status === "success") {
      const items = data.value?.data?.items || [];
      arrangeTeacherModal.data = items.map(item => ({
        ...item,
        ho_ten: `${item.ho_va_ho_dem || ""} ${item.ten || ""}`.trim(),
      }));
      arrangeTeacherModal.pagination.total = data.value?.data?.totalrecord || 0;
    } else {
      throw new Error(error.value?.data?.message || "Không thể tải danh sách giáo viên");
    }
  } catch (err) {
    arrangeTeacherModal.data = [];
    arrangeTeacherModal.pagination.total = 0;
    message.error(err?.message || "Không thể tải danh sách giáo viên");
  } finally {
    arrangeTeacherModal.loading = false;
  }
};

const openArrangeClassModal = async () => {
  if (!infoScheduleId.value) return;
  arrangeClassModal.pagination.current = 1;
  arrangeClassModal.visible = true;
  await fetchArrangeClasses();
};

const openArrangeRoomModal = async () => {
  if (!infoScheduleId.value) return;
  arrangeRoomModal.pagination.current = 1;
  arrangeRoomModal.visible = true;
  await fetchArrangeRooms();
};

const openArrangeTeacherModal = async () => {
  if (!infoScheduleId.value) return;
  arrangeTeacherModal.pagination.current = 1;
  arrangeTeacherModal.visible = true;
  await fetchArrangeTeachers();
};

const handleArrangeClassTableChange = async pag => {
  arrangeClassModal.pagination.current = pag.current;
  arrangeClassModal.pagination.pageSize = pag.pageSize;
  await fetchArrangeClasses();
};

const handleArrangeRoomTableChange = async pag => {
  arrangeRoomModal.pagination.current = pag.current;
  arrangeRoomModal.pagination.pageSize = pag.pageSize;
  await fetchArrangeRooms();
};

const handleArrangeTeacherTableChange = async pag => {
  arrangeTeacherModal.pagination.current = pag.current;
  arrangeTeacherModal.pagination.pageSize = pag.pageSize;
  await fetchArrangeTeachers();
};

const handleArrangeClassSearch = async () => {
  arrangeClassModal.pagination.current = 1;
  await fetchArrangeClasses();
};

const handleArrangeRoomSearch = async () => {
  arrangeRoomModal.pagination.current = 1;
  await fetchArrangeRooms();
};

const handleArrangeTeacherSearch = async () => {
  arrangeTeacherModal.pagination.current = 1;
  await fetchArrangeTeachers();
};

const confirmArrangeClass = async () => {
  if (!infoScheduleId.value) return;
  if (!arrangeClassModal.selectedRowKeys.length) {
    arrangeClassModal.visible = false;
    return;
  }
  try {
    arrangeClassModal.loading = true;
    const { data, error } = await RestApi.review_timetable.arrange_class({
      body: {
        id_lich: infoScheduleId.value,
        ids: arrangeClassModal.selectedRowKeys,
      },
    });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xếp theo lớp thành công");
      arrangeClassModal.visible = false;
      arrangeClassModal.selectedRowKeys = [];
      await fetchDetail(infoScheduleId.value);
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Xếp theo lớp không thành công");
    }
  } catch (err) {
    message.error(err?.message || "Xếp theo lớp không thành công");
  } finally {
    arrangeClassModal.loading = false;
  }
};

const confirmArrangeRoom = async () => {
  if (!infoScheduleId.value) return;
  if (!arrangeRoomModal.selectedRowKeys.length) {
    arrangeRoomModal.visible = false;
    return;
  }
  try {
    arrangeRoomModal.loading = true;
    const { data, error } = await RestApi.review_timetable.arrange_room({
      body: {
        id_lich: infoScheduleId.value,
        ids: arrangeRoomModal.selectedRowKeys,
      },
    });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xếp theo phòng thành công");
      arrangeRoomModal.visible = false;
      arrangeRoomModal.selectedRowKeys = [];
      await fetchDetail(infoScheduleId.value);
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Xếp theo phòng không thành công");
    }
  } catch (err) {
    message.error(err?.message || "Xếp theo phòng không thành công");
  } finally {
    arrangeRoomModal.loading = false;
  }
};

const confirmArrangeTeacher = async () => {
  if (!infoScheduleId.value) return;
  if (!arrangeTeacherModal.selectedRowKeys.length) {
    arrangeTeacherModal.visible = false;
    return;
  }
  try {
    arrangeTeacherModal.loading = true;
    const { data, error } = await RestApi.review_timetable.arrange_teacher({
      body: {
        id_lich: infoScheduleId.value,
        ids: arrangeTeacherModal.selectedRowKeys,
      },
    });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xếp theo giáo viên thành công");
      arrangeTeacherModal.visible = false;
      arrangeTeacherModal.selectedRowKeys = [];
      await fetchDetail(infoScheduleId.value);
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Xếp theo giáo viên không thành công");
    }
  } catch (err) {
    message.error(err?.message || "Xếp theo giáo viên không thành công");
  } finally {
    arrangeTeacherModal.loading = false;
  }
};

const handleOk = async () => {
  let shouldClose = false;
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;
    const payload = { ...formState };

    if (isEdit.value) {
      const { data, error } = await RestApi.review_schedule.update({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật thành công");
        shouldClose = true;
      } else {
        throw new Error(error.value?.data?.message || "Cập nhật không thành công");
      }
    } else {
      delete payload.id;
      const { data, error } = await RestApi.review_schedule.create({ body: payload });
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

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.review_schedule.delete({ params: { id } });
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
