<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="space-y-2 mb-4">
      <a-form :model="param" layout="vertical" class="grid grid-cols-1 md:grid-cols-4 gap-2">
        <SelectYear v-model="param.IdNam" name="filter_id_nam_hoc" label="Năm học" />
        <SelectGradeLevelByUnit v-model="param.IdKhoi" name="filter_id_khoi" label="Khối lớp" />
        <SelectSchoolship v-model="param.IdBan" name="filter_id_ban" label="Ban học" />
        <SelectSubject v-model="param.IdMon" name="filter_id_mon" label="Môn học" :extra-params="filterSubjectParams" />
      </a-form>

      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <a-input-search v-model:value="searchText" placeholder="Tìm kiếm..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
        <div class="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <a-button @click="resetForm" class="w-full md:w-auto">
            <span class="md:inline">Đặt lại</span>
          </a-button>
          <a :href="'/Mau_ppct.xlsx'" download class="w-full md:w-auto">
            <a-button class="w-full md:w-auto">Tải file mẫu</a-button>
          </a>
          <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">
            <span class="md:inline">Thêm mới</span>
          </a-button>
        </div>
      </div>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '1000' }" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
          </template>
          <template v-if="column.key === 'action'">
            <div class="flex justify-center gap-2">
              <a-tooltip title="Chi tiết phân phối">
                <a-button type="link" size="small" @click="openDetailDrawer(record)">
                  <template #icon>
                    <UnorderedListOutlined />
                  </template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="Xuất phân phối">
                <a-button type="link" size="small" @click="exportDistribution(record)">
                  <template #icon>
                    <FileExcelOutlined />
                  </template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="Import dữ liệu">
                <a-button type="link" size="small" @click="openImportModal(record)">
                  <template #icon>
                    <UploadOutlined />
                  </template>
                </a-button>
              </a-tooltip>
              <a-button type="link" size="small" @click="editItem(record)" :disabled="!canModify(record)">
                <template #icon>
                  <EditOutlined />
                </template>
              </a-button>
              <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                <a-button type="link" danger size="small">
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <!-- Modal: Chi tiết phân phối chương trình -->
    <a-modal v-model:open="detailDrawer.open" :title="`Chi tiết phân phối: ${detailDrawer.header.ten || ''}`" :footer="null" :width="1000" :bodyStyle="{ maxHeight: '70vh', overflowY: 'auto' }">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Left: Form nhập chi tiết -->
        <!-- <a-card size="small" title="Thiết lập phân phối chương trình">
          <div class="grid grid-cols-1 gap-3 mb-3 text-sm">
            <div><span class="font-medium">Năm học:</span> {{ detailDrawer.header.ten_nam_hoc || "-" }}</div>
            <div><span class="font-medium">Khối lớp:</span> {{ detailDrawer.header.ten_khoi || "-" }}</div>
            <div><span class="font-medium">Ban học:</span> {{ detailDrawer.header.ten_ban || "-" }}</div>
            <div><span class="font-medium">Môn học:</span> {{ detailDrawer.header.ten_mon || "-" }}</div>
          </div>
          <a-form ref="detailFormRef" :model="detailForm" layout="vertical" :rules="detailRules">
            <a-form-item label="Tuần" name="tuan">
              <a-input-number v-model:value="detailForm.tuan" :min="1" :step="1" :precision="0" class="!w-full" placeholder="Nhập tuần" />
            </a-form-item>
            <a-form-item label="Số thứ tự tiết" name="thu_tu_tiet">
              <a-input-number v-model:value="detailForm.thu_tu_tiet" :min="1" :step="1" :precision="0" class="!w-full" placeholder="Nhập số thứ tự tiết" />
            </a-form-item>
            <a-form-item label="Phân môn" name="phan_mon">
              <a-input v-model:value="detailForm.phan_mon" allow-clear placeholder="Nhập tên phân môn" />
            </a-form-item>
            <a-form-item label="Tên bài học" name="ten_bai">
              <a-input v-model:value="detailForm.ten_bai" allow-clear placeholder="Nhập tên bài học" />
            </a-form-item>

            <div class="flex gap-2">
              <a-button type="primary" :loading="detailDrawer.saving" :disabled="!settingStore.currentPermission" @click="saveDetail">Lưu</a-button>
              <a-button danger @click="resetDetailForm" :disabled="!settingStore.currentPermission">Hủy</a-button>
            </div>
          </a-form>
        </a-card> -->

        <!-- Right: Danh sách chi tiết -->
        <a-card class="col-span-3" size="small" title="Danh sách chi tiết phân phối chương trình">
          <ClientOnly class="overflow-x-auto">
            <a-table :columns="detailColumns" :data-source="detailData" :pagination="detailPagination" :loading="detailDrawer.loading" size="small" bordered :scroll="{ x: '800' }" @change="handleDetailTableChange" row-key="id">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'stt'">
                  <!-- {{ (detailPagination.current - 1) * detailPagination.pageSize + index + 1 }} -->
                  {{ record.stt }}
                </template>
              </template>
            </a-table>
          </ClientOnly>
        </a-card>
      </div>
    </a-modal>

    <!-- Modal: Import dữ liệu PPCT -->
    <a-modal v-model:open="importModal.open" title="IMPORT PHÂN PHỐI CHƯƠNG TRÌNH" :confirmLoading="importModal.uploading" @ok="handleImport" @cancel="closeImportModal">
      <div class="space-y-2 text-sm">
        <div><span class="font-medium">Tên phân phối chương trình:</span> {{ detailDrawer.header.ten || "-" }}</div>
        <div><span class="font-medium">Năm học:</span> {{ detailDrawer.header.ten_nam_hoc || "-" }}</div>
        <div><span class="font-medium">Khối lớp:</span> {{ detailDrawer.header.ten_khoi || "-" }}</div>
        <div><span class="font-medium">Ban học:</span> {{ detailDrawer.header.ten_ban || "-" }}</div>
        <div><span class="font-medium">Môn học:</span> {{ detailDrawer.header.ten_mon || "-" }}</div>
      </div>
      <div class="mt-4">
        <a-upload :beforeUpload="beforeUpload" :maxCount="1" :file-list="importModal.fileList" @remove="onRemoveFile" :accept="'.xlsx,.xls'" :showUploadList="{ showRemoveIcon: true }">
          <a-button>Chọn file</a-button>
        </a-upload>
      </div>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <a-button @click="closeImportModal">Hủy</a-button>
          <a-button type="primary" :disabled="!importModal.file || !settingStore.currentPermission" :loading="importModal.uploading" @click="handleImport">Lưu</a-button>
        </div>
      </template>
    </a-modal>

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa' : 'Thêm mới'" @cancel="handleCancel" :width="600">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tên" name="ten" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên" :maxlength="255" show-count />
        </a-form-item>
        <SelectYear v-model="formState.id_nam_hoc" name="id_nam_hoc" :rules="rules.id_nam_hoc" />
        <SelectGradeLevelByUnit v-model="formState.id_khoi" name="id_khoi" :rules="rules.id_khoi" />
        <SelectSchoolship v-model="formState.id_ban" name="id_ban" :rules="rules.id_ban" />
        <SelectSubject v-if="formState.id_khoi && formState.id_ban" v-model="formState.id_mon" name="id_mon" :rules="rules.id_mon" :extra-params="formSubjectParams" />
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
const router = useRouter();
const settingStore = useSettingStore();
const { RestApi } = useApi();
const param = ref({
  pageIndex: 1,
  pageSize: 10,
  search: "",
  IdKhoi: null,
  IdBan: null,
  IdMon: null,
  IdNam: null,
});

// Query params bổ sung cho SelectSubject ở vùng filter: chỉ gửi khi đã chọn Khối & Ban
const filterSubjectParams = computed(() => {
  const { IdKhoi, IdBan } = param.value || {};
  if (!IdKhoi || !IdBan) return {};
  return { id_khoi: IdKhoi, id_ban: IdBan };
});
function reloadPage() {
  router.go(0);
}
const columns = [
  { title: "STT", key: "stt", width: 50, align: "center" },
  { title: "Tên", dataIndex: "ten", key: "ten", ellipsis: true },
  { title: "Năm học", dataIndex: "ten_nam_hoc", key: "ten_nam_hoc", ellipsis: true },
  { title: "Khối", dataIndex: "ten_khoi", key: "ten_khoi", ellipsis: true },
  { title: "Ban", dataIndex: "ten_ban", key: "ten_ban", ellipsis: true },
  { title: "Môn", dataIndex: "ten_mon", key: "ten_mon", ellipsis: true },
  { title: "Thao tác", key: "action", width: 160, align: "center", fixed: "right" },
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
  id_nam_hoc: null,
  id_khoi: null,
  id_ban: null,
  id_mon: null,
});

// Query params bổ sung cho SelectSubject trong modal thêm/sửa
const formSubjectParams = computed(() => {
  const { id_khoi, id_ban } = formState;
  if (!id_khoi || !id_ban) return {};
  return { id_khoi, id_ban };
});

const rules = reactive({
  ten: [
    { required: true, message: "Vui lòng nhập tên", trigger: "blur" },
    { max: 255, message: "Tối đa 255 ký tự", trigger: "blur" },
  ],
  id_nam_hoc: [{ required: true, message: "Vui lòng chọn năm học", trigger: "change" }],
  id_khoi: [{ required: true, message: "Vui lòng chọn khối", trigger: "change" }],
  id_ban: [{ required: true, message: "Vui lòng chọn ban", trigger: "change" }],
  id_mon: [{ required: true, message: "Vui lòng chọn môn", trigger: "change" }],
});

// Chỉ cho phép chỉnh sửa/xóa/import khi có quyền và bản ghi được phép sửa (edit = true từ API)
const canModify = record => {
  if (!settingStore.currentPermission) return false;
  return !!record?.edit;
};

// Chỉ build các query param khi có giá trị (tránh gửi null/rỗng lên API)
const buildQueryParams = () => {
  const query = {
    pageIndex: param.value.pageIndex,
    pageSize: param.value.pageSize,
  };

  const s = (param.value.search || "").trim();
  if (s) query.search = s;

  const hasValue = v => v !== null && v !== undefined && v !== "";
  if (hasValue(param.value.IdNam)) query.IdNam = param.value.IdNam;
  if (hasValue(param.value.IdKhoi)) query.IdKhoi = param.value.IdKhoi;
  if (hasValue(param.value.IdBan)) query.IdBan = param.value.IdBan;
  if (hasValue(param.value.IdMon)) query.IdMon = param.value.IdMon;

  return query;
};

const fetchData = async () => {
  try {
    loading.value = true;
    const query = buildQueryParams();
    const { data, error } = await RestApi.phanphoi_chuongtrinh.list({ params: query });
    if (data.value?.status === "success") {
      dataSource.value = data.value.data.items || [];
      pagination.total = data.value.data.totalrecord;
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

// Download helper for phân phối chương trình
const exportFile = async apiFn => {
  try {
    settingStore.setLoading(true);
    const { data, error } = await apiFn();
    if (error.value) {
      throw new Error(error.value?.data?.message || "Xuất file không thành công");
    }
    const { blob: blobData, headers } = data.value || {};
    if (!blobData) {
      throw new Error("Xuất file không thành công");
    }
    const blob = blobData instanceof Blob ? blobData : new Blob([blobData]);
    const cd = headers?.["content-disposition"] || headers?.["Content-Disposition"];
    const filename = (cd && (decodeURIComponent(/filename\*=UTF-8''([^;]+)/.exec(cd)?.[1] || "") || /filename="([^"]+)"/.exec(cd)?.[1])) || "phanphoi.xlsx";
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    message.error(err.message || "Xuất file không thành công");
  } finally {
    settingStore.setLoading(false);
  }
};

const exportDistribution = async record => {
  if (!record?.id) {
    message.error("Không xác định được phân phối chương trình");
    return;
  }
  await exportFile(() => RestApi.phanphoi_chuongtrinh.export({ params: { Id: record.id } }));
};

// Tự động lọc theo các tiêu chí chọn (Năm, Khối, Ban, Môn)
watch(
  () => [param.value.IdNam, param.value.IdKhoi, param.value.IdBan, param.value.IdMon],
  async () => {
    pagination.current = 1;
    param.value.pageIndex = 1;
    await fetchData();
  },
);

// Drawer: Chi tiết phân phối
const detailDrawer = reactive({ open: false, header: {}, loading: false, saving: false });
const detailParam = ref({ pageIndex: 1, pageSize: 10, search: "", idPpct: null });
const detailData = ref([]);
const detailPagination = reactive({ current: 1, pageSize: 10, total: 0, showSizeChanger: true, pageSizeOptions: ["10", "20", "50"] });
const detailColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Tuần", dataIndex: "tuan", key: "tuan", align: "center" },
  {
    title: "Số thứ tự tiết",
    dataIndex: "thu_tu_tiet",
    key: "thu_tu_tiet",
    align: "center",
    sorter: (a, b) => (Number(a?.thu_tu_tiet) || 0) - (Number(b?.thu_tu_tiet) || 0),
    defaultSortOrder: "ascend",
  },
  { title: "Phân môn", dataIndex: "phan_mon", key: "phan_mon" },
  { title: "Tên bài học", dataIndex: "ten_bai", key: "ten_bai" },
];

const detailFormRef = ref();
const isDetailEdit = ref(false);
const detailForm = reactive({ id: null, id_ppct: null, tuan: null, thu_tu_tiet: null, phan_mon: "", ten_bai: "" });
const detailRules = reactive({
  tuan: [{ required: true, message: "Vui lòng nhập tuần", trigger: "blur" }],
  thu_tu_tiet: [{ required: true, message: "Vui lòng nhập số thứ tự tiết", trigger: "blur" }],
  ten_bai: [{ required: true, message: "Vui lòng nhập tên bài học", trigger: "blur" }],
});

// (Removed row selection and bulk delete for detail list)

const openDetailDrawer = async record => {
  detailDrawer.open = true;
  detailDrawer.header = { ...record };
  detailParam.value = { pageIndex: 1, pageSize: 10, search: "", idPpct: record.id };
  resetDetailForm();
  await fetchDetailData();
  await setNextThuTuTietFromAll();
};

const fetchDetailData = async () => {
  try {
    detailDrawer.loading = true;
    const { data, error } = await RestApi.phanphoi_chuongtrinh_chitiet.list({ params: { ...detailParam.value } });
    if (data.value?.status === "success") {
      const items = data.value.data.items || [];
      // Sắp xếp danh sách chi tiết theo Số thứ tự tiết (tăng dần)
      items.sort((a, b) => (Number(a?.thu_tu_tiet) || 0) - (Number(b?.thu_tu_tiet) || 0));
      detailData.value = items;
      detailPagination.total = data.value.data.totalrecord || 0;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được dữ liệu");
    }
  } catch (err) {
    detailData.value = [];
    detailPagination.total = 0;
    message.error(err.message || "Lỗi tải dữ liệu");
  } finally {
    detailDrawer.loading = false;
  }
};

// Tính và gán "Số thứ tự tiết" tiếp theo (dựa trên tất cả bản ghi hiện có của PPCT)
const setNextThuTuTietFromAll = async () => {
  try {
    if (!detailDrawer.header?.id) return;
    if (isDetailEdit.value) return; // không tự động khi đang chỉnh sửa
    const { data } = await RestApi.phanphoi_chuongtrinh_chitiet.list({
      params: { idPpct: detailDrawer.header.id, pageIndex: 1, pageSize: 100000 },
    });
    if (data.value?.status === "success") {
      const all = data.value.data.items || [];
      const max = all.reduce((m, x) => {
        const v = Number(x?.thu_tu_tiet) || 0;
        return v > m ? v : m;
      }, 0);
      detailForm.thu_tu_tiet = max + 1 || 1;
    }
  } catch (e) {
    // bỏ qua lỗi, không chặn luồng
  }
};

// Import modal state and actions
const importModal = reactive({ open: false, file: null, fileList: [], uploading: false });
const openImportModal = record => {
  if (record) {
    // set header to selected row so modal knows the context
    detailDrawer.header = { ...record };
  }
  importModal.open = true;
};
const closeImportModal = () => {
  importModal.open = false;
  importModal.file = null;
  importModal.fileList = [];
};
const beforeUpload = file => {
  const originFile = file?.originFileObj || file;
  const extIndex = originFile.name?.lastIndexOf(".") ?? -1;
  const ext = extIndex >= 0 ? originFile.name.slice(extIndex) : "";
  const newName = `${Date.now()}${ext}`;
  const renamedFile = new File([originFile], newName, {
    type: originFile.type,
    lastModified: originFile.lastModified,
  });
  importModal.file = renamedFile;
  importModal.fileList = [{ ...file, name: originFile.name }];
  return false; // prevent auto upload
};
const onRemoveFile = () => {
  importModal.file = null;
  importModal.fileList = [];
};
const handleImport = async () => {
  if (!detailDrawer.header?.id) {
    message.error("Không xác định được phân phối chương trình");
    return;
  }
  if (!importModal.file) {
    message.warning("Vui lòng chọn file để import");
    return;
  }
  try {
    importModal.uploading = true;
    const form = new FormData();
    // Gửi File đã được đổi tên trong bộ nhớ
    form.append("file", importModal.file);
    form.append("idppct", String(detailDrawer.header.id));
    const resp = await RestApi.phanphoi_chuongtrinh_chitiet.import_file({ body: form });
    if (resp.data.value?.status === "success") {
      message.success(resp.data.value?.message || "Import thành công");
      closeImportModal();
      // window.location.reload();
      // await fetchDetailData();
      // await setNextThuTuTietFromAll();
    } else {
      const msg = resp.error?.value?.data?.message || resp.data.value?.message || "Import không thành công";
      throw new Error(msg);
    }
  } catch (err) {
    message.error(err.message || "Import không thành công");
  } finally {
    closeImportModal();
    importModal.uploading = false;
    await fetchData();
    // onRemoveFile();
    // reloadPage();
  }
};

const handleDetailTableChange = async pag => {
  detailPagination.current = pag.current;
  detailPagination.pageSize = pag.pageSize;
  detailParam.value.pageIndex = pag.current;
  detailParam.value.pageSize = pag.pageSize;
  await fetchDetailData();
};

const resetDetailForm = () => {
  isDetailEdit.value = false;
  // Reset các field trước, sau đó gán giá trị mặc định (để tránh resetFields ghi đè)
  detailFormRef.value?.resetFields?.();
  Object.assign(detailForm, {
    id: null,
    id_ppct: detailDrawer.header?.id || null,
    tuan: null,
    thu_tu_tiet: (Number(detailData.value?.reduce?.((m, x) => ((Number(x?.thu_tu_tiet) || 0) > m ? Number(x?.thu_tu_tiet) : m), 0)) || 0) + 1,
    phan_mon: "",
    ten_bai: "",
  });
};

const editDetail = record => {
  isDetailEdit.value = true;
  Object.assign(detailForm, {
    id: record.id,
    id_ppct: detailDrawer.header?.id || record.id_ppct,
    tuan: record.tuan,
    thu_tu_tiet: record.thu_tu_tiet,
    phan_mon: record.phan_mon,
    ten_bai: record.ten_bai,
  });
};

const saveDetail = async () => {
  try {
    await detailFormRef.value?.validate?.();
    detailDrawer.saving = true;
    const payload = { id: detailForm.id, id_ppct: detailDrawer.header?.id, tuan: detailForm.tuan, thu_tu_tiet: detailForm.thu_tu_tiet, phan_mon: detailForm.phan_mon, ten_bai: detailForm.ten_bai };
    let resp;
    if (isDetailEdit.value) {
      resp = await RestApi.phanphoi_chuongtrinh_chitiet.update({ body: payload });
    } else {
      delete payload.id;
      resp = await RestApi.phanphoi_chuongtrinh_chitiet.create({ body: payload });
    }
    if (resp.data.value?.status === "success") {
      message.success(resp.data.value?.message || "Thành công");
      await fetchDetailData();
      resetDetailForm();
      await setNextThuTuTietFromAll();
    } else {
      throw new Error(resp.error?.value?.data?.message || "Lỗi không xác định");
    }
  } catch (err) {
    message.error(err.message || "Lỗi khi lưu dữ liệu");
  } finally {
    detailDrawer.saving = false;
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
  const search = (searchText.value || "").trim();
  if (search) {
    param.value.search = search;
  } else {
    delete param.value.search;
  }
  pagination.current = 1;
  param.value.pageIndex = 1;
  await fetchData();
};

const showModal = () => {
  isEdit.value = false;
  Object.assign(formState, { id: null, ten: "", id_nam_hoc: null, id_khoi: null, id_ban: null, id_mon: null });
  visible.value = true;
};

const editItem = async record => {
  isEdit.value = true;
  Object.assign(formState, record);
  visible.value = true;
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    const payload = { ...formState };
    let res;
    if (isEdit.value) {
      res = await RestApi.phanphoi_chuongtrinh.update({ body: payload });
    } else {
      delete payload.id;
      res = await RestApi.phanphoi_chuongtrinh.create({ body: payload });
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
    const { data, error } = await RestApi.phanphoi_chuongtrinh.delete({ params: { Id: id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa thành công");
      pagination.current = 1;
      param.value.pageIndex = 1;
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (error) {
    message.error(error?.message || error?.value?.data?.message || "Xóa không thành công ");
  } finally {
    await fetchData();
  }
};

const resetForm = async () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  searchText.value = "";
  param.value.pageIndex = 1;
  param.value.pageSize = 10;
  param.value.search = "";
  param.value.IdKhoi = null;
  param.value.IdBan = null;
  param.value.IdMon = null;
  param.value.IdNam = null;
  pagination.current = 1;
  pagination.pageSize = 10;
  await fetchData();
};
await fetchData();
</script>
