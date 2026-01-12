<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm lớp ôn tập..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '1400' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-if="column.key === 'action'">
            <div class="flex justify-center">
              <div class="md:flex space-x-2">
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

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa lớp ôn tập' : 'Thêm mới lớp ôn tập'" @cancel="handleCancel" :width="720">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules" class="grid grid-cols-2 gap-2">
        <a-form-item label="Mã lớp ôn tập" name="ma">
          <a-input v-model:value="formState.ma" placeholder="Nhập mã lớp ôn tập" :maxlength="50" show-count />
        </a-form-item>
        <a-form-item label="Tên lớp ôn tập" name="ten">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên lớp ôn tập" :maxlength="50" show-count />
        </a-form-item>
        <SelectGradeLevelByUnit v-model="formState.id_khoi" label="Khối lớp" name="id_khoi" :rules="rules.id_khoi" />
        <SelectSubject v-model="formState.id_mon" label="Môn học" name="id_mon" :rules="rules.id_mon" />
        <SelectClassroom v-model="formState.id_phong" label="Phòng học" name="id_phong" :rules="rules.id_phong" />
        <SelectTeacher v-model="formState.id_giao_vien" label="Giáo viên" name="id_giao_vien" :rules="rules.id_giao_vien" />
        <SelectYear v-model="formState.id_nam" label="Năm học" name="id_nam" :rules="rules.id_nam" />
        <a-form-item label="Số tiết tối đa/tuần" name="so_tiet_toi_da_tren_tuan" class="">
          <a-input-number v-model:value="formState.so_tiet_toi_da_tren_tuan" class="!w-full" :min="1" :max="99" :precision="0" />
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
  </div>
</template>

<script setup>
const settingStore = useSettingStore();
const { RestApi } = useApi();
const param = ref({ pageIndex: 1, pageSize: 10, search: "" });

const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã lớp", dataIndex: "ma", key: "ma", width: 120, ellipsis: true },
  { title: "Tên lớp ôn tập", dataIndex: "ten", key: "ten", width: 180, ellipsis: true },
  { title: "Khối", dataIndex: "ten_khoi", key: "ten_khoi", width: 120, ellipsis: true },
  { title: "Môn học", dataIndex: "ten_mon", key: "ten_mon", width: 160, ellipsis: true },
  { title: "Phòng học", dataIndex: "ten_phong", key: "ten_phong", width: 140, ellipsis: true },
  { title: "Giáo viên", dataIndex: "ten_giao_vien", key: "ten_giao_vien", width: 160, ellipsis: true },
  { title: "Năm học", dataIndex: "ten_nam", key: "ten_nam", width: 120, ellipsis: true },
  { title: "Số tiết tối đa/tuần", dataIndex: "so_tiet_toi_da_tren_tuan", key: "so_tiet_toi_da_tren_tuan", width: 170, align: "center" },
  { title: "Thao tác", key: "action", width: 90, align: "center", fixed: "right" },
];

const dataSource = ref([]);
const loading = ref(false);
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

const formState = reactive({
  id: undefined,
  ma: "",
  ten: "",
  id_khoi: undefined,
  id_mon: undefined,
  id_phong: undefined,
  id_giao_vien: undefined,
  id_nam: undefined,
  so_tiet_toi_da_tren_tuan: undefined,
});

const rules = reactive({
  ma: [
    { required: true, message: "Vui lòng nhập mã lớp ôn tập", trigger: "blur" },
    { max: 50, message: "Mã lớp không quá 50 ký tự", trigger: "blur" },
  ],
  ten: [
    { required: true, message: "Vui lòng nhập tên lớp ôn tập", trigger: "blur" },
    { max: 50, message: "Tên lớp không quá 50 ký tự", trigger: "blur" },
  ],
  id_khoi: [{ required: true, message: "Vui lòng chọn khối lớp", trigger: "change" }],
  id_mon: [{ required: true, message: "Vui lòng chọn môn học", trigger: "change" }],
  id_phong: [{ required: true, message: "Vui lòng chọn phòng học", trigger: "change" }],
  id_giao_vien: [{ required: true, message: "Vui lòng chọn giáo viên", trigger: "change" }],
  id_nam: [{ required: true, message: "Vui lòng chọn năm học", trigger: "change" }],
  so_tiet_toi_da_tren_tuan: [
    { required: true, message: "Vui lòng nhập số tiết tối đa/tuần", trigger: "blur" },
    {
      validator: (_, value) => {
        const numberValue = Number(value);
        if (!Number.isFinite(numberValue) || !Number.isInteger(numberValue)) {
          return Promise.reject("Số tiết phải là số nguyên");
        }
        if (numberValue < 1 || numberValue > 99) {
          return Promise.reject("Số tiết phải trong khoảng 1-99");
        }
        return Promise.resolve();
      },
      trigger: ["blur", "change"],
    },
  ],
});

const fetchData = async p => {
  try {
    loading.value = true;
    const { data, error } = await RestApi.review_class.list({ params: p });
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
    ma: "",
    ten: "",
    id_khoi: undefined,
    id_mon: undefined,
    id_phong: undefined,
    id_giao_vien: undefined,
    id_nam: undefined,
    so_tiet_toi_da_tren_tuan: undefined,
  });
  visible.value = true;
};

const editItem = record => {
  isEdit.value = true;
  Object.assign(formState, {
    id: record.id,
    ma: record.ma || "",
    ten: record.ten || "",
    id_khoi: record.id_khoi ?? undefined,
    id_mon: record.id_mon ?? undefined,
    id_phong: record.id_phong ?? undefined,
    id_giao_vien: record.id_giao_vien ?? undefined,
    id_nam: record.id_nam ?? undefined,
    so_tiet_toi_da_tren_tuan: record.so_tiet_toi_da_tren_tuan ?? undefined,
  });
  visible.value = true;
};

const handleOk = async () => {
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;
    const payload = { ...formState };

    if (isEdit.value) {
      const { data, error } = await RestApi.review_class.update({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật thành công");
      } else {
        throw new Error(error.value?.data?.message || "Cập nhật không thành công");
      }
    } else {
      delete payload.id;
      const { data, error } = await RestApi.review_class.create({ body: payload });
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
    const { data, error } = await RestApi.review_class.delete({ params: { id } });
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
