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
        <a-button type="primary" @click="openAdjustFromInfo" :disabled="!settingStore.currentPermission || !infoScheduleId">Tinh chỉnh lịch ôn tập</a-button>
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
            </div>
          </div>
        </div>
      </a-spin>
    </a-drawer>
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
  await fetchDetail(infoScheduleId.value);
};

const closeDetailDrawer = () => {
  detailDrawerOpen.value = false;
  detailData.value = null;
  infoScheduleId.value = null;
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

const handleOk = async () => {
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;
    const payload = { ...formState };

    if (isEdit.value) {
      const { data, error } = await RestApi.review_schedule.update({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật thành công");
      } else {
        throw new Error(error.value?.data?.message || "Cập nhật không thành công");
      }
    } else {
      delete payload.id;
      const { data, error } = await RestApi.review_schedule.create({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Thêm mới thành công");
      } else {
        throw new Error(error.value?.data?.message || "Thêm mới không thành công");
      }
    }
  } catch (error) {
    message.error(error.message || error?.response?.data?.message || "Đã xảy ra lỗi khi lưu");
  } finally {
    await fetchData({ ...param.value });
    confirmLoading.value = false;
    visible.value = false;
    formRef.value?.resetFields?.();
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
