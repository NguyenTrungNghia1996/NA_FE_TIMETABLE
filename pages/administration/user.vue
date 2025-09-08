<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm người dùng..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>
    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: 1000 }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record }">
          <!-- Cột trạng thái -->
          <template v-if="column.key === 'stt'">
            {{ record.stt }}
          </template>
          <template v-if="column.key === 'isActive'">
            <a-tag :color="record.isActive ? 'green' : 'red'">
              {{ record.isActive ? "Hoạt động" : "Không hoạt động" }}
            </a-tag>
          </template>

          <!-- Cột quyền admin -->
          <template v-if="column.key === 'isAdmin'">
            <a-tag v-if="record.isAdmin" color="blue">Quản trị</a-tag>
            <a-tag v-else color="orange">Người dùng</a-tag>
          </template>

          <!-- Cột thao tác -->
          <template v-if="column.key === 'action'">
            <div class="flex justify-center gap-2">
              <!-- Desktop view - full buttons -->
              <div class="hidden md:flex space-x-2">
                <a-tooltip title="Sửa">
                  <a-button type="link" size="small" @click="editItem(record)" :disabled="!settingStore.currentPermission">
                    <template #icon>
                      <EditOutlined />
                    </template>
                  </a-button>
                </a-tooltip>
                <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                  <a-tooltip title="Xóa">
                    <a-button type="link" danger size="small" :disabled="!settingStore.currentPermission">
                      <template #icon>
                        <DeleteOutlined />
                      </template>
                    </a-button>
                  </a-tooltip>
                </a-popconfirm>
              </div>

              <!-- Mobile view - dropdown -->
              <div class="md:hidden">
                <a-dropdown :trigger="['click']">
                  <a-button type="text" size="small">
                    <MoreOutlined />
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="1" @click="editItem(record)" :disabled="!settingStore.currentPermission">
                        <template #icon>
                          <EditOutlined />
                        </template>
                        Sửa
                      </a-menu-item>
                      <a-menu-item key="2" danger @click="deleteItem(record.id)" :disabled="!settingStore.currentPermission">
                        <template #icon>
                          <DeleteOutlined />
                        </template>
                        Xóa
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>
    <!-- Modal thêm/sửa user -->
    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa người dùng' : 'Thêm mới người dùng'" @cancel="handleCancel" :width="700" :footer="null">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a-form-item label="Tên đăng nhập" name="username">
            <a-input v-model:value="formState.username" :disabled="isEdit" />
          </a-form-item>

          <a-form-item label="Họ và tên" name="hoten">
            <a-input v-model:value="formState.hoten" />
          </a-form-item>
          <SelectUnit v-model="formState.id_Donvi" label="Đơn vị" name="id_Donvi" placeholder="Chọn đơn vị" :rules="rules.id_Donvi" />
          <SelectRole v-model="formState.idRoles" label="Vai trò" name="idRoles" placeholder="Chọn vai trò" :multiple="true" :rules="rules.idRoles" />
        </div>

        <div class="flex gap-4 mt-4">
          <a-form-item label="Trạng thái" name="isActive">
            <a-switch v-model:checked="formState.isActive" checked-children="Hoạt động" un-checked-children="Không hoạt động" />
          </a-form-item>

          <a-form-item label="Quyền quản trị" name="isAdmin">
            <a-switch v-model:checked="formState.isAdmin" checked-children="Quản trị" un-checked-children="Người dùng" />
          </a-form-item>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading">
            {{ isEdit ? "Cập nhật" : "Thêm mới" }}
          </a-button>
        </div>
      </a-form>
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
    width: 70,
    align: "center",
  },
  {
    title: "Tên đăng nhập",
    dataIndex: "username",
    key: "username",
    width: 150,
  },
  {
    title: "Họ và tên",
    dataIndex: "hoten",
    key: "hoten",
    width: 150,
  },
  {
    title: "Đơn vị",
    dataIndex: "tendonvi",
    key: "tendonvi",
    width: 200,
    ellipsis: true,
  },
  {
    title: "Trạng thái",
    key: "isActive",
    width: 120,
    align: "center",
  },
  {
    title: "Quyền",
    key: "isAdmin",
    width: 100,
    align: "center",
  },
  {
    title: "Thao tác",
    key: "action",
    width: 120,
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
  username: "",
  hoten: "",
  id_Donvi: undefined,
  isActive: true,
  isAdmin: false,
  idRoles: undefined,
});

const rules = {
  username: [
    { required: true, message: "Vui lòng nhập tên đăng nhập", trigger: "blur" },
    { min: 3, message: "Tên đăng nhập ít nhất 3 ký tự", trigger: "blur" },
    { max: 100, message: "Tên đăng nhập không quá 100 ký tự", trigger: "blur" },
    {
      pattern: /^[a-z0-9.]+$/,
      message: "Chỉ nhập chữ thường, viết liền, không dấu, không ký tự đặc biệt",
      trigger: "blur",
    },
  ],
  hoten: [
    { required: true, message: "Vui lòng nhập họ tên", trigger: "blur" },
    { max: 50, message: "Họ tên không quá 50 ký tự", trigger: "blur" },
  ],
  id_Donvi: [{ required: true, message: "Vui lòng chọn Đơn vị", trigger: "blur" }],
  idRoles: [{ required: true, message: "Vui lòng chọn Vai trò", trigger: "blur" }],
};

// Methods
const fetchData = async param => {
  try {
    loading.value = true;
    const { data } = await RestApi.user.list({ params: param });

    if (data.value?.status === "success") {
      dataSource.value = data.value.data.items;
      pagination.total = data.value.data.totalrecord;
    } else {
      dataSource.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    message.error("Lỗi khi tải danh sách người dùng");
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
  param.value.search = searchText.value;
  pagination.current = 1;
  param.value.PageIndex = 1;
  await fetchData({ ...param.value });
};

const showModal = async () => {
  isEdit.value = false;
  Object.assign(formState, {
    username: "",
    hoten: "",
    id_Donvi: [],
    isActive: true,
    isAdmin: false,
    idRoles: [],
  });
  await nextTick();
  formRef.value?.clearValidate();
  visible.value = true;
};

const editItem = async record => {
  try {
    loading.value = true;
    const { data } = await RestApi.user.detail({ params: { id: record.id } });
    if (data.value?.status === "success") {
      const userData = data.value.data;
      Object.assign(formState, {
        id: userData.id,
        username: userData.username,
        hoten: userData.hoten,
        id_Donvi: userData.id_Donvi || undefined,
        isActive: userData.isActive,
        isAdmin: userData.isAdmin,
        idRoles: userData.idRoles || undefined,
      });
      isEdit.value = true;
      visible.value = true;
    } else {
      message.error(data.value?.message || "Không thể tải thông tin người dùng");
    }
  } catch (error) {
    console.error("Error fetching user detail:", error);
    message.error("Lỗi khi tải thông tin người dùng");
  } finally {
    loading.value = false;
    await nextTick();
    formRef.value?.clearValidate();
  }
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;

    if (isEdit.value) {
      const { data, error } = await RestApi.user.update({ body: { ...formState } });
      if (data.value?.status === "success") {
        message.success(data.value.message || "Cập nhật người dùng thành công");
      } else {
        throw new Error(error.value?.data?.message || "Cập nhật không thành công");
      }
    } else {
      if (formState) {
        delete formState.id;
      }
      const { data, error } = await RestApi.user.create({ body: { ...formState } });
      if (data.value?.status === "success") {
        message.success(data.value.message || "Thêm mới người dùng thành công");
      } else {
        throw new Error(error.value?.data?.message || "Thêm mới không thành công");
      }
    }
  } catch (error) {
    message.error(error.message || error.response?.data?.message || "Đã xảy ra lỗi khi lưu thông tin người dùng");
  } finally {
    visible.value = false;
    await fetchData({ ...param.value });
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  formRef.value?.resetFields();
  visible.value = false;
};

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.user.delete({ params: { id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa người dùng thành công");
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (error) {
    message.error(error.message || error.response?.data?.message || "Đã xảy ra lỗi khi xóa thông tin người dùng");
  } finally {
    await fetchData({ ...param.value });
  }
};

const resetForm = async () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  searchText.value = "";
  param.value.PageIndex = 1;
  param.value.PageSize = 10;
  param.value.search = "";
  pagination.current = 1;
  pagination.pageSize = 10;
  await fetchData({ ...param.value });
};

// Lifecycle
await fetchData({ ...param.value });
</script>

<style scoped>
/* Responsive table */
@media (max-width: 768px) {
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 8px !important;
    font-size: 13px;
  }

  .ant-table-cell {
    white-space: nowrap;
  }
}

/* Fix for sticky column */
.ant-table-cell-fix-left,
.ant-table-cell-fix-right {
  z-index: 1;
  background: white;
}

.ant-table-cell-fix-right {
  box-shadow: -5px 0 5px -5px rgba(0, 0, 0, 0.1);
}
</style>
