<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm điểm thi..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetSearch" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '1400' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>

          <template v-if="column.key === 'co_giam_sat'">
            <a-tag :color="record.co_giam_sat ? 'green' : 'default'">
              {{ record.co_giam_sat ? "Có" : "Không" }}
            </a-tag>
          </template>

          <template v-if="column.key === 'action'">
            <div class="flex justify-center">
              <div class="md:flex space-x-2">
                <a-button type="link" size="small" @click="editItem(record)" :disabled="!settingStore.currentPermission || detailLoading">
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

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa điểm thi' : 'Thêm mới điểm thi'" @cancel="handleCancel" :width="800">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules" class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <a-form-item label="Mã điểm thi" name="ma">
          <a-input v-model:value="formState.ma" placeholder="Nhập mã điểm thi" :maxlength="50" show-count />
        </a-form-item>

        <a-form-item label="Tên điểm thi" name="ten">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên điểm thi" :maxlength="255" show-count />
        </a-form-item>

        <a-form-item label="Số giám thị/1 phòng" name="so_giam_thi_1_phong">
          <a-input-number v-model:value="formState.so_giam_thi_1_phong" :min="1" :max="99" :precision="0" class="!w-full" />
        </a-form-item>

        <SelectUnit v-model="formState.id_don_vi" label="Đơn vị" name="id_don_vi" :rules="rules.id_don_vi" />

        <SelectYear v-model="examBoardYearFilter" label="Năm học" name="filter_id_nam" />

        <SelectExamBoard v-model="formState.id_hoi_dong" label="Hội đồng thi" name="id_hoi_dong" :rules="rules.id_hoi_dong" :id-nam="examBoardYearFilter" />

        <div class="grid grid-cols-1 sm:grid-cols-2">
          <a-form-item label="Giám sát" name="co_giam_sat">
            <a-switch v-model:checked="formState.co_giam_sat" checked-children="Có" un-checked-children="Không" />
          </a-form-item>

          <a-form-item v-if="formState.co_giam_sat" label="Số phòng giám sát tối đa" name="so_phong_giam_sat_toi_da">
            <a-input-number v-model:value="formState.so_phong_giam_sat_toi_da" :min="1" :max="99" :precision="0" class="!w-full" />
          </a-form-item>
        </div>
      </a-form>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading || detailLoading">
            {{ isEdit ? "Cập nhật" : "Thêm mới" }}
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
const settingStore = useSettingStore();
const { RestApi } = useApi();

const param = ref({ pageIndex: 1, pageSize: 10, search: "" });

const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã", dataIndex: "ma", key: "ma", width: 120, align: "center" },
  { title: "Tên điểm thi", dataIndex: "ten", key: "ten", width: 220, ellipsis: true },
  { title: "Đơn vị", dataIndex: "ten_don_vi", key: "ten_don_vi", width: 220, ellipsis: true },
  { title: "Hội đồng thi", dataIndex: "ten_hoi_dong", key: "ten_hoi_dong", width: 180, ellipsis: true },
  { title: "Số giám thị/1 phòng", dataIndex: "so_giam_thi_1_phong", key: "so_giam_thi_1_phong", width: 140, align: "center" },
  { title: "Giám sát", key: "co_giam_sat", width: 110, align: "center" },
  { title: "Số phòng giám sát tối đa", dataIndex: "so_phong_giam_sat_toi_da", key: "so_phong_giam_sat_toi_da", width: 170, align: "center" },
  { title: "Thao tác", key: "action", width: 90, align: "center", fixed: "right" },
];

const dataSource = ref([]);
const loading = ref(false);
const detailLoading = ref(false);
const searchText = ref("");
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const formRef = ref();
const examBoardYearFilter = ref(undefined);

const pagination = reactive({
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
  ten: "",
  so_giam_thi_1_phong: 1,
  co_giam_sat: false,
  so_phong_giam_sat_toi_da: 0,
  id_don_vi: undefined,
  id_hoi_dong: undefined,
});

const formState = reactive(defaultFormState());

const validateInteger = (value, { min = 0, max = 99, requiredMessage, rangeMessage }) => {
  if (value === undefined || value === null || value === "") {
    return Promise.reject(requiredMessage);
  }
  if (!Number.isInteger(value)) {
    return Promise.reject("Giá trị phải là số nguyên");
  }
  if (value < min || value > max) {
    return Promise.reject(rangeMessage);
  }
  return Promise.resolve();
};

const rules = reactive({
  ma: [
    { required: true, message: "Vui lòng nhập mã điểm thi", trigger: "blur" },
    { max: 50, message: "Mã điểm thi không quá 50 ký tự", trigger: "blur" },
  ],
  ten: [
    { required: true, message: "Vui lòng nhập tên điểm thi", trigger: "blur" },
    { max: 255, message: "Tên điểm thi không quá 255 ký tự", trigger: "blur" },
  ],
  so_giam_thi_1_phong: [
    { required: true, message: "Vui lòng nhập số giám thị/1 phòng", trigger: "blur" },
    {
      validator: (_rule, value) =>
        validateInteger(value, {
          min: 1,
          max: 99,
          requiredMessage: "Vui lòng nhập số giám thị/1 phòng",
          rangeMessage: "Số giám thị/1 phòng phải từ 1 đến 99",
        }),
      trigger: ["blur", "change"],
    },
  ],
  so_phong_giam_sat_toi_da: [
    {
      validator: (_rule, value) => {
        if (!formState.co_giam_sat) return Promise.resolve();
        return validateInteger(value, {
          min: 1,
          max: 99,
          requiredMessage: "Vui lòng nhập số phòng giám sát tối đa",
          rangeMessage: "Số phòng giám sát tối đa phải từ 1 đến 99",
        });
      },
      trigger: ["blur", "change"],
    },
  ],
  id_don_vi: [{ required: true, message: "Vui lòng chọn đơn vị", trigger: "change" }],
  id_hoi_dong: [{ required: true, message: "Vui lòng chọn hội đồng thi", trigger: "change" }],
});

const resetFormState = () => {
  Object.assign(formState, defaultFormState());
};

const fetchData = async p => {
  try {
    loading.value = true;
    const { data, error } = await RestApi.exam_location.list({ params: p });
    if (data.value?.status === "success") {
      dataSource.value = data.value?.data?.items || [];
      pagination.total = data.value?.data?.totalrecord || 0;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được dữ liệu điểm thi");
    }
  } catch (err) {
    dataSource.value = [];
    pagination.total = 0;
    message.error(err?.message || "Lỗi tải dữ liệu");
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

const resetSearch = async () => {
  searchText.value = "";
  param.value = { pageIndex: 1, pageSize: pagination.pageSize, search: "" };
  pagination.current = 1;
  await fetchData({ ...param.value });
};

const showModal = () => {
  isEdit.value = false;
  resetFormState();
  examBoardYearFilter.value = undefined;
  visible.value = true;
};

watch(
  () => formState.co_giam_sat,
  value => {
    if (!value) {
      formState.so_phong_giam_sat_toi_da = 0;
    } else if (!formState.so_phong_giam_sat_toi_da) {
      formState.so_phong_giam_sat_toi_da = 1;
    }
  },
);

watch(examBoardYearFilter, (value, oldValue) => {
  if (value !== oldValue) {
    formState.id_hoi_dong = undefined;
  }
});

const editItem = async record => {
  try {
    detailLoading.value = true;
    const { data, error } = await RestApi.exam_location.detail({ params: { Id: record.id } });
    if (data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || "Không tải được chi tiết điểm thi");
    }

    isEdit.value = true;
    Object.assign(formState, {
      id: data.value?.data?.id,
      ma: data.value?.data?.ma || "",
      ten: data.value?.data?.ten || "",
      so_giam_thi_1_phong: data.value?.data?.so_giam_thi_1_phong ?? 1,
      co_giam_sat: !!data.value?.data?.co_giam_sat,
      so_phong_giam_sat_toi_da: data.value?.data?.so_phong_giam_sat_toi_da ?? 0,
      id_don_vi: data.value?.data?.id_don_vi ?? undefined,
      id_hoi_dong: data.value?.data?.id_hoi_dong ?? undefined,
    });
    visible.value = true;
  } catch (error) {
    message.error(error?.message || "Không tải được chi tiết điểm thi");
  } finally {
    detailLoading.value = false;
  }
};

const buildPayload = () => ({
  ...(isEdit.value ? { id: formState.id } : {}),
  ma: (formState.ma || "").trim(),
  ten: (formState.ten || "").trim(),
  so_giam_thi_1_phong: formState.so_giam_thi_1_phong,
  co_giam_sat: formState.co_giam_sat,
  so_phong_giam_sat_toi_da: formState.co_giam_sat ? formState.so_phong_giam_sat_toi_da : 0,
  id_don_vi: formState.id_don_vi,
  id_hoi_dong: formState.id_hoi_dong,
});

const handleOk = async () => {
  let shouldClose = false;
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;
    const payload = buildPayload();

    if (isEdit.value) {
      const { data, error } = await RestApi.exam_location.update({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật điểm thi thành công");
        shouldClose = true;
      } else {
        throw new Error(error.value?.data?.message || "Cập nhật không thành công");
      }
    } else {
      const { data, error } = await RestApi.exam_location.create({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Thêm mới điểm thi thành công");
        shouldClose = true;
      } else {
        throw new Error(error.value?.data?.message || "Thêm mới không thành công");
      }
    }
  } catch (error) {
    message.error(error?.message || error?.response?.data?.message || "Đã xảy ra lỗi khi lưu");
  } finally {
    confirmLoading.value = false;
    if (shouldClose) {
      await fetchData({ ...param.value });
      visible.value = false;
      formRef.value?.resetFields?.();
      resetFormState();
    }
  }
};

const handleCancel = () => {
  formRef.value?.resetFields?.();
  resetFormState();
  examBoardYearFilter.value = undefined;
  visible.value = false;
};

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.exam_location.delete({ params: { Id: id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa thành công");
      pagination.current = 1;
      param.value.pageIndex = 1;
      await fetchData({ ...param.value });
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (error) {
    message.error(error?.message || "Không thể xóa điểm thi");
  }
};

await fetchData({ ...param.value });
</script>
