<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm lớp học..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="drawerBreakOpen = true" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Tiết nghỉ</a-button>
      <a-button type="primary" @click="drawerAvoidOpen = true" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Tiết tránh xếp của cặp Lớp - Môn học</a-button>
      <a-button type="primary" @click="drawerSubjectOpen = true" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Môn học của lớp</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '1000' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-if="column.key === 'action'">
            <div class="flex justify-center">
              <div class="md:flex space-x-2">
                <a-button type="link" size="small" @click="editItem(record.id)" :disabled="!settingStore.currentPermission">
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

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa lớp học' : 'Thêm mới lớp học'" @cancel="handleCancel" :width="700">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tên lớp" name="ten">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên lớp" />
        </a-form-item>
        <SelectGradeLevelByUnit v-model="formState.id_khoi" name="id_khoi" :rules="rules.id_khoi" />
        <a-form-item label="Sĩ số" name="si_so">
          <a-input-number v-model:value="formState.si_so" style="width: 100%" :max="99" :precision="0" :min="1" />
        </a-form-item>
        <SelectSchoolShiftByUnit v-model="formState.id_ca" name="id_ca" :rules="rules.id_ca" />
        <SelectTeacher v-model="formState.id_gvcn" name="id_gvcn" :rules="rules.id_gvcn" />
        <SelectClassroom v-model="formState.id_phong" name="id_phong" :rules="rules.id_phong" />
        <SelectSchoolship v-model="formState.id_ban" name="id_ban" :rules="rules.id_ban" />
      </a-form>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading">{{ isEdit ? "Cập nhật" : "Thêm mới" }}</a-button>
        </div>
      </template>
    </a-modal>
    <a-drawer v-model:open="drawerBreakOpen" title="Thiết lập tiết nghỉ của lớp" :footer="null" height="100vh" placement="bottom" @close="closeClassBreak">
      <ClassBreak ref="breakRef" />
    </a-drawer>
    <a-drawer v-model:open="drawerAvoidOpen" title="Thiết lập tiết tránh xếp của cặp Lớp - Môn học" :footer="null" height="100vh" placement="bottom" @close="closeSubjectAvoid">
      <ClientOnly>
        <ClassSubjectAvoid ref="avoidRef" />
      </ClientOnly>
    </a-drawer>
    <a-drawer v-model:open="drawerSubjectOpen" title="Môn học của lớp" :footer="null" height="100vh" placement="bottom" @close="closeClassSubject">
      <ClientOnly>
        <GradeClassList ref="gradeClassRef" />
      </ClientOnly>
    </a-drawer>
  </div>
</template>

<script setup>
const settingStore = useSettingStore();
const { RestApi } = useApi();
const param = ref({ PageIndex: 1, PageSize: 10, search: "" });
const drawerBreakOpen = ref(false);
const breakRef = ref(null);

const drawerAvoidOpen = ref(false);
const avoidRef = ref(null);

const drawerSubjectOpen = ref(false);
const gradeClassRef = ref(null);

const closeClassBreak = () => {
  breakRef.value?.reset();
};

const closeSubjectAvoid = () => {
  avoidRef.value?.reset();
};

const closeClassSubject = () => {
  gradeClassRef.value?.reset();
};

watch(drawerBreakOpen, val => {
  if (val) {
    breakRef.value?.refresh();
  }
});

watch(drawerAvoidOpen, val => {
  if (val) {
    avoidRef.value?.refresh();
  }
});

watch(drawerSubjectOpen, val => {
  if (val) {
    gradeClassRef.value?.refresh();
  }
});

const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Tên lớp", dataIndex: "ten", key: "ten", ellipsis: true },
  { title: "Khối", dataIndex: "ten_khoi", key: "ten_khoi", ellipsis: true },
  { title: "Sĩ số", dataIndex: "si_so", key: "si_so", align: "center" },
  { title: "Ca học", dataIndex: "ten_ca", key: "ten_ca", ellipsis: true },
  { title: "Giáo viên CN", dataIndex: "ten_giao_vien", key: "ten_giao_vien", ellipsis: true },
  { title: "Phòng học", dataIndex: "ten_phong", key: "ten_phong", ellipsis: true },
  { title: "Ban học", dataIndex: "ten_ban", key: "ten_ban", ellipsis: true },
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
  ten: "",
  id_khoi: undefined,
  si_so: null,
  id_ca: undefined,
  id_gvcn: undefined,
  id_phong: undefined,
  id_ban: undefined,
});

const rules = reactive({
  ten: [
    { required: true, message: "Vui lòng nhập tên lớp", trigger: "blur" },
    { max: 20, message: "Tên lớp học không quá 20 kí tự", trigger: "blur" },
  ],
  id_khoi: [{ required: true, message: "Vui lòng chọn khối", trigger: "change" }],
  // si_so: [{ required: true, type: "number", message: "Vui lòng nhập sĩ số", trigger: "change" }],
  id_ca: [{ required: true, message: "Vui lòng chọn ca", trigger: "change" }],
  id_gvcn: [{ required: true, message: "Vui lòng chọn giáo viên", trigger: "change" }],
  id_phong: [{ required: true, message: "Vui lòng chọn phòng học", trigger: "change" }],
  id_ban: [{ required: true, message: "Vui lòng chọn ban học", trigger: "change" }],
});

const fetchData = async paramData => {
  try {
    loading.value = true;
    const { data } = await RestApi.class.list({ params: paramData });
    if (data.value?.status === "success") {
      dataSource.value = data.value.data.items || [];
      pagination.total = data.value.data.totalrecord;
    } else {
      dataSource.value = [];
      pagination.total = 0;
    }
  } catch {
    message.error("Không thể tải dữ liệu");
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
  Object.assign(formState, { id: null, ten: "", id_khoi: undefined, si_so: null, id_ca: undefined, id_gvcn: undefined, id_phong: undefined, id_ban: undefined });
  visible.value = true;
};

const editItem = async id => {
  isEdit.value = true;
  try {
    const { data } = await RestApi.class.detail({ params: { id } });
    if (data.value?.status === "success") {
      Object.assign(formState, data.value.data);
      visible.value = true;
    }
  } catch {
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
      res = await RestApi.class.update({ body: payload });
    } else {
      delete payload.id;
      res = await RestApi.class.create({ body: payload });
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
  formRef.value?.resetFields();
  visible.value = false;
};

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.class.delete({ params: { Id: id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa thành công");
      pagination.current = 1;
      param.value.PageIndex = 1;
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (error) {
    message.error(error?.message || error?.value?.data?.message || "Xóa không thành công ");
  } finally {
    await fetchData({ ...param.value });
  }
};

const resetForm = async () => {
  if (formRef.value) formRef.value.resetFields();
  searchText.value = "";
  param.value = { PageIndex: 1, PageSize: 10, search: "" };
  pagination.current = 1;
  pagination.pageSize = 10;
  await fetchData({ ...param.value });
};

await fetchData({ ...param.value });
</script>

<style scoped>
@media (max-width: 768px) {
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 8px !important;
    font-size: 13px;
  }
  .ant-table-content {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

.ant-table-cell-fix-left,
.ant-table-cell-fix-right {
  z-index: 1;
  background: white;
}

.ant-table-cell-fix-right {
  box-shadow: -5px 0 5px -5px rgba(0, 0, 0, 0.1);
}
</style>
