<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">
        <span class="md:inline">Đặt lại</span>
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
          <template v-if="column.key === 'action'">
            <div class="flex justify-center gap-2">
              <a-tooltip title="Chi tiết phân phối">
                <a-button type="link" size="small" @click="openDetailDrawer(record)">
                  <template #icon>
                    <UnorderedListOutlined />
                  </template>
                </a-button>
              </a-tooltip>
              <a-button type="link" size="small" @click="editItem(record)" :disabled="!settingStore.currentPermission">
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
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <!-- Drawer: Chi tiết phân phối chương trình (full, slide from bottom) -->
    <a-drawer v-model:open="detailDrawer.open" :title="`Chi tiết phân phối: ${detailDrawer.header.ten || ''}`" :footer="null" height="100vh" placement="bottom" :destroyOnClose="true">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Left: Form nhập chi tiết -->
        <a-card size="small" title="Thiết lập phân phối chương trình">
          <div class="grid grid-cols-1 gap-3 mb-3 text-sm">
            <div><span class="font-medium">Năm học:</span> {{ detailDrawer.header.ten_nam_hoc || "-" }}</div>
            <div><span class="font-medium">Khối lớp:</span> {{ detailDrawer.header.ten_khoi || "-" }}</div>
            <div><span class="font-medium">Ban học:</span> {{ detailDrawer.header.ten_ban || "-" }}</div>
            <div><span class="font-medium">Môn học:</span> {{ detailDrawer.header.ten_mon || "-" }}</div>
          </div>
          <a-form ref="detailFormRef" :model="detailForm" layout="vertical" :rules="detailRules">
            <a-form-item label="Tuần" name="tuan">
              <a-input-number v-model:value="detailForm.tuan" :min="1" :step="1" class="!w-full" placeholder="Nhập tuần" />
            </a-form-item>
            <a-form-item label="Số thứ tự tiết" name="thu_tu_tiet">
              <a-input-number v-model:value="detailForm.thu_tu_tiet" :min="1" :step="1" class="!w-full" placeholder="Nhập số thứ tự tiết" />
            </a-form-item>
            <a-form-item label="Phân môn" name="phan_mon">
              <a-input v-model:value="detailForm.phan_mon" allow-clear placeholder="Nhập tên phân môn" />
            </a-form-item>
            <a-form-item label="Tên bài học" name="ten_bai">
              <a-input v-model:value="detailForm.ten_bai" allow-clear placeholder="Nhập tên bài học" />
            </a-form-item>
            <a-form-item label="Ghi chú" name="ghi_chu">
              <a-input v-model:value="detailForm.ghi_chu" allow-clear placeholder="Ghi chú (không bắt buộc)" />
            </a-form-item>
            <div class="flex gap-2">
              <a-button type="primary" :loading="detailDrawer.saving" :disabled="!settingStore.currentPermission" @click="saveDetail">Lưu</a-button>
              <a-button danger @click="resetDetailForm" :disabled="!settingStore.currentPermission">Hủy</a-button>
            </div>
          </a-form>
        </a-card>

        <!-- Right: Danh sách chi tiết -->
        <a-card class="col-span-2" size="small" title="Danh sách chi tiết phân phối chương trình">
          <ClientOnly class="overflow-x-auto">
            <a-table :columns="detailColumns" :data-source="detailData" :pagination="detailPagination" :loading="detailDrawer.loading" size="small" bordered :scroll="{ x: '800' }" @change="handleDetailTableChange">
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'stt'">
                  {{ (detailPagination.current - 1) * detailPagination.pageSize + index + 1 }}
                </template>
                <template v-else-if="column.key === 'action'">
                  <div class="flex justify-center gap-2">
                    <a-button type="link" size="small" :disabled="!settingStore.currentPermission" @click="editDetail(record)">
                      <template #icon><EditOutlined /></template>
                    </a-button>
                    <a-popconfirm title="Xóa mục này?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteDetail(record.id)">
                      <a-button type="link" size="small" danger :disabled="!settingStore.currentPermission">
                        <template #icon><DeleteOutlined /></template>
                      </a-button>
                    </a-popconfirm>
                  </div>
                </template>
              </template>
            </a-table>
          </ClientOnly>
        </a-card>
      </div>
    </a-drawer>

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa' : 'Thêm mới'" @cancel="handleCancel" :width="600">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tên" name="ten" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên" :maxlength="255" show-count />
        </a-form-item>
        <SelectYear v-model="formState.id_nam_hoc" name="id_nam_hoc" :rules="rules.id_nam_hoc" />
        <SelectGradeLevel v-model="formState.id_khoi" name="id_khoi" :rules="rules.id_khoi" />
        <SelectSchoolship v-model="formState.id_ban" name="id_ban" :rules="rules.id_ban" />
        <SelectSubject v-model="formState.id_mon" name="id_mon" :rules="rules.id_mon" />
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
const settingStore = useSettingStore();
const { RestApi } = useApi();
const param = ref({ PageIndex: 1, PageSize: 10, search: "" });

const columns = [
  { title: "STT", key: "stt", width: 50, align: "center" },
  { title: "Tên", dataIndex: "ten", key: "ten", ellipsis: true },
  { title: "Năm học", dataIndex: "ten_nam_hoc", key: "ten_nam_hoc", ellipsis: true },
  { title: "Khối", dataIndex: "ten_khoi", key: "ten_khoi", ellipsis: true },
  { title: "Ban", dataIndex: "ten_ban", key: "ten_ban", ellipsis: true },
  { title: "Môn", dataIndex: "ten_mon", key: "ten_mon", ellipsis: true },
  { title: "Thao tác", key: "action", width: 120, align: "center", fixed: "right" },
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

const fetchData = async param => {
  try {
    loading.value = true;
    const { data } = await RestApi.phanphoi_chuongtrinh.list({ params: param });
    if (data.value?.status === "success") {
      dataSource.value = data.value.data.items || [];
      pagination.total = data.value.data.totalrecord;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được dữ liệu");
    }
  } catch (error) {
    dataSource.value = [];
    pagination.total = 0;
    message.error(err.message || "Lỗi tải dữ liệu");
  } finally {
    loading.value = false;
  }
};

// Drawer: Chi tiết phân phối
const detailDrawer = reactive({ open: false, header: {}, loading: false, saving: false });
const detailParam = ref({ pageIndex: 1, pageSize: 10, search: "", idPpct: null });
const detailData = ref([]);
const detailPagination = reactive({ current: 1, pageSize: 10, total: 0, showSizeChanger: true, pageSizeOptions: ["10", "20", "50"] });
const detailColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Tuần", dataIndex: "tuan", key: "tuan", width: 90, align: "center" },
  { title: "Số thứ tự tiết", dataIndex: "thu_tu_tiet", key: "thu_tu_tiet", width: 140, align: "center" },
  { title: "Phân môn", dataIndex: "phan_mon", key: "phan_mon" },
  { title: "Tên bài học", dataIndex: "ten_bai", key: "ten_bai" },
  { title: "Thao tác", key: "action", width: 100, align: "center", fixed: "right" },
];

const detailFormRef = ref();
const isDetailEdit = ref(false);
const detailForm = reactive({ id: null, id_ppct: null, tuan: null, thu_tu_tiet: null, phan_mon: "", ten_bai: "", ghi_chu: "" });
const detailRules = reactive({
  tuan: [{ required: true, message: "Vui lòng nhập tuần", trigger: "blur" }],
  thu_tu_tiet: [{ required: true, message: "Vui lòng nhập số thứ tự tiết", trigger: "blur" }],
  ten_bai: [{ required: true, message: "Vui lòng nhập tên bài học", trigger: "blur" }],
});

const openDetailDrawer = async record => {
  detailDrawer.open = true;
  detailDrawer.header = { ...record };
  detailParam.value = { pageIndex: 1, pageSize: 10, search: "", idPpct: record.id };
  resetDetailForm();
  await fetchDetailData();
};

const fetchDetailData = async () => {
  try {
    detailDrawer.loading = true;
    const { data, error } = await RestApi.phanphoi_chuongtrinh_chitiet.list({ params: { ...detailParam.value } });
    if (data.value?.status === "success") {
      detailData.value = data.value.data.items || [];
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

const handleDetailTableChange = async pag => {
  detailPagination.current = pag.current;
  detailPagination.pageSize = pag.pageSize;
  detailParam.value.pageIndex = pag.current;
  detailParam.value.pageSize = pag.pageSize;
  await fetchDetailData();
};

const resetDetailForm = () => {
  isDetailEdit.value = false;
  Object.assign(detailForm, { id: null, id_ppct: detailDrawer.header?.id || null, tuan: null, thu_tu_tiet: null, phan_mon: "", ten_bai: "", ghi_chu: "" });
  detailFormRef.value?.resetFields?.();
};

const editDetail = record => {
  isDetailEdit.value = true;
  Object.assign(detailForm, { ...record, id_ppct: detailDrawer.header?.id || record.id_ppct });
};

const saveDetail = async () => {
  try {
    await detailFormRef.value?.validate?.();
    detailDrawer.saving = true;
    const payload = { id: detailForm.id, id_ppct: detailDrawer.header?.id, tuan: detailForm.tuan, thu_tu_tiet: detailForm.thu_tu_tiet, phan_mon: detailForm.phan_mon, ten_bai: detailForm.ten_bai, ghi_chu: detailForm.ghi_chu };
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
    } else {
      throw new Error(resp.error?.value?.data?.message || "Lỗi không xác định");
    }
  } catch (err) {
    message.error(err.message || "Lỗi khi lưu dữ liệu");
  } finally {
    detailDrawer.saving = false;
  }
};

const deleteDetail = async id => {
  try {
    const { data, error } = await RestApi.phanphoi_chuongtrinh_chitiet.delete({ params: { Id: id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa thành công");
      detailParam.value.pageIndex = 1;
      detailPagination.current = 1;
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (err) {
    message.error(err.message || "Xóa không thành công");
  } finally {
    await fetchDetailData();
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
</script>
