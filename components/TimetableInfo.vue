<script setup>
const props = defineProps({
  timetableId: {
    type: [Number, String],
    required: true,
  },
});

const { RestApi } = useApi();

const info = reactive({
  ten: "",
  tong_tat_ca_tiet: 0,
  tong_tiet_da_xep: 0,
  tong_tiet_chua_xep: 0,
});

const totalLessons = computed(() => info.tong_tat_ca_tiet);
const arrangedLessons = computed(() => info.tong_tiet_da_xep);
const unarrangedLessons = computed(() => info.tong_tiet_chua_xep);

const settingStore = useSettingStore();
const stringSorter = key => (a, b) => (a[key] || "").localeCompare(b[key] || "");
const numberSorter = key => (a, b) => (a[key] ?? 0) - (b[key] ?? 0);
const subjectModal = reactive({
  visible: false,
  loading: false,
  data: [],
  selectedRowKeys: [],
});
const subjectColumns = [
  { title: "Tên môn học", dataIndex: "ten", sorter: stringSorter("ten") },
  { title: "Tổng tiết", dataIndex: "tong_tiet", sorter: numberSorter("tong_tiet") },
  { title: "Tiết chưa xếp", dataIndex: "tiet_chua_xep", sorter: numberSorter("tiet_chua_xep") },
  { title: "Tiết đã xếp", dataIndex: "tiet_da_xep", sorter: numberSorter("tiet_da_xep") },
];
const subjectRowSelection = computed(() => ({
  selectedRowKeys: subjectModal.selectedRowKeys,
  onChange: keys => (subjectModal.selectedRowKeys = keys),
}));

const teacherModal = reactive({
  visible: false,
  loading: false,
  data: [],
  selectedRowKeys: [],
});
const teacherColumns = [
  { title: "Tên giáo viên", dataIndex: "ho_ten", sorter: stringSorter("ho_ten") },
  { title: "Tổng tiết", dataIndex: "tong_tiet", sorter: numberSorter("tong_tiet") },
  { title: "Tiết chưa xếp", dataIndex: "tiet_chua_xep", sorter: numberSorter("tiet_chua_xep") },
  { title: "Tiết đã xếp", dataIndex: "tiet_da_xep", sorter: numberSorter("tiet_da_xep") },
];
const teacherRowSelection = computed(() => ({
  selectedRowKeys: teacherModal.selectedRowKeys,
  onChange: keys => (teacherModal.selectedRowKeys = keys),
}));

const classModal = reactive({
  visible: false,
  loading: false,
  data: [],
  selectedRowKeys: [],
});
const classColumns = [
  { title: "Tên lớp", dataIndex: "ten", sorter: stringSorter("ten") },
  { title: "Tổng tiết", dataIndex: "tong_tiet", sorter: numberSorter("tong_tiet") },
  { title: "Tiết chưa xếp", dataIndex: "tiet_chua_xep", sorter: numberSorter("tiet_chua_xep") },
  { title: "Tiết đã xếp", dataIndex: "tiet_da_xep", sorter: numberSorter("tiet_da_xep") },
];
const classRowSelection = computed(() => ({
  selectedRowKeys: classModal.selectedRowKeys,
  onChange: keys => (classModal.selectedRowKeys = keys),
}));

const classSubjectModal = reactive({
  visible: false,
  loading: false,
  data: [],
  selectedRowKeys: [],
});
const classSubjectColumns = [
  { title: "Tên lớp/Môn", dataIndex: "name", sorter: stringSorter("name") },
  { title: "Tổng tiết", dataIndex: "tong_tiet", sorter: numberSorter("tong_tiet") },
  { title: "Tiết chưa xếp", dataIndex: "tiet_chua_xep", sorter: numberSorter("tiet_chua_xep") },
  { title: "Tiết đã xếp", dataIndex: "tiet_da_xep", sorter: numberSorter("tiet_da_xep") },
];
const classSubjectRowSelection = computed(() => ({
  selectedRowKeys: classSubjectModal.selectedRowKeys,
  onChange: keys => (classSubjectModal.selectedRowKeys = keys),
  getCheckboxProps: record => ({ disabled: record.type === "class" }),
}));

const roomModal = reactive({
  visible: false,
  loading: false,
  data: [],
  selectedRowKeys: [],
});
const roomColumns = [
  { title: "Tên phòng học", dataIndex: "ten", sorter: stringSorter("ten") },
  { title: "Tổng tiết", dataIndex: "tong_tiet", sorter: numberSorter("tong_tiet") },
  { title: "Tiết chưa xếp", dataIndex: "tiet_chua_xep", sorter: numberSorter("tiet_chua_xep") },
  { title: "Tiết đã xếp", dataIndex: "tiet_da_xep", sorter: numberSorter("tiet_da_xep") },
];
const roomRowSelection = computed(() => ({
  selectedRowKeys: roomModal.selectedRowKeys,
  onChange: keys => (roomModal.selectedRowKeys = keys),
}));

const fetchSubjectLessons = async () => {
  subjectModal.loading = true;
  try {
    const { data, error } = await RestApi.timetable.subject_list({
      params: { idtkb: props.timetableId },
    });
    if (error.value) {
      throw new Error(error.value?.data?.message || "Không thể tải danh sách môn học");
    }
    subjectModal.data = data.value?.data || [];
  } catch (err) {
    message.error(err.message || "Không thể tải danh sách môn học");
  } finally {
    subjectModal.loading = false;
  }
};
const openSubjectModal = async () => {
  await fetchSubjectLessons();
  subjectModal.visible = true;
};
const confirmArrangeSubject = async () => {
  if (!subjectModal.selectedRowKeys.length) {
    subjectModal.visible = false;
    return;
  }
  subjectModal.loading = true;
  try {
    const { data, error } = await RestApi.timetable.arrange_subject({
      body: { id_tkb: props.timetableId, ids: subjectModal.selectedRowKeys },
    });
    if (error.value || data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || data.value?.message || "Xếp môn học không thành công");
    }
    message.success(data.value.message || data.value.data || "");
    subjectModal.visible = false;
    subjectModal.selectedRowKeys = [];
    await fetchInfo();
  } catch (err) {
    message.error(err.message || "Xếp môn học không thành công");
  } finally {
    subjectModal.loading = false;
  }
};

const fetchTeacherLessons = async () => {
  teacherModal.loading = true;
  try {
    const { data, error } = await RestApi.timetable.teacher_list({
      params: { idtkb: props.timetableId },
    });
    if (error.value) {
      throw new Error(error.value?.data?.message || "Không thể tải danh sách giáo viên");
    }
    teacherModal.data = data.value?.data || [];
  } catch (err) {
    message.error(err.message || "Không thể tải danh sách giáo viên");
  } finally {
    teacherModal.loading = false;
  }
};
const openTeacherModal = async () => {
  await fetchTeacherLessons();
  teacherModal.visible = true;
};
const confirmArrangeTeacher = async () => {
  if (!teacherModal.selectedRowKeys.length) {
    teacherModal.visible = false;
    return;
  }
  teacherModal.loading = true;
  try {
    const { data, error } = await RestApi.timetable.arrange_teacher({
      body: { id_tkb: props.timetableId, ids: teacherModal.selectedRowKeys },
    });
    if (error.value || data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || data.value?.message || "Xếp giáo viên không thành công");
    }
    message.success(data.value.message || data.value.data || "");
    teacherModal.visible = false;
    teacherModal.selectedRowKeys = [];
    await fetchInfo();
  } catch (err) {
    message.error(err.message || "Xếp giáo viên không thành công");
  } finally {
    teacherModal.loading = false;
  }
};

const fetchClassLessons = async () => {
  classModal.loading = true;
  try {
    const { data, error } = await RestApi.timetable.class_list({
      params: { idtkb: props.timetableId },
    });
    if (error.value) {
      throw new Error(error.value?.data?.message || "Không thể tải danh sách lớp");
    }
    classModal.data = data.value?.data || [];
  } catch (err) {
    message.error(err.message || "Không thể tải danh sách lớp");
  } finally {
    classModal.loading = false;
  }
};
const openClassModal = async () => {
  await fetchClassLessons();
  classModal.visible = true;
};
const confirmArrangeClass = async () => {
  if (!classModal.selectedRowKeys.length) {
    classModal.visible = false;
    return;
  }
  classModal.loading = true;
  try {
    const { data, error } = await RestApi.timetable.arrange_class({
      body: { id_tkb: props.timetableId, ids: classModal.selectedRowKeys },
    });
    if (error.value || data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || data.value?.message || "Xếp lớp không thành công");
    }
    message.success(data.value.message || data.value.data || "");
    classModal.visible = false;
    classModal.selectedRowKeys = [];
    await fetchInfo();
  } catch (err) {
    message.error(err.message || "Xếp lớp không thành công");
  } finally {
    classModal.loading = false;
  }
};

const fetchClassSubjectLessons = async () => {
  classSubjectModal.loading = true;
  try {
    const { data, error } = await RestApi.timetable.class_subject_list({
      params: { idtkb: props.timetableId },
    });
    if (error.value) {
      throw new Error(error.value?.data?.message || "Không thể tải danh sách lớp - môn");
    }
    const resp = data.value?.data || [];
    classSubjectModal.data = resp.map(cls => ({
      key: `class-${cls.id_lop}`,
      type: "class",
      name: cls.ten_lop,
      id_lop: cls.id_lop,
      ten_lop: cls.ten_lop,
      children:
        cls.ds_mon?.map(sub => ({
          key: `${cls.id_lop}-${sub.id_mon}`,
          type: "subject",
          name: sub.ten_mon,
          id_lop: cls.id_lop,
          ten_lop: cls.ten_lop,
          id_mon: sub.id_mon,
          ten_mon: sub.ten_mon,
          tong_tiet: sub.tong_tiet,
          tiet_chua_xep: sub.tiet_chua_xep,
          tiet_da_xep: sub.tiet_da_xep,
        })) || [],
    }));
  } catch (err) {
    message.error(err.message || "Không thể tải danh sách lớp - môn");
  } finally {
    classSubjectModal.loading = false;
  }
};
const openClassSubjectModal = async () => {
  await fetchClassSubjectLessons();
  classSubjectModal.visible = true;
};
const confirmArrangeClassSubject = async () => {
  if (!classSubjectModal.selectedRowKeys.length) {
    classSubjectModal.visible = false;
    return;
  }
  classSubjectModal.loading = true;
  try {
    const selected = [];
    classSubjectModal.data.forEach(cls => {
      const selectedSubs = cls.children?.filter(ch => classSubjectModal.selectedRowKeys.includes(ch.key)) || [];
      if (selectedSubs.length) {
        selected.push({
          id_lop: cls.id_lop,
          ten_lop: cls.ten_lop,
          ds_mon: selectedSubs.map(({ id_mon, ten_mon, tong_tiet, tiet_chua_xep, tiet_da_xep }) => ({
            id_mon,
            ten_mon,
            tong_tiet,
            tiet_chua_xep,
            tiet_da_xep,
          })),
        });
      }
    });
    const { data, error } = await RestApi.timetable.arrange_class_subject({
      params: { idtkb: props.timetableId },
      body: selected,
    });
    if (error.value || data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || data.value?.message || "Xếp Lớp - Môn không thành công");
    }
    message.success(data.value.message || data.value.data || "");
    classSubjectModal.visible = false;
    classSubjectModal.selectedRowKeys = [];
    await fetchInfo();
  } catch (err) {
    message.error(err.message || "Xếp Lớp - Môn không thành công");
  } finally {
    classSubjectModal.loading = false;
  }
};

const fetchRoomLessons = async () => {
  roomModal.loading = true;
  try {
    const { data, error } = await RestApi.timetable.room_list({
      params: { idtkb: props.timetableId },
    });
    if (error.value) {
      throw new Error(error.value?.data?.message || "Không thể tải danh sách phòng học");
    }
    roomModal.data = data.value?.data || [];
  } catch (err) {
    message.error(err.message || "Không thể tải danh sách phòng học");
  } finally {
    roomModal.loading = false;
  }
};
const openRoomModal = async () => {
  await fetchRoomLessons();
  roomModal.visible = true;
};
const confirmArrangeRoom = async () => {
  if (!roomModal.selectedRowKeys.length) {
    roomModal.visible = false;
    return;
  }
  roomModal.loading = true;
  try {
    const { data, error } = await RestApi.timetable.arrange_room({
      body: { id_tkb: props.timetableId, ids: roomModal.selectedRowKeys },
    });
    if (error.value || data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || data.value?.message || "Xếp phòng học không thành công");
    }
    message.success(data.value.message || data.value.data || "");
    roomModal.visible = false;
    roomModal.selectedRowKeys = [];
    await fetchInfo();
  } catch (err) {
    message.error(err.message || "Xếp phòng học không thành công");
  } finally {
    roomModal.loading = false;
  }
};
const arrangeFunctionRoom = async () => {
  settingStore.setLoading(true);
  try {
    const { data, error } = await RestApi.timetable.arrange_function_room({
      params: { idtkb: props.timetableId },
    });
    if (error.value || data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || data.value?.message || "Xếp phòng chức năng không thành công");
    }
    message.success(data.value.message || data.value.data || "");
    await fetchInfo();
  } catch (err) {
    message.error(err.message || "Xếp phòng chức năng không thành công");
  } finally {
    settingStore.setLoading(false);
  }
};

const arrangeGvcn = async () => {
  settingStore.setLoading(true);
  try {
    const { data, error } = await RestApi.timetable.arrange_gvcn({
      params: { idtkb: props.timetableId },
    });
    if (error.value || data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || data.value?.message || "Xếp GVCN không thành công");
    }
    message.success(data.value.message || data.value.data || "");
    await fetchInfo();
  } catch (err) {
    message.error(err.message || "Xếp GVCN không thành công");
  } finally {
    settingStore.setLoading(false);
  }
};
const arrangeAll = async () => {
  settingStore.setLoading(true);
  try {
    const { data, error } = await RestApi.timetable.arrange_all({
      params: { Idtkb: props.timetableId },
    });
    if (error.value || data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || data.value?.message || "Xếp thời khóa biểu không thành công");
    }
    message.success(data.value.data || "");
  } catch (err) {
    message.error(err.message || "Xếp thời khóa biểu không thành công");
  } finally {
    await fetchInfo();
    settingStore.setLoading(false);
  }
};

const arrangePartial = type => {
  // 'Xếp Phòng chức năng', 'Xếp GVCN', 'Xếp Môn học', 'Xếp Giáo viên', 'Xếp Nhóm', 'Xếp Lớp', 'Xếp Lớp - Môn', 'Xếp Khối - Môn', 'Xếp Phòng học'
  // console.log("Xếp cục bộ:", type);
  switch (type) {
    case "Xếp Phòng chức năng":
      arrangeFunctionRoom();
      break;
    case "Xếp GVCN":
      arrangeGvcn();
      break;
    case "Xếp Môn học":
      openSubjectModal();
      break;
    case "Xếp Giáo viên":
      openTeacherModal();
      break;
    case "Xếp Nhóm":
      console.log("Thực hiện xếp Nhóm");
      break;
    case "Xếp Lớp":
      openClassModal();
      break;
    case "Xếp Lớp - Môn":
      openClassSubjectModal();
      break;
    case "Xếp Khối - Môn":
      console.log("Thực hiện xếp Khối - Môn");
      break;
    case "Xếp Phòng học":
      openRoomModal();
      break;
    default:
      console.log("Chức năng không hợp lệ");
  }
};

const cancelArrange = async () => {
  settingStore.setLoading(true);
  try {
    const { data, error } = await RestApi.timetable.cancel_result({
      params: { Id: props.timetableId },
    });
    if (error.value || data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || data.value?.message || "Hủy kết quả xếp không thành công");
    }
    message.success(data.value.data || "");
  } catch (err) {
    message.error(err.message || "Hủy kết quả xếp không thành công");
  } finally {
    await fetchInfo();
    settingStore.setLoading(false);
  }
};

const exportFile = async (apiFn, key) => {
  // Keep global loading for consistency if used elsewhere
  settingStore.setLoading(true);
  if (key) exportModal.loadingKey = key;
  try {
    const { data, error } = await apiFn();
    if (error.value) {
      throw new Error(error.value?.data?.message || "Xuất file không thành công");
    }
    const { blob: blobData, headers } = data.value || {};
    if (!blobData) {
      throw new Error("Xuất file không thành công");
    }
    const blob = blobData instanceof Blob ? blobData : new Blob([blobData]);
    const cd = headers["content-disposition"] || headers["Content-Disposition"];
    const filename = (cd && (decodeURIComponent(/filename\*=UTF-8''([^;]+)/.exec(cd)?.[1] || "") || /filename="([^"]+)"/.exec(cd)?.[1])) || "export.xlsx";
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
    if (key) exportModal.loadingKey = null;
  }
};

const exportClass = () => exportFile(() => RestApi.timetable.export_class({ params: { idtkb: props.timetableId } }), 'class');
const exportTeacher = () => exportFile(() => RestApi.timetable.export_teacher({ params: { idtkb: props.timetableId } }), 'teacher');
const exportTkb = () => exportFile(() => RestApi.timetable.export({ params: { idtkb: props.timetableId } }), 'school');

// Export modal state + helpers
const exportModal = reactive({
  visible: false,
  loadingKey: null, // 'class' | 'school' | 'teacher' | null
  options: {
    class: { showRoom: false, showTeacher: false },
    school: { showRoom: false, showTeacher: false },
    teacher: { showRoom: false },
  },
});

const openExportModal = () => {
  exportModal.visible = true;
  exportModal.loadingKey = null;
  // reset options each open
  exportModal.options.class.showRoom = false;
  exportModal.options.class.showTeacher = false;
  exportModal.options.school.showRoom = false;
  exportModal.options.school.showTeacher = false;
  exportModal.options.teacher.showRoom = false;
};
const closeExportModal = () => {
  exportModal.visible = false;
  exportModal.loadingKey = null;
};

const exportAllWithOptions = () =>
  exportFile(
    () =>
    RestApi.timetable.export({
      params: {
        idtkb: props.timetableId,
        show_room: exportModal.options.school.showRoom ? 1 : 0,
        show_teacher: exportModal.options.school.showTeacher ? 1 : 0,
      },
    }),
    'school',
  );
const exportClassWithOptions = () =>
  exportFile(
    () =>
    RestApi.timetable.export_class({
      params: {
        idtkb: props.timetableId,
        show_room: exportModal.options.class.showRoom ? 1 : 0,
        show_teacher: exportModal.options.class.showTeacher ? 1 : 0,
      },
    }),
    'class',
  );
const exportTeacherWithOptions = () =>
  exportFile(
    () =>
    RestApi.timetable.export_teacher({
      params: {
        idtkb: props.timetableId,
        show_room: exportModal.options.teacher.showRoom ? 1 : 0,
      },
    }),
    'teacher',
  );
const notifyUpdating = () => message.info("Tính năng đang phát triển");

async function fetchInfo() {
  // if (!props.timetableId) return;
  // settingStore.setLoading(true);
  try {
    const { data, error } = await RestApi.timetable.detail({
      params: { Id: props.timetableId },
    });
    if (error.value) {
      message.error(error.value?.data?.message || "Không thể tải thông tin thời khóa biểu");
      reset();
      return;
    }
    if (data.value?.status === "success") {
      Object.assign(info, data.value.data || {});
    } else {
      reset();
    }
  } catch (err) {
    message.error(err.message || "Không thể tải thông tin thời khóa biểu");
  }
  // settingStore.setLoading(false);
}

function reset() {
  Object.assign(info, {
    ten: "",
    tong_tat_ca_tiet: 0,
    tong_tiet_da_xep: 0,
    tong_tiet_chua_xep: 0,
  });
}

async function refresh() {
  await fetchInfo();
}

// watch(() => props.timetableId, await fetchInfo(), { immediate: true });
onMounted(fetchInfo);
watch(() => props.timetableId, fetchInfo);
defineExpose({ refresh, reset });
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <div class="flex justify-end items-center mb-6">
      <a-button class="mr-2" @click="openExportModal"> Xuất dữ liệu XLSX </a-button>
      <a-button type="primary" danger @click="cancelArrange"> Hủy kết quả xếp </a-button>
    </div>

    <!-- Info Section -->
    <div class="bg-white p-4 rounded-md shadow-lg mb-8">
      <p class="mb-2">
        <span class="font-semibold">Tên thời khóa biểu:</span>
        <span class="ml-2">{{ info.ten }}</span>
      </p>
      <p class="mb-2">
        <span class="font-semibold">Tổng số tiết: </span>
        <span class="ml-2 text-blue-500">{{ totalLessons }} tiết</span>
      </p>
      <p class="mb-2">
        <span class="font-semibold">Tiết đã xếp: </span>
        <span class="ml-2 text-green-500">{{ arrangedLessons }} tiết</span>
      </p>
      <p>
        <span class="font-semibold">Tiết chưa xếp: </span>
        <span class="ml-2 text-red-500">{{ unarrangedLessons }} tiết</span>
      </p>
    </div>

    <!-- Action Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Xếp toàn trường -->
      <div class="bg-white p-4 rounded-md shadow-lg flex flex-col items-center">
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Xếp toàn trường <span class="text-sm text-gray-500">(Xếp tự động)</span></h2>
        <a-button type="primary" class="bg-green-500 border-green-500" @click="arrangeAll"> Xếp Thời khóa biểu </a-button>
      </div>

      <!-- Xếp cục bộ -->
      <div class="bg-white p-4 rounded-md shadow-lg col-span-2">
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Xếp cục bộ <span class="text-sm text-gray-500">(Xếp từng phần)</span></h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <!-- <a-button v-for="btn in ['Xếp Phòng chức năng', 'Xếp GVCN', 'Xếp Môn học', 'Xếp Giáo viên', 'Xếp Lớp', 'Xếp Phòng học', 'Xếp Lớp - Môn', 'Xếp Khối - Môn', 'Xếp Nhóm']" :key="btn" type="primary" class="bg-blue-500 border-blue-500" @click="arrangePartial(btn)">
            {{ btn }}
          </a-button> -->
          <a-button v-for="btn in ['Xếp Phòng chức năng', 'Xếp GVCN', 'Xếp Môn học', 'Xếp Giáo viên', 'Xếp Lớp', 'Xếp Phòng học', 'Xếp Lớp - Môn']" :key="btn" type="primary" class="bg-blue-500 border-blue-500" @click="arrangePartial(btn)">
            {{ btn }}
          </a-button>
        </div>
      </div>
    </div>
    <a-modal v-model:open="subjectModal.visible" title="Xếp Môn học" :confirm-loading="subjectModal.loading" @ok="confirmArrangeSubject" @cancel="subjectModal.visible = false" width="800px">
      <a-table :columns="subjectColumns" :data-source="subjectModal.data" :row-selection="subjectRowSelection" row-key="id" :pagination="false" :scroll="{ y: 600 }" size="small" />
    </a-modal>
    <a-modal v-model:open="teacherModal.visible" title="Xếp Giáo viên" :confirm-loading="teacherModal.loading" @ok="confirmArrangeTeacher" @cancel="teacherModal.visible = false" width="800px">
      <a-table :columns="teacherColumns" :data-source="teacherModal.data" :row-selection="teacherRowSelection" row-key="id" :pagination="false" :scroll="{ y: 600 }" size="small" />
    </a-modal>
    <a-modal v-model:open="classModal.visible" title="Xếp Lớp" :confirm-loading="classModal.loading" @ok="confirmArrangeClass" @cancel="classModal.visible = false" width="800px">
      <a-table :columns="classColumns" :data-source="classModal.data" :row-selection="classRowSelection" row-key="id" :pagination="false" :scroll="{ y: 600 }" size="small" />
    </a-modal>
    <a-modal v-model:open="classSubjectModal.visible" title="Xếp Lớp - Môn" :confirm-loading="classSubjectModal.loading" @ok="confirmArrangeClassSubject" @cancel="classSubjectModal.visible = false" width="800px">
      <a-table :columns="classSubjectColumns" :data-source="classSubjectModal.data" :row-selection="classSubjectRowSelection" row-key="key" :pagination="false" :scroll="{ y: 600 }" size="small" />
    </a-modal>
    <a-modal v-model:open="roomModal.visible" title="Xếp Phòng học" :confirm-loading="roomModal.loading" @ok="confirmArrangeRoom" @cancel="roomModal.visible = false" width="800px">
      <a-table :columns="roomColumns" :data-source="roomModal.data" :row-selection="roomRowSelection" row-key="id" :pagination="false" :scroll="{ y: 600 }" size="small" />
    </a-modal>

    <!-- Export Modal -->
    <a-modal v-model:open="exportModal.visible" :title="'Xuất Excel thời khóa biểu'" :footer="null" width="900px" @cancel="closeExportModal">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Thời khóa biểu của lớp -->
        <a-card type="inner" title="Thời khóa biểu của lớp">
          <div class="mb-3 text-gray-600">Chọn thông tin hiển thị trên thời khóa biểu:</div>
          <div class="flex flex-col gap-2 mb-4">
            <a-checkbox v-model:checked="exportModal.options.class.showRoom">Phòng học</a-checkbox>
            <a-checkbox v-model:checked="exportModal.options.class.showTeacher">Tên Giáo viên</a-checkbox>
          </div>
          <a-button
            type="primary"
            class="bg-blue-500"
            :loading="exportModal.loadingKey === 'class'"
            :disabled="!!exportModal.loadingKey && exportModal.loadingKey !== 'class'"
            @click="exportClassWithOptions"
          >
            Xuất TKB Lớp
          </a-button>
        </a-card>

        <!-- Thời khóa biểu toàn trường -->
        <a-card type="inner" title="Thời khóa biểu toàn trường">
          <div class="mb-3 text-gray-600">Chọn thông tin hiển thị trên thời khóa biểu:</div>
          <div class="flex flex-col gap-2 mb-4">
            <a-checkbox v-model:checked="exportModal.options.school.showRoom">Phòng học</a-checkbox>
            <a-checkbox v-model:checked="exportModal.options.school.showTeacher">Tên Giáo viên</a-checkbox>
          </div>
          <a-button
            type="primary"
            class="bg-blue-500"
            :loading="exportModal.loadingKey === 'school'"
            :disabled="!!exportModal.loadingKey && exportModal.loadingKey !== 'school'"
            @click="exportAllWithOptions"
          >
            Xuất TKB Toàn trường
          </a-button>
        </a-card>

        <!-- Thời khóa biểu của giáo viên -->
        <a-card type="inner" title="Thời khóa biểu của giáo viên">
          <div class="mb-3 text-gray-600">Chọn thông tin hiển thị trên thời khóa biểu:</div>
          <div class="flex flex-col gap-2 mb-4">
            <a-checkbox v-model:checked="exportModal.options.teacher.showRoom">Phòng học</a-checkbox>
          </div>
          <a-button
            type="primary"
            class="bg-blue-500"
            :loading="exportModal.loadingKey === 'teacher'"
            :disabled="!!exportModal.loadingKey && exportModal.loadingKey !== 'teacher'"
            @click="exportTeacherWithOptions"
          >
            Xuất TKB Giáo viên
          </a-button>
        </a-card>

        <!-- Ma trận thời khóa biểu -->
        <a-card type="inner" title="Ma trận thời khóa biểu">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a-button @click="notifyUpdating">Ma trận Tần Bình</a-button>
            <a-button @click="notifyUpdating">Ma trận Giáo viên</a-button>
            <a-button @click="notifyUpdating">Ma trận Khối</a-button>
            <a-button @click="notifyUpdating">Ma trận Tổ chuyên môn</a-button>
          </div>
        </a-card>
      </div>
    </a-modal>
  </div>
</template>

<style scoped></style>
