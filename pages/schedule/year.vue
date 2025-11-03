<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm năm học..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '900' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>

          <template v-if="column.key === 'tu_ngay'">
            {{ formatDate(record.tu_ngay) || "Trống" }}
          </template>
          <template v-if="column.key === 'den_ngay'">
            {{ formatDate(record.den_ngay) || "Trống" }}
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

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa năm học' : 'Thêm mới năm học'" @cancel="handleCancel" :width="640">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tên năm học" name="ten" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên năm học" :maxlength="50" show-count />
        </a-form-item>

        <a-form-item label="Khoảng ngày (dd/mm/yyyy)" name="dateRange" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <a-range-picker v-model:value="formState.dateRange" format="DD/MM/YYYY" :allow-clear="true" class="w-full" />
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
import dayjs from 'dayjs';
const settingStore = useSettingStore();
const { RestApi } = useApi();

const param = ref({ pageIndex: 1, pageSize: 10, search: "" });

const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Tên năm học", dataIndex: "ten", key: "ten", ellipsis: true },
  { title: "Từ ngày", dataIndex: "tu_ngay", key: "tu_ngay", width: 140, align: "center" },
  { title: "Đến ngày", dataIndex: "den_ngay", key: "den_ngay", width: 140, align: "center" },
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
  pageSizeOptions: ["1", "10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const formState = reactive({
  id: undefined,
  ten: "",
  dateRange: [],
});

const rules = reactive({
  ten: [
    { required: true, message: "Vui lòng nhập tên năm học", trigger: "blur" },
    { min: 2, message: "Tên phải có ít nhất 2 ký tự", trigger: "blur" },
  ],
  dateRange: [
    {
      validator: async (_rule, value) => {
        if (!Array.isArray(value) || value.length !== 2 || !value[0] || !value[1]) {
          return Promise.reject("Vui lòng chọn khoảng ngày");
        }
        return Promise.resolve();
      },
      trigger: "change",
    },
  ],
});

const formatDate = date => {
  if (!date) return "";
  try {
    return dayjs(date).format("DD/MM/YYYY");
  } catch {
    return "";
  }
};

const fetchData = async p => {
  try {
    loading.value = true;
    const { data, error } = await RestApi.year.list({ params: p });
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
  Object.assign(formState, { id: undefined, ten: "", dateRange: [] });
  visible.value = true;
};

const editItem = record => {
  isEdit.value = true;
  Object.assign(formState, {
    id: record.id,
    ten: record.ten,
    dateRange: [record.tu_ngay ? dayjs(record.tu_ngay) : null, record.den_ngay ? dayjs(record.den_ngay) : null],
  });
  visible.value = true;
};

const buildPayload = () => {
  const [start, end] = formState.dateRange || [];
  return {
    ...(isEdit.value ? { id: formState.id } : {}),
    ten: formState.ten,
    tu_ngay: start ? dayjs(start).toDate().toISOString() : null,
    den_ngay: end ? dayjs(end).toDate().toISOString() : null,
  };
};

const handleOk = async () => {
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;
    const payload = buildPayload();

    if (isEdit.value) {
      const { data, error } = await RestApi.year.update({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật năm học thành công");
      } else {
        throw new Error(error.value?.data?.message || "Cập nhật không thành công");
      }
    } else {
      const { data, error } = await RestApi.year.create({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Thêm năm học thành công");
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
    // API expects `Id` in query per spec
    const { data, error } = await RestApi.year.delete({ params: { Id: id } });
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
