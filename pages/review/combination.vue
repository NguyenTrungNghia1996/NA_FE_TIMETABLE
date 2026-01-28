<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Nhập thông tin tìm kiếm" enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '1000' }" row-key="id" @change="handleTableChange" bordered size="small">
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

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa tổ hợp môn' : 'Thêm mới tổ hợp môn'" @cancel="handleCancel" :width="720">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Mã tổ hợp môn" name="ma">
          <a-input v-model:value="formState.ma" placeholder="Nhập mã tổ hợp môn" :maxlength="50" show-count :disabled="detailLoading" />
        </a-form-item>
        <a-form-item label="Tên tổ hợp môn" name="ten">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên tổ hợp môn" :maxlength="50" show-count :disabled="detailLoading" />
        </a-form-item>
        <a-form-item label="Môn trong tổ hợp" name="ds_mon">
          <a-table :columns="subjectColumns" :data-source="subjectList" :pagination="subjectPagination" :loading="subjectLoading" row-key="id" size="small" bordered @change="handleSubjectTableChange">
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'stt'">
                {{ (subjectPagination.current - 1) * subjectPagination.pageSize + index + 1 }}
              </template>
              <template v-else-if="column.key === 'action'">
                <a-switch :checked="isSubjectSelected(record.id)" :disabled="detailLoading" size="small" @change="checked => toggleSubject(record.id, checked)" />
              </template>
            </template>
          </a-table>
        </a-form-item>
      </a-form>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading" :disabled="detailLoading">
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
  { title: "Mã tổ hợp", dataIndex: "ma", key: "ma", width: 140, ellipsis: true },
  { title: "Tên tổ hợp", dataIndex: "ten", key: "ten", width: 200, ellipsis: true },
  { title: "Môn trong tổ hợp", dataIndex: "ten_mon", key: "ten_mon", ellipsis: true },
  { title: "Thao tác", key: "action", width: 110, align: "center", fixed: "right" },
];

const dataSource = ref([]);
const loading = ref(false);
const searchText = ref("");
const visible = ref(false);
const confirmLoading = ref(false);
const detailLoading = ref(false);
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
  ds_mon: [],
});

const subjectList = ref([]);
const subjectLoading = ref(false);
const subjectPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});
const subjectParam = ref({ PageIndex: 1, PageSize: 10, search: "" });

const subjectColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Môn học", dataIndex: "ten", key: "ten", ellipsis: true },
  { title: "Lựa chọn", key: "action", width: 120, align: "center" },
];

const rules = reactive({
  ma: [
    { required: true, message: "Vui lòng nhập mã tổ hợp môn", trigger: "blur" },
    { max: 50, message: "Mã tổ hợp không quá 50 ký tự", trigger: "blur" },
  ],
  ten: [
    { required: true, message: "Vui lòng nhập tên tổ hợp môn", trigger: "blur" },
    { max: 50, message: "Tên tổ hợp không quá 50 ký tự", trigger: "blur" },
  ],
  ds_mon: [
    {
      validator: (_, value) => {
        if (Array.isArray(value) && value.length > 0) return Promise.resolve();
        return Promise.reject("Vui lòng chọn ít nhất 1 môn học");
      },
      trigger: "change",
    },
  ],
});

const fetchData = async p => {
  try {
    loading.value = true;
    const { data, error } = await RestApi.review_subject_combination.list({ params: p });
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
    ds_mon: [],
  });
  subjectPagination.current = 1;
  subjectPagination.pageSize = 10;
  subjectParam.value.PageIndex = 1;
  subjectParam.value.PageSize = 10;
  visible.value = true;
  fetchSubjects({ ...subjectParam.value });
};

const editItem = async record => {
  isEdit.value = true;
  visible.value = true;
  detailLoading.value = true;
  subjectPagination.current = 1;
  subjectPagination.pageSize = 10;
  subjectParam.value.PageIndex = 1;
  subjectParam.value.PageSize = 10;
  fetchSubjects({ ...subjectParam.value });
  Object.assign(formState, {
    id: record.id,
    ma: record.ma || "",
    ten: record.ten || "",
    ds_mon: [],
  });
  try {
    const { data, error } = await RestApi.review_subject_combination.detail({ params: { id: record.id } });
    if (data.value?.status === "success") {
      const detail = data.value.data || {};
      formState.ma = detail.ma ?? formState.ma;
      formState.ten = detail.ten ?? formState.ten;
      formState.ds_mon = Array.isArray(detail.ds_mon) ? detail.ds_mon : [];
    } else {
      throw new Error(error.value?.data?.message || "Không tải được chi tiết");
    }
  } catch (err) {
    message.error(err.message || "Không tải được chi tiết");
  } finally {
    detailLoading.value = false;
  }
};

const fetchSubjects = async params => {
  try {
    subjectLoading.value = true;
    const { data, error } = await RestApi.subject.list({ params });
    if (data.value?.status === "success") {
      subjectList.value = data.value.data.items || [];
      subjectPagination.total = data.value.data.totalrecord || 0;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được danh sách môn học");
    }
  } catch (err) {
    subjectList.value = [];
    subjectPagination.total = 0;
    message.error(err.message || "Không tải được danh sách môn học");
  } finally {
    subjectLoading.value = false;
  }
};

const handleSubjectTableChange = async pag => {
  subjectPagination.current = pag.current;
  subjectPagination.pageSize = pag.pageSize;
  subjectParam.value.PageIndex = pag.current;
  subjectParam.value.PageSize = pag.pageSize;
  await fetchSubjects({ ...subjectParam.value });
};

const isSubjectSelected = id => {
  return Array.isArray(formState.ds_mon) && formState.ds_mon.includes(id);
};

const toggleSubject = (id, checked) => {
  const next = new Set(Array.isArray(formState.ds_mon) ? formState.ds_mon : []);
  if (checked) {
    next.add(id);
  } else {
    next.delete(id);
  }
  formState.ds_mon = Array.from(next);
  formRef.value?.validateFields?.(["ds_mon"]).catch(() => {});
};

const handleOk = async () => {
  let shouldClose = false;
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;
    const payload = {
      id: formState.id,
      ma: formState.ma,
      ten: formState.ten,
      ds_mon: formState.ds_mon || [],
    };
    if (isEdit.value) {
      const { data, error } = await RestApi.review_subject_combination.update({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật thành công");
        shouldClose = true;
      } else {
        throw new Error(error.value?.data?.message || "Cập nhật không thành công");
      }
    } else {
      delete payload.id;
      const { data, error } = await RestApi.review_subject_combination.create({ body: payload });
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
    const { data, error } = await RestApi.review_subject_combination.delete({ params: { id } });
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
