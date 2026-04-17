<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="space-y-4">
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div class="flex flex-col xl:flex-row xl:items-end gap-3">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
            <a-input-search
              v-model:value="searchText"
              placeholder="Tìm kiếm lịch thi..."
              enter-button
              @search="handleSearch"
            />

            <SelectYear
              v-model="filterForm.id_nam"
              label=""
              name="exam_schedule_filter_year"
              :no-form-item="true"
              placeholder="-- Chọn năm học --"
            />

            <SelectExamBoard
              v-model="filterForm.id_hoi_dong"
              label=""
              name="exam_schedule_filter_board"
              :no-form-item="true"
              placeholder="-- Chọn hội đồng thi --"
              :id-nam="filterForm.id_nam || null"
            />

            <SelectExamLocation
              v-model="filterForm.id_diem_thi"
              label=""
              name="exam_schedule_filter_location"
              :no-form-item="true"
              placeholder="-- Chọn điểm thi --"
              :id-hoi-dong="filterForm.id_hoi_dong || null"
            />
          </div>

          <div class="flex items-center gap-2">
            <a-button @click="resetFilters">Đặt lại</a-button>
            <a-button type="primary" @click="showModal" :disabled="!settingStore.currentPermission">
              Thêm mới
            </a-button>
          </div>
        </div>
      </div>

      <ClientOnly class="overflow-x-auto">
        <a-table
          :columns="columns"
          :data-source="dataSource"
          :pagination="pagination"
          :loading="loading"
          :scroll="{ x: '1400' }"
          row-key="id"
          bordered
          size="small"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'stt'">
              {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
            </template>

            <template v-else-if="column.key === 'ten_mon'">
              {{ getSubjectDisplay(record) }}
            </template>

            <template v-else-if="column.key === 'bai_thi_tu_chon'">
              <a-tag :color="record.bai_thi_tu_chon ? 'green' : 'default'">
                {{ record.bai_thi_tu_chon ? "Có" : "Không" }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'ngay'">
              {{ formatDate(record.ngay) }}
            </template>

            <template v-else-if="column.key === 'giam_thi_khong_cung_mon'">
              <a-tag :color="record.giam_thi_khong_cung_mon ? 'green' : 'default'">
                {{ record.giam_thi_khong_cung_mon ? "Có" : "Không" }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'action'">
              <div class="flex justify-center">
                <div class="md:flex space-x-2">
                  <a-tooltip title="Thao tác xếp lịch">
                    <a-button type="link" size="small" @click="openActionModal(record)" :disabled="!settingStore.currentPermission || detailLoading">
                      <template #icon>
                        <ControlOutlined />
                      </template>
                    </a-button>
                  </a-tooltip>
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
    </div>

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa lịch thi' : 'Thêm mới lịch thi'" :width="820" @cancel="handleCancel">
      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical" class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <SelectYear
          v-model="formState.id_nam"
          label="Năm học"
          name="id_nam"
          :rules="rules.id_nam"
          :disabled="isEdit"
        />

        <SelectExamBoard
          v-model="formState.id_hoi_dong"
          label="Hội đồng thi"
          name="id_hoi_dong"
          :rules="rules.id_hoi_dong"
          :id-nam="formState.id_nam || null"
          :disabled="isEdit"
        />

        <SelectExamLocation
          v-model="formState.id_diem_thi"
          label="Điểm thi"
          name="id_diem_thi"
          :rules="rules.id_diem_thi"
          :id-hoi-dong="formState.id_hoi_dong || null"
          :disabled="isEdit"
        />

        <a-form-item label="Ngày thi" name="ngay">
          <a-date-picker
            v-model:value="formState.ngay"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            class="w-full"
            placeholder="Chọn ngày thi"
          />
        </a-form-item>

        <SelectExamSubject
          v-model="formState.id_mon"
          label="Môn thi"
          name="id_mon"
          :rules="rules.id_mon"
          :id-hoi-dong="formState.id_hoi_dong || null"
          :disabled="!formState.id_hoi_dong || formState.bai_thi_tu_chon"
          placeholder="Chọn môn thi"
        />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 md:col-span-2">
          <a-form-item label="Bài thi tự chọn" name="bai_thi_tu_chon">
            <a-switch v-model:checked="formState.bai_thi_tu_chon" checked-children="Có" un-checked-children="Không" />
          </a-form-item>

          <a-form-item label="Giám thị không cùng bộ môn" name="giam_thi_khong_cung_mon">
            <a-switch v-model:checked="formState.giam_thi_khong_cung_mon" checked-children="Có" un-checked-children="Không" />
          </a-form-item>
        </div>
      </a-form>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" :loading="confirmLoading || detailLoading" @click="handleOk">
            {{ isEdit ? "Cập nhật" : "Thêm mới" }}
          </a-button>
        </div>
      </template>
    </a-modal>

    <a-modal
      v-model:open="actionModal.visible"
      title="Xếp lịch coi thi"
      :width="760"
      :footer="null"
      :confirm-loading="actionModal.loading"
      @cancel="closeActionModal"
    >
      <a-spin :spinning="actionModal.loading">
        <div class="space-y-4">
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div class="text-base font-semibold uppercase text-[#16697a]">
              Thông tin lịch coi thi
            </div>

            <div v-if="actionModal.detail" class="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 md:grid-cols-2">
              <div><span class="font-semibold">Môn thi:</span> {{ getSubjectDisplay(actionModal.detail) || "--" }}</div>
              <div><span class="font-semibold">Ngày thi:</span> {{ formatDate(actionModal.detail.ngay) || "--" }}</div>
              <div><span class="font-semibold">Điểm thi:</span> {{ actionModal.detail.ten_diem_thi || "--" }}</div>
              <div><span class="font-semibold">Hội đồng thi:</span> {{ actionModal.detail.ten_hoi_dong || "--" }}</div>
              <div><span class="font-semibold">Năm học:</span> {{ actionModal.detail.ten_nam || "--" }}</div>
              <div>
                <span class="font-semibold">Giám thị không cùng môn:</span>
                {{ actionModal.detail.giam_thi_khong_cung_mon ? "Có" : "Không" }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="rounded-lg border border-slate-200 p-4 text-center">
              <div class="text-sm font-semibold uppercase text-slate-700">Xếp tự động</div>
              <div class="mt-2 text-xs text-slate-500">
                Hệ thống tự động xếp lịch coi thi theo lịch thi đã chọn.
              </div>
              <a-button
                type="primary"
                class="mt-4 !bg-[#16a085] !border-[#16a085] hover:!bg-[#12806b] hover:!border-[#12806b]"
                :loading="actionModal.submitting"
                :disabled="!settingStore.currentPermission"
                @click="handleAutoAssign"
              >
                Thực hiện xếp
              </a-button>
            </div>

            <div class="rounded-lg border border-slate-200 p-4 text-center">
              <div class="text-sm font-semibold uppercase text-slate-700">Bốc thăm</div>
              <div class="mt-2 text-xs text-slate-500">
                Mở màn hình bốc thăm và theo dõi phân công giám thị theo tòa, tầng, phòng.
              </div>
              <a-button
                class="mt-4 !bg-[#4b9cc9] !border-[#4b9cc9] !text-white hover:!bg-[#3f86ad] hover:!border-[#3f86ad]"
                :disabled="!settingStore.currentPermission"
                @click="handleOpenLotteryDrawer"
              >
                Mở bốc thăm
              </a-button>
            </div>
          </div>
        </div>
      </a-spin>
    </a-modal>

    <ExamScheduleLotteryDrawer
      v-model:open="lotteryDrawer.open"
      :schedule-id="lotteryDrawer.scheduleId"
      :schedule-meta="lotteryDrawer.meta"
      @close="closeLotteryDrawer"
    />
  </div>
</template>

<script setup>
import { h } from "vue";
import dayjs from "dayjs";
import { Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";

const settingStore = useSettingStore();
const { RestApi } = useApi();

const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Môn thi", key: "ten_mon", width: 220, ellipsis: true },
  { title: "Bài thi tự chọn", key: "bai_thi_tu_chon", width: 130, align: "center" },
  { title: "Ngày thi", key: "ngay", width: 120, align: "center" },
  { title: "Điểm thi", dataIndex: "ten_diem_thi", key: "ten_diem_thi", width: 220, ellipsis: true },
  { title: "Hội đồng thi", dataIndex: "ten_hoi_dong", key: "ten_hoi_dong", width: 220, ellipsis: true },
  { title: "Năm học", dataIndex: "ten_nam", key: "ten_nam", width: 140, ellipsis: true },
  { title: "Giám thị không cùng bộ môn", key: "giam_thi_khong_cung_mon", width: 180, align: "center" },
  { title: "Thao tác", key: "action", width: 130, align: "center", fixed: "right" },
];

const defaultParams = () => ({
  pageIndex: 1,
  pageSize: 10,
  search: "",
});

const param = ref(defaultParams());
const dataSource = ref([]);
const loading = ref(false);
const detailLoading = ref(false);
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const searchText = ref("");
const formRef = ref();
const syncingEditForm = ref(false);
const actionModal = reactive({
  visible: false,
  loading: false,
  submitting: false,
  detail: null,
});
const lotteryDrawer = reactive({
  open: false,
  scheduleId: null,
  meta: null,
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const filterForm = reactive({
  id_nam: undefined,
  id_hoi_dong: undefined,
  id_diem_thi: undefined,
});

const defaultFormState = () => ({
  id: undefined,
  id_nam: undefined,
  id_hoi_dong: undefined,
  id_diem_thi: undefined,
  id_mon: undefined,
  ngay: undefined,
  giam_thi_khong_cung_mon: false,
  bai_thi_tu_chon: false,
});

const formState = reactive(defaultFormState());

const validateSubjectOrOptional = () => {
  if (formState.id_mon || formState.bai_thi_tu_chon) {
    return Promise.resolve();
  }
  return Promise.reject("Vui lòng chọn môn thi hoặc tích chọn bài thi tự chọn");
};

const rules = reactive({
  id_nam: [{ required: true, message: "Vui lòng chọn năm học", trigger: "change" }],
  id_hoi_dong: [{ required: true, message: "Vui lòng chọn hội đồng thi", trigger: "change" }],
  id_diem_thi: [{ required: true, message: "Vui lòng chọn điểm thi", trigger: "change" }],
  ngay: [{ required: true, message: "Vui lòng chọn ngày thi", trigger: "change" }],
  id_mon: [{ validator: validateSubjectOrOptional, trigger: ["change", "blur"] }],
  bai_thi_tu_chon: [{ validator: validateSubjectOrOptional, trigger: "change" }],
});

const resetFormState = () => {
  Object.assign(formState, defaultFormState());
};

const formatDate = value => {
  if (!value) return "";
  return dayjs(value).isValid() ? dayjs(value).format("DD/MM/YYYY") : "";
};

const getSubjectDisplay = record => {
  if (record?.ten_mon) return record.ten_mon;
  if (record?.bai_thi_tu_chon) return "Tự chọn";
  return "";
};

const buildListParams = () => {
  const params = {
    pageIndex: param.value.pageIndex,
    pageSize: param.value.pageSize,
  };

  const search = (param.value.search || "").trim();
  if (search) params.search = search;
  if (filterForm.id_hoi_dong) params.idHoiDong = filterForm.id_hoi_dong;
  if (filterForm.id_diem_thi) params.idDiemThi = filterForm.id_diem_thi;

  return params;
};

const fetchData = async () => {
  try {
    loading.value = true;
    const { data, error } = await RestApi.exam_schedule.list({ params: buildListParams() });
    if (data.value?.status === "success") {
      dataSource.value = data.value?.data?.items || [];
      pagination.total = data.value?.data?.totalrecord || 0;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được dữ liệu lịch thi");
    }
  } catch (err) {
    dataSource.value = [];
    pagination.total = 0;
    message.error(err?.message || "Lỗi tải dữ liệu lịch thi");
  } finally {
    loading.value = false;
  }
};

const handleTableChange = async pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  param.value.pageIndex = pag.current;
  param.value.pageSize = pag.pageSize;
  await fetchData();
};

const handleSearch = async () => {
  param.value.search = (searchText.value || "").trim();
  pagination.current = 1;
  param.value.pageIndex = 1;
  await fetchData();
};

const resetFilters = async () => {
  searchText.value = "";
  filterForm.id_nam = undefined;
  filterForm.id_hoi_dong = undefined;
  filterForm.id_diem_thi = undefined;
  param.value = defaultParams();
  pagination.current = 1;
  pagination.pageSize = 10;
  await fetchData();
};

const showModal = () => {
  isEdit.value = false;
  resetFormState();
  formState.id_nam = filterForm.id_nam;
  formState.id_hoi_dong = filterForm.id_hoi_dong;
  formState.id_diem_thi = filterForm.id_diem_thi;
  visible.value = true;
};

const buildPayload = () => ({
  ...(isEdit.value ? { id: formState.id } : {}),
  id_mon: formState.id_mon ?? null,
  id_diem_thi: formState.id_diem_thi,
  ngay: formState.ngay ? dayjs(formState.ngay).format("YYYY-MM-DDT00:00:00") : null,
  giam_thi_khong_cung_mon: !!formState.giam_thi_khong_cung_mon,
  bai_thi_tu_chon: !!formState.bai_thi_tu_chon,
});

const confirmSkipScheduleCheck = content =>
  new Promise(resolve => {
    Modal.confirm({
      title: "Kiểm tra xếp lịch",
      icon: h(ExclamationCircleOutlined),
      content,
      okText: "Bỏ qua và tiếp tục",
      cancelText: "Hủy",
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });

const handleOk = async () => {
  let shouldClose = false;
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;
    const payload = buildPayload();

    if (isEdit.value) {
      const { data, error } = await RestApi.exam_schedule.update({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật lịch thi thành công");
        shouldClose = true;
      } else {
        throw new Error(error.value?.data?.message || "Cập nhật lịch thi không thành công");
      }
    } else {
      const { data: checkData, error: checkError } = await RestApi.exam_schedule.check({
        params: {
          idDiemThi: formState.id_diem_thi,
        },
      });

      if (checkData.value?.status !== "success") {
        const confirmMessage = checkError.value?.data?.message || checkData.value?.message || "Kiểm tra xếp lịch không thành công";
        const shouldContinue = await confirmSkipScheduleCheck(confirmMessage);
        if (!shouldContinue) {
          return;
        }
      }

      const { data, error } = await RestApi.exam_schedule.create({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Thêm mới lịch thi thành công");
        shouldClose = true;
      } else {
        throw new Error(error.value?.data?.message || "Thêm mới lịch thi không thành công");
      }
    }
  } catch (error) {
    message.error(error?.message || error?.response?.data?.message || "Đã xảy ra lỗi khi lưu lịch thi");
  } finally {
    confirmLoading.value = false;
    if (shouldClose) {
      visible.value = false;
      formRef.value?.resetFields?.();
      resetFormState();
      await fetchData();
    }
  }
};

const fillFormDependenciesFromLocation = async idDiemThi => {
  if (!idDiemThi) return;

  const { data, error } = await RestApi.exam_location.detail({ params: { Id: idDiemThi } });
  if (data.value?.status !== "success") {
    throw new Error(error.value?.data?.message || "Không tải được thông tin điểm thi");
  }

  formState.id_hoi_dong = data.value?.data?.id_hoi_dong ?? formState.id_hoi_dong;
};

const editItem = async record => {
  try {
    detailLoading.value = true;
    const { data, error } = await RestApi.exam_schedule.detail({ params: { Id: record.id } });
    if (data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || "Không tải được chi tiết lịch thi");
    }

    syncingEditForm.value = true;
    isEdit.value = true;
    Object.assign(formState, {
      id: data.value?.data?.id,
      id_nam: data.value?.data?.id_nam ?? undefined,
      id_hoi_dong: data.value?.data?.id_hoi_dong ?? undefined,
      id_diem_thi: data.value?.data?.id_diem_thi ?? undefined,
      id_mon: data.value?.data?.id_mon ?? undefined,
      ngay: data.value?.data?.ngay ? dayjs(data.value.data.ngay).format("YYYY-MM-DD") : undefined,
      giam_thi_khong_cung_mon: !!data.value?.data?.giam_thi_khong_cung_mon,
      bai_thi_tu_chon: !!data.value?.data?.bai_thi_tu_chon,
    });
    visible.value = true;
    await nextTick();
  } catch (error) {
    message.error(error?.message || "Không tải được chi tiết lịch thi");
  } finally {
    syncingEditForm.value = false;
    detailLoading.value = false;
  }
};

const handleCancel = () => {
  formRef.value?.resetFields?.();
  resetFormState();
  visible.value = false;
};

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.exam_schedule.delete({ params: { Id: id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa lịch thi thành công");
      pagination.current = 1;
      param.value.pageIndex = 1;
    } else {
      throw new Error(error.value?.data?.message || "Xóa lịch thi không thành công");
    }
  } catch (error) {
    message.error(error?.message || error?.value?.data?.message || "Không thể xóa lịch thi");
  } finally {
    await fetchData();
  }
};

const openActionModal = async record => {
  try {
    actionModal.visible = true;
    actionModal.loading = true;
    actionModal.detail = null;

    const { data, error } = await RestApi.exam_schedule.detail({ params: { Id: record.id } });
    if (data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || "Không tải được chi tiết lịch thi");
    }

    actionModal.detail = data.value?.data || null;
  } catch (error) {
    actionModal.visible = false;
    message.error(error?.message || "Không tải được chi tiết lịch thi");
  } finally {
    actionModal.loading = false;
  }
};

const closeActionModal = () => {
  actionModal.visible = false;
  actionModal.loading = false;
  actionModal.submitting = false;
  actionModal.detail = null;
};

const handleAutoAssign = async () => {
  if (!actionModal.detail?.id) {
    message.warning("Không tìm thấy lịch thi để xếp tự động");
    return;
  }

  try {
    actionModal.submitting = true;
    const { data, error } = await RestApi.exam_schedule.auto_assign({
      params: { idLich: actionModal.detail.id },
    });

    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xếp lịch coi thi tự động thành công");
      closeActionModal();
      await fetchData();
      return;
    }

    throw new Error(error.value?.data?.message || "Xếp lịch coi thi tự động không thành công");
  } catch (error) {
    message.error(error?.message || "Xếp lịch coi thi tự động không thành công");
  } finally {
    actionModal.submitting = false;
  }
};

const handleOpenLotteryDrawer = () => {
  if (!actionModal.detail?.id) {
    message.warning("Không tìm thấy lịch thi để mở bốc thăm");
    return;
  }

  lotteryDrawer.scheduleId = actionModal.detail.id;
  lotteryDrawer.meta = { ...actionModal.detail };
  lotteryDrawer.open = true;
  actionModal.visible = false;
};

const closeLotteryDrawer = () => {
  lotteryDrawer.open = false;
  lotteryDrawer.scheduleId = null;
  lotteryDrawer.meta = null;
};

watch(
  () => filterForm.id_nam,
  (value, oldValue) => {
    if (value !== oldValue) {
      filterForm.id_hoi_dong = undefined;
      filterForm.id_diem_thi = undefined;
    }
  },
);

watch(
  () => filterForm.id_hoi_dong,
  async (value, oldValue) => {
    if (value !== oldValue) {
      filterForm.id_diem_thi = undefined;
      pagination.current = 1;
      param.value.pageIndex = 1;
      await fetchData();
    }
  },
);

watch(
  () => filterForm.id_diem_thi,
  async (value, oldValue) => {
    if (value !== oldValue) {
      pagination.current = 1;
      param.value.pageIndex = 1;
      await fetchData();
    }
  },
);

watch(
  () => formState.id_nam,
  (value, oldValue) => {
    if (syncingEditForm.value || value === oldValue) return;
    formState.id_hoi_dong = undefined;
    formState.id_diem_thi = undefined;
    formState.id_mon = undefined;
  },
);

watch(
  () => formState.id_hoi_dong,
  (value, oldValue) => {
    if (syncingEditForm.value || value === oldValue) return;
    formState.id_diem_thi = undefined;
    formState.id_mon = undefined;
  },
);

watch(
  () => formState.id_diem_thi,
  async (value, oldValue) => {
    if (syncingEditForm.value || value === oldValue || !value) return;
    formState.id_mon = undefined;
    try {
      await fillFormDependenciesFromLocation(value);
    } catch (error) {
      message.error(error?.message || "Không tải được thông tin điểm thi");
    }
  },
);

watch(
  () => formState.bai_thi_tu_chon,
  value => {
    if (value) {
      formState.id_mon = undefined;
    }
  },
);

await fetchData();
</script>
