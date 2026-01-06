<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm giáo viên..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">
        <span class="md:inline">Đặt lại</span>
      </a-button>
      <a-button type="primary" @click="drawerAssignmentOpen = true" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">
        <span class="md:inline">Chuyên môn của Giáo viên</span>
      </a-button>
      <a-button type="primary" @click="drawerAvoidOpen = true" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">
        <span class="md:inline">Tiết tránh xếp</span>
      </a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">
        <span class="md:inline">Thêm mới</span>
      </a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '1000' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-if="column.key === 'ho_va_ho_dem'"> {{ record.ho_va_ho_dem }} {{ record.ten }} </template>
          <template v-if="column.key === 'action'">
            <div class="flex justify-center">
              <div class="md:flex space-x-2">
                <a-button type="link" size="small" @click="editItem(record.id)" :disabled="!settingStore.currentPermission">
                  <template #icon>
                    <EditOutlined />
                  </template>
                </a-button>
                <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
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

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa giáo viên' : 'Thêm mới giáo viên'" @cancel="handleCancel" :width="600">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Mã giáo viên" name="ma_giao_vien" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <a-input v-model:value="formState.ma_giao_vien" placeholder="Nhập mã giáo viên" :maxlength="30" show-count />
        </a-form-item>
        <a-form-item label="Họ và Họ đệm" name="ho_va_ho_dem" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <a-input v-model:value="formState.ho_va_ho_dem" placeholder="Nhập họ và họ đệm" :maxlength="30" show-count />
        </a-form-item>
        <a-form-item label="Tên" name="ten" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên" :maxlength="30" show-count />
        </a-form-item>
        <SelectExpertise v-model="formState.id_to_chuyen_mon" name="id_to_chuyen_mon" :multiple="true" :rules="rules.id_to_chuyen_mon" />
        <SelectSchoolSite v-model="formState.id_diem_truong" name="id_diem_truong" :multiple="true" :rules="rules.id_diem_truong" />
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
    <a-drawer v-model:open="drawerAvoidOpen" title="Thiết lập tiết tránh xếp của giáo viên" :footer="null" height="100vh" placement="bottom" @close="closeTeacherAvoid">
      <TeacherAvoid ref="avoidRef" />
    </a-drawer>
    <a-drawer v-model:open="drawerAssignmentOpen" title="Chuyên môn của Giáo viên" :footer="null" height="100vh" placement="bottom" @close="closeAssignmentDrawer">
      <TeacherAssignment ref="assignmentRef" />
    </a-drawer>
  </div>
</template>

<script setup>
const settingStore = useSettingStore();
const { RestApi } = useApi();
const param = ref({ PageIndex: 1, PageSize: 10, search: "" });

const columns = [
  { title: "STT", key: "stt", width: 50, align: "center" },
  { title: "Mã giáo viên", dataIndex: "ma_giao_vien", key: "ma_giao_vien", ellipsis: true },
  { title: "Họ và tên", dataIndex: "ho_va_ho_dem", key: "ho_va_ho_dem", ellipsis: true },
  // { title: "Tên", dataIndex: "ten", key: "ten", ellipsis: true },
  { title: "Tổ chuyên môn", dataIndex: "ten_to_chuyen_mon", key: "ten_to_chuyen_mon", ellipsis: true },
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
  id: null,
  ma_giao_vien: "",
  ho_va_ho_dem: "",
  ten: "",
  id_to_chuyen_mon: [],
  id_diem_truong: [],
});

const rules = reactive({
  ma_giao_vien: [
    { required: true, message: "Vui lòng nhập mã giáo viên", trigger: "blur" },
    { max: 30, message: "Mã giáo viên tối đa 30 ký tự", trigger: "blur" },
  ],
  ho_va_ho_dem: [
    { required: true, message: "Vui lòng nhập họ và họ đệm", trigger: "blur" },
    { max: 30, message: "Tối đa 30 ký tự", trigger: "blur" },
  ],
  ten: [
    { required: true, message: "Vui lòng nhập tên", trigger: "blur" },
    { max: 30, message: "Tối đa 30 ký tự", trigger: "blur" },
  ],
  id_to_chuyen_mon: [{ required: true, message: "Vui lòng chọn tổ chuyên môn", trigger: "change" }],
  id_diem_truong: [{ required: true, message: "Vui lòng chọn điểm trường", trigger: "change" }],
});

const fetchData = async param => {
  try {
    loading.value = true;
    const { data } = await RestApi.teacher.list({ params: param });
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
  Object.assign(formState, { id: null, ma_giao_vien: "", ho_va_ho_dem: "", ten: "", id_to_chuyen_mon: [], id_diem_truong: [] });
  visible.value = true;
};

const editItem = async id => {
  isEdit.value = true;
  try {
    const { data } = await RestApi.teacher.detail({ params: { Id: id } });
    if (data.value?.status === "success") {
      Object.assign(formState, {
        id: data.value.data.id,
        ma_giao_vien: data.value.data.ma_giao_vien,
        ho_va_ho_dem: data.value.data.ho_va_ho_dem,
        ten: data.value.data.ten,
        id_to_chuyen_mon: data.value.data.id_to_chuyen_mon,
        id_diem_truong: data.value.data.id_diem_truong,
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
    const payload = { ...formState };
    let res;
    if (isEdit.value) {
      res = await RestApi.teacher.update({ body: payload });
    } else {
      delete payload.id;
      res = await RestApi.teacher.create({ body: payload });
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
    const { data, error } = await RestApi.teacher.delete({ params: { Id: id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa thành công");
      pagination.current = 1;
      param.value.PageIndex = 1;
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
  param.value.PageIndex = 1;
  param.value.PageSize = 10;
  param.value.search = "";
  pagination.current = 1;
  pagination.pageSize = 10;
  await fetchData({ ...param.value });
};

await fetchData({ ...param.value });

const drawerAvoidOpen = ref(false);
const avoidRef = ref(null);
const closeTeacherAvoid = () => {
  avoidRef.value?.reset();
};

watch(drawerAvoidOpen, val => {
  if (val) {
    avoidRef.value?.refresh();
  }
});

const drawerAssignmentOpen = ref(false);
const assignmentRef = ref();

watch(drawerAssignmentOpen, val => {
  if (val) {
    assignmentRef.value?.refresh();
  }
});

const closeAssignmentDrawer = () => {
  // drawerOpen.value = false
  assignmentRef.value?.reset();
};
</script>
