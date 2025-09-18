<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-1 space-y-4">
    <div>
      <SelectGradeLevelByUnit v-model="gradeId" />
      <a-card title="DANH SÁCH LỚP">
        <a-table :columns="columns" :data-source="classes" :loading="loading" :pagination="pagination" size="small" row-key="id" @change="handleTableChange" :customRow="onRow">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'stt'">
              {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
            </template>
            <template v-else-if="column.key === 'name'">{{ record.ten }}</template>
            <template v-else-if="column.key === 'teacher'">{{ record.ten_giao_vien }}</template>
            <template v-else-if="column.key === 'shift'">{{ record.ten_ca }}</template>
          </template>
        </a-table>
      </a-card>
    </div>
    <div class="col-span-2">
      <div class="overflow-x-auto">
        <a-card :title="'Danh sách môn học lớp: ' + selectedClass.ten">
          <a-table :columns="subjectColumns" :data-source="subjects" :loading="subjectLoading" :pagination="false" size="small" row-key="id_mon" :scroll="{ x: 'max-content' }">
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'stt'">{{ index + 1 }}</template>
              <template v-else-if="column.key === 'teacher'">
                <div class="flex items-center justify-between w-full">
                  <span>{{ record.ten_giao_vien }}</span>
                  <button v-if="record.trang_thai" class="text-blue-600 hover:text-blue-800 cursor-pointer" @click="openTeacherModal(record)">
                    <Icon name="ant-design:edit-outlined" />
                  </button>
                </div>
              </template>
              <template v-else-if="column.key === 'tradRoom'">
                <div class="flex items-center justify-between w-full">
                  <span>{{ record.ten_phong_truyen_thong }}</span>
                  <button v-if="record.trang_thai" class="text-blue-600 hover:text-blue-800 cursor-pointer" @click="openRoomModal(record, 'trad')">
                    <Icon name="ant-design:edit-outlined" />
                  </button>
                </div>
              </template>

              <template v-else-if="column.key === 'weekly'">
                {{ record.so_tiet_tuan > 0 ? record.so_tiet_tuan : "-" }}
              </template>
              <template v-else-if="column.key === 'tradMorning'">
                <template v-if="record.trang_thai">
                  <a-input-number v-model:value="record.so_tiet_ca_sang_truyen_thong" :min="0" size="small" style="width: 80px" @change="updateWeekly(record)" />
                </template>
                <template v-else>
                  {{ record.so_tiet_ca_sang_truyen_thong > 0 ? record.so_tiet_ca_sang_truyen_thong : "-" }}
                </template>
              </template>
              <template v-else-if="column.key === 'tradAfternoon'">
                <template v-if="record.trang_thai">
                  <a-input-number v-model:value="record.so_tiet_ca_chieu_truyen_thong" :min="0" size="small" style="width: 80px" @change="updateWeekly(record)" />
                </template>
                <template v-else>
                  {{ record.so_tiet_ca_chieu_truyen_thong > 0 ? record.so_tiet_ca_chieu_truyen_thong : "-" }}
                </template>
              </template>
              <template v-else-if="column.key === 'specRoom'">
                <div class="flex items-center justify-between w-full">
                  <span>{{ record.ten_phong_chuyen_dung }}</span>
                  <button v-if="record.trang_thai" class="text-blue-600 hover:text-blue-800 cursor-pointer" @click="openRoomModal(record, 'spec')">
                    <Icon name="ant-design:edit-outlined" />
                  </button>
                </div>
              </template>
              <template v-else-if="column.key === 'specMorning'">
                <template v-if="record.trang_thai">
                  <a-input-number v-model:value="record.so_tiet_ca_sang_phong_chuyen_dung" :min="0" size="small" style="width: 80px" @change="updateWeekly(record)" />
                </template>
                <template v-else>
                  {{ record.so_tiet_ca_sang_phong_chuyen_dung > 0 ? record.so_tiet_ca_sang_phong_chuyen_dung : "-" }}
                </template>
              </template>
              <template v-else-if="column.key === 'specAfternoon'">
                <template v-if="record.trang_thai">
                  <a-input-number v-model:value="record.so_tiet_ca_chieu_phong_chuyen_dung" :min="0" size="small" style="width: 80px" @change="updateWeekly(record)" />
                </template>
                <template v-else>
                  {{ record.so_tiet_ca_chieu_phong_chuyen_dung > 0 ? record.so_tiet_ca_chieu_phong_chuyen_dung : "-" }}
                </template>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-switch v-model:checked="record.trang_thai" size="small" @change="onStatusChange(record)" />
              </template>
            </template>
          </a-table>
          <div class="flex justify-end gap-2 mt-2">
            <a-button type="primary" :loading="saving" @click="handleSave">Lưu</a-button>
            <a-button danger @click="resetSubjects">Hủy</a-button>
          </div>
        </a-card>
      </div>
      <a-modal v-model:open="teacherModal.visible" title="Chọn giáo viên" :footer="null" width="600px" @cancel="cancelTeacher">
        <a-radio-group v-model:value="teacherModal.filter" @change="loadTeachers" class="mb-2">
          <a-radio-button value="subject"
            ><p class="uppercase">{{ teacherModal.record.ten_mon }}</p></a-radio-button
          >
          <a-radio-button value="all"><p class="uppercase">Tất cả giáo viên</p></a-radio-button>
        </a-radio-group>
        <a-table :columns="teacherColumns" :data-source="teacherModal.teachers" :loading="teacherModal.loading" :pagination="false" size="small" row-key="id" :row-selection="teacherRowSelection" />
        <div class="flex justify-end gap-2 mt-4">
          <a-button @click="cancelTeacher">Hủy</a-button>
          <a-button type="primary" @click="confirmTeacher">OK</a-button>
        </div>
      </a-modal>
      <a-modal v-model:open="roomModal.visible" title="Chọn phòng học" :footer="null" width="600px" @cancel="cancelRoom">
        <a-radio-group v-model:value="roomModal.filter" @change="loadRooms" class="mb-2">
          <a-radio-button value="all"><p class="uppercase">Tất cả</p></a-radio-button>
          <a-radio-button value="trad"><p class="uppercase">Phòng truyền thống</p></a-radio-button>
          <a-radio-button value="spec"><p class="uppercase">Phòng chuyên dụng</p></a-radio-button>
        </a-radio-group>
        <div class="mb-2">
          <a-button danger @click="noRoom">Không sử dụng phòng học</a-button>
        </div>
        <a-table :columns="roomColumns" :data-source="roomModal.rooms" :loading="roomModal.loading" :pagination="false" size="small" row-key="id" :row-selection="roomRowSelection" />
        <div class="flex justify-end gap-2 mt-4">
          <a-button @click="cancelRoom">Hủy</a-button>
          <a-button type="primary" @click="confirmRoom">OK</a-button>
        </div>
      </a-modal>
    </div>
  </div>
</template>

<script setup>
const { RestApi } = useApi();

const gradeId = ref(null);
const classes = ref([]);
const loading = ref(false);
const selectedClassId = ref(null);
const subjects = ref([]);
const subjectLoading = ref(false);
const saving = ref(false);
const subjectBackup = ref([]);

const teacherModal = reactive({
  visible: false,
  filter: "subject",
  loading: false,
  teachers: [],
  selectedId: null,
  record: null,
});

const roomModal = reactive({
  visible: false,
  filter: "all",
  loading: false,
  rooms: [],
  selectedId: null,
  type: "trad",
  record: null,
});

function updateWeekly(sub) {
  sub.so_tiet_tuan = (sub.so_tiet_ca_sang_truyen_thong || 0) + (sub.so_tiet_ca_chieu_truyen_thong || 0) + (sub.so_tiet_ca_sang_phong_chuyen_dung || 0) + (sub.so_tiet_ca_chieu_phong_chuyen_dung || 0);
}

function onStatusChange(sub) {
  if (!sub.trang_thai) {
    sub.so_tiet_ca_sang_truyen_thong = 0;
    sub.so_tiet_ca_chieu_truyen_thong = 0;
    sub.so_tiet_ca_sang_phong_chuyen_dung = 0;
    sub.so_tiet_ca_chieu_phong_chuyen_dung = 0;
  }
  updateWeekly(sub);
}

watch(
  subjects,
  val => {
    val.forEach(s => updateWeekly(s));
  },
  { deep: true },
);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Tên lớp", key: "name" },
  { title: "Giáo viên chủ nhiệm", key: "teacher" },
  { title: "Ca học", key: "shift" },
];

const subjectColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Tên môn", dataIndex: "ten_mon", key: "name" },
  { title: "Giáo viên", dataIndex: "ten_giao_vien", key: "teacher" },
  { title: "Số tiết/tuần", dataIndex: "so_tiet_tuan", key: "weekly", align: "center" },
  {
    title: "Phòng học truyền thống",
    children: [
      { title: "Phòng học", dataIndex: "ten_phong_truyen_thong", key: "tradRoom", align: "center" },
      { title: "Ca sáng", dataIndex: "so_tiet_ca_sang_truyen_thong", key: "tradMorning", align: "center" },
      { title: "Ca chiều", dataIndex: "so_tiet_ca_chieu_truyen_thong", key: "tradAfternoon", align: "center" },
    ],
  },
  {
    title: "Phòng bộ môn",
    children: [
      { title: "Phòng học", dataIndex: "ten_phong_chuyen_dung", key: "specRoom", align: "center" },
      { title: "Ca sáng", dataIndex: "so_tiet_ca_sang_phong_chuyen_dung", key: "specMorning", align: "center" },
      { title: "Ca chiều", dataIndex: "so_tiet_ca_chieu_phong_chuyen_dung", key: "specAfternoon", align: "center" },
    ],
  },
  { title: "Chọn", key: "action", width: 80, align: "center" },
];

const teacherColumns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã GV", dataIndex: "ma_giao_vien", key: "code" },
  {
    title: "Họ và tên",
    key: "name",
    customRender: ({ record }) => `${record.ho_va_ho_dem} ${record.ten}`,
  },
];

const roomColumns = [
  { title: "STT", dataIndex: "stt", key: "stt", width: 60, align: "center" },
  { title: "Phòng học", dataIndex: "ten", key: "name" },
  { title: "Ca sáng", dataIndex: "ca_sang", key: "morning", align: "center" },
  { title: "Ca chiều", dataIndex: "ca_chieu", key: "afternoon", align: "center" },
];

async function fetchClasses(id) {
  try {
    loading.value = true;
    const params = {
      PageIndex: pagination.current,
      PageSize: pagination.pageSize,
    };
    if (id) params.id_khoilop = id;
    const { data } = await RestApi.class.list({ params });
    if (data.value?.status === "success") {
      classes.value = data.value.data.items || [];
      pagination.total = data.value.data.totalrecord;
    } else {
      classes.value = [];
      pagination.total = 0;
    }
  } catch (err) {
    console.error("Fetch classes by grade error", err);
  } finally {
    loading.value = false;
  }
}

watch(
  gradeId,
  id => {
    pagination.current = 1;
    fetchClasses(id);
  },
  { immediate: true },
);

const reset = () => {
  gradeId.value = null;
  classes.value = [];
  selectedClassId.value = null;
  subjects.value = [];
  subjectBackup.value = [];
  pagination.current = 1;
  pagination.total = 0;
};

const refresh = async () => {
  await fetchClasses(gradeId.value);
  if (selectedClassId.value) {
    await fetchSubjects(selectedClassId.value);
  }
};

async function fetchSubjects(id) {
  if (!id) {
    subjects.value = [];
    return;
  }
  try {
    subjectLoading.value = true;
    const { data } = await RestApi.class.get_subjects({ params: { idLop: id } });
    if (data.value?.status === "success") {
      const list = data.value.data?.ds_mon || [];
      subjects.value = list.map(mon => ({
        ...mon,
        so_tiet_tuan: (mon.so_tiet_ca_sang_truyen_thong || 0) + (mon.so_tiet_ca_chieu_truyen_thong || 0) + (mon.so_tiet_ca_sang_phong_chuyen_dung || 0) + (mon.so_tiet_ca_chieu_phong_chuyen_dung || 0),
      }));
      subjectBackup.value = JSON.parse(JSON.stringify(subjects.value));
    } else {
      subjects.value = [];
      subjectBackup.value = [];
    }
  } catch (err) {
    console.error("Fetch subjects error", err);
  } finally {
    subjectLoading.value = false;
  }
}

function openTeacherModal(record) {
  teacherModal.record = record;
  teacherModal.visible = true;
  teacherModal.selectedId = record.id_giao_vien || null;
  teacherModal.filter = "subject";
  loadTeachers();
}

async function loadTeachers() {
  try {
    teacherModal.loading = true;
    const params = {};
    if (teacherModal.filter === "subject" && teacherModal.record) {
      params.idMon = teacherModal.record.id_mon;
    }
    const { data } = await RestApi.teacher.list({ params });
    if (data.value?.status === "success") {
      teacherModal.teachers = data.value.data.items || [];
    } else {
      teacherModal.teachers = [];
    }
  } catch (err) {
    console.error("Fetch teachers error", err);
  } finally {
    teacherModal.loading = false;
  }
}

function cancelTeacher() {
  teacherModal.visible = false;
}

function confirmTeacher() {
  if (!teacherModal.record) return;
  const t = teacherModal.teachers.find(tt => tt.id === teacherModal.selectedId);
  if (t) {
    teacherModal.record.id_giao_vien = t.id;
    teacherModal.record.ten_giao_vien = `${t.ho_va_ho_dem} ${t.ten}`;
  }
  teacherModal.visible = false;
}

const teacherRowSelection = computed(() => ({
  type: "radio",
  selectedRowKeys: teacherModal.selectedId ? [teacherModal.selectedId] : [],
  onChange: keys => {
    teacherModal.selectedId = keys[0];
  },
}));

const roomRowSelection = computed(() => ({
  type: "radio",
  selectedRowKeys: roomModal.selectedId ? [roomModal.selectedId] : [],
  onChange: keys => {
    roomModal.selectedId = keys[0];
  },
}));

function openRoomModal(record, type) {
  roomModal.record = record;
  roomModal.type = type;
  roomModal.visible = true;
  roomModal.selectedId = type === "trad" ? record.id_phong_truyen_thong : record.id_phong_chuyen_dung;
  roomModal.filter = type;
  loadRooms();
}

async function loadRooms() {
  try {
    roomModal.loading = true;
    const params = {};
    if (roomModal.filter === "trad") params.idLoaiPhonghoc = 1;
    else if (roomModal.filter === "spec") params.idLoaiPhonghoc = 2;
    const { data } = await RestApi.classroom.list({ params });
    if (data.value?.status === "success") {
      roomModal.rooms = data.value.data.items || [];
    } else {
      roomModal.rooms = [];
    }
  } catch (err) {
    console.error("Fetch classrooms error", err);
  } finally {
    roomModal.loading = false;
  }
}

function noRoom() {
  roomModal.selectedId = null;
}

function cancelRoom() {
  roomModal.visible = false;
}

function confirmRoom() {
  if (!roomModal.record) return;
  const r = roomModal.rooms.find(rr => rr.id === roomModal.selectedId);
  if (roomModal.type === "trad") {
    roomModal.record.id_phong_truyen_thong = r ? r.id : null;
    roomModal.record.ten_phong_truyen_thong = r ? r.ten : "";
  } else {
    roomModal.record.id_phong_chuyen_dung = r ? r.id : null;
    roomModal.record.ten_phong_chuyen_dung = r ? r.ten : "";
  }
  roomModal.visible = false;
}

async function handleTableChange(pag) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  await fetchClasses(gradeId.value);
}

function resetSubjects() {
  subjects.value = JSON.parse(JSON.stringify(subjectBackup.value));
}

async function handleSave() {
  if (!selectedClassId.value) return;
  try {
    saving.value = true;
    const payload = {
      id_lop: selectedClassId.value,
      ds_mon: subjects.value.map(mon => ({
        id_mon: mon.id_mon,
        trang_thai: mon.trang_thai,
        id_giao_vien: mon.id_giao_vien,
        id_phong_chuyen_dung: mon.id_phong_chuyen_dung,
        id_phong_truyen_thong: mon.id_phong_truyen_thong,
        so_tiet_ca_sang_truyen_thong: mon.so_tiet_ca_sang_truyen_thong,
        so_tiet_ca_chieu_truyen_thong: mon.so_tiet_ca_chieu_truyen_thong,
        so_tiet_ca_sang_phong_chuyen_dung: mon.so_tiet_ca_sang_phong_chuyen_dung,
        so_tiet_ca_chieu_phong_chuyen_dung: mon.so_tiet_ca_chieu_phong_chuyen_dung,
      })),
    };
    const { data, error } = await RestApi.class.update_subjects({ body: payload });
    if (data.value?.status === "success") {
      message.success(data.value.message || "Cập nhật thành công");
      subjectBackup.value = JSON.parse(JSON.stringify(subjects.value));
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Cập nhật không thành công");
    }
  } catch (err) {
    console.error("Update class subjects error", err);
    message.error(err.message || "Lỗi cập nhật");
  } finally {
    saving.value = false;
  }
}
const selectedClass = ref();
defineExpose({ reset, refresh });
const onRow = record => {
  return {
    onClick: () => {
      selectedClassId.value = record.id;
      selectedClass.value = record;
      fetchSubjects(record.id);
    },
    style: {
      cursor: "pointer",
    },
  };
};
</script>
