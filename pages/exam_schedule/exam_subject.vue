<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm môn thi..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetSearch" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button @click="showSubjectImportModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm từ môn học</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '1100' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>

          <template v-if="column.key === 'action'">
            <div class="flex justify-center">
              <div class="md:flex space-x-2">
                <a-button type="link" size="small" @click="editItem(record)" :disabled="!settingStore.currentPermission || detailLoading">
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

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa môn thi' : 'Thêm mới môn thi'" @cancel="handleCancel" :width="720">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules" class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <a-form-item label="Mã môn thi" name="ma">
          <a-input v-model:value="formState.ma" placeholder="Nhập mã môn thi" :maxlength="50" show-count />
        </a-form-item>

        <a-form-item label="Tên môn thi" name="ten">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên môn thi" :maxlength="255" show-count />
        </a-form-item>

        <SelectYear v-model="formState.id_nam" label="Năm học" name="id_nam" :rules="rules.id_nam" />

        <SelectExamBoard v-model="formState.id_hoi_dong" label="Hội đồng thi" name="id_hoi_dong" :rules="rules.id_hoi_dong" :id-nam="formState.id_nam" />
      </a-form>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading || detailLoading">
            {{ isEdit ? "Cập nhật" : "Thêm mới" }}
          </a-button>
        </div>
      </template>
    </a-modal>

    <a-modal
      v-model:open="subjectImportVisible"
      title="Thêm môn thi từ môn học"
      @cancel="handleSubjectImportCancel"
      :width="900"
      :confirm-loading="subjectImportSaving"
    >
      <a-form ref="subjectImportFormRef" :model="subjectImportForm" layout="vertical" :rules="subjectImportRules">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <SelectYear v-model="subjectImportForm.id_nam" label="Năm học" name="id_nam" :rules="subjectImportRules.id_nam" />
          <SelectExamBoard
            v-model="subjectImportForm.id_hoi_dong"
            label="Hội đồng thi"
            name="id_hoi_dong"
            :rules="subjectImportRules.id_hoi_dong"
            :id-nam="subjectImportForm.id_nam"
          />
        </div>

        <a-form-item label="Danh sách môn học" name="id_mon">
          <a-table
            :columns="subjectColumns"
            :data-source="subjectList"
            :pagination="subjectPagination"
            :loading="subjectLoading || subjectImportLoading"
            row-key="id"
            size="small"
            bordered
            @change="handleSubjectTableChange"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'stt'">
                {{ (subjectPagination.current - 1) * subjectPagination.pageSize + index + 1 }}
              </template>
              <template v-else-if="column.key === 'action'">
                <a-switch
                  :checked="isImportedSubjectSelected(record.id)"
                  size="small"
                  :disabled="!subjectImportForm.id_hoi_dong || subjectImportLoading"
                  @change="checked => toggleImportedSubject(record.id, checked)"
                />
              </template>
            </template>
          </a-table>
        </a-form-item>
      </a-form>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <a-button @click="handleSubjectImportCancel">Hủy</a-button>
          <a-button type="primary" @click="handleSubjectImportSave" :loading="subjectImportSaving">
            Lưu
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
  { title: "Mã", dataIndex: "ma", key: "ma", width: 140, align: "center" },
  { title: "Tên môn thi", dataIndex: "ten", key: "ten", width: 260, ellipsis: true },
  { title: "Hội đồng thi", dataIndex: "ten_hoi_dong", key: "ten_hoi_dong", width: 220, ellipsis: true },
  { title: "Năm học", dataIndex: "ten_nam", key: "ten_nam", width: 140, ellipsis: true },
  { title: "Thao tác", key: "action", width: 90, align: "center", fixed: "right" },
];

const dataSource = ref([]);
const loading = ref(false);
const detailLoading = ref(false);
const searchText = ref("");
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const formRef = ref();
const syncingEditForm = ref(false);
const syncingSubjectImportForm = ref(false);
const subjectImportVisible = ref(false);
const subjectImportLoading = ref(false);
const subjectImportSaving = ref(false);
const subjectImportFormRef = ref();

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const defaultFormState = () => ({
  id: undefined,
  ma: "",
  ten: "",
  id_hoi_dong: undefined,
  id_nam: undefined,
});

const formState = reactive(defaultFormState());
const subjectImportForm = reactive({
  id_nam: undefined,
  id_hoi_dong: undefined,
  id_mon: [],
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
    { required: true, message: "Vui lòng nhập mã môn thi", trigger: "blur" },
    { max: 50, message: "Mã môn thi không quá 50 ký tự", trigger: "blur" },
  ],
  ten: [
    { required: true, message: "Vui lòng nhập tên môn thi", trigger: "blur" },
    { max: 255, message: "Tên môn thi không quá 255 ký tự", trigger: "blur" },
  ],
  id_hoi_dong: [{ required: true, message: "Vui lòng chọn hội đồng thi", trigger: "change" }],
  id_nam: [{ required: true, message: "Vui lòng chọn năm học", trigger: "change" }],
});

const subjectImportRules = reactive({
  id_nam: [{ required: true, message: "Vui lòng chọn năm học", trigger: "change" }],
  id_hoi_dong: [{ required: true, message: "Vui lòng chọn hội đồng thi", trigger: "change" }],
  id_mon: [
    {
      validator: (_rule, value) => {
        if (Array.isArray(value) && value.length > 0) return Promise.resolve();
        return Promise.reject("Vui lòng chọn ít nhất 1 môn học");
      },
      trigger: "change",
    },
  ],
});

const resetFormState = () => {
  Object.assign(formState, defaultFormState());
};

const resetSubjectImportState = () => {
  subjectImportForm.id_nam = undefined;
  subjectImportForm.id_hoi_dong = undefined;
  subjectImportForm.id_mon = [];
  subjectPagination.current = 1;
  subjectPagination.pageSize = 10;
  subjectParam.value = { PageIndex: 1, PageSize: 10, search: "" };
};

const fetchData = async p => {
  try {
    loading.value = true;
    const { data, error } = await RestApi.exam_subject.list({ params: p });
    if (data.value?.status === "success") {
      dataSource.value = data.value?.data?.items || [];
      pagination.total = data.value?.data?.totalrecord || 0;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được dữ liệu môn thi");
    }
  } catch (err) {
    dataSource.value = [];
    pagination.total = 0;
    message.error(err?.message || "Lỗi tải dữ liệu");
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

const resetSearch = async () => {
  searchText.value = "";
  param.value = { pageIndex: 1, pageSize: pagination.pageSize, search: "" };
  pagination.current = 1;
  await fetchData({ ...param.value });
};

const showModal = () => {
  isEdit.value = false;
  resetFormState();
  visible.value = true;
};

const fetchSubjects = async params => {
  try {
    subjectLoading.value = true;
    const { data, error } = await RestApi.subject.list({ params });
    if (data.value?.status === "success") {
      subjectList.value = data.value?.data?.items || [];
      subjectPagination.total = data.value?.data?.totalrecord || 0;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được danh sách môn học");
    }
  } catch (error) {
    subjectList.value = [];
    subjectPagination.total = 0;
    message.error(error?.message || "Không tải được danh sách môn học");
  } finally {
    subjectLoading.value = false;
  }
};

const fetchSubjectImportSelection = async idHoiDong => {
  if (!idHoiDong) {
    subjectImportForm.id_mon = [];
    return;
  }

  try {
    subjectImportLoading.value = true;
    const { data, error } = await RestApi.exam_subject.list_from_subject({ params: { idHoiDong: idHoiDong } });
    if (data.value?.status === "success") {
      subjectImportForm.id_mon = (data.value?.data?.id_mon || []).filter(item => Number.isInteger(item));
      subjectImportFormRef.value?.validateFields?.(["id_mon"]).catch(() => {});
    } else {
      throw new Error(error.value?.data?.message || "Không tải được danh sách môn thi từ môn học");
    }
  } catch (error) {
    subjectImportForm.id_mon = [];
    message.error(error?.message || "Không tải được danh sách môn thi từ môn học");
  } finally {
    subjectImportLoading.value = false;
  }
};

const showSubjectImportModal = async () => {
  resetSubjectImportState();
  subjectImportVisible.value = true;
  await fetchSubjects({ ...subjectParam.value });
};

watch(
  () => formState.id_nam,
  (value, oldValue) => {
    if (syncingEditForm.value) return;
    if (value !== oldValue) {
      formState.id_hoi_dong = undefined;
    }
  },
);

watch(
  () => subjectImportForm.id_nam,
  (value, oldValue) => {
    if (syncingSubjectImportForm.value) return;
    if (value !== oldValue) {
      subjectImportForm.id_hoi_dong = undefined;
      subjectImportForm.id_mon = [];
    }
  },
);

watch(
  () => subjectImportForm.id_hoi_dong,
  async (value, oldValue) => {
    if (syncingSubjectImportForm.value || value === oldValue) return;
    await fetchSubjectImportSelection(value);
  },
);

const editItem = async record => {
  try {
    detailLoading.value = true;
    const { data, error } = await RestApi.exam_subject.detail({ params: { Id: record.id } });
    if (data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || "Không tải được chi tiết môn thi");
    }

    isEdit.value = true;
    syncingEditForm.value = true;
    Object.assign(formState, {
      id: data.value?.data?.id,
      ma: data.value?.data?.ma || "",
      ten: data.value?.data?.ten || "",
      id_hoi_dong: data.value?.data?.id_hoi_dong ?? undefined,
      id_nam: data.value?.data?.id_nam ?? undefined,
    });
    visible.value = true;
    await nextTick();
  } catch (error) {
    message.error(error?.message || "Không tải được chi tiết môn thi");
  } finally {
    syncingEditForm.value = false;
    detailLoading.value = false;
  }
};

const buildPayload = () => ({
  ...(isEdit.value ? { id: formState.id } : {}),
  ma: (formState.ma || "").trim(),
  ten: (formState.ten || "").trim(),
  id_hoi_dong: formState.id_hoi_dong,
  id_nam: formState.id_nam,
});

const handleOk = async () => {
  let shouldClose = false;
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;
    const payload = buildPayload();

    if (isEdit.value) {
      const { data, error } = await RestApi.exam_subject.update({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật môn thi thành công");
        shouldClose = true;
      } else {
        throw new Error(error.value?.data?.message || "Cập nhật không thành công");
      }
    } else {
      const { data, error } = await RestApi.exam_subject.create({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Thêm mới môn thi thành công");
        shouldClose = true;
      } else {
        throw new Error(error.value?.data?.message || "Thêm mới không thành công");
      }
    }
  } catch (error) {
    message.error(error?.message || error?.response?.data?.message || "Đã xảy ra lỗi khi lưu");
  } finally {
    confirmLoading.value = false;
    if (shouldClose) {
      await fetchData({ ...param.value });
      visible.value = false;
      formRef.value?.resetFields?.();
      resetFormState();
    }
  }
};

const handleCancel = () => {
  formRef.value?.resetFields?.();
  resetFormState();
  visible.value = false;
};

const handleSubjectTableChange = async pag => {
  subjectPagination.current = pag.current;
  subjectPagination.pageSize = pag.pageSize;
  subjectParam.value.PageIndex = pag.current;
  subjectParam.value.PageSize = pag.pageSize;
  await fetchSubjects({ ...subjectParam.value });
};

const isImportedSubjectSelected = id => {
  return Array.isArray(subjectImportForm.id_mon) && subjectImportForm.id_mon.includes(id);
};

const toggleImportedSubject = (id, checked) => {
  const next = new Set(Array.isArray(subjectImportForm.id_mon) ? subjectImportForm.id_mon : []);
  if (checked) {
    next.add(id);
  } else {
    next.delete(id);
  }
  subjectImportForm.id_mon = Array.from(next);
  subjectImportFormRef.value?.validateFields?.(["id_mon"]).catch(() => {});
};

const handleSubjectImportCancel = () => {
  subjectImportFormRef.value?.resetFields?.();
  resetSubjectImportState();
  subjectImportVisible.value = false;
};

const handleSubjectImportSave = async () => {
  let shouldClose = false;
  try {
    await subjectImportFormRef.value?.validate();
    subjectImportSaving.value = true;

    const payload = {
      id_hoi_dong: subjectImportForm.id_hoi_dong,
      id_mon: [...(subjectImportForm.id_mon || [])],
    };

    const { data, error } = await RestApi.exam_subject.save_subject_list({ body: payload });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Lưu môn thi từ môn học thành công");
      shouldClose = true;
    } else {
      throw new Error(error.value?.data?.message || "Lưu không thành công");
    }
  } catch (error) {
    message.error(error?.message || "Không thể lưu môn thi từ môn học");
  } finally {
    subjectImportSaving.value = false;
    if (shouldClose) {
      await fetchData({ ...param.value });
      handleSubjectImportCancel();
    }
  }
};

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.exam_subject.delete({ params: { Id: id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa thành công");
      pagination.current = 1;
      param.value.pageIndex = 1;
      await fetchData({ ...param.value });
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (error) {
    message.error(error?.message || "Không thể xóa môn thi");
  }
};

await fetchData({ ...param.value });
</script>
