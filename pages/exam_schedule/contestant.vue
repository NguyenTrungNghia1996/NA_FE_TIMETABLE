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
          <div class="flex gap-2">
            <a-button :disabled="!settingStore.currentPermission" @click="openAssignSbdModal">
              Đánh số báo danh
            </a-button>
            <a-button :disabled="!settingStore.currentPermission" @click="openImportModal">Import thí sinh</a-button>
            <a-button type="primary" :disabled="!settingStore.currentPermission" @click="showModal">Thêm mới</a-button>
          </div>
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
                placeholder="-- Chọn 1 hoặc 2 môn thi --"
                :max-count="2"
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

    <a-modal v-model:open="assignSbdModal.open" title="Đánh số báo danh" :confirm-loading="assignSbdLoading" ok-text="Thực hiện" cancel-text="Hủy" @ok="handleAssignSbd" @cancel="closeAssignSbdModal">
      <div class="space-y-3 py-2">
        <a-form layout="vertical">
          <a-form-item label="Hội đồng thi" required>
            <SelectExamBoard
              v-model="assignSbdModal.boardId"
              name="assign_sbd_board"
              label=""
              :no-form-item="true"
              placeholder="-- Chọn hội đồng thi --"
              :id-nam="locationFilter.yearId"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <a-modal v-model:open="importModal.open" title="Import thí sinh" :footer="null" :width="1100" :destroyOnClose="true" @cancel="closeImportModal">
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="text-sm text-gray-600">Chọn file Excel (.xlsx, .xls) để import danh sách thí sinh.</div>
          <a-upload :beforeUpload="beforeImportUpload" :maxCount="1" :file-list="importModal.fileList" @remove="removeImportFile" :accept="'.xlsx,.xls'" :showUploadList="{ showRemoveIcon: true }">
            <a-button>Chọn file</a-button>
          </a-upload>
        </div>

        <div class="flex justify-end gap-2">
          <a-button
            type="primary"
            ghost
            :loading="importModal.saving"
            :disabled="!importModal.results.length || !importModal.selectedRowKeys.length || !settingStore.currentPermission"
            @click="handleSaveImportedContestants"
          >
            Lưu
          </a-button>
          <a-button type="primary" :loading="importModal.uploading" :disabled="!importModal.file || !settingStore.currentPermission" @click="handleImportContestants">
            Import
          </a-button>
          <a-button danger @click="closeImportModal">Hủy</a-button>
        </div>

        <a-table
          v-if="importModal.results.length"
          :columns="importColumns"
          :data-source="importModal.results"
          :pagination="importPagination"
          :scroll="{ x: '1100' }"
          :row-key="buildImportRowKey"
          :row-selection="importRowSelection"
          size="small"
          bordered
          @change="handleImportTableChange"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'stt'">
              {{ index + 1 }}
            </template>
            <template v-else-if="column.key === 'ngay_sinh'">
              {{ formatDate(record.ngay_sinh) }}
            </template>
          <template v-else-if="column.key === 'isDuplicate'">
              <a-tag :color="record.isDuplicate ? 'red' : 'green'">
                {{ record.isDuplicate ? "Trùng" : "Hợp lệ" }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'saveStatus'">
              <p v-if="record.saveStatus === 'success'" style="color: green">Thành công</p>
              <p v-else-if="record.saveStatus === 'error'" style="color: red">{{ record.saveMessage || "Lỗi" }}</p>
              <p v-else-if="record.saveStatus === 'processing'" style="color: blue">Đang xử lý</p>
              <p v-else class="text-gray-400">Chưa lưu</p>
            </template>
          </template>
        </a-table>
      </div>
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
const assignSbdLoading = ref(false);
const syncingForm = ref(false);
const formRef = ref();

const locationFilter = reactive({
  yearId: undefined,
  boardId: undefined,
});

const assignSbdModal = reactive({
  open: false,
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

const locationDataSource = ref([]);
const contestantDataSource = ref([]);
const selectedLocation = ref(null);
const importModal = reactive({
  open: false,
  file: null,
  fileList: [],
  uploading: false,
  saving: false,
  results: [],
  selectedRowKeys: [],
});

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

const importPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const importRowSelection = computed(() => ({
  selectedRowKeys: importModal.selectedRowKeys,
  onChange: keys => {
    importModal.selectedRowKeys = keys;
  },
  getCheckboxProps: record => ({
    disabled: !!record?.isDuplicate,
  }),
}));

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
        if (!Array.isArray(value) || value.length < 1) {
          return Promise.reject("Vui lòng chọn ít nhất 1 môn thi");
        }
        if (value.length > 2) {
          return Promise.reject("Chỉ được chọn tối đa 2 môn thi");
        }
        if (new Set(value).size !== value.length) {
          return Promise.reject("Các môn thi không được trùng nhau");
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

const normalizeText = value => String(value || "").trim().toLowerCase();
const compareText = (a, b) => normalizeText(a).localeCompare(normalizeText(b), "vi");
const compareDate = (a, b) => dayjs(a || 0).valueOf() - dayjs(b || 0).valueOf();
const includesText = (source, keyword) => normalizeText(source).includes(normalizeText(keyword));
const buildColumnFilters = (items, key) =>
  [...new Set((items || []).map(item => item?.[key]).filter(Boolean))].map(value => ({
    text: value,
    value,
  }));

const locationColumns = computed(() => [
  { title: "STT", key: "stt", width: 60, align: "center" },
  {
    title: "Mã điểm thi",
    dataIndex: "ma",
    key: "ma",
    width: 130,
    align: "center",
    sorter: (a, b) => compareText(a.ma, b.ma),
    filters: buildColumnFilters(locationDataSource.value, "ma"),
    onFilter: (value, record) => includesText(record.ma, value),
  },
  {
    title: "Tên điểm thi",
    dataIndex: "ten",
    key: "ten",
    ellipsis: true,
    sorter: (a, b) => compareText(a.ten, b.ten),
    filters: buildColumnFilters(locationDataSource.value, "ten"),
    onFilter: (value, record) => includesText(record.ten, value),
  },
]);

const contestantColumns = computed(() => [
  { title: "STT", key: "stt", width: 60, align: "center" },
  {
    title: "Số báo danh",
    dataIndex: "so_bao_danh",
    key: "so_bao_danh",
    width: 120,
    align: "center",
    sorter: (a, b) => compareText(a.so_bao_danh, b.so_bao_danh),
  },
  {
    title: "Họ và tên",
    dataIndex: "ho_va_ten",
    key: "ho_va_ten",
    width: 180,
    ellipsis: true,
    sorter: (a, b) => compareText(a.ho_va_ten, b.ho_va_ten),
    filters: buildColumnFilters(contestantDataSource.value, "ho_va_ten"),
    onFilter: (value, record) => includesText(record.ho_va_ten, value),
  },
  {
    title: "CCCD",
    dataIndex: "cccd",
    key: "cccd",
    width: 150,
    align: "center",
    sorter: (a, b) => compareText(a.cccd, b.cccd),
    filters: buildColumnFilters(contestantDataSource.value, "cccd"),
    onFilter: (value, record) => includesText(record.cccd, value),
  },
  {
    title: "Ngày sinh",
    dataIndex: "ngay_sinh",
    key: "ngay_sinh",
    width: 120,
    align: "center",
    sorter: (a, b) => compareDate(a.ngay_sinh, b.ngay_sinh),
  },
  {
    title: "Nơi sinh",
    dataIndex: "ten_noi_sinh",
    key: "ten_noi_sinh",
    width: 180,
    ellipsis: true,
    sorter: (a, b) => compareText(a.ten_noi_sinh, b.ten_noi_sinh),
    filters: buildColumnFilters(contestantDataSource.value, "ten_noi_sinh"),
    onFilter: (value, record) => includesText(record.ten_noi_sinh, value),
  },
  {
    title: "Nơi thường trú",
    dataIndex: "ten_thuong_tru",
    key: "ten_thuong_tru",
    width: 180,
    ellipsis: true,
    sorter: (a, b) => compareText(a.ten_thuong_tru, b.ten_thuong_tru),
    filters: buildColumnFilters(contestantDataSource.value, "ten_thuong_tru"),
    onFilter: (value, record) => includesText(record.ten_thuong_tru, value),
  },
  {
    title: "Dân tộc",
    dataIndex: "ten_dan_toc",
    key: "ten_dan_toc",
    width: 110,
    align: "center",
    sorter: (a, b) => compareText(a.ten_dan_toc, b.ten_dan_toc),
    filters: buildColumnFilters(contestantDataSource.value, "ten_dan_toc"),
    onFilter: (value, record) => includesText(record.ten_dan_toc, value),
  },
  {
    title: "Môn thi 1",
    dataIndex: "ten_mon_1",
    key: "ten_mon_1",
    width: 120,
    align: "center",
    sorter: (a, b) => compareText(a.ten_mon_1, b.ten_mon_1),
    filters: buildColumnFilters(contestantDataSource.value, "ten_mon_1"),
    onFilter: (value, record) => includesText(record.ten_mon_1, value),
  },
  {
    title: "Môn thi 2",
    dataIndex: "ten_mon_2",
    key: "ten_mon_2",
    width: 120,
    align: "center",
    sorter: (a, b) => compareText(a.ten_mon_2, b.ten_mon_2),
    filters: buildColumnFilters(contestantDataSource.value, "ten_mon_2"),
    onFilter: (value, record) => includesText(record.ten_mon_2, value),
  },
  { title: "Thao tác", key: "action", width: 100, align: "center", fixed: "right" },
]);

const importColumns = computed(() => [
  { title: "STT", key: "stt", width: 60, align: "center" },
  {
    title: "Họ và tên",
    dataIndex: "ho_va_ten",
    key: "ho_va_ten",
    width: 180,
    ellipsis: true,
    sorter: (a, b) => compareText(a.ho_va_ten, b.ho_va_ten),
    filters: buildColumnFilters(importModal.results, "ho_va_ten"),
    onFilter: (value, record) => includesText(record.ho_va_ten, value),
  },
  {
    title: "Ngày sinh",
    dataIndex: "ngay_sinh",
    key: "ngay_sinh",
    width: 120,
    align: "center",
    sorter: (a, b) => compareDate(a.ngay_sinh, b.ngay_sinh),
  },
  {
    title: "CCCD",
    dataIndex: "cccd",
    key: "cccd",
    width: 140,
    align: "center",
    sorter: (a, b) => compareText(a.cccd, b.cccd),
    filters: buildColumnFilters(importModal.results, "cccd"),
    onFilter: (value, record) => includesText(record.cccd, value),
  },
  {
    title: "Mã điểm thi",
    dataIndex: "ma_diem_thi",
    key: "ma_diem_thi",
    width: 130,
    align: "center",
    sorter: (a, b) => compareText(a.ma_diem_thi, b.ma_diem_thi),
    filters: buildColumnFilters(importModal.results, "ma_diem_thi"),
    onFilter: (value, record) => includesText(record.ma_diem_thi, value),
  },
  {
    title: "Trạng thái",
    key: "isDuplicate",
    width: 120,
    align: "center",
    filters: [
      { text: "Hợp lệ", value: false },
      { text: "Trùng", value: true },
    ],
    onFilter: (value, record) => record.isDuplicate === value,
    sorter: (a, b) => Number(!!a.isDuplicate) - Number(!!b.isDuplicate),
  },
  {
    title: "Kết quả lưu",
    key: "saveStatus",
    width: 180,
    align: "center",
    filters: [
      { text: "Thành công", value: "success" },
      { text: "Lỗi", value: "error" },
      { text: "Đang xử lý", value: "processing" },
    ],
    onFilter: (value, record) => record.saveStatus === value,
    sorter: (a, b) => compareText(a.saveStatus, b.saveStatus),
  },
]);

const buildImportRowKey = record =>
  [
    String(record?.ho_va_ten || "").trim().toLowerCase(),
    String(record?.ngay_sinh || "").trim(),
    String(record?.cccd || "").trim(),
    String(record?.ma_diem_thi || "").trim().toLowerCase(),
  ].join("|");

const dedupeImportResults = items => {
  const seen = new Set();
  return (items || []).filter(item => {
    const key = buildImportRowKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const updateImportResultStatuses = statusMap => {
  importModal.results = importModal.results.map(item => {
    const nextStatus = statusMap.get(buildImportRowKey(item));
    return nextStatus ? { ...item, ...nextStatus } : item;
  });
};

const resetFormState = () => {
  Object.assign(formState, defaultFormState());
};

watch(
  () => importModal.results.length,
  total => {
    importPagination.total = total;
  },
);

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

const handleImportTableChange = pag => {
  importPagination.current = pag.current;
  importPagination.pageSize = pag.pageSize;
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
  mon_thi_2: formState.selected_subjects?.[1] ?? null,
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
  await nextTick();
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
    await nextTick();
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

const openImportModal = () => {
  importModal.open = true;
};

const openAssignSbdModal = () => {
  assignSbdModal.open = true;
  assignSbdModal.boardId = locationFilter.boardId ?? undefined;
};

const closeAssignSbdModal = () => {
  assignSbdModal.open = false;
  assignSbdModal.boardId = locationFilter.boardId ?? undefined;
};

const closeImportModal = () => {
  importModal.open = false;
  importModal.file = null;
  importModal.fileList = [];
  importModal.uploading = false;
  importModal.saving = false;
  importModal.results = [];
  importModal.selectedRowKeys = [];
  importPagination.current = 1;
};

const beforeImportUpload = file => {
  const originFile = file?.originFileObj || file;
  const extIndex = originFile.name?.lastIndexOf(".") ?? -1;
  const ext = extIndex >= 0 ? originFile.name.slice(extIndex) : "";
  const renamedFile = new File([originFile], `${Date.now()}${ext}`, {
    type: originFile.type,
    lastModified: originFile.lastModified,
  });
  importModal.file = renamedFile;
  importModal.fileList = [{ ...file, name: originFile.name }];
  importModal.results = [];
  importModal.selectedRowKeys = [];
  importPagination.current = 1;
  return false;
};

const removeImportFile = () => {
  importModal.file = null;
  importModal.fileList = [];
  importModal.results = [];
  importModal.selectedRowKeys = [];
  importPagination.current = 1;
};

const handleImportContestants = async () => {
  if (!importModal.file) return;

  try {
    importModal.uploading = true;
    const formData = new FormData();
    formData.append("file", importModal.file);

    const { data, error } = await RestApi.contestant.import_file({ body: formData });
    if (data.value?.status === "success") {
      importModal.results = dedupeImportResults(data.value?.data?.item || []).map(item => ({
        ...item,
        saveStatus: undefined,
        saveMessage: "",
      }));
      importModal.selectedRowKeys = [];
      importPagination.current = 1;
      message.success("Import thí sinh thành công");
      if (selectedLocation.value?.id) {
        await fetchContestants({ ...contestantParam.value });
      }
    } else {
      throw new Error(error.value?.data?.message || "Import thí sinh thất bại");
    }
  } catch (error) {
    importModal.results = [];
    message.error(error?.message || "Import thí sinh thất bại");
  } finally {
    importModal.uploading = false;
  }
};

const resolveExamLocationIdByCode = async maDiemThi => {
  const code = String(maDiemThi || "").trim();
  if (!code) {
    throw new Error("Thiếu mã điểm thi");
  }

  const { data, error } = await RestApi.exam_location.list({
    params: {
      pageIndex: 1,
      pageSize: 100,
      search: code,
    },
  });

  if (data.value?.status !== "success") {
    throw new Error(error.value?.data?.message || `Không tìm được điểm thi ${code}`);
  }

  const items = data.value?.data?.items || [];
  const normalizedCode = code.toLowerCase();
  const matched = items.find(item => String(item.ma || "").trim().toLowerCase() === normalizedCode) || items.find(item => String(item.ten || "").trim().toLowerCase() === normalizedCode);

  if (!matched?.id) {
    throw new Error(`Không tìm được điểm thi ${code}`);
  }

  return matched.id;
};

const handleSaveImportedContestants = async () => {
  const selectedItems = dedupeImportResults(importModal.results.filter(record => importModal.selectedRowKeys.includes(buildImportRowKey(record))));

  if (!selectedItems.length) {
    message.warning("Vui lòng chọn ít nhất 1 thí sinh");
    return;
  }

  try {
    importModal.saving = true;
    const processingMap = new Map(selectedItems.map(item => [buildImportRowKey(item), { saveStatus: "processing", saveMessage: "" }]));
    updateImportResultStatuses(processingMap);

    const results = await Promise.allSettled(
      selectedItems.map(async item => {
        const idDiemThi = await resolveExamLocationIdByCode(item.ma_diem_thi);
        const payload = {
          ho_va_ten: item.ho_va_ten,
          ngay_sinh: item.ngay_sinh ? dayjs(item.ngay_sinh).format("YYYY-MM-DDT00:00:00") : null,
          noi_sinh_xa: item.noi_sinh,
          dan_toc: item.dan_toc,
          cccd: item.cccd,
          thuong_tru_xa: item.noi_thuong_tru,
          id_diem_thi: idDiemThi,
          mon_thi_1: item.mon_1,
          mon_thi_2: item.mon_2,
        };

        const { data, error } = await RestApi.contestant.create({ body: payload });
        if (data.value?.status !== "success") {
          throw new Error(error.value?.data?.message || `Không thể tạo thí sinh ${item.ho_va_ten || ""}`.trim());
        }

        return item;
      }),
    );

    const statusMap = new Map();
    let successCount = 0;
    let errorCount = 0;

    results.forEach((result, index) => {
      const item = selectedItems[index];
      const key = buildImportRowKey(item);
      if (result.status === "fulfilled") {
        successCount += 1;
        statusMap.set(key, {
          saveStatus: "success",
          saveMessage: "Đã lưu",
        });
      } else {
        errorCount += 1;
        statusMap.set(key, {
          saveStatus: "error",
          saveMessage: result.reason?.message || "Lưu thất bại",
        });
      }
    });

    updateImportResultStatuses(statusMap);

    if (successCount > 0 && selectedLocation.value?.id) {
      await fetchContestants({ ...contestantParam.value });
    }

    if (errorCount > 0) {
      message.warning(`Đã lưu ${successCount} thí sinh, ${errorCount} bản ghi lỗi`);
    } else {
      message.success(`Đã lưu ${successCount} thí sinh`);
    }
  } catch (error) {
    message.error(error?.message || "Lưu danh sách import thất bại");
  } finally {
    importModal.saving = false;
  }
};

const handleAssignSbd = async () => {
  if (!assignSbdModal.boardId) {
    message.warning("Vui lòng chọn hội đồng thi");
    return;
  }

  try {
    assignSbdLoading.value = true;
    const { data, error } = await RestApi.contestant.generate_sbd({
      params: { idHoiDong: assignSbdModal.boardId },
    });

    if (data.value?.status === "success") {
      message.success("Đánh số báo danh thành công");
      assignSbdModal.open = false;
      await Promise.all([fetchLocationTable(), fetchContestants({ ...contestantParam.value })]);
    } else {
      throw new Error(error.value?.data?.message || "Đánh số báo danh thất bại");
    }
  } catch (error) {
    message.error(error?.message || "Đánh số báo danh thất bại");
  } finally {
    assignSbdLoading.value = false;
  }
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
