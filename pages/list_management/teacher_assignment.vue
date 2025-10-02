<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <h2 class="text-lg font-semibold mb-3 uppercase">Phân công chuyên môn theo giáo viên</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Left: Teacher list -->
      <a-card :title="'DANH SÁCH GIÁO VIÊN'">
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
        <!-- <template #extra>
          <a-space>
            <a-button type="primary" :loading="saving" @click="handleUpdate" :disabled="!selectedTeacher">Cập nhật</a-button>
          </a-space>
        </template> -->

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
      subjectRows.value = data.value.data || [];
    } else {
      subjectRows.value = [];
    }
  } catch (err) {
    console.error("Load teacher subjects error", err);
    subjectRows.value = [];
  }
}

const assignments = reactive({});

const classModal = reactive({ visible: false, loading: false, classes: [], selectedIds: [], record: null, title: "", search: "" });
const classColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Lớp học", dataIndex: "ten_lop", key: "ten_lop" },
  { title: "Số tiết", dataIndex: "tong_tiet", key: "tong_tiet", width: 90, align: "center" },
  { title: "Đã phân công", dataIndex: "ten_giao_vien", key: "ten_giao_vien" },
];

const classRowSelection = computed(() => ({
  selectedRowKeys: classModal.selectedIds,
  onChange: keys => (classModal.selectedIds = keys),
  type: "checkbox",
}));

const onClassRow = record => ({
  onClick: () => {
    const key = record.id_lop;
    const idx = classModal.selectedIds.findIndex(id => id === key);
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
      classModal.classes = data.value.data || [];
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
  const current = Array.isArray(subject.id_lop) ? subject.id_lop : [];
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
  const selected = classModal.classes.filter(c => classModal.selectedIds.includes(c.id_lop));
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
    const { data, error } = await RestApi.teacher.update_assignment({ body: subjectRows.value || [] });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Cập nhật thành công");
      await loadTeacherSubjects();
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Cập nhật không thành công");
    }
  } catch (error) {
    message.error(error?.message || error?.value?.data?.message || "Xóa không thành công ");
  } finally {
    saving.value = false;
  }
}

onMounted(fetchTeachers);
</script>

<style scoped>
:deep(.active-row > td) {
  background-color: #e6f7ff !important;
}
</style>
