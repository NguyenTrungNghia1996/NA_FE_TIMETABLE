<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm hội đồng thi..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '1100' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
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

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa hội đồng thi' : 'Thêm mới hội đồng thi'" @cancel="handleCancel" :width="720">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules" class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <a-form-item label="Mã hội đồng" name="ma">
          <a-input v-model:value="formState.ma" :maxlength="2" inputmode="numeric" placeholder="Nhập mã hội đồng" @input="handleMaInput" />
        </a-form-item>

        <a-form-item label="Tên hội đồng thi" name="ten">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên hội đồng thi" :maxlength="100" show-count />
        </a-form-item>

        <SelectYear v-model="formState.id_nam" label="Năm học" name="id_nam" :rules="rules.id_nam" />
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
  { title: "Mã", dataIndex: "ma", key: "ma", width: 90, align: "center" },
  { title: "Tên hội đồng thi", dataIndex: "ten", key: "ten", width: 220, ellipsis: true },
  { title: "Đơn vị", dataIndex: "ten_don_vi", key: "ten_don_vi", width: 260, ellipsis: true },
  { title: "Năm học", dataIndex: "ten_nam", key: "ten_nam", width: 140, ellipsis: true },
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
  id_nam: undefined,
});

const formState = reactive(defaultFormState());

const rules = reactive({
  ma: [
    { required: true, message: "Vui lòng nhập mã hội đồng", trigger: "blur" },
    {
      validator: (_rule, value) => {
        if (value === undefined || value === null || value === "") {
          return Promise.reject("Vui lòng nhập mã hội đồng");
        }
        if (!/^\d{1,2}$/.test(String(value))) {
          return Promise.reject("Mã hội đồng phải là chuỗi số, tối đa 2 ký tự");
        }
        return Promise.resolve();
      },
      trigger: ["blur", "change"],
    },
  ],
  ten: [
    { required: true, message: "Vui lòng nhập tên hội đồng thi", trigger: "blur" },
    { max: 100, message: "Tên hội đồng thi không quá 100 ký tự", trigger: "blur" },
  ],
  id_nam: [{ required: true, message: "Vui lòng chọn năm học", trigger: "change" }],
});

const resetFormState = () => {
  Object.assign(formState, defaultFormState());
};

const fetchData = async p => {
  try {
    loading.value = true;
    const { data, error } = await RestApi.exam_board.list({ params: p });
    if (data.value?.status === "success") {
      dataSource.value = data.value?.data?.items || [];
      pagination.total = data.value?.data?.totalrecord || 0;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được dữ liệu");
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

const handleMaInput = event => {
  const rawValue = event?.target?.value ?? "";
  formState.ma = String(rawValue).replace(/\D/g, "").slice(0, 2);
};

const showModal = () => {
  isEdit.value = false;
  resetFormState();
  visible.value = true;
};

const editItem = async record => {
  try {
    detailLoading.value = true;
    const { data, error } = await RestApi.exam_board.detail({ params: { Id: record.id } });
    if (data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || "Không tải được chi tiết hội đồng thi");
    }

    isEdit.value = true;
    Object.assign(formState, {
      id: data.value?.data?.id,
      ma: data.value?.data?.ma !== undefined && data.value?.data?.ma !== null ? data.value.data.ma : "",
      ten: data.value?.data?.ten || "",
      id_nam: data.value?.data?.id_nam ?? undefined,
    });
    visible.value = true;
  } catch (error) {
    message.error(error?.message || "Không tải được chi tiết hội đồng thi");
  } finally {
    detailLoading.value = false;
  }
};

const buildPayload = () => ({
  ...(isEdit.value ? { id: formState.id } : {}),
  ma: formState.ma,
  ten: (formState.ten || "").trim(),
  id_nam: formState.id_nam,
});

const handleOk = async () => {
  let shouldClose = false;
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;
    const payload = buildPayload();

    if (isEdit.value) {
      const { data, error } = await RestApi.exam_board.update({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật hội đồng thi thành công");
        shouldClose = true;
      } else {
        throw new Error(error.value?.data?.message || "Cập nhật không thành công");
      }
    } else {
      const { data, error } = await RestApi.exam_board.create({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Thêm mới hội đồng thi thành công");
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
  visible.value = false;
};

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.exam_board.delete({ params: { Id: id } });
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
  resetFormState();
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
