<template>
  <div class="p-4 bg-white rounded shadow min-h-full">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm thời khóa biểu..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetSearch" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto">Thêm mới</a-button>
    </div>

    <!-- Table -->
    <ClientOnly>
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" @change="handleTableChange" bordered size="middle">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.dang_su_dung ? 'green' : 'red'">
              {{ record.dang_su_dung ? "Đang sử dụng" : "Không sử dụng" }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex justify-end gap-2">
              <a-tooltip v-if="record.dang_su_dung" title="Thời khóa biểu">
                <a-button type="link" size="small" @click="openInfoDrawer(record)">
                  <template #icon><CalendarOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip v-if="record.dang_su_dung" title="Tinh chỉnh">
                <a-button type="link" size="small" @click="openAdjustDrawer(record)">
                  <template #icon><SettingOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip v-if="record.dang_su_dung" title="Đồng bộ">
                <a-button type="link" size="small" :loading="syncingId === record.id" :disabled="!!syncingId && syncingId !== record.id" @click="syncTimetable(record)">
                  <template #icon><SyncOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="Xuất Excel">
                <a-button type="link" size="small" @click="openExportModal(record)">
                  <template #icon><FileExcelOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="Sao chép">
                <a-button type="link" size="small" @click="openCloneModal(record)">
                  <template #icon><CopyOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="Sửa">
                <a-button type="link" size="small" @click="editItem(record)">
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                <a-tooltip title="Xóa">
                  <a-button type="link" danger size="small">
                    <template #icon><DeleteOutlined /></template>
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <!-- Modal -->
    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa thời khóa biểu' : 'Thêm mới thời khóa biểu'" @cancel="handleCancel" :footer="null">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tên thời khóa biểu" name="ten">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên thời khóa biểu" showCount :maxlength="100" />
        </a-form-item>
        <a-form-item label="Đang sử dụng" name="dang_su_dung">
          <a-switch v-model:checked="formState.dang_su_dung" />
        </a-form-item>
        <div class="flex justify-end gap-2 mt-6">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading">
            {{ isEdit ? "Cập nhật" : "Thêm mới" }}
          </a-button>
        </div>
      </a-form>
    </a-modal>

    <!-- Clone Modal -->
    <a-modal v-model:open="cloneVisible" :title="'Tạo bản sao thời khóa biểu: ' + cloneSourceName" @cancel="handleCloneCancel" :footer="null">
      <a-form ref="cloneFormRef" :model="cloneForm" layout="vertical" :rules="rules">
        <a-form-item label="Tên thời khóa biểu" name="ten" :required="true">
          <a-input v-model:value="cloneForm.ten" placeholder="Nhập tên thời khóa biểu" showCount :maxlength="100" />
        </a-form-item>
        <a-form-item label="Trạng thái" name="dang_su_dung">
          <a-switch v-model:checked="cloneForm.dang_su_dung" />
        </a-form-item>
        <div class="flex justify-end gap-2 mt-6">
          <a-button @click="handleCloneCancel">Hủy</a-button>
          <a-button type="primary" @click="handleCloneOk" :loading="cloneConfirmLoading">Tạo bản sao</a-button>
        </div>
      </a-form>
    </a-modal>

    <!-- Export Modal -->
    <a-modal v-model:open="exportModal.visible" :title="'Xuất Excel thời khóa biểu' + (exportModal.timetableName ? `: ${exportModal.timetableName}` : '')" :footer="null" width="900px" @cancel="closeExportModal">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Thời khóa biểu của lớp -->
        <a-card type="inner" title="Thời khóa biểu của lớp">
          <div class="mb-3 text-gray-600">Chọn thông tin hiển thị trên thời khóa biểu:</div>
          <div class="flex flex-col gap-2 mb-4">
            <a-checkbox v-model:checked="exportModal.options.class.showRoom">Phòng học</a-checkbox>
            <a-checkbox v-model:checked="exportModal.options.class.showTeacher">Tên Giáo viên</a-checkbox>
          </div>
          <a-button type="primary" class="bg-blue-500" :loading="exportModal.loadingKey === 'class'" :disabled="!!exportModal.loadingKey && exportModal.loadingKey !== 'class'" @click="exportClass"> Xuất TKB Lớp </a-button>
        </a-card>

        <!-- Thời khóa biểu toàn trường -->
        <a-card type="inner" title="Thời khóa biểu toàn trường">
          <div class="mb-3 text-gray-600">Chọn thông tin hiển thị trên thời khóa biểu:</div>
          <div class="flex flex-col gap-2 mb-4">
            <a-checkbox v-model:checked="exportModal.options.school.showRoom">Phòng học</a-checkbox>
            <a-checkbox v-model:checked="exportModal.options.school.showTeacher">Tên Giáo viên</a-checkbox>
          </div>
          <a-button type="primary" class="bg-blue-500" :loading="exportModal.loadingKey === 'school'" :disabled="!!exportModal.loadingKey && exportModal.loadingKey !== 'school'" @click="exportAll"> Xuất TKB Toàn trường </a-button>
        </a-card>

        <!-- Thời khóa biểu của giáo viên -->
        <a-card type="inner" title="Thời khóa biểu của giáo viên">
          <div class="mb-3 text-gray-600">Chọn thông tin hiển thị trên thời khóa biểu:</div>
          <div class="flex flex-col gap-2 mb-4">
            <a-checkbox v-model:checked="exportModal.options.teacher.showRoom">Phòng học</a-checkbox>
          </div>
          <a-button type="primary" class="bg-blue-500" :loading="exportModal.loadingKey === 'teacher'" :disabled="!!exportModal.loadingKey && exportModal.loadingKey !== 'teacher'" @click="exportTeacher"> Xuất TKB Giáo viên </a-button>
        </a-card>

        <!-- Ma trận thời khóa biểu -->
        <a-card type="inner" title="Ma trận thời khóa biểu">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a-button :loading="exportModal.loadingKey === 'matrix-school'" :disabled="!!exportModal.loadingKey && exportModal.loadingKey !== 'matrix-school'" @click="exportMatrixSchool">Ma trận Toàn trường</a-button>
            <a-button :loading="exportModal.loadingKey === 'matrix-teacher'" :disabled="!!exportModal.loadingKey && exportModal.loadingKey !== 'matrix-teacher'" @click="exportMatrixTeacher">Ma trận Giáo viên</a-button>
            <a-button :loading="exportModal.loadingKey === 'matrix-grade'" :disabled="!!exportModal.loadingKey && exportModal.loadingKey !== 'matrix-grade'" @click="exportMatrixGrade">Ma trận Khối</a-button>
            <a-button :loading="exportModal.loadingKey === 'matrix-expertise'" :disabled="!!exportModal.loadingKey && exportModal.loadingKey !== 'matrix-expertise'" @click="exportMatrixExpertise">Ma trận Tổ chuyên môn</a-button>
          </div>
        </a-card>
      </div>
    </a-modal>
    <!-- <a-drawer v-model:open="drawerInfoOpen" title="Xếp thời khóa biểu" :footer="null" height="100vh" placement="bottom" @close="closeInfoDrawer"> -->
    <a-drawer v-model:open="drawerInfoOpen" title="Xếp thời khóa biểu" :footer="null" height="100vh" placement="bottom" @close="closeInfoDrawer">
      <template #extra>
        <a-button class="mr-2" @click="openCloneFromInfo">Sao chép</a-button>
        <a-button type="primary" @click="openAdjustFromInfo">Tinh chỉnh thời khóa biểu</a-button>
      </template>
      <ClientOnly>
        <TimetableInfo ref="infoRef" :timetableId="infoTimetableId" />
      </ClientOnly>
    </a-drawer>
    <a-drawer v-model:open="drawerAdjustOpen" title="Tinh chỉnh thời khóa biểu" :footer="null" height="100vh" placement="bottom" :header-style="{ padding: '0px 0px' }" :body-style="{ padding: '4px 4px' }" :destroyOnClose="true" @close="closeAdjustDrawer">
      <ClientOnly>
        <TimetableGrid v-model:classId="adjustClassId" :timetableId="adjustTimetableId" />
      </ClientOnly>
    </a-drawer>
  </div>
</template>

<script setup>
const { RestApi } = useApi();

const searchText = ref("");
const dataSource = ref([]);
const loading = ref(false);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const columns = [
  {
    title: "STT",
    key: "stt",
    width: 70,
    align: "center",
    customRender: ({ index }) => (pagination.current - 1) * pagination.pageSize + index + 1,
  },
  {
    title: "Tên thời khóa biểu",
    dataIndex: "ten",
    key: "ten",
  },
  {
    title: "Trạng thái",
    dataIndex: "dang_su_dung",
    key: "status",
    width: 140,
    align: "center",
  },
  {
    title: "Thao tác",
    key: "action",
    width: 200,
    align: "center",
  },
];

const param = ref({ pageIndex: 1, pageSize: 10 });

const visible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const confirmLoading = ref(false);
const formState = reactive({ id: null, ten: "", dang_su_dung: true });

// Clone state
const cloneVisible = ref(false);
const cloneFormRef = ref();
const cloneConfirmLoading = ref(false);
const cloneSourceId = ref(null);
const cloneSourceName = ref("");
const cloneForm = reactive({ ten: "", dang_su_dung: true });

// Export modal state
const exportModal = reactive({
  visible: false,
  timetableId: null,
  timetableName: "",
  loadingKey: null, // 'class' | 'school' | 'teacher' | 'matrix-school' | 'matrix-teacher' | 'matrix-grade' | 'matrix-expertise' | null
  options: {
    class: { showRoom: false, showTeacher: false },
    school: { showRoom: false, showTeacher: false },
    teacher: { showRoom: false },
  },
});

const rules = {
  ten: [
    { required: true, message: "Vui lòng nhập tên thời khóa biểu", trigger: ["blur", "change"] },
    { max: 100, message: "Tên thời khóa biểu không quá 100 kí tự", trigger: ["blur", "change"] },
  ],
};

// Sync state and action
const syncingId = ref(null);
const syncTimetable = async record => {
  if (!record?.id) return;
  try {
    syncingId.value = record.id;
    const { data, error } = await RestApi.timetable.sync({ params: { idtkb: record.id } });
    if (error?.value) {
      throw new Error(error.value?.data?.message || "Đồng bộ không thành công");
    }
    if (data?.value?.status === "success") {
      message.success(data.value?.message || "Đồng bộ thành công");
    } else {
      throw new Error(data?.value?.message || "Đồng bộ không thành công");
    }
  } catch (err) {
    message.error(err?.message || "Đồng bộ không thành công");
  } finally {
    syncingId.value = null;
  }
};

const openAdjustFromInfo = () => {
  openAdjustDrawer({ id: infoTimetableId.value });
};

const openCloneFromInfo = () => {
  const record = dataSource.value?.find?.(x => x.id === infoTimetableId.value);
  if (record) {
    openCloneModal(record);
  } else {
    message.warning("Không tìm thấy thời khóa biểu để sao chép");
  }
};

const openExportModal = record => {
  exportModal.timetableId = record?.id ?? null;
  exportModal.timetableName = record?.ten ?? "";
  exportModal.visible = true;
  exportModal.loadingKey = null;
  // reset options each open
  exportModal.options.class.showRoom = false;
  exportModal.options.class.showTeacher = false;
  exportModal.options.school.showRoom = false;
  exportModal.options.school.showTeacher = false;
  exportModal.options.teacher.showRoom = false;
};
const closeExportModal = () => {
  exportModal.visible = false;
  exportModal.loadingKey = null;
};
const settingStore = useSettingStore();
// Download helper reused across pages
const exportFile = async (apiFn, key) => {
  try {
    settingStore.setLoading(true);
    exportModal.loadingKey = key;
    const { data, error } = await apiFn();
    if (error.value) {
      throw new Error(error.value?.data?.message || "Xuất file không thành công");
    }
    const { blob, headers } = data.value || {};
    if (!(blob instanceof Blob)) throw new Error("Xuất file không thành công");
    const cd = headers && (headers["content-disposition"] || headers["Content-Disposition"]);
    const filename = (cd && (decodeURIComponent(/filename\*=UTF-8''([^;]+)/.exec(cd)?.[1] || "") || /filename="([^"]+)"/.exec(cd)?.[1])) || "export.xlsx";
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    message.error(err.message || "Xuất file không thành công");
  } finally {
    exportModal.loadingKey = null;
    settingStore.setLoading(false);
  }
};

const exportAll = () =>
  exportFile(
    () =>
      RestApi.timetable.export({
        params: {
          idtkb: exportModal.timetableId,
          show_room: exportModal.options.school.showRoom ? 1 : 0,
          show_teacher: exportModal.options.school.showTeacher ? 1 : 0,
        },
      }),
    "school",
  );
const exportClass = () =>
  exportFile(
    () =>
      RestApi.timetable.export_class({
        params: {
          idtkb: exportModal.timetableId,
          show_room: exportModal.options.class.showRoom ? 1 : 0,
          show_teacher: exportModal.options.class.showTeacher ? 1 : 0,
        },
      }),
    "class",
  );
const exportTeacher = () =>
  exportFile(
    () =>
      RestApi.timetable.export_teacher({
        params: {
          idtkb: exportModal.timetableId,
          show_room: exportModal.options.teacher.showRoom ? 1 : 0,
        },
      }),
    "teacher",
  );

const fetchData = async p => {
  try {
    loading.value = true;
    const { data } = await RestApi.timetable.list({ params: p });
    if (data.value?.status === "success") {
      dataSource.value = data.value.data.items;
      pagination.total = data.value.data.totalrecord;
    } else {
      dataSource.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    message.error("Lỗi khi tải danh sách thời khóa biểu");
  } finally {
    loading.value = false;
  }
};

const exportMatrixSchool = () => exportFile(() => RestApi.timetable.export_matrix_school({ params: { idtkb: exportModal.timetableId } }), "matrix-school");
const exportMatrixTeacher = () => exportFile(() => RestApi.timetable.export_matrix_teacher({ params: { idtkb: exportModal.timetableId } }), "matrix-teacher");
const exportMatrixGrade = () => exportFile(() => RestApi.timetable.export_matrix_grade({ params: { idtkb: exportModal.timetableId } }), "matrix-grade");
const exportMatrixExpertise = () => exportFile(() => RestApi.timetable.export_matrix_expertise({ params: { idtkb: exportModal.timetableId } }), "matrix-expertise");

const notifyUpdating = () => message.info("Tính năng đang phát triển");
const handleTableChange = async pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  param.value.pageIndex = pag.current;
  param.value.pageSize = pag.pageSize;
  await fetchData({ ...param.value });
};

const handleSearch = async () => {
  const search = searchText.value.trim();
  if (search) {
    param.value.search = search;
  } else {
    delete param.value.search;
  }
  pagination.current = 1;
  param.value.pageIndex = 1;
  await fetchData({ ...param.value });
};

const resetSearch = async () => {
  searchText.value = "";
  pagination.current = 1;
  param.value.pageIndex = 1;
  delete param.value.search;
  await fetchData({ ...param.value });
};

const showModal = () => {
  isEdit.value = false;
  Object.assign(formState, { id: null, ten: "", dang_su_dung: true });
  visible.value = true;
};

const editItem = record => {
  Object.assign(formState, {
    id: record.id,
    ten: record.ten,
    dang_su_dung: record.dang_su_dung,
  });
  isEdit.value = true;
  visible.value = true;
  formRef.value?.clearValidate();
};

const openCloneModal = record => {
  cloneSourceId.value = record.id;
  cloneSourceName.value = record.ten;
  // Object.assign(cloneForm, { ten: `Bản sao ${record.ten}`, dang_su_dung: record?.dang_su_dung ?? true });
  Object.assign(cloneForm, { ten: "", dang_su_dung: record?.dang_su_dung ?? true });
  cloneVisible.value = true;
  cloneFormRef.value?.clearValidate?.();
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;

    if (isEdit.value) {
      const { data, error } = await RestApi.timetable.update({ body: { ...formState } });
      if (data.value?.status === "success") {
        message.success(data.value.message || "Cập nhật thành công");
      } else {
        throw new Error(error.value?.data?.message || "Cập nhật không thành công");
      }
    } else {
      const { id, ...body } = formState;
      const { data, error } = await RestApi.timetable.create({ body });
      if (data.value?.status === "success") {
        message.success(data.value.message || "Thêm mới thành công");
      } else {
        throw new Error(error.value?.data?.message || "Thêm mới không thành công");
      }
    }
  } catch (error) {
    message.error(error?.message || error?.value?.data?.message || "Có lỗi ");
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

const handleCloneOk = async () => {
  // Validate first; if invalid, keep modal open
  try {
    await cloneFormRef.value.validate();
  } catch (err) {
    // Validation failed: do not close modal
    return;
  }

  try {
    cloneConfirmLoading.value = true;
    const payload = {
      id: cloneSourceId.value,
      ten: cloneForm.ten,
      dang_su_dung: cloneForm.dang_su_dung,
    };
    const { data, error } = await RestApi.timetable.copy({ body: payload });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Tạo bản sao thành công");
      cloneVisible.value = false;
      await fetchData({ ...param.value });
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Tạo bản sao không thành công");
    }
  } catch (err) {
    message.error(err?.message || err?.value?.data?.message || "Có lỗi");
  } finally {
    cloneConfirmLoading.value = false;
  }
};

const handleCloneCancel = () => {
  cloneFormRef.value?.resetFields?.();
  cloneVisible.value = false;
};

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.timetable.delete({ params: { Id: id } });
    if (data.value?.status === "success") {
      pagination.current = 1;
      param.value.pageIndex = 1;
      message.success("Xóa thành công");
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (error) {
    message.error(error?.message || error?.value?.data?.message || "Xóa không thành công ");
  } finally {
    await fetchData({ ...param.value });
  }
};

fetchData({ ...param.value });

const drawerInfoOpen = ref(false);
const infoRef = ref(null);
const drawerAdjustOpen = ref(false);
const adjustClassId = ref(null);
const adjustTimetableId = ref(null);
const infoTimetableId = ref(null);

watch(drawerInfoOpen, val => {
  if (val) {
    infoRef.value?.refresh?.();
  }
});

const closeInfoDrawer = () => {
  infoRef.value?.reset?.();
};
const openInfoDrawer = reg => {
  infoTimetableId.value = reg.id;
  drawerInfoOpen.value = true;
};
const openAdjustDrawer = record => {
  adjustTimetableId.value = record.id;
  drawerAdjustOpen.value = true;
};

// Ensure adjust drawer state resets when closed
const closeAdjustDrawer = () => {
  // Clear ids to reset child component props/state
  adjustClassId.value = null;
  adjustTimetableId.value = null;
};
</script>
