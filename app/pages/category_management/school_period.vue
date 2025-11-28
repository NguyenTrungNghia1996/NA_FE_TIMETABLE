<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row gap-2 mb-4 md:items-center">
      <div class="flex-1 w-full">
        <a-input-search
          v-model:value="searchText"
          placeholder="Tìm kiếm tiết học..."
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

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa tiết học' : 'Thêm mới tiết học'" @cancel="handleCancel" :width="600">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tên tiết học" name="ten" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên tiết học" :maxlength="200" show-count />
        </a-form-item>
        <SelectSchoolShiftByUnit v-model="formState.id_ca_hoc" name="id_ca_hoc" :multiple="true" :rules="rules.id_ca_hoc" />
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
  { title: "STT", key: "stt", width: 50, align: "center" },
  { title: "Tên tiết học", dataIndex: "ten", key: "ten", ellipsis: true },
  { title: "Thao tác", key: "action", width: 80, align: "center", fixed: "right" },
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
  ten: "",
  id_ca_hoc: [],
});

const rules = reactive({
  ten: [
    { required: true, message: "Vui lòng nhập tên tiết học", trigger: "blur" },
    { min: 2, message: "Tên phải có ít nhất 2 ký tự", trigger: "blur" },
  ],
  id_ca_hoc: [{ required: true, message: "Vui lòng chọn ca học", trigger: "blur", type: "array" }],
});

const fetchData = async param => {
  try {
    loading.value = true;
    const { data } = await RestApi.school_period.list({ params: param });
    if (data.value?.status === "success") {
      dataSource.value = data.value.data.items || [];
      pagination.total = data.value.data.totalrecord;
    } else {
      dataSource.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    message.error("Lỗi khi tải dữ liệu");
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
  Object.assign(formState, { ten: "", id_ca_hoc: [] });
  visible.value = true;
};

const editItem = async record => {
  isEdit.value = true;
  try {
    const { data } = await RestApi.school_period.detail({ params: { id: record.id } });
    if (data.value?.status === "success") {
      const detail = data.value.data;
      Object.assign(formState, {
        id: detail.id,
        ten: detail.ten,
        id_ca_hoc: detail.id_Ca_hoc || [],
      });
      visible.value = true;
    }
  } catch (err) {
    message.error("Không thể lấy dữ liệu chi tiết");
  }
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    let res;
    if (isEdit.value) {
      res = await RestApi.school_period.update({ body: { ...formState } });
    } else {
      if (formState.id) delete formState.id;
      res = await RestApi.school_period.create({ body: { ...formState } });
    }
    if (res.data.value?.status === "success") {
      message.success(res.data.value?.message || "Thành công");
      await fetchData({ ...param.value });
      visible.value = false;
      formRef.value.resetFields();
    } else {
      throw new Error(res.error?.value?.data?.message || "Lỗi không xác định");
    }
  } catch (err) {
    message.error(err.message || "Lỗi khi lưu thông tin");
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  formRef.value.resetFields();
  visible.value = false;
};

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.school_period.delete({ params: { id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Đã xóa");
      pagination.current = 1;
      param.value.PageIndex = 1;
      await fetchData({ ...param.value });
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (error) {
    message.error(error?.message || error?.value?.data?.message || "Xóa không thành công ");
  }
};

const resetForm = async () => {
  if (formRef.value) formRef.value.resetFields();
  param.value = { PageIndex: 1, PageSize: 10, search: "" };
  pagination.current = 1;
  pagination.pageSize = 10;
  await fetchData({ ...param.value });
};

await fetchData({ ...param.value });
</script>
