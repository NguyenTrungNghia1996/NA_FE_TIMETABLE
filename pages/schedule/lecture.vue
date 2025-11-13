<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm lịch báo giảng..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetForm" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '1000', y: 500 }" @change="handleTableChange" bordered size="small" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'date_range'">
            <span>
              {{ formatDate(record.tu_ngay) && formatDate(record.den_ngay) ? `Từ ngày ${formatDate(record.tu_ngay)} đến ${formatDate(record.den_ngay)}` : "" }}
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex justify-center">
              <div class="md:flex space-x-2">
                <a-tooltip title="Danh sách phiếu báo giảng">
                  <a-button type="link" size="small" @click="openSlipModal(record)">
                    <template #icon><ProfileOutlined /></template>
                  </a-button>
                </a-tooltip>
                <a-button type="link" size="small" @click="editItem(record)" :disabled="!canModify(record)">
                  <template #icon><EditOutlined /></template>
                </a-button>
                <a-popconfirm placement="topRight" title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="confirmDelete(record)">
                  <a-button type="link" danger size="small" :disabled="!canModify(record)">
                    <template #icon><DeleteOutlined /></template>
                  </a-button>
                </a-popconfirm>
              </div>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <a-modal v-model:open="visible" :title="isEdit ? `Chỉnh sửa lịch báo giảng - Tuần ${editingWeek || ''}` : `Thêm mới lịch báo giảng - Tuần ${nextWeek}`" @cancel="handleCancel" :width="640">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <SelectYear v-model="formState.id_nam_hoc" label="Năm học" name="id_nam_hoc" :rules="rules.id_nam_hoc" />
        <SelectTimetable v-model="formState.id_tkb" label="Thời khóa biểu" name="id_tkb" :rules="rules.id_tkb" />
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

    <!-- Slip (Phiếu báo giảng) Modal -->
    <a-modal v-model:open="slipModal.visible" title="Danh sách phiếu báo giảng" @cancel="closeSlipModal" :width="1000" :footer="null">
      <div class="flex flex-col md:flex-row gap-2 mb-3">
        <a-input-search v-model:value="slipModal.searchText" placeholder="Tìm theo tên giáo viên..." enter-button @search="handleSlipSearch" class="w-full md:w-1/3" />
      </div>
      <a-table :columns="slipColumns" :data-source="slipModal.data" :pagination="slipPagination" :loading="slipModal.loading" :scroll="{ x: '1000', y: 500 }" @change="handleSlipTableChange" bordered size="small" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'date_range'">
            <span>
              {{ formatDate(record.tu_ngay) && formatDate(record.den_ngay) ? `Từ ngày ${formatDate(record.tu_ngay)} đến ${formatDate(record.den_ngay)}` : "" }}
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="openSlipDetail(record)">Chi tiết</a-button>
          </template>
        </template>
      </a-table>
    </a-modal>

    <!-- Slip Detail Modal -->
    <a-modal v-model:open="detailModal.visible" :title="'CHI TIẾT PHIẾU BÁO GIẢNG'" :width="1000" @cancel="closeDetailModal">
      <div class="mb-3">
        <div class="font-semibold">{{ detailModal.header.teacher }}</div>
        <div v-if="detailModal.header.week || (detailModal.header.from && detailModal.header.to)" class="text-gray-600 text-sm">
          <span v-if="detailModal.header.week">Tuần {{ detailModal.header.week }}</span>
          <span v-if="detailModal.header.from && detailModal.header.to"> (Từ ngày {{ formatDate(detailModal.header.from) }} đến {{ formatDate(detailModal.header.to) }})</span>
        </div>
      </div>
      <a-table :columns="detailColumns" :data-source="detailRows" :loading="detailModal.loading" :scroll="{ x: '1200', y: 520 }" size="small" bordered :pagination="false" row-key="_k">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'day'">
            <span class="[writing-mode:vertical-rl] items-center justify-center">{{ record.day }}</span>
          </template>
          <template v-if="column.key === 'session'">
            <span class="[writing-mode:vertical-lr] items-center justify-center"> {{ record.session }}</span>
          </template>
        </template>
      </a-table>
      <template #footer>
        <a-button @click="closeDetailModal">Đóng</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import "dayjs/locale/vi";
const settingStore = useSettingStore();
const { RestApi } = useApi();

const param = ref({ pageIndex: 1, pageSize: 10, search: "" });

const columns = [
  { title: "STT", dataIndex: "stt", key: "stt", width: 60, align: "center" },
  { title: "Năm học", dataIndex: "ten_nam_hoc", key: "ten_nam_hoc", width: 160 },
  { title: "Tuần", dataIndex: "tuan", key: "tuan", width: 80, align: "center", sorter: (a, b) => (Number(a?.tuan) || 0) - (Number(b?.tuan) || 0), sortDirections: ["ascend", "descend"] },
  { title: "Theo TKB", dataIndex: "ten_tkb", key: "ten_tkb", width: 200 },
  { title: "Từ ngày - Đến ngày", key: "date_range", width: 260 },
  { title: "Thao tác", key: "action", width: 100, align: "center", fixed: "right" },
];

const dataSource = ref([]);
const loading = ref(false);
const searchText = ref("");
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const formRef = ref();
const editingWeek = ref(null);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["1", "10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const formState = reactive({
  id: undefined,
  id_nam_hoc: undefined,
  id_tkb: undefined,
});

const rules = reactive({
  id_nam_hoc: [{ required: true, message: "Vui lòng chọn năm học", trigger: "change" }],
  id_tkb: [{ required: true, message: "Vui lòng chọn thời khóa biểu", trigger: "change" }],
});

const formatDate = date => {
  if (!date) return "";
  try {
    return dayjs(date).format("dd DD/MM/YYYY");
  } catch {
    return "";
  }
};

// Tính tuần kế tiếp (max tuần hiện có + 1) từ dữ liệu đang hiển thị
const maxWeek = computed(() => {
  const weeks = (dataSource.value || []).map(i => Number(i?.tuan) || 0);
  return weeks.length ? Math.max(...weeks) : 0;
});
const nextWeek = computed(() => (maxWeek.value || 0) + 1);

// Chỉ cho phép sửa/xóa khi có quyền và lịch chưa bắt đầu
const canModify = record => {
  try {
    if (!settingStore.currentPermission) return false;
    if (!record?.tu_ngay) return false;
    const todayStart = dayjs().startOf("day").valueOf();
    const startDate = dayjs(record.tu_ngay).startOf("day").valueOf();
    return startDate > todayStart; // chỉ khi bắt đầu sau hôm nay
  } catch (e) {
    return false;
  }
};

const fetchData = async p => {
  try {
    loading.value = true;
    const { data, error } = await RestApi.lecture_schedule.list({ params: p });
    if (data.value?.status === "success") {
      dataSource.value = data.value.data?.items || [];
      pagination.total = data.value.data?.totalrecord || 0;
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

const handleTableChange = async pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  param.value.pageIndex = pag.current;
  param.value.pageSize = pag.pageSize;
  await fetchData({ ...param.value });
};

const handleSearch = async () => {
  const search = (searchText.value || "").trim();
  if (search) param.value.search = search;
  else delete param.value.search;
  pagination.current = 1;
  param.value.pageIndex = 1;
  await fetchData({ ...param.value });
};

const showModal = () => {
  isEdit.value = false;
  Object.assign(formState, { id: undefined, id_nam_hoc: undefined, id_tkb: undefined });
  editingWeek.value = null;
  visible.value = true;
};

const editItem = record => {
  if (!canModify(record)) {
    message.warning("Chỉ được sửa lịch báo giảng chưa bắt đầu");
    return;
  }
  isEdit.value = true;
  Object.assign(formState, {
    id: record.id,
    id_nam_hoc: record.id_nam_hoc,
    id_tkb: record.id_tkb,
  });
  editingWeek.value = record?.tuan ?? null;
  visible.value = true;
};

const buildPayload = () => ({
  ...(isEdit.value ? { id: formState.id } : {}),
  id_nam_hoc: formState.id_nam_hoc,
  id_tkb: formState.id_tkb,
});

const handleOk = async () => {
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;
    const payload = buildPayload();

    if (isEdit.value) {
      const { data, error } = await RestApi.lecture_schedule.update({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật lịch báo giảng thành công");
      } else {
        throw new Error(error.value?.data?.message || "Cập nhật không thành công");
      }
    } else {
      const { data, error } = await RestApi.lecture_schedule.create({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Thêm lịch báo giảng thành công");
      } else {
        throw new Error(error.value?.data?.message || "Thêm mới không thành công");
      }
    }
    await fetchData({ ...param.value });
    visible.value = false;
    formRef.value?.resetFields?.();
  } catch (error) {
    message.error(error.message || error?.response?.data?.message || "Nhập thiếu thông tin");
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  formRef.value?.resetFields?.();
  editingWeek.value = null;
  visible.value = false;
};

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.lecture_schedule.delete({ params: { Id: id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa thành công");
      pagination.current = 1;
      param.value.pageIndex = 1;
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (error) {
    message.error(error?.message || error?.value?.data?.message || "Xóa không thành công");
  } finally {
    await fetchData({ ...param.value });
  }
};

const confirmDelete = async record => {
  if (!canModify(record)) {
    message.warning("Chỉ được xóa lịch báo giảng chưa bắt đầu");
    return;
  }
  await deleteItem(record.id);
};

const resetForm = async () => {
  formRef.value?.resetFields?.();
  searchText.value = "";
  param.value.pageIndex = 1;
  param.value.pageSize = 10;
  delete param.value.search;
  pagination.current = 1;
  pagination.pageSize = 10;
  await fetchData({ ...param.value });
};

await fetchData({ ...param.value });

// Slip modal state and logic
const slipModal = reactive({ visible: false, loading: false, id_lbg: null, data: [], searchText: "" });
const slipPagination = reactive({ current: 1, pageSize: 10, total: 0, showSizeChanger: true, pageSizeOptions: ["1", "10", "20", "50"], showTotal: t => `Tổng ${t} bản ghi` });
const slipColumns = [
  { title: "STT", dataIndex: "stt", key: "stt", width: 60, align: "center" },
  { title: "Họ và tên giáo viên", dataIndex: "ten_giao_vien", key: "teacher_name" },
  { title: "Tuần", dataIndex: "tuan", key: "tuan", width: 80, align: "center", sorter: (a, b) => (Number(a?.tuan) || 0) - (Number(b?.tuan) || 0), sortDirections: ["ascend", "descend"] },
  { title: "Năm học", dataIndex: "ten_nam", key: "ten_nam_hoc", width: 140 },
  { title: "Từ ngày - Đến ngày", key: "date_range", width: 300 },
  { title: "Chức năng", key: "action", width: 120, align: "center" },
];

const fetchSlipData = async p => {
  try {
    slipModal.loading = true;
    const { data, error } = await RestApi.lecture_schedule.slip_list({ params: p });
    if (data.value?.status === "success") {
      slipModal.data = data.value?.data?.items || [];
      slipPagination.total = data.value?.data?.totalrecord || 0;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được danh sách phiếu");
    }
  } catch (err) {
    slipModal.data = [];
    slipPagination.total = 0;
    message.error(err.message || "Lỗi tải dữ liệu phiếu");
  } finally {
    slipModal.loading = false;
  }
};

const openSlipModal = async record => {
  slipModal.id_lbg = record?.id || null;
  slipPagination.current = 1;
  slipPagination.pageSize = 10;
  slipModal.searchText = "";
  slipModal.visible = true;
  await fetchSlipData({ pageIndex: 1, pageSize: 10, Idlbg: slipModal.id_lbg });
};
const closeSlipModal = () => {
  slipModal.visible = false;
};
const handleSlipTableChange = async pag => {
  slipPagination.current = pag.current;
  slipPagination.pageSize = pag.pageSize;
  const params = { pageIndex: pag.current, pageSize: pag.pageSize, Idlbg: slipModal.id_lbg };
  if (slipModal.searchText?.trim()) params.search = slipModal.searchText.trim();
  await fetchSlipData(params);
};
const handleSlipSearch = async () => {
  slipPagination.current = 1;
  const params = { pageIndex: 1, pageSize: slipPagination.pageSize, Idlbg: slipModal.id_lbg };
  const s = (slipModal.searchText || "").trim();
  if (s) params.search = s;
  await fetchSlipData(params);
};

// Detail modal state and logic
const detailModal = reactive({ visible: false, loading: false, header: { teacher: "", week: null, from: null, to: null }, data: null });
const detailColumns = [
  {
    title: "Thứ/Ngày",
    dataIndex: "day",
    key: "day",
    width: 90,
    customCell: record => ({ rowSpan: record?._rowspan_day ?? 1, class: "td-vertical" }),
  },
  {
    title: "Buổi",
    dataIndex: "session",
    key: "session",
    width: 60,
    align: "center",
    customCell: record => ({ rowSpan: record?._rowspan_session ?? 1, class: "td-vertical" }),
  },
  { title: "Tiết TKB", dataIndex: "tiet_tkb", key: "tiet_tkb", width: 80, align: "center" },
  { title: "Tiết PPCT", dataIndex: "tiet_ppct", key: "tiet_ppct", width: 90, align: "center" },
  { title: "Lớp", dataIndex: "ten_lop", key: "ten_lop", width: 80, align: "center" },
  { title: "Môn (Phân môn)", dataIndex: "mon_phanmon", key: "mon_phanmon", width: 200 },
  { title: "Nội dung bài học", dataIndex: "ten_bai", key: "ten_bai", width: 300 },
  { title: "Ghi chú", dataIndex: "ghi_chu", key: "ghi_chu", width: 120 },
];
const detailRows = ref([]);

const openSlipDetail = async record => {
  try {
    detailModal.visible = true;
    detailModal.loading = true;
    detailModal.header.teacher = record?.ten_giao_vien || "";
    detailModal.header.week = record?.tuan || null;
    detailModal.header.from = record?.tu_ngay || null;
    detailModal.header.to = record?.den_ngay || null;
    detailRows.value = [];
    const { data, error } = await RestApi.lecture_schedule.slip_detail({ params: { Idpbg: record?.id } });

    if (data.value?.status === "success") {
      const items = data.value?.data?.items || {};
      // teacher from API has priority
      detailModal.header.teacher = items?.ten_giao_vien || detailModal.header.teacher;
      const rows = [];
      (items?.lich_theo_ngay || []).forEach((d, di) => {
        const dayLabel = d?.ngay || "";
        const start = rows.length;
        (d?.buoi_hoc || []).forEach((s, si) => {
          const sessionLabel = s?.ten_buoi || "";
          const sessionStart = rows.length;
          (s?.cac_tiet_hoc || []).forEach((t, ti) => {
            const part = t?.phan_mon ? ` (${t?.phan_mon})` : "";
            rows.push({
              _k: `${di}-${si}-${ti}`,
              day: dayLabel,
              session: sessionLabel,
              tiet_tkb: t?.tiet_tkb ?? "",
              tiet_ppct: t?.tiet_ppct ?? "",
              ten_lop: t?.ten_lop || "",
              mon_phanmon: `${t?.ten_mon || ""}${part}`.trim(),
              ten_bai: t?.ten_bai || "",
              ghi_chu: t?.ghi_chu || "",
              _rowspan_day: 0,
              _rowspan_session: 0,
            });
          });
          const sessionEnd = rows.length;
          const scount = sessionEnd - sessionStart;
          if (scount > 0) {
            rows[sessionStart]._rowspan_session = scount;
            for (let i = sessionStart + 1; i < sessionEnd; i++) rows[i]._rowspan_session = 0;
          }
        });
        const end = rows.length;
        const count = end - start;
        if (count > 0) {
          rows[start]._rowspan_day = count;
          for (let i = start + 1; i < end; i++) rows[i]._rowspan_day = 0;
        }
      });
      detailRows.value = rows;
    } else {
      throw new Error(error.value?.data?.message || "Không tải được chi tiết phiếu");
    }
  } catch (err) {
    message.error(err.message || "Lỗi tải chi tiết");
  } finally {
    detailModal.loading = false;
  }
};

const closeDetailModal = () => {
  detailModal.visible = false;
};
</script>
