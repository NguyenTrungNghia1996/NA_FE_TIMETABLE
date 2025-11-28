<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <!-- <h1 class="text-xl md:text-2xl font-bold mb-4 md:mb-6">Quản lý ca học</h1> -->
    <div class="flex flex-col md:flex-row gap-2 mb-4 md:items-center">
      <div class="flex-1 w-full">
        <a-input-search
          v-model:value="searchText"
          placeholder="Tìm kiếm ca học..."
          enter-button
          @search="handleSearch"
          class="w-full" />
      </div>

      <div class="flex flex-col w-full gap-2 md:w-auto md:flex-row md:flex-wrap md:justify-end">
        <a-button @click="resetForm" class="w-full md:w-auto">
          <span class="md:inline">Đặt lại</span>
        </a-button>
        <a-button
          type="primary"
          @click="showModal"
          class="w-full md:w-auto"
          :disabled="!settingStore.currentPermission">
          <span class="md:inline">Thêm mới</span>
        </a-button>
      </div>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '800' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>

          <template v-if="column.key === 'ghichu'">
            <span v-if="record.ghichu">{{ record.ghichu }}</span>
            <span v-else class="text-gray-400">Trống</span>
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
    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa ca học' : 'Thêm mới ca học'" @cancel="handleCancel" :width="600">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tên ca học" name="ten" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên ca học" :maxlength="20" show-count />
        </a-form-item>

        <a-form-item label="Ghi chú" name="ghichu" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <a-textarea v-model:value="formState.ghichu" :rows="4" placeholder="Nhập ghi chú (nếu có)" :maxlength="200" show-count />
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
const param = ref({ PageIndex: 1, PageSize: 10, search: "" });
const columns = [
  {
    title: "STT",
    key: "stt",
    width: 50,
    align: "center",
  },
  {
    title: "Tên ca học",
    dataIndex: "ten",
    key: "ten",
    ellipsis: true,
  },
  {
    title: "Ghi chú",
    dataIndex: "ghichu",
    key: "ghichu",
    ellipsis: true,
  },
  {
    title: "Thao tác",
    key: "action",
    width: 80,
    align: "center",
    fixed: "right",
  },
];

// State
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
  ten: "",
  ghichu: "",
});

const rules = reactive({
  ten: [
    { required: true, message: "Vui lòng nhập tên ca học", trigger: "blur" },
    { min: 2, message: "Tên ca học phải có ít nhất 2 ký tự", trigger: "blur" },
  ],
});

// Methods
const fetchData = async param => {
  try {
    loading.value = true;
    const { data, error } = await RestApi.school_shift.list({ params: param });
    if (data.value?.status === "success") {
      dataSource.value = data.value.data.items || [];
      pagination.total = data.value.data.totalrecord;
    } else {
      throw new Error(error.value?.data?.message);
    }
  } catch (error) {
    message.error(error.message);
    dataSource.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const handleTableChange = async pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  param.value.PageIndex = pag.current;
  param.value.PageSize = pag.pageSize;
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
  await fetchData({ ...param.value });
};

const showModal = () => {
  isEdit.value = false;
  Object.assign(formState, {
    ten: "",
    ghichu: "",
  });
  visible.value = true;
};

const editItem = record => {
  isEdit.value = true;
  Object.assign(formState, {
    id: record.id,
    ten: record.ten,
    ghichu: record.ghichu || "",
  });
  visible.value = true;
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    if (isEdit.value) {
      const { data, error } = await RestApi.school_shift.update({ body: { ...formState } });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật thành công");
      } else {
        throw new Error(error.value?.data?.message || "Thêm mới không thành công");
      }
    } else {
      if (formState) {
        delete formState.id;
      }
      const { data, error } = await RestApi.school_shift.create({ body: { ...formState } });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Tạo mới thành công");
      } else {
        throw new Error(error.value?.data?.message || "Thêm mới không thành công");
      }
    }
  } catch (error) {
    message.error(error.message || error.response?.data?.message || "Đã xảy ra lỗi khi lưu thông tin");
  } finally {
    await fetchData({ ...param.value });
    confirmLoading.value = false;
    visible.value = false;
    formRef.value.resetFields();
  }
};

const handleCancel = () => {
  formRef.value.resetFields();
  visible.value = false;
};

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.school_shift.delete({ params: { id: id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa thành công");
      param.value.PageIndex = 1;
      pagination.current = 1;
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (error) {
    // console.error("Error deleting data:", error);
    // message.error("Có lỗi xảy ra khi xóa dữ liệu");
    message.error(error?.message || error?.value?.data?.message || "Xóa không thành công ");
  } finally {
    await fetchData({ ...param.value });
  }
};
const resetForm = async () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  searchText.value = "";
  param.value = { PageIndex: 1, PageSize: 10, search: "" };
  pagination.current = 1;
  pagination.pageSize = 10;
  await fetchData({ ...param.value });
};

await fetchData({ ...param.value });
</script>
