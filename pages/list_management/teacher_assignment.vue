<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <h2 class="text-lg font-semibold mb-3 uppercase">Phân công chuyên môn theo giáo viên</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Left: Teacher list -->
      <a-card :title="'DANH SÁCH GIÁO VIÊN'">
        <template #extra>
          <a-button size="small" :loading="exporting" @click="exportAssignment">Xuất Excel</a-button>
        </template>
        <div class="flex items-center gap-2 mb-2">
          <SelectSubject v-model="selectedSubjectId" :multiple="false" label="" placeholder="-- Chọn môn học --" class="flex-1" />
        </div>
        <a-table :columns="teacherColumns" :data-source="teachers" :loading="loadingTeachers" :pagination="teacherPagination" size="small" row-key="id" @change="onTeacherTableChange" :customRow="onTeacherRow" :row-class-name="teacherRowClassName" bordered>
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'stt'">
              {{ (teacherPagination.current - 1) * teacherPagination.pageSize + index + 1 }}
            </template>
            <template v-else-if="column.key === 'name'"> {{ record.ho_va_ho_dem }} {{ record.ten }} </template>
            <template v-else-if="column.key === 'morning'">{{ record.ca_sang ?? 0 }}</template>
            <template v-else-if="column.key === 'afternoon'">{{ record.ca_chieu ?? 0 }}</template>
            <template v-else-if="column.key === 'total'">{{ (record.ca_sang || 0) + (record.ca_chieu || 0) }}</template>
          </template>
        </a-table>
      </a-card>

      <!-- Right: Assignment result -->
      <a-card :title="'KẾT QUẢ PHÂN CÔNG'">

        <div v-if="!selectedTeacher" class="text-gray-500">Vui lòng chọn một giáo viên bên trái.</div>

        <template v-else>
          <div class="mb-2 flex items-center justify-between">
            <a-radio-group v-model:value="mode" size="small" @change="loadTeacherSubjects">
              <a-radio value="subject">Theo chuyên môn</a-radio>
              <a-radio value="all">Theo tất cả các môn</a-radio>
            </a-radio-group>
          </div>
          <a-table :columns="subjectColumns" :data-source="subjectRows" :pagination="false" size="small" row-key="id_mon" bordered>
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'stt'">{{ index + 1 }}</template>
              <template v-else-if="column.key === 'action'">
                <a-button size="small" @click="openClassModal(record)">Chọn</a-button>
              </template>
            </template>
          </a-table>
        </template>
      </a-card>
    </div>

    <!-- Modal: pick classes for subject -->
    <a-modal v-model:open="classModal.visible" :title="classModal.title" :footer="null" width="800px" @cancel="cancelClassModal">
      <div class="mb-2 text-sm text-gray-600">
        <div>
          Môn đang phân công: <b>{{ classModal.record?.ten_mon }}</b>
        </div>
        <div>
          Giáo viên được phân công: <b>{{ selectedTeacher?.ho_va_ho_dem }} {{ selectedTeacher?.ten }}</b>
        </div>
      </div>
      <div class="mb-2 flex items-center gap-2">
        <a-button @click="resetClassSelection">Bỏ chọn</a-button>
      </div>
      <a-table :columns="classColumns" :data-source="classModal.classes" :loading="classModal.loading" :pagination="false" size="small" row-key="id_lop" :row-selection="classRowSelection" :customRow="onClassRow" bordered>
        <template #bodyCell="{ column, index }">
          <template v-if="column.key === 'stt'">{{ index + 1 }}</template>
        </template>
      </a-table>
      <div class="flex justify-end gap-2 mt-3">
        <a-button @click="cancelClassModal">Hủy</a-button>
        <a-button type="primary" :loading="saving" @click="confirmClassSelection">Lưu</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
const { RestApi } = useApi();

// API + state
const selectedSubjectId = ref(null);
const teachers = ref([]);
const loadingTeachers = ref(false);
const selectedTeacher = ref(null);
const teacherPagination = reactive({ current: 1, pageSize: 10, total: 0, showSizeChanger: true, pageSizeOptions: ["10", "20", "50"], showTotal: t => `Tổng ${t} bản ghi` });

const teacherColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Họ và tên", key: "name" },
  { title: "Ca sáng", key: "morning", width: 90, align: "center" },
  { title: "Ca chiều", key: "afternoon", width: 90, align: "center" },
  { title: "Tổng số", key: "total", width: 90, align: "center" },
];

async function fetchTeachers() {
  try {
    loadingTeachers.value = true;
    const params = { PageIndex: teacherPagination.current, PageSize: teacherPagination.pageSize };
    if (selectedSubjectId.value) params.idMon = selectedSubjectId.value;
    const { data } = await RestApi.teacher.list({ params });
    if (data.value?.status === "success") {
      teachers.value = data.value.data.items || [];
      teacherPagination.total = data.value.data.totalrecord || 0;
    } else {
      teachers.value = [];
      teacherPagination.total = 0;
    }
  } catch (err) {
    console.error("Fetch teachers error", err);
    teachers.value = [];
  } finally {
    loadingTeachers.value = false;
  }
}

function onTeacherTableChange(pag) {
  teacherPagination.current = pag.current;
  teacherPagination.pageSize = pag.pageSize;
  fetchTeachers();
}

watch(selectedSubjectId, () => {
  teacherPagination.current = 1;
  fetchTeachers();
});

const onTeacherRow = record => ({
  onClick: () => {
    selectedTeacher.value = record;
    loadTeacherSubjects();
  },
  style: { cursor: "pointer" },
});
const teacherRowClassName = record => (selectedTeacher.value && record.id === selectedTeacher.value.id ? "active-row" : "");

// Right: subject list
const mode = ref("subject"); // 'subject' | 'all'
const subjectRows = ref([]);
const saving = ref(false);
const exporting = ref(false);
const subjectColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Tên môn", dataIndex: "ten_mon", key: "name" },
  { title: "Danh sách lớp", key: "ten_lop", dataIndex: "ten_lop", ellipsis: true },
  { title: "Chọn lớp", key: "action", width: 100, align: "center" },
];

async function loadTeacherSubjects() {
  if (!selectedTeacher.value) return;
  try {
    const type = mode.value === "subject" ? 1 : 2;
    const { data } = await RestApi.teacher.get_assignment({ params: { idgv: selectedTeacher.value.id, type } });
    if (data.value?.status === "success") {
      const rows = data.value.data || [];
      subjectRows.value = rows.map(item => ({
        ...item,
        id_giao_vien: selectedTeacher.value.id,
        id_gv: selectedTeacher.value.id,
        idgv: selectedTeacher.value.id,
        id_lop: Array.isArray(item.id_lop)
          ? item.id_lop
          : (typeof item.id_lop === "string" && item.id_lop
              ? item.id_lop.split(",").map(s => Number(s.trim()) || s.trim()).filter(Boolean)
              : []),
      }));
    } else {
      subjectRows.value = [];
    }
  } catch (err) {
    console.error("Load teacher subjects error", err);
    subjectRows.value = [];
  }
}

const assignments = reactive({});
const sortClass = (a, b) => (a.ten_lop || "").localeCompare(b.ten_lop || "", "vi", { numeric: true, sensitivity: "base" });

const classModal = reactive({ visible: false, loading: false, classes: [], selectedIds: [], record: null, title: "", search: "" });
const classColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  {
    title: "Lớp học",
    dataIndex: "ten_lop",
    key: "ten_lop",
    sorter: (a, b) => sortClass(a, b),
  },
  {
    title: "Số tiết",
    dataIndex: "tong_tiet",
    key: "tong_tiet",
    width: 90,
    align: "center",
    sorter: (a, b) => (Number(a.tong_tiet) || 0) - (Number(b.tong_tiet) || 0),
  },
  {
    title: "Đã phân công",
    dataIndex: "ten_giao_vien",
    key: "ten_giao_vien",
    sorter: (a, b) => (a.ten_giao_vien || "").localeCompare(b.ten_giao_vien || "", "vi"),
  },
];

const classRowSelection = computed(() => ({
  selectedRowKeys: classModal.selectedIds,
  onChange: keys => (classModal.selectedIds = keys),
  type: "checkbox",
}));

const onClassRow = record => ({
  onClick: e => {
    if (e?.target?.closest?.(".ant-table-selection-column") || e?.target?.closest?.(".ant-checkbox-wrapper")) {
      return;
    }
    const key = record.id_lop;
    const idx = classModal.selectedIds.findIndex(id => String(id) === String(key));
    if (idx >= 0) classModal.selectedIds.splice(idx, 1);
    else classModal.selectedIds.push(key);
  },
  style: { cursor: "pointer" },
});

async function loadClasses() {
  try {
    classModal.loading = true;
    const idgv = selectedTeacher.value?.id;
    const idmon = classModal.record?.id_mon;
    if (!idgv || !idmon) {
      classModal.classes = [];
      return;
    }
    const { data } = await RestApi.teacher.get_assignment_classes({ params: { idgv, idmon } });
    if (data.value?.status === "success") {
      const items = data.value.data || [];
      classModal.classes = [...items].sort(sortClass);

      // Pre-select classes if selectedIds is empty
      if (classModal.selectedIds.length === 0) {
        const teacherFullName = `${selectedTeacher.value?.ho_va_ho_dem || ""} ${selectedTeacher.value?.ten || ""}`.trim().toLowerCase();
        const preSelected = items
          .filter(c =>
            (c.id_giao_vien && idgv && c.id_giao_vien == idgv) ||
            (c.id_gv && idgv && c.id_gv == idgv) ||
            (c.ten_giao_vien && c.ten_giao_vien.trim().toLowerCase() === teacherFullName)
          )
          .map(c => c.id_lop);
        if (preSelected.length > 0) {
          classModal.selectedIds = preSelected;
          if (classModal.record) {
            classModal.record.id_lop = preSelected;
          }
        }
      }
    } else {
      classModal.classes = [];
    }
  } catch (err) {
    console.error("Fetch assignment classes error", err);
    classModal.classes = [];
  } finally {
    classModal.loading = false;
  }
}

function openClassModal(subject) {
  if (!selectedTeacher.value) return;
  classModal.record = subject;
  classModal.title = `Danh sách lớp`;
  const current = Array.isArray(subject.id_lop)
    ? subject.id_lop
    : (typeof subject.id_lop === "string" && subject.id_lop
        ? subject.id_lop.split(",").map(s => Number(s.trim()) || s.trim()).filter(Boolean)
        : []);
  classModal.selectedIds = [...current];
  classModal.visible = true;
  loadClasses();
}

function cancelClassModal() {
  classModal.visible = false;
}

function resetClassSelection() {
  classModal.selectedIds = [];
}

async function confirmClassSelection() {
  if (!selectedTeacher.value || !classModal.record) return;
  const selected = classModal.classes
    .filter(c => classModal.selectedIds.some(id => String(id) === String(c.id_lop)))
    .sort(sortClass);
  // Update the active subject row: id_lop array and ten_lop string
  classModal.record.id_lop = selected.map(c => c.id_lop);
  classModal.record.ten_lop = selected.map(c => c.ten_lop).join(", ");
  // Keep internal assignments map in sync (if used elsewhere)
  const list = selected.map(c => ({ id: c.id_lop, ten: c.ten_lop }));
  assignments[selectedTeacher.value.id] = assignments[selectedTeacher.value.id] || {};
  assignments[selectedTeacher.value.id][classModal.record.id_mon] = list;
  // Save immediately after confirming
  await handleUpdate();
  classModal.visible = false;
}

async function handleUpdate() {
  if (!selectedTeacher.value) return;
  try {
    saving.value = true;
    const preparedRows = (subjectRows.value || []).map(row => ({
      ...row,
      id_giao_vien: selectedTeacher.value.id,
      id_gv: selectedTeacher.value.id,
      idgv: selectedTeacher.value.id,
      id_lop: Array.isArray(row.id_lop)
        ? row.id_lop.map(id => Number(id) || id)
        : (typeof row.id_lop === "string" && row.id_lop.trim()
            ? row.id_lop.split(",").map(s => Number(s.trim()) || s.trim()).filter(Boolean)
            : []),
    }));

    const { data, error } = await RestApi.teacher.update_assignment({
      params: { idgv: selectedTeacher.value.id },
      body: preparedRows,
    });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Cập nhật thành công");
      await loadTeacherSubjects();
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Cập nhật không thành công");
    }
  } catch (error) {
    console.error("Update teacher assignment error", error);
    message.error(error?.message || error?.value?.data?.message || "Cập nhật không thành công");
  } finally {
    saving.value = false;
  }
}

const exportFile = async apiFn => {
  try {
    exporting.value = true;
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
    const filename = (cd && (decodeURIComponent(/filename\*=UTF-8''([^;]+)/.exec(cd)?.[1] || "") || /filename="([^"]+)"/.exec(cd)?.[1])) || "phanconggv.xlsx";
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    message.error(error?.message || "Xuất file không thành công");
  } finally {
    exporting.value = false;
  }
};

const exportAssignment = async () => {
  const type = mode.value === "subject" ? 1 : 2;
  const params = { type };
  if (selectedTeacher.value?.id) params.idgv = selectedTeacher.value.id;
  await exportFile(() => RestApi.teacher.export_assignment({ params }));
};

onMounted(fetchTeachers);
</script>

<style scoped>
:deep(.active-row > td) {
  background-color: #e6f7ff !important;
}
</style>
