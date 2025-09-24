<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm môn học..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">
        <span class="md:inline">Đặt lại</span>
      </a-button>
      <a-button @click="openBusyManager" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Cài đặt tiết tránh xếp</a-button>
      <a-button @click="openDrawer" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Cài đặt tiết cố định</a-button>
      <a-button @click="SubjectCombinationDrawer = true" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Tổ hợp môn</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">
        <span class="md:inline">Thêm mới</span>
      </a-button>
    </div>

    <ClientOnly>
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: 1500 }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-if="column.key === 'bool'">
            <!-- <span>{{ record[column.dataIndex] ? "✔️" : "❌" }}</span> -->
            <Icon v-if="record[column.dataIndex]" name="ant-design:check-outlined" class="text-green-600" />
            <Icon v-else name="ant-design:close-outlined" class="text-red-500" />
          </template>
          <template v-if="column.key === 'action'">
            <div class="flex justify-center">
              <div class="md:flex space-x-2">
                <a-button type="link" size="small" @click="editBusy(record)" :disabled="!settingStore.currentPermission">
                  <template #icon>
                    <Icon name="ant-design:calendar-outlined" />
                  </template>
                </a-button>
                <a-button type="link" size="small" @click="editItem(record)" :disabled="!settingStore.currentPermission">
                  <template #icon>
                    <Icon name="ant-design:edit-outlined" />
                  </template>
                </a-button>
                <a-popconfirm placement="topRight" title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                  <a-button type="link" danger size="small" :disabled="!settingStore.currentPermission">
                    <template #icon>
                      <Icon name="ant-design:delete-outlined" />
                    </template>
                  </a-button>
                </a-popconfirm>
              </div>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa môn học' : 'Thêm mới môn học'" @cancel="handleCancel" :width="700">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a-form-item label="Mã môn học" name="ma">
            <a-input v-model:value="formState.ma" placeholder="Nhập mã môn học" :maxlength="30" show-count />
          </a-form-item>
          <a-form-item label="Tên môn học" name="ten">
            <a-input v-model:value="formState.ten" placeholder="Nhập tên môn học" :maxlength="30" show-count />
          </a-form-item>
          <!-- <SelectClassroomType v-model="formState.Id_loai_phong_hoc" name="Id_loai_phong_hoc" :rules="rules.Id_loai_phong_hoc" /> -->
          <SelectClassroomType v-model="formState.Id_loai_phong_hoc" name="Id_loai_phong_hoc" :rules="rules.Id_loai_phong_hoc" />
          <SelectKnowledge v-model="formState.Id_khoi_kien_thuc" name="Id_khoi_kien_thuc" :multiple="true" />
          <a-form-item label="Số tiết tối đa một ca" name="So_tiet_toi_da_mot_ca">
            <a-input-number v-model:value="formState.So_tiet_toi_da_mot_ca" :precision="0" style="width: 100%" />
          </a-form-item>
          <a-form-item label="Số tiết tối đa hai ca" name="So_tiet_toi_da_hai_ca">
            <a-input-number v-model:value="formState.So_tiet_toi_da_hai_ca" :precision="0" style="width: 100%" />
          </a-form-item>
          <SelectClassroom v-if="formState.Id_loai_phong_hoc" v-model="formState.id_phong" name="classroomByType" :idLoaiPhonghoc="formState.Id_loai_phong_hoc" :multiple="true" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <a-form-item>
            <a-checkbox v-model:checked="formState.Do_GVCN_phu_trach">Do GVCN phụ trách</a-checkbox>
          </a-form-item>
          <!-- <a-form-item>
            <a-checkbox v-model:checked="formState.Khong_can_phong_hoc">Không cần phòng học</a-checkbox>
          </a-form-item> -->
          <a-form-item>
            <a-checkbox v-model:checked="formState.Hoc_cach_ngay">Học cách ngày</a-checkbox>
          </a-form-item>
          <a-form-item>
            <a-checkbox v-model:checked="formState.Xep_thanh_cap">Xếp thành cặp</a-checkbox>
          </a-form-item>
          <a-form-item class="md:col-span-2">
            <a-checkbox v-model:checked="formState.La_mon_tu_chon">Là môn tự chọn</a-checkbox>
          </a-form-item>
        </div>
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
    <a-modal v-model:open="busy_modal" title="Cài đặt tiết tránh xếp" @cancel="handleBusyCancel" :width="600" :footer="null">
      <div v-for="block in busy_data.ds_Ca" :key="block.id" class="mb-8">
        <Timetable :block="block" />
      </div>
      <div class="flex justify-end gap-2 mt-6">
        <a-button @click="handleBusyCancel">Hủy</a-button>
        <a-button @click="saveBusy" :loading="confirmLoading">Lưu</a-button>
        <a-button type="primary" @click="handleBusyOk" :loading="confirmLoading">Cập nhật</a-button>
      </div>
    </a-modal>
    <a-drawer v-model:open="busy_manager_modal" title="Cài đặt tiết tránh xếp" @close="closeBusyManager" placement="bottom" height="100vh">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a-table :columns="busyColumns" :data-source="dataSource" :pagination="pagination" :loading="loading" bordered size="small" row-key="id" @change="handleTableChange" :customRow="onBusyRow" :row-class-name="busyRowClassName" />
        <div v-if="selectedSubject && busy_data" class="flex flex-col col-span-2">
          <h3 class="font-medium mb-2">{{ selectedSubject.ten }}</h3>
          <div v-for="block in busy_data.ds_Ca" :key="block.id" class="mb-8">
            <Timetable :block="block" />
          </div>
          <div class="flex justify-end gap-2 mt-auto pt-2">
            <a-button @click="closeBusyManager">Hủy</a-button>
            <a-button @click="saveBusy" :loading="confirmLoading">Lưu</a-button>
          </div>
        </div>
      </div>
    </a-drawer>
    <a-drawer height="100vh" title="Cài đặt tiết cố định" placement="bottom" v-model:open="statusDrawer" @close="onCloseDrawer">
      <FixedLesson ref="fixedLessonRef" />
    </a-drawer>
    <a-drawer v-model:open="SubjectCombinationDrawer" title="Tổ Hợp môn" @close="onCloseSubjectCombinationDrawer" :footer="null" height="100vh" placement="bottom">
      <SubjectCombination ref="subjectCombinationRef" />
    </a-drawer>
  </div>
</template>

<script setup>
const settingStore = useSettingStore();
const { RestApi } = useApi();

const searchText = ref("");
const loading = ref(false);
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const formRef = ref();
const busy_modal = ref(false);
const busy_data = ref();
const busy_manager_modal = ref(false);
const selectedSubject = ref(null);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["1", "10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const columns = [
  { title: "STT", key: "stt", width: 50, align: "center" },
  { title: "Tên môn học", dataIndex: "ten", key: "ten", ellipsis: true, width: 120 },
  { title: "Loại phòng học", dataIndex: "ten_loai_phong_hoc", key: "ten_loai_phong_hoc", ellipsis: true, width: 150 },
  // { title: 'Khối kiến thức', dataIndex: 'ten_khoi_kien_thuc', key: 'ten_khoi_kien_thuc', ellipsis: true },
  { title: "Số tiết/ca", dataIndex: "so_tiet_toi_da_mot_ca", key: "so_tiet_toi_da_mot_ca", align: "center", width: 100 },
  { title: "Số tiết/2 ca", dataIndex: "so_tiet_toi_da_hai_ca", key: "so_tiet_toi_da_hai_ca", align: "center", width: 120 },
  { title: "GVCN", dataIndex: "do_GVCN_phu_trach", key: "bool", align: "center", width: 60 },
  // { title: "Không cần phòng học", dataIndex: "khong_can_phong_hoc", key: "bool", align: "center" },
  { title: "Học cách ngày", dataIndex: "hoc_cach_ngay", key: "bool", align: "center", width: 120 },
  { title: "Xếp thành cặp", dataIndex: "xep_thanh_cap", key: "bool", align: "center", width: 120 },
  { title: "Tự chọn", dataIndex: "la_mon_tu_chon", key: "bool", align: "center", width: 100 },
  { title: "Thao tác", key: "action", width: 100, align: "center", fixed: "right" },
];

const busyColumns = [
  {
    title: "STT",
    key: "stt",
    width: 60,
    align: "center",
    customRender: ({ index }) => (pagination.current - 1) * pagination.pageSize + index + 1,
  },
  {
    title: "Tên môn học",
    dataIndex: "ten",
    key: "ten",
    customRender: ({ record }) =>
      h(
        "a",
        {
          onClick: e => {
            e?.stopPropagation?.();
            selectSubject(record);
          },
          class: "text-blue-600 hover:underline",
        },
        record.ten,
      ),
  },
];

const param = ref({ PageIndex: 1, PageSize: 10, search: "" });
const dataSource = ref([]);

const formState = reactive({
  ma: "",
  ten: "",
  Id_loai_phong_hoc: undefined,
  Id_khoi_kien_thuc: [],
  Do_GVCN_phu_trach: false,
  // Khong_can_phong_hoc: false,
  Hoc_cach_ngay: false,
  Xep_thanh_cap: false,
  So_tiet_toi_da_mot_ca: undefined,
  So_tiet_toi_da_hai_ca: undefined,
  La_mon_tu_chon: false,
  id_phong: [],
});

const isPosInt = v => Number.isInteger(v) && v > 0;
const rules = reactive({
  ma: [
    { required: true, message: "Vui lòng nhập mã môn học", trigger: "blur" },
    { max: 30, message: "Mã môn học tối đa 30 ký tự", trigger: "blur" },
  ],
  ten: [
    { required: true, message: "Vui lòng nhập tên môn học", trigger: "blur" },
    { max: 30, message: "Tên môn học tối đa 30 ký tự", trigger: "blur" },
  ],
  So_tiet_toi_da_mot_ca: [
    { required: true, message: "Vui lòng nhập số tiết", trigger: ["blur", "change"] },
    {
      validator: (_, value) => {
        if (!isPosInt(value)) return Promise.reject("Số tiết tối đa phải là số nguyên dương");
        if (!/^[1-9]$/.test(String(value))) return Promise.reject("Chỉ có thể nhập 1 ký tự (1-9)");
        const haiCa = formState.So_tiet_toi_da_hai_ca;
        if (isPosInt(haiCa) && !(haiCa >= value)) {
          return Promise.reject("Số tiết tối đa 1 ca phải nhỏ hơn hoặc bằng số tiết tối đa 2 ca");
        }
        return Promise.resolve();
      },
      trigger: ["blur", "change"],
    },
  ],

  So_tiet_toi_da_hai_ca: [
    { required: true, message: "Vui lòng nhập số tiết", trigger: ["blur", "change"] },
    {
      validator: (_, value) => {
        if (!isPosInt(value)) return Promise.reject("Số tiết tối đa phải là số nguyên dương");
        if (!/^[1-9]$/.test(String(value))) return Promise.reject("Chỉ có thể nhập 1 ký tự (1-9)");
        const motCa = formState.So_tiet_toi_da_mot_ca;
        if (isPosInt(motCa) && !(value >= motCa)) {
          return Promise.reject("Số tiết tối đa 2 ca phải lớn hơn hoặc bằng số tiết tối đa 1 ca");
        }
        return Promise.resolve();
      },
      trigger: ["blur", "change"],
    },
  ],
});

watch(
  () => formState.So_tiet_toi_da_mot_ca,
  () => {
    formRef.value?.validateFields(["So_tiet_toi_da_hai_ca"]).catch(() => {});
  },
);

watch(
  () => formState.So_tiet_toi_da_hai_ca,
  () => {
    formRef.value?.validateFields(["So_tiet_toi_da_mot_ca"]).catch(() => {});
  },
);

watch(
  () => formState.Id_loai_phong_hoc,
  (val, oldVal) => {
    if (oldVal !== undefined && val !== oldVal) {
      formState.id_phong = [];
    }
  },
);

const fetchData = async param => {
  try {
    loading.value = true;
    const { data } = await RestApi.subject.list({ params: param });
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

const openBusyManager = async () => {
  await fetchData({ ...param.value });
  busy_manager_modal.value = true;
};

const closeBusyManager = () => {
  busy_manager_modal.value = false;
  selectedSubject.value = null;
  busy_data.value = null;
};

const selectSubject = async record => {
  selectedSubject.value = record;
  try {
    const { data } = await RestApi.subject.get_avoid({ params: { Id: record.id } });
    if (data.value?.status === "success") {
      busy_data.value = data.value.data;
    }
  } catch (err) {
    message.error("Không thể tải dữ liệu");
  }
};

// Row interactions for busy manager drawer
const onBusyRow = record => ({
  onClick: () => selectSubject(record),
  style: { cursor: "pointer" },
});

const busyRowClassName = record => (selectedSubject.value && record.id === selectedSubject.value.id ? "active-row" : "");

const showModal = () => {
  isEdit.value = false;
  Object.assign(formState, {
    ma: "",
    ten: "",
    Id_loai_phong_hoc: undefined,
    Id_khoi_kien_thuc: [],
    Do_GVCN_phu_trach: false,
    // Khong_can_phong_hoc: false,
    Hoc_cach_ngay: false,
    Xep_thanh_cap: false,
    So_tiet_toi_da_mot_ca: undefined,
    So_tiet_toi_da_hai_ca: undefined,
    La_mon_tu_chon: false,
    id_phong: [],
  });
  visible.value = true;
};

const editItem = async record => {
  isEdit.value = true;
  try {
    const { data } = await RestApi.subject.detail({ params: { Id: record.id } });
    if (data.value?.status === "success") {
      Object.assign(formState, {
        id: data.value.data.id,
        ma: data.value.data.ma,
        ten: data.value.data.ten,
        Id_loai_phong_hoc: data.value.data.id_loai_phong_hoc != 0 ? data.value.data.id_loai_phong_hoc : undefined,
        Id_khoi_kien_thuc: data.value.data.id_khoi_kien_thuc,
        Do_GVCN_phu_trach: data.value.data.do_GVCN_phu_trach,
        // Khong_can_phong_hoc: data.value.data.khong_can_phong_hoc,
        Hoc_cach_ngay: data.value.data.hoc_cach_ngay,
        Xep_thanh_cap: data.value.data.xep_thanh_cap,
        So_tiet_toi_da_mot_ca: data.value.data.so_tiet_toi_da_mot_ca,
        So_tiet_toi_da_hai_ca: data.value.data.so_tiet_toi_da_hai_ca,
        La_mon_tu_chon: data.value.data.la_mon_tu_chon,
      });
      await nextTick();
      formState.id_phong = data.value.data.id_phong;
      visible.value = true;
    }
  } catch (err) {
    message.error("Không thể lấy dữ liệu chi tiết");
  }
};

const editBusy = async record => {
  try {
    const { data } = await RestApi.subject.get_avoid({ params: { Id: record.id } });
    if (data.value?.status === "success") {
      busy_data.value = data.value.data;
      busy_modal.value = true;
    }
  } catch (err) {
    message.error("Không thể tải dữ liệu");
  }
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    const payload = { ...formState };
    let res;
    if (isEdit.value) {
      res = await RestApi.subject.update({ body: payload });
    } else {
      delete payload.id;
      res = await RestApi.subject.create({ body: payload });
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

const updateBusy = async () => {
  try {
    confirmLoading.value = true;
    const { data, error } = await RestApi.subject.update_avoid({ body: busy_data.value });
    if (data.value?.status === "success") {
      message.success(data.value.message || "Cập nhật thành công");
      return true;
    }
    throw new Error(error.value?.data?.message || "Cập nhật không thành công");
  } catch (err) {
    message.error(err.message || "Đã xảy ra lỗi khi lưu thông tin");
    return false;
  } finally {
    confirmLoading.value = false;
  }
};

const handleBusyOk = async () => {
  if (await updateBusy()) {
    busy_modal.value = false;
    busy_manager_modal.value = false;
  }
};

const saveBusy = async () => {
  await updateBusy();
};

const handleBusyCancel = () => {
  busy_data.value = [];
  busy_modal.value = false;
};

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.subject.delete({ params: { Id: id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa thành công");
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
  searchText.value = "";
  param.value = { PageIndex: 1, PageSize: 10, search: "" };
  pagination.current = 1;
  pagination.pageSize = 10;
  await fetchData({ ...param.value });
};

await fetchData({ ...param.value });
const fixedLessonRef = ref();
const statusDrawer = ref(false);
const openDrawer = () => {
  statusDrawer.value = true;
};
const onCloseDrawer = () => {
  fixedLessonRef.value?.reset();
};

const subjectCombinationRef = ref();
const SubjectCombinationDrawer = ref(false);
const onCloseSubjectCombinationDrawer = () => {
  subjectCombinationRef.value?.reset();
};
</script>

<style scoped>
:deep(.active-row > td) {
  background-color: #e6f7ff !important;
}
</style>
