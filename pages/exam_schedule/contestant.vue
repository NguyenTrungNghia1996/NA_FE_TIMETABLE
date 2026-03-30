<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <a-card title="DANH SÁCH ĐIỂM THI" class="xl:col-span-4">
        <div class="space-y-3">
          <div class="grid grid-cols-1 gap-2 items-start">
            <SelectYear
              v-model="locationFilter.yearId"
              label="Năm học:"
              name="location_filter_year"
              :no-form-item="true"
              :inline-label="true"
              placeholder="Chọn năm học"
            />

            <SelectExamBoard
              v-model="locationFilter.boardId"
              label="Hội đồng thi:"
              name="location_filter_board"
              :no-form-item="true"
              :inline-label="true"
              :id-nam="locationFilter.yearId"
            />
          </div>

          <div class="flex flex-col sm:flex-row gap-2">
            <a-input-search v-model:value="locationSearchText" placeholder="Nhập thông tin tìm kiếm" enter-button @search="handleLocationSearch" class="flex-1" />
            <a-button @click="resetLocationSearch">Đặt lại</a-button>
          </div>

          <ClientOnly>
            <a-table
              :columns="locationColumns"
              :data-source="locationDataSource"
              :pagination="locationPagination"
              :loading="locationLoading"
              row-key="id"
              size="small"
              bordered
              :customRow="onLocationRow"
              :row-class-name="locationRowClassName"
              @change="handleLocationTableChange"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'stt'">
                  {{ (locationPagination.current - 1) * locationPagination.pageSize + index + 1 }}
                </template>
              </template>
            </a-table>
          </ClientOnly>
        </div>
      </a-card>

      <a-card :title="contestantTitle" class="xl:col-span-8">
        <template #extra>
          <a-button type="primary" :disabled="!settingStore.currentPermission" @click="showModal">Thêm mới</a-button>
        </template>

        <div class="flex flex-col sm:flex-row gap-2 mb-3">
          <a-input-search
            v-model:value="contestantSearchText"
            placeholder="Tìm kiếm họ tên hoặc CCCD..."
            enter-button
            class="flex-1"
            :disabled="!selectedLocation"
            @search="handleContestantSearch"
          />
          <a-button :disabled="!selectedLocation" @click="resetContestantSearch">Đặt lại</a-button>
        </div>

        <div v-if="!selectedLocation" class="text-gray-500 min-h-[160px] flex items-center justify-center">
          Vui lòng chọn một điểm thi ở bảng bên trái.
        </div>

        <ClientOnly v-else>
          <a-table
            :columns="contestantColumns"
            :data-source="contestantDataSource"
            :pagination="contestantPagination"
            :loading="contestantLoading"
            row-key="id"
            size="small"
            bordered
            :scroll="{ x: '1200' }"
            @change="handleContestantTableChange"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'stt'">
                {{ (contestantPagination.current - 1) * contestantPagination.pageSize + index + 1 }}
              </template>

              <template v-else-if="column.key === 'ngay_sinh'">
                {{ formatDate(record.ngay_sinh) }}
              </template>

              <template v-else-if="column.key === 'action'">
                <div class="flex justify-center">
                  <div class="md:flex space-x-2">
                    <a-button type="link" size="small" :disabled="!settingStore.currentPermission || detailLoading" @click="editItem(record)">
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
      </a-card>
    </div>

    <a-modal v-model:open="visible" :title="isEdit ? 'Cập nhật thí sinh' : 'Thêm mới thí sinh'" :width="760" @cancel="handleCancel">
      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical" class="contestant-form">
        <div class="space-y-3">
          <div class="contestant-form-row">
            <label class="contestant-form-label">Năm học <span class="text-red-500">*</span></label>
            <a-form-item name="id_nam" class="contestant-form-control">
              <SelectYear v-model="formState.id_nam" name="id_nam_select" :no-form-item="true" label="" placeholder="-- Chọn năm học --" />
            </a-form-item>
          </div>

          <div class="contestant-form-row">
            <label class="contestant-form-label">Hội đồng thi <span class="text-red-500">*</span></label>
            <a-form-item name="id_hoi_dong" class="contestant-form-control">
              <SelectExamBoard
                v-model="formState.id_hoi_dong"
                name="id_hoi_dong_select"
                label=""
                :no-form-item="true"
                placeholder="-- Chọn hội đồng thi --"
                :id-nam="formState.id_nam"
                :disabled="!formState.id_nam"
              />
            </a-form-item>
          </div>

          <div class="contestant-form-row">
            <label class="contestant-form-label">Điểm thi <span class="text-red-500">*</span></label>
            <a-form-item name="id_diem_thi" class="contestant-form-control">
              <SelectExamLocation
                v-model="formState.id_diem_thi"
                name="id_diem_thi_select"
                label=""
                :no-form-item="true"
                placeholder="-- Chọn điểm thi --"
                :id-hoi-dong="formState.id_hoi_dong"
                :disabled="!formState.id_hoi_dong"
              />
            </a-form-item>
          </div>

          <div class="contestant-form-row">
            <label class="contestant-form-label">Số báo danh</label>
            <a-form-item class="contestant-form-control">
              <a-input :value="formState.so_bao_danh || ''" disabled placeholder="Tự động sinh" />
            </a-form-item>
          </div>

          <div class="contestant-form-row">
            <label class="contestant-form-label">Họ và tên <span class="text-red-500">*</span></label>
            <a-form-item name="ho_va_ten" class="contestant-form-control">
              <a-input v-model:value="formState.ho_va_ten" placeholder="Nhập họ và tên thí sinh" :maxlength="255" />
            </a-form-item>
          </div>

          <div class="contestant-form-row">
            <label class="contestant-form-label">CCCD <span class="text-red-500">*</span></label>
            <a-form-item name="cccd" class="contestant-form-control">
              <a-input v-model:value="formState.cccd" placeholder="Nhập CCCD" :maxlength="20" />
            </a-form-item>
          </div>

          <div class="contestant-form-row">
            <label class="contestant-form-label">Ngày sinh <span class="text-red-500">*</span></label>
            <a-form-item name="ngay_sinh" class="contestant-form-control">
              <a-date-picker v-model:value="formState.ngay_sinh" format="DD/MM/YYYY" value-format="YYYY-MM-DD" class="w-full" placeholder="Nhập ngày sinh" />
            </a-form-item>
          </div>

          <div class="contestant-form-row items-start">
            <label class="contestant-form-label pt-2">Nơi sinh <span class="text-red-500">*</span></label>
            <div class="contestant-form-control space-y-2">
              <a-form-item name="noi_sinh_tinh" class="mb-0">
                <SelectTinh v-model="formState.noi_sinh_tinh" name="noi_sinh_tinh_select" label="" :no-form-item="true" placeholder="-- Chọn tỉnh --" />
              </a-form-item>
              <a-form-item name="noi_sinh_xa" class="mb-0">
                <SelectXa
                  v-model="formState.noi_sinh_xa"
                  name="noi_sinh_xa_select"
                  label=""
                  :no-form-item="true"
                  :id-tinh="formState.noi_sinh_tinh"
                  placeholder="-- Chọn xã --"
                  :disabled="!formState.noi_sinh_tinh"
                />
              </a-form-item>
            </div>
          </div>

          <div class="contestant-form-row items-start">
            <label class="contestant-form-label pt-2">Nơi thường trú <span class="text-red-500">*</span></label>
            <div class="contestant-form-control space-y-2">
              <a-form-item name="thuong_tru_tinh" class="mb-0">
                <SelectTinh v-model="formState.thuong_tru_tinh" name="thuong_tru_tinh_select" label="" :no-form-item="true" placeholder="-- Chọn tỉnh --" />
              </a-form-item>
              <a-form-item name="thuong_tru_xa" class="mb-0">
                <SelectXa
                  v-model="formState.thuong_tru_xa"
                  name="thuong_tru_xa_select"
                  label=""
                  :no-form-item="true"
                  :id-tinh="formState.thuong_tru_tinh"
                  placeholder="-- Chọn xã --"
                  :disabled="!formState.thuong_tru_tinh"
                />
              </a-form-item>
            </div>
          </div>

          <div class="contestant-form-row">
            <label class="contestant-form-label">Dân tộc <span class="text-red-500">*</span></label>
            <a-form-item name="dan_toc" class="contestant-form-control">
              <SelectDanToc v-model="formState.dan_toc" name="dan_toc_select" label="" :no-form-item="true" placeholder="-- Chọn dân tộc --" />
            </a-form-item>
          </div>

          <div class="contestant-form-row items-start">
            <label class="contestant-form-label pt-2">Môn thi <span class="text-red-500">*</span></label>
            <a-form-item name="selected_subjects" class="contestant-form-control">
              <SelectExamSubject
                v-model="formState.selected_subjects"
                name="selected_subjects_select"
                label=""
                :no-form-item="true"
                multiple
                :id-hoi-dong="formState.id_hoi_dong"
                :disabled="!formState.id_hoi_dong"
                placeholder="-- Chọn đủ 2 môn thi --"
                :max-tag-count="2"
              />
            </a-form-item>
          </div>
        </div>
      </a-form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <a-button danger @click="handleCancel">Hủy</a-button>
          <a-button type="primary" :loading="confirmLoading || detailLoading" @click="handleOk">
            {{ isEdit ? "Cập nhật" : "Thêm mới" }}
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import debounce from "lodash/debounce";

const settingStore = useSettingStore();
const { RestApi } = useApi();

const locationSearchText = ref("");
const contestantSearchText = ref("");
const visible = ref(false);
const isEdit = ref(false);
const detailLoading = ref(false);
const contestantLoading = ref(false);
const locationLoading = ref(false);
const confirmLoading = ref(false);
const syncingForm = ref(false);
const formRef = ref();

const locationFilter = reactive({
  yearId: undefined,
  boardId: undefined,
});

const locationParam = ref({
  pageIndex: 1,
  pageSize: 10,
  search: "",
});

const contestantParam = ref({
  pageIndex: 1,
  pageSize: 10,
  search: "",
});

const locationColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã điểm thi", dataIndex: "ma", key: "ma", width: 130, align: "center" },
  { title: "Tên điểm thi", dataIndex: "ten", key: "ten", ellipsis: true },
];

const contestantColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Số báo danh", dataIndex: "so_bao_danh", key: "so_bao_danh", width: 120, align: "center" },
  { title: "Họ và tên", dataIndex: "ho_va_ten", key: "ho_va_ten", width: 180, ellipsis: true },
  { title: "CCCD", dataIndex: "cccd", key: "cccd", width: 150, align: "center" },
  { title: "Ngày sinh", dataIndex: "ngay_sinh", key: "ngay_sinh", width: 120, align: "center" },
  { title: "Nơi sinh", dataIndex: "ten_noi_sinh", key: "ten_noi_sinh", width: 180, ellipsis: true },
  { title: "Nơi thường trú", dataIndex: "ten_thuong_tru", key: "ten_thuong_tru", width: 180, ellipsis: true },
  { title: "Dân tộc", dataIndex: "ten_dan_toc", key: "ten_dan_toc", width: 110, align: "center" },
  { title: "Môn thi 1", dataIndex: "ten_mon_1", key: "ten_mon_1", width: 120, align: "center" },
  { title: "Môn thi 2", dataIndex: "ten_mon_2", key: "ten_mon_2", width: 120, align: "center" },
  { title: "Thao tác", key: "action", width: 100, align: "center", fixed: "right" },
];

const locationDataSource = ref([]);
const contestantDataSource = ref([]);
const selectedLocation = ref(null);

const locationPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const contestantPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const defaultFormState = () => ({
  id: undefined,
  so_bao_danh: "",
  id_nam: undefined,
  id_hoi_dong: undefined,
  ho_va_ten: "",
  ngay_sinh: undefined,
  noi_sinh_tinh: undefined,
  noi_sinh_xa: undefined,
  dan_toc: undefined,
  cccd: "",
  thuong_tru_tinh: undefined,
  thuong_tru_xa: undefined,
  id_diem_thi: undefined,
  selected_subjects: [],
});

const formState = reactive(defaultFormState());

const rules = reactive({
  id_nam: [{ required: true, message: "Vui lòng chọn năm học", trigger: "change" }],
  id_hoi_dong: [{ required: true, message: "Vui lòng chọn hội đồng thi", trigger: "change" }],
  ho_va_ten: [
    { required: true, message: "Vui lòng nhập họ và tên", trigger: "blur" },
    { max: 255, message: "Họ và tên không quá 255 ký tự", trigger: "blur" },
  ],
  ngay_sinh: [{ required: true, message: "Vui lòng chọn ngày sinh", trigger: "change" }],
  noi_sinh_tinh: [{ required: true, message: "Vui lòng chọn tỉnh nơi sinh", trigger: "change" }],
  noi_sinh_xa: [{ required: true, message: "Vui lòng chọn nơi sinh", trigger: "change" }],
  dan_toc: [{ required: true, message: "Vui lòng chọn dân tộc", trigger: "change" }],
  cccd: [{ required: true, message: "Vui lòng nhập CCCD", trigger: "blur" }],
  thuong_tru_tinh: [{ required: true, message: "Vui lòng chọn tỉnh thường trú", trigger: "change" }],
  thuong_tru_xa: [{ required: true, message: "Vui lòng chọn nơi thường trú", trigger: "change" }],
  id_diem_thi: [{ required: true, message: "Vui lòng chọn điểm thi", trigger: "change" }],
  selected_subjects: [
    {
      validator: (_rule, value) => {
        if (!Array.isArray(value) || value.length !== 2) {
          return Promise.reject("Vui lòng chọn đúng 2 môn thi");
        }
        if (new Set(value).size !== 2) {
          return Promise.reject("Hai môn thi không được trùng nhau");
        }
        return Promise.resolve();
      },
      trigger: "change",
    },
  ],
});

const contestantTitle = computed(() => {
  if (!selectedLocation.value) return "DANH SÁCH THÍ SINH";
  return `DANH SÁCH THÍ SINH - ${selectedLocation.value.ten || selectedLocation.value.ma || ""}`;
});

const formatDate = value => {
  if (!value) return "";
  return dayjs(value).isValid() ? dayjs(value).format("DD/MM/YYYY") : "";
};

const resetFormState = () => {
  Object.assign(formState, defaultFormState());
};

const fetchXaDetail = async id => {
  if (!id) return null;
  try {
    const { data } = await RestApi.xa.list({ params: { Id: id, pageIndex: 1, pageSize: 1 } });
    const raw = data.value?.data;
    const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : raw ? [raw] : [];
    return items.find(item => item.id === id) || items[0] || null;
  } catch (_error) {
    return null;
  }
};

const fetchLocations = async params => {
  try {
    locationLoading.value = true;
    const { data, error } = await RestApi.exam_location.list({ params });
    if (data.value?.status === "success") {
      locationDataSource.value = data.value?.data?.items || [];
      locationPagination.total = data.value?.data?.totalrecord || 0;

      if (selectedLocation.value) {
        const matched = locationDataSource.value.find(item => item.id === selectedLocation.value.id);
        if (matched) {
          selectedLocation.value = matched;
        } else {
          selectedLocation.value = null;
          contestantDataSource.value = [];
          contestantPagination.total = 0;
        }
      }
    } else {
      throw new Error(error.value?.data?.message || "Không tải được danh sách điểm thi");
    }
  } catch (error) {
    locationDataSource.value = [];
    locationPagination.total = 0;
    message.error(error?.message || "Không tải được danh sách điểm thi");
  } finally {
    locationLoading.value = false;
  }
};

const fetchContestants = async params => {
  if (!selectedLocation.value?.id) {
    contestantDataSource.value = [];
    contestantPagination.total = 0;
    return;
  }

  try {
    contestantLoading.value = true;
    const { data, error } = await RestApi.contestant.list({
      params: {
        ...params,
        idDiemThi: selectedLocation.value.id,
      },
    });

    if (data.value?.status === "success") {
      contestantDataSource.value = data.value?.data?.items || [];
      contestantPagination.total = data.value?.data?.totalrecord || 0;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được danh sách thí sinh");
    }
  } catch (error) {
    contestantDataSource.value = [];
    contestantPagination.total = 0;
    message.error(error?.message || "Không tải được danh sách thí sinh");
  } finally {
    contestantLoading.value = false;
  }
};

const handleLocationTableChange = async pag => {
  locationPagination.current = pag.current;
  locationPagination.pageSize = pag.pageSize;
  locationParam.value.pageIndex = pag.current;
  locationParam.value.pageSize = pag.pageSize;
  await fetchLocationTable();
};

const handleContestantTableChange = async pag => {
  contestantPagination.current = pag.current;
  contestantPagination.pageSize = pag.pageSize;
  contestantParam.value.pageIndex = pag.current;
  contestantParam.value.pageSize = pag.pageSize;
  await fetchContestants({ ...contestantParam.value });
};

const fetchLocationTable = async () => {
  const params = {
    ...locationParam.value,
  };
  if (!params.search) delete params.search;
  if (locationFilter.boardId) params.idHoiDong = locationFilter.boardId;
  await fetchLocations(params);
};

const handleLocationSearch = async () => {
  locationParam.value.search = (locationSearchText.value || "").trim();
  locationParam.value.pageIndex = 1;
  locationPagination.current = 1;
  await fetchLocationTable();
};

const resetLocationSearch = async () => {
  locationSearchText.value = "";
  locationFilter.yearId = undefined;
  locationFilter.boardId = undefined;
  locationParam.value = { pageIndex: 1, pageSize: locationPagination.pageSize, search: "" };
  locationPagination.current = 1;
  selectedLocation.value = null;
  contestantDataSource.value = [];
  contestantPagination.total = 0;
  await fetchLocationTable();
};

const handleContestantSearch = async () => {
  contestantParam.value.search = (contestantSearchText.value || "").trim();
  contestantParam.value.pageIndex = 1;
  contestantPagination.current = 1;
  await fetchContestants({ ...contestantParam.value });
};

const resetContestantSearch = async () => {
  contestantSearchText.value = "";
  contestantParam.value = { pageIndex: 1, pageSize: contestantPagination.pageSize, search: "" };
  contestantPagination.current = 1;
  await fetchContestants({ ...contestantParam.value });
};

const onLocationRow = record => ({
  onClick: async () => {
    selectedLocation.value = record;
    contestantParam.value.pageIndex = 1;
    contestantPagination.current = 1;
    contestantSearchText.value = "";
    contestantParam.value.search = "";
    await fetchContestants({ ...contestantParam.value });
  },
});

const locationRowClassName = record => (selectedLocation.value?.id === record.id ? "ant-table-row-selected" : "");

const buildPayload = () => ({
  ...(isEdit.value ? { id: formState.id } : {}),
  ho_va_ten: (formState.ho_va_ten || "").trim(),
  ngay_sinh: formState.ngay_sinh ? dayjs(formState.ngay_sinh).format("YYYY-MM-DDT00:00:00") : null,
  noi_sinh_xa: formState.noi_sinh_xa,
  dan_toc: formState.dan_toc,
  cccd: (formState.cccd || "").trim(),
  thuong_tru_xa: formState.thuong_tru_xa,
  id_diem_thi: formState.id_diem_thi,
  mon_thi_1: formState.selected_subjects?.[0],
  mon_thi_2: formState.selected_subjects?.[1],
});

const showModal = async () => {
  isEdit.value = false;
  resetFormState();
  syncingForm.value = true;
  if (selectedLocation.value?.id) {
    const { data } = await RestApi.exam_location.detail({ params: { Id: selectedLocation.value.id } });
    formState.id_diem_thi = selectedLocation.value.id;
    formState.id_hoi_dong = data.value?.data?.id_hoi_dong;
    if (formState.id_hoi_dong) {
      const boardDetail = await RestApi.exam_board.detail({ params: { Id: formState.id_hoi_dong } });
      formState.id_nam = boardDetail.data.value?.data?.id_nam;
    }
  }
  visible.value = true;
  syncingForm.value = false;
};

const editItem = async record => {
  try {
    detailLoading.value = true;
    const { data, error } = await RestApi.contestant.detail({ params: { Id: record.id } });
    if (data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || "Không tải được chi tiết thí sinh");
    }

    const detail = data.value?.data || {};
    syncingForm.value = true;
    let locationDetail = null;
    let boardDetailData = null;
    let birthXaDetail = null;
    let residenceXaDetail = null;

    if (!detail.noi_sinh_tinh && detail.noi_sinh_xa) {
      birthXaDetail = await fetchXaDetail(detail.noi_sinh_xa);
    }
    if (!detail.thuong_tru_tinh && detail.thuong_tru_xa) {
      residenceXaDetail = await fetchXaDetail(detail.thuong_tru_xa);
    }
    if ((!detail.id_hoi_dong || !detail.id_nam) && detail.id_diem_thi) {
      const locationResp = await RestApi.exam_location.detail({ params: { Id: detail.id_diem_thi } });
      locationDetail = locationResp.data.value?.data || null;
      if (!detail.id_nam && locationDetail?.id_hoi_dong) {
        const boardResp = await RestApi.exam_board.detail({ params: { Id: locationDetail.id_hoi_dong } });
        boardDetailData = boardResp.data.value?.data || null;
      }
    }
    isEdit.value = true;
    Object.assign(formState, {
      id: detail.id,
      so_bao_danh: detail.so_bao_danh || "",
      id_nam: detail.id_nam ?? boardDetailData?.id_nam ?? undefined,
      id_hoi_dong: detail.id_hoi_dong ?? locationDetail?.id_hoi_dong ?? undefined,
      ho_va_ten: detail.ho_va_ten || "",
      ngay_sinh: detail.ngay_sinh ? dayjs(detail.ngay_sinh).format("YYYY-MM-DD") : undefined,
      noi_sinh_tinh: detail.noi_sinh_tinh ?? birthXaDetail?.id_tinh ?? undefined,
      noi_sinh_xa: detail.noi_sinh_xa ?? undefined,
      dan_toc: detail.dan_toc ?? undefined,
      cccd: detail.cccd || "",
      thuong_tru_tinh: detail.thuong_tru_tinh ?? residenceXaDetail?.id_tinh ?? undefined,
      thuong_tru_xa: detail.thuong_tru_xa ?? undefined,
      id_diem_thi: detail.id_diem_thi ?? selectedLocation.value?.id,
      selected_subjects: [detail.mon_thi_1, detail.mon_thi_2].filter(Boolean),
    });

    visible.value = true;
    syncingForm.value = false;
  } catch (error) {
    syncingForm.value = false;
    message.error(error?.message || "Không tải được chi tiết thí sinh");
  } finally {
    detailLoading.value = false;
  }
};

const handleOk = async () => {
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;
    const payload = buildPayload();
    const { data, error } = isEdit.value ? await RestApi.contestant.update({ body: payload }) : await RestApi.contestant.create({ body: payload });

    if (data.value?.status === "success") {
      message.success(isEdit.value ? "Cập nhật thí sinh thành công" : "Thêm mới thí sinh thành công");
      visible.value = false;
      resetFormState();
      await fetchContestants({ ...contestantParam.value });
    } else {
      throw new Error(error.value?.data?.message || "Lưu thí sinh thất bại");
    }
  } catch (error) {
    if (error?.errorFields) return;
    message.error(error?.message || "Lưu thí sinh thất bại");
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  visible.value = false;
  resetFormState();
  formRef.value?.clearValidate?.();
};

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.contestant.delete({ params: { Id: id } });
    if (data.value?.status === "success") {
      message.success("Xóa thí sinh thành công");

      const isLastItemOnPage = contestantDataSource.value.length === 1 && contestantPagination.current > 1;
      if (isLastItemOnPage) {
        contestantPagination.current -= 1;
        contestantParam.value.pageIndex = contestantPagination.current;
      }

      await fetchContestants({ ...contestantParam.value });
    } else {
      throw new Error(error.value?.data?.message || "Xóa thí sinh thất bại");
    }
  } catch (error) {
    message.error(error?.message || "Xóa thí sinh thất bại");
  }
};

watch(
  () => formState.id_nam,
  async (value, oldValue) => {
    if (value !== oldValue) {
      if (syncingForm.value) return;
      formState.id_hoi_dong = undefined;
      formState.id_diem_thi = undefined;
      formState.selected_subjects = [];
    }
  },
);

watch(
  () => formState.id_hoi_dong,
  async (value, oldValue) => {
    if (value !== oldValue) {
      if (syncingForm.value) return;
      formState.id_diem_thi = undefined;
      formState.selected_subjects = [];
    }
  },
);

watch(
  () => locationFilter.yearId,
  async (value, oldValue) => {
    if (value !== oldValue) {
      locationFilter.boardId = undefined;
      locationPagination.current = 1;
      locationParam.value.pageIndex = 1;
      await fetchLocationTable();
    }
  },
);

watch(
  () => locationFilter.boardId,
  async (value, oldValue) => {
    if (value !== oldValue) {
      selectedLocation.value = null;
      contestantDataSource.value = [];
      contestantPagination.total = 0;
      locationPagination.current = 1;
      locationParam.value.pageIndex = 1;
      await fetchLocationTable();
    }
  },
);

watch(
  () => formState.id_diem_thi,
  value => {
    if (!value) {
      formState.so_bao_danh = "";
    }
  },
);

await Promise.all([fetchLocationTable()]);
</script>

<style scoped>
.contestant-form-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contestant-form-label {
  width: 180px;
  text-align: right;
  font-weight: 500;
  flex-shrink: 0;
}

.contestant-form-control {
  flex: 1;
  margin-bottom: 0;
}

:deep(.contestant-form-control .ant-form-item) {
  margin-bottom: 0;
}

@media (max-width: 640px) {
  .contestant-form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .contestant-form-label {
    width: 100%;
    text-align: left;
  }
}
</style>
