<template>
  <div @click="contextMenu.show = false" class="grid grid-cols-1 gap-2">
    <div class="grid grid-cols-4 gap-2">
      <div class="col-span-3 overflow-auto">
        <SelectReviewClass v-model="selectedClassId" :autoSelectFirst="true" size="small" :noFormItem="true" :inlineLabel="true" :showNavigationButtons="true" />
        <div v-for="ca in dsCa" :key="ca.id">
          <div class="overflow-x-auto">
            <table class="min-w-full border-collapse select-none">
              <thead v-if="ca.id == 1">
                <tr>
                  <th class="border select-none">Ca</th>
                  <th class="border select-none">Tiết</th>
                  <th v-for="ngay in ca.ds_Ngay" :key="ngay.id" class="border p-0.5 select-none">{{ ngay.ten }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tiet, pIdx) in ca.ds_Ngay[0].ds_Tiet" :key="pIdx">
                  <td v-if="pIdx % getPeriodsForShift(ca.id) === 0" class="border p-0.5 text-center font-medium select-none align-middle" :rowspan="getPeriodsForShift(ca.id)" :style="labelCellStyle()">
                    <span class="[writing-mode:vertical-rl] items-center justify-center">{{ getShiftLabel(ca.id) }}</span>
                  </td>
                  <td class="border p-0.5 text-center font-medium select-none" :style="labelCellStyle()">Tiết {{ (pIdx % getPeriodsForShift(ca.id)) + 1 }}</td>
                  <td v-for="ngay in ca.ds_Ngay" :key="ngay.id" class="text-center border p-0.5 text-xs align-top min-w-[100px] max-w-[100px] relative select-none" :style="cellStyle(ca.id, ngay.id, pIdx, ngay.ds_Tiet[pIdx])" :class="cellClasses(ca.id, ngay.id, pIdx, ngay.ds_Tiet[pIdx])" :draggable="isDraggable(ngay.ds_Tiet[pIdx])" @dragstart="onDragStart(ca.id, ngay.id, pIdx)" @dragover="onDragOver($event, ca.id, ngay.id, pIdx)" @drop="onDrop(ca.id, ngay.id, pIdx)" @click="onCellClick(ca.id, ngay.id, pIdx)" @contextmenu.prevent="openContextMenu($event, ca.id, ngay.id, pIdx)">
                    <template v-if="ngay.ds_Tiet[pIdx].isRest && !ngay.ds_Tiet[pIdx].isError">
                      <span class="italic text-red-500">Nghỉ</span>
                    </template>
                    <template v-else-if="ngay.ds_Tiet[pIdx].ten_mon">
                      <div class="font-medium leading-tight">{{ ngay.ds_Tiet[pIdx].ten_mon }} - {{ ngay.ds_Tiet[pIdx].ten_giao_vien }}</div>
                      <div class="text-gray-600">{{ ngay.ds_Tiet[pIdx].ten_phong }}</div>
                    </template>
                    <template v-else>
                      <div class="text-transparent">Trống</div>
                      <div class="text-transparent">Trống</div>
                    </template>
                    <div v-if="ngay.ds_Tiet[pIdx].isLock" class="absolute top-1 right-1 text-[10px] text-red-600">Khóa</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <!-- <p class="font-medium leading-tight text-xl">Giáo viên</p> -->
          <SelectTeacher v-model="selectedTeacherId" :autoSelectFirst="true" size="small" :noFormItem="true" :inlineLabel="true" :showNavigationButtons="true" />
          <div v-for="ca in teacherDsCa" :key="ca.id">
            <div class="overflow-x-auto">
              <table class="min-w-full border-collapse select-none">
                <thead v-if="ca.id == 1">
                  <tr>
                    <th class="border p-0.5 select-none">Ca</th>
                    <th class="border p-0.5 select-none">Tiết</th>
                    <th v-for="ngay in ca.ds_Ngay" :key="ngay.id" class="border p-0.5 select-none">{{ ngay.ten }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(tiet, pIdx) in ca.ds_Ngay[0].ds_Tiet" :key="pIdx">
                    <td v-if="pIdx % getPeriodsForShift(ca.id) === 0" class="border p-0.5 text-center font-medium select-none align-middle" :rowspan="getPeriodsForShift(ca.id)" :style="labelCellStyle()">
                      <span class="[writing-mode:vertical-rl] items-center justify-center">{{ getShiftLabel(ca.id) }}</span>
                    </td>
                    <td class="border p-0.5 text-center font-medium select-none" :style="labelCellStyle()">Tiết {{ (pIdx % getPeriodsForShift(ca.id)) + 1 }}</td>
                    <td v-for="ngay in ca.ds_Ngay" :key="ngay.id" class="text-center border p-0.5 text-xs align-top min-w-[100px] max-w-[100px] relative select-none" :style="teacherCellStyle(ca.id, ngay.id, pIdx, ngay.ds_Tiet[pIdx])" :class="teacherCellClasses(ca.id, ngay.id, pIdx, ngay.ds_Tiet[pIdx])" :draggable="teacherIsDraggable(ngay.ds_Tiet[pIdx])" @dragstart="onTeacherDragStart(ca.id, ngay.id, pIdx)" @dragover="onTeacherDragOver($event, ca.id, ngay.id, pIdx)" @drop="onTeacherDrop(ca.id, ngay.id, pIdx)" @click="onTeacherCellClick(ca.id, ngay.id, pIdx)" @contextmenu.prevent="openContextMenu($event, ca.id, ngay.id, pIdx, true)">
                      <template v-if="ngay.ds_Tiet[pIdx].isRest && !ngay.ds_Tiet[pIdx].isError">
                        <span class="italic text-red-500">Nghỉ</span>
                      </template>
                      <template v-else-if="ngay.ds_Tiet[pIdx].ten_mon">
                        <div class="font-medium leading-tight">
                          {{ ngay.ds_Tiet[pIdx].ten_mon }}
                          <template v-if="ngay.ds_Tiet[pIdx].ten_lop"> - {{ ngay.ds_Tiet[pIdx].ten_lop }} </template>
                        </div>
                        <div class="text-gray-600">{{ ngay.ds_Tiet[pIdx].ten_phong }}</div>
                      </template>
                      <template v-else>
                        <div class="text-transparent">Trống</div>
                        <div class="text-transparent">Trống</div>
                      </template>
                      <div v-if="ngay.ds_Tiet[pIdx].isLock" class="absolute top-1 right-1 text-[10px] text-red-600">Khóa</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="h-[calc(100vh-110px)] flex flex-col">
        <div class="py-1 flex justify-end w-full gap-2">
          <a-button :disabled="!canUndo || undoLoading" :loading="undoLoading" @click.stop="undoLastAction">Hoàn tác</a-button>
          <a-button @click.stop="openThemeModal">Cài đặt màu lịch ôn tập</a-button>
        </div>
        <div class="h-1/3 overflow-auto m-3 shadow-xl">
          <h4 class="font-semibold">
            Tiết chưa xếp của lớp học
            <span v-if="selectedClassName">: {{ selectedClassName }}</span>
          </h4>
          <UnscheduledTable :data="classUnscheduled" class="w-full" @row-click="onUnscheduledClick" />
        </div>
        <div class="h-1/3 overflow-auto m-3 shadow-xl">
          <h4 class="font-semibold flex items-center justify-between gap-2 flex-wrap">
            <span>
              Tiết chưa xếp của giáo viên
              <span v-if="selectedTeacherName"
                >: {{ selectedTeacherName }}
                <a-tooltip>
                  <template #title>Đã xếp / Tổng</template>
                  {{ teacherPeriodStats.scheduled }} / {{ teacherPeriodStats.total }}
                </a-tooltip>
              </span>
            </span>
            <!-- <span v-if="teacherPeriodStats.total || teacherPeriodStats.scheduled" class="text-sm font-normal text-gray-600">
              Đã xếp / Tổng: 
            </span> -->
          </h4>
          <TeacherUnscheduledTable :data="teacherUnscheduled" class="w-full" @row-click="onTeacherUnscheduledClick" />
        </div>
        <div class="h-1/3 overflow-auto m-3 shadow-xl">
          <h4 class="font-semibold">Tiết chưa xếp của thời khóa biểu</h4>
          <TimetableUnscheduledTable :data="timetableUnscheduled" class="w-full" @row-click="onTimetableUnscheduledClick" />
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div v-if="contextMenu.show" class="absolute bg-white border shadow rounded text-sm z-50" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
      <ul class="min-w-[150px] py-1 select-none">
        <template v-if="contextMenu.cell?.id_chitiet">
          <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" @click="clearCell">Hủy tiết</li>
        </template>
        <template v-else>
          <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" @click="addLesson">Xếp tiết</li>
        </template>
      </ul>
    </div>

    <!-- Review timetable theme modal -->
    <a-modal v-model:open="themeModal.open" title="Cài đặt màu lịch ôn tập" :confirm-loading="themeModal.saving" width="650px" @ok="saveTheme" @cancel="themeModal.open = false">
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-32 text-sm text-gray-600">Bộ màu</div>
          <a-select class="flex-1" v-model:value="themeForm.activePalette" :options="paletteOptions" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="flex items-center gap-3">
            <div class="w-32 text-sm text-gray-600">Nền lỗi</div>
            <input type="color" v-model="themeForm.colors.errorBg" class="w-10 h-8 p-0 border rounded" />
            <a-input size="small" v-model:value="themeForm.colors.errorBg" />
          </div>
          <div class="flex items-center gap-3">
            <div class="w-32 text-sm text-gray-600">Nền đang kéo</div>
            <input type="color" v-model="themeForm.colors.dragBg" class="w-10 h-8 p-0 border rounded" />
            <a-input size="small" v-model:value="themeForm.colors.dragBg" />
          </div>
          <div class="flex items-center gap-3">
            <div class="w-32 text-sm text-gray-600">Nền khóa</div>
            <input type="color" v-model="themeForm.colors.lockBg" class="w-10 h-8 p-0 border rounded" />
            <a-input size="small" v-model:value="themeForm.colors.lockBg" />
          </div>
          <div class="flex items-center gap-3">
            <div class="w-32 text-sm text-gray-600">Nền cùng môn</div>
            <input type="color" v-model="themeForm.colors.sameSubjectBg" class="w-10 h-8 p-0 border rounded" />
            <a-input size="small" v-model:value="themeForm.colors.sameSubjectBg" />
          </div>
          <div class="flex items-center gap-3">
            <div class="w-32 text-sm text-gray-600">Nền đang chọn</div>
            <input type="color" v-model="themeForm.colors.selectedBg" class="w-10 h-8 p-0 border rounded" />
            <a-input size="small" v-model:value="themeForm.colors.selectedBg" />
          </div>
          <div class="flex items-center gap-3">
            <div class="w-32 text-sm text-gray-600">Nền trống</div>
            <input type="color" v-model="themeForm.colors.emptyBg" class="w-10 h-8 p-0 border rounded" />
            <a-input size="small" v-model:value="themeForm.colors.emptyBg" />
          </div>
        </div>
      </div>
    </a-modal>

    <a-modal v-model:open="showAddModal" title="Chọn tiết học" :footer="null" @cancel="showAddModal = false">
      <a-table :columns="lessonColumns" :data-source="lessonOptions" :pagination="false" size="small" bordered :customRow="lessonRowProps" />
    </a-modal>
  </div>
</template>

<script setup>
import { transformTimetable } from "@/composables/useTimetable";
import { useSettingStore } from "~/stores/settingStore";
import { useTimetableStore } from "~/stores/timetableStore";
const { RestApi } = useApi();
const Api = RestApi.review_timetable;

const props = defineProps({
  classId: {
    type: Number,
    default: null,
  },
  timetableId: {
    type: Number,
    default: null,
  },
});

const scheduleId = computed(() => props.timetableId);
const buildScheduleParams = (extra = {}) => ({
  idlich: scheduleId.value,
  ...extra,
});

const timetableStore = useTimetableStore();
const dsCa = ref([]);
const teacherDsCa = ref([]);
const teacherUnscheduled = ref([]);
const teacherPeriodStats = ref({ scheduled: 0, total: 0 });
const timetableUnscheduled = ref([]);
const classUnscheduled = ref([]);
const selectedTeacherId = ref(null);
const selectedTeacherName = ref("");
const selectedClassId = ref(props.classId);
const selectedClassName = ref("");
let classNameFetchToken = 0;
let teacherNameFetchToken = 0;
const canUndo = computed(() => timetableStore.canUndo);
const emit = defineEmits(["cell-click", "update:classId"]);
const showAddModal = ref(false);
const selectedIdx = ref(0);
const targetCell = ref(null);
const selectedSubjectId = ref(null);
const selectedCellPos = ref(null);
const undoLoading = ref(false);
const lessonOptions = ref([]);
// Guard: avoid clearing selection when classId changes due to teacher-cell click
const suppressSelectionResetOnClassChange = ref(false);
// Guards to prevent watcher-fetch overriding suggestion highlights
const teacherSuggestInProgress = ref(false);
const classSuggestInProgress = ref(false);
const suppressNextTeacherTimetableFetch = ref(false);
const lessonColumns = computed(() => [
  {
    title: "STT",
    key: "stt",
    width: 70,
    align: "center",
    customRender: ({ index }) => index + 1,
  },
  {
    title: "Môn học",
    dataIndex: "ten_mon",
    key: "ten_mon",
  },
  {
    title: contextMenu.isTeacher ? "Lớp" : "Giáo viên",
    dataIndex: contextMenu.isTeacher ? "ten_lop" : "ten_giao_vien",
    key: contextMenu.isTeacher ? "ten_lop" : "ten_giao_vien",
  },
  {
    title: "Phòng",
    dataIndex: "ten_phong",
    key: "ten_phong",
  },
  {
    title: "Tiết",
    dataIndex: "tiet_thu_may",
    key: "tiet_thu_may",
    align: "center",
    width: 120,
  },
]);

// Review timetable color palette (configurable via setting store)
const settingStore = useSettingStore();
const activePalette = computed(() => settingStore.activeReviewTimetablePalette);
// Centralized timetable config from Pinia
const timetableConfig = computed(() => settingStore.timetableConfig);
// transformTimetable expects numeric shift ids; map labels -> indices 1..N
const transformOpts = computed(() => {
  const cfg = timetableConfig.value || {};
  const shiftIds = (cfg.shifts || []).map((_, idx) => idx + 1);
  const perShift = Object.fromEntries(shiftIds.map((id, idx) => [id, Number(cfg.shiftPeriods?.[idx]) || cfg.periodsPerShift || 5]));
  return {
    daysCount: cfg.daysCount,
    shifts: shiftIds,
    periodsPerShift: cfg.periodsPerShift,
    periodsPerShiftByShift: perShift,
    dayNames: cfg.dayNames,
  };
});

function getShiftLabel(shiftId) {
  const labels = timetableConfig.value?.shifts || [];
  return labels[Number(shiftId) - 1] || (Number(shiftId) === 1 ? "Ca sáng" : "Ca chiều");
}

function getPeriodsForShift(shiftId) {
  const cfg = timetableConfig.value || {};
  const idx = Number(shiftId) - 1;
  const fromCfg = Number(cfg.shiftPeriods?.[idx]);
  if (fromCfg > 0) return fromCfg;
  // fallback to data length if available to avoid mismatch
  const ca = dsCa.value.find(c => c.id === Number(shiftId));
  const len = ca?.ds_Ngay?.[0]?.ds_Tiet?.length;
  if (Number(len) > 0) return Number(len);
  return Number(cfg.periodsPerShift) || 5;
}
// Theme modal state and handlers
const themeModal = reactive({ open: false, saving: false });
const themeForm = reactive({
  activePalette: computed(() => settingStore.reviewTimetableTheme.activePalette).value,
  colors: { ...activePalette.value },
});
const paletteOptions = computed(() => Object.keys(settingStore.reviewTimetableTheme.palettes || {}).map(key => ({ label: key, value: key })));

watch(
  () => themeForm.activePalette,
  key => {
    const p = settingStore.reviewTimetableTheme.palettes[key] || {};
    themeForm.colors = { ...p };
  },
);

function openThemeModal() {
  themeForm.activePalette = settingStore.reviewTimetableTheme.activePalette;
  themeForm.colors = { ...activePalette.value };
  themeModal.open = true;
}

// Structure modal state and handlers
const structModal = reactive({ open: false, saving: false });
const structForm = reactive({ daysCount: 7, shifts: [], periods: [] });

function openStructModal() {
  const cfg = timetableConfig.value || {};
  structForm.daysCount = Number(cfg.daysCount) || 7;
  structForm.shifts = [...(cfg.shifts || [])];
  const def = Number(cfg.periodsPerShift) || 5;
  const periods = Array.isArray(cfg.shiftPeriods) ? cfg.shiftPeriods.map(n => Number(n) || def) : [];
  while (periods.length < structForm.shifts.length) periods.push(def);
  structForm.periods = periods.slice(0, structForm.shifts.length);
  if (!structForm.shifts.length) {
    structForm.shifts = ["Ca 1"];
    structForm.periods = [def];
  }
  structModal.open = true;
}

function addShiftRow() {
  structForm.shifts.push("");
  const def = Number(timetableConfig.value?.periodsPerShift) || 5;
  structForm.periods.push(def);
}

function removeShiftRow(idx) {
  if (structForm.shifts.length <= 1) return;
  structForm.shifts.splice(idx, 1);
  structForm.periods.splice(idx, 1);
}

async function saveStruct() {
  try {
    structModal.saving = true;
    const days = Math.max(1, Math.min(7, Number(structForm.daysCount) || 7));
    const shifts = (structForm.shifts || []).map(s => String(s || "").trim()).filter(Boolean);
    const periods = (structForm.periods || []).map(n => Math.max(1, Number(n) || 1));
    if (!shifts.length) {
      message.error("Vui lòng nhập ít nhất 1 ca học");
      return;
    }
    while (periods.length < shifts.length) periods.push(Number(timetableConfig.value?.periodsPerShift) || 5);
    settingStore.setTimetableDaysCount(days);
    settingStore.setTimetableShifts(shifts);
    settingStore.setTimetableShiftPeriods(periods.slice(0, shifts.length));
    structModal.open = false;
    // refresh grids to apply new structure
    await fetchClassTimetable();
    if (selectedTeacherId.value && scheduleId.value) {
      await fetchTeacherTimetable(selectedTeacherId.value);
    }
  } finally {
    structModal.saving = false;
  }
}

function saveTheme() {
  themeModal.saving = true;
  try {
    // Update or create selected palette then activate it
    settingStore.setReviewTimetablePalette(themeForm.activePalette, { ...themeForm.colors });
    settingStore.setActiveReviewTimetablePalette(themeForm.activePalette);
    themeModal.open = false;
  } finally {
    themeModal.saving = false;
  }
}
const lessonRowProps = (record, index) => ({
  onClick: () => onSelectLessonRow(index),
});

async function fetchAllUnscheduled() {
  if (scheduleId.value) {
    const { data } = await Api.unscheduled({ params: buildScheduleParams() });
    timetableUnscheduled.value = Array.isArray(data.value.data) ? data.value.data : [];
  } else {
    timetableUnscheduled.value = [];
  }
}

async function fetchClassTimetable() {
  if (!selectedClassId.value || !scheduleId.value) {
    dsCa.value = [];
    classUnscheduled.value = [];
    return;
  }
  try {
    const { data, error } = await Api.get_class({
      params: buildScheduleParams({ idLop: selectedClassId.value }),
    });
    if (data.value?.status === "success") {
      const { timetable, ds_chua_xep } = data.value.data || {};
      const { ds_Ca } = transformTimetable(timetable || [], transformOpts.value);
      dsCa.value = ds_Ca;
      classUnscheduled.value = Array.isArray(ds_chua_xep) ? ds_chua_xep : [];
    } else {
      message.error("Load class timetable error", error?.value || data.value);
      dsCa.value = [];
      classUnscheduled.value = [];
    }
  } catch (err) {
    message.error("Load class timetable error", err);
    dsCa.value = [];
    classUnscheduled.value = [];
  }
}

watch(
  () => props.classId,
  id => {
    selectedClassId.value = id;
  },
);

watch(selectedClassId, async id => {
  // Capture suggest flags at the time this watcher starts
  const skipTeacherFetch = teacherSuggestInProgress.value;
  const skipClassFetch = classSuggestInProgress.value;

  emit("update:classId", id);
  await fetchClassName(id);

  if (id && scheduleId.value) {
    if (!skipClassFetch) {
      await fetchClassTimetable();
    }
  }

  if (id && selectedTeacherId.value && scheduleId.value) {
    if (suppressNextTeacherTimetableFetch.value) {
      suppressNextTeacherTimetableFetch.value = false;
    } else if (!skipTeacherFetch) {
      await fetchTeacherTimetable(selectedTeacherId.value);
    }
    if (!suppressSelectionResetOnClassChange.value) {
      selectedSubjectId.value = null;
      selectedCellPos.value = null;
    }
    // reset the guard after handling this change
    suppressSelectionResetOnClassChange.value = false;
  }
});

// Keep class timetable in sync when inputs change
watch([selectedClassId, () => scheduleId.value], async () => {
  if (!classSuggestInProgress.value) {
    await fetchClassTimetable();
  }
});

watch(selectedTeacherId, async id => {
  // Capture suggest flag to avoid late false after awaits
  const skipTeacherFetch = teacherSuggestInProgress.value;
  await fetchTeacherName(id);
  if (id && scheduleId.value) {
    if (suppressNextTeacherTimetableFetch.value) {
      suppressNextTeacherTimetableFetch.value = false;
    } else if (!skipTeacherFetch) {
      await fetchTeacherTimetable(id);
    }
  } else {
    teacherDsCa.value = [];
    teacherUnscheduled.value = [];
    teacherPeriodStats.value = { scheduled: 0, total: 0 };
  }
});

if (selectedClassId.value !== null && selectedClassId.value !== undefined) {
  fetchClassName(selectedClassId.value);
}

async function fetchClassName(id) {
  const currentToken = ++classNameFetchToken;
  if (!id) {
    selectedClassName.value = "";
    return;
  }

  try {
    const { data } = await RestApi.class.detail({ params: { id } });
    if (currentToken !== classNameFetchToken) return;
    if (data.value?.status === "success") {
      selectedClassName.value = data.value.data?.ten || "";
    } else {
      selectedClassName.value = "";
    }
  } catch {
    if (currentToken === classNameFetchToken) {
      selectedClassName.value = "";
    }
  }
}

async function fetchTeacherName(id) {
  const currentToken = ++teacherNameFetchToken;
  if (!id) {
    selectedTeacherName.value = "";
    return;
  }

  try {
    const { data } = await RestApi.teacher.detail({ params: { Id: id } });
    if (currentToken !== teacherNameFetchToken) return;
    if (data.value?.status === "success") {
      const info = data.value.data || {};
      const fullName = [info.ho_va_ho_dem, info.ten].filter(Boolean).join(" ").trim();
      const baseName = fullName || "";
      if (info.ma_giao_vien) {
        selectedTeacherName.value = baseName ? `${baseName} (${info.ma_giao_vien})` : info.ma_giao_vien;
      } else {
        selectedTeacherName.value = baseName;
      }
    } else {
      selectedTeacherName.value = "";
    }
  } catch {
    if (currentToken === teacherNameFetchToken) {
      selectedTeacherName.value = "";
    }
  }
}

watch(
  () => scheduleId.value,
  () => {
    fetchAllUnscheduled();
    fetchClassTimetable();
  },
  { immediate: true },
);

const dragSource = ref(null);
const teacherDragSource = ref(null);
const contextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  ca: null,
  ngay: null,
  pIdx: null,
  cell: null,
  isTeacher: false,
});

function getCell(caId, dayId, pIdx) {
  const ca = dsCa.value.find(c => c.id === caId);
  const ngay = ca?.ds_Ngay.find(n => n.id === dayId);
  return ngay?.ds_Tiet[pIdx];
}

function getTeacherCell(caId, dayId, pIdx) {
  const ca = teacherDsCa.value.find(c => c.id === caId);
  const ngay = ca?.ds_Ngay.find(n => n.id === dayId);
  return ngay?.ds_Tiet[pIdx];
}

function saveClassUpdatePayload(payload) {
  return timetableStore.pushClassUpdate(payload);
}

function buildUndoTimetablePayload(timetable = []) {
  if (!Array.isArray(timetable) || !timetable.length) return [];
  const keysToPreserve = ["ngay", "tiet", "id_ca"];
  return timetable.map((slot, idx) => {
    const mirrored = timetable[timetable.length - 1 - idx] || {};
    const merged = { ...slot };
    Object.keys(mirrored).forEach(key => {
      if (keysToPreserve.includes(key)) return;
      merged[key] = mirrored[key];
    });
    return merged;
  });
}

async function handleUndoClassUpdate(payload) {
  if (!payload?.timetable?.length) {
    message.info("Không có dữ liệu để hoàn tác");
    return false;
  }
  const reversedTimetable = buildUndoTimetablePayload(payload.timetable);
  if (!reversedTimetable.length) {
    message.info("Không có dữ liệu để hoàn tác");
    return false;
  }
  const body = {
    ...payload,
    timetable: reversedTimetable,
  };
  try {
    const { data, error } = await Api.update_class({ body });
    if (data.value?.status !== "success") {
      message.error("Hoàn tác thất bại", error.value || data.value);
      return false;
    }
    const idLop = payload.id_lop || selectedClassId.value;
    const idSchedule = payload.timetable?.[0]?.id_tkb || scheduleId.value;
    if (idLop && idSchedule) {
      const { data: listData, error: listError } = await Api.get_class({
        params: buildScheduleParams({ idLop, idlich: idSchedule }),
      });
      if (listData.value?.status === "success") {
        const { ds_Ca } = transformTimetable(listData.value.data.timetable || [], transformOpts.value);
        dsCa.value = ds_Ca;
        classUnscheduled.value = Array.isArray(listData.value.data.ds_chua_xep) ? listData.value.data.ds_chua_xep : [];
        selectedSubjectId.value = null;
        selectedCellPos.value = null;
      } else {
        message.error("Load timetable error", listError.value || listData.value);
      }
    } else {
      await fetchClassTimetable();
    }
    await fetchAllUnscheduled();
    const teacherIds = Array.isArray(payload.timetable) ? [...new Set(payload.timetable.map(t => t?.id_giao_vien).filter(Boolean))] : [];
    if (teacherIds.length && scheduleId.value) {
      const targetTeacher = teacherIds.includes(selectedTeacherId.value) ? selectedTeacherId.value : teacherIds[0];
      await fetchTeacherTimetable(targetTeacher);
    }
    return true;
  } catch (err) {
    message.error("Hoàn tác thất bại", err);
    return false;
  }
}

async function handleUndoLockPeriod() {
  message.info("Hoàn tác khóa chưa hỗ trợ cho lịch ôn tập");
  return false;
}

async function handleUndoUnlockPeriod() {
  message.info("Hoàn tác khóa chưa hỗ trợ cho lịch ôn tập");
  return false;
}

async function handleUndoClearPeriod(payload) {
  // const lesson = lessonOptions.value[selectedIdx.value];
  // if (!lesson) return;
  const cell = payload?.cell ?? payload;
  if (!cell?.id_chitiet) {
    message.info("Không có dữ liệu để hoàn tác");
    return false;
  }
  const body = {
    // id: cell.id_chitiet,
    id: 0,
    id_don_vi: cell.id_don_vi,
    id_tkb: cell.id_tkb,
    id_lich: scheduleId.value ?? cell.id_lich ?? cell.id_tkb,
    id_lop: cell.id_lop,
    ten_lop: cell.ten_lop,
    id_mon: cell.id_mon,
    ten_mon: cell.ten_mon,
    id_giao_vien: cell.id_giao_vien,
    ten_giao_vien: cell.ten_giao_vien,
    id_phong: cell.id_phong,
    ten_phong: cell.ten_phong,
    tiet_thu_may: cell.tiet_thu_may,
    id_ca: cell.id_ca,
    ngay: cell.ngay,
    tiet: cell.tiet,
    khoa: !!cell.isLock,
    ds_vi_tri_xep_duoc: [],
  };
  try {
    const { data, error } = await Api.update_period({ body });
    if (data.value?.status !== "success") {
      message.error("Hoàn tác huỷ tiết thất bại", error.value || data.value);
      return false;
    }
    await fetchClassTimetable();
    if (selectedTeacherId.value && scheduleId.value) {
      await fetchTeacherTimetable(selectedTeacherId.value);
    }
    await fetchAllUnscheduled();
    return true;
  } catch (err) {
    message.error("Hoàn tác huỷ tiết thất bại", err);
    return false;
  }
}

async function handleUndoAddPeriod(payload) {
  const cell = payload?.cell ?? payload;
  if (!cell?.id_chitiet) {
    message.info("Không có dữ liệu để hoàn tác");
    return false;
  }
  try {
    const { data, error } = await Api.cancel_period({ params: { id: cell.id_chitiet } });
    if (data.value?.status !== "success") {
      message.error("Hoàn tác thêm tiết thất bại", error.value || data.value);
      return false;
    }
    await fetchClassTimetable();
    if (selectedTeacherId.value && scheduleId.value) {
      await fetchTeacherTimetable(selectedTeacherId.value);
    }
    await fetchAllUnscheduled();
    return true;
  } catch (err) {
    message.error("Hoàn tác thêm tiết thất bại", err);
    return false;
  }
}

async function undoLastAction() {
  if (undoLoading.value) return;
  const lastAction = timetableStore.lastAction;
  if (!lastAction) {
    message.info("Không có thao tác để hoàn tác");
    return;
  }
  let success = false;
  undoLoading.value = true;
  try {
    switch (lastAction.type) {
      case "classUpdate":
        success = await handleUndoClassUpdate(lastAction.payload);
        break;
      case "clearPeriod":
        success = await handleUndoClearPeriod(lastAction.payload);
        break;
      case "addPeriod":
        success = await handleUndoAddPeriod(lastAction.payload);
        break;
      default:
        message.warning("Chưa hỗ trợ hoàn tác cho thao tác này");
        break;
    }
    if (success) {
      timetableStore.popLastAction();
    }
  } finally {
    undoLoading.value = false;
  }
}

async function fetchTeacherTimetable(teacherId) {
  try {
    const { data, error } = await Api.get_teacher({
      params: buildScheduleParams({ idGV: teacherId }),
    });
    if (data.value?.status === "success") {
      const { timetable, ds_chua_xep, so_tiet_da_xep, tong_so_tiet } = data.value.data || {};
      const { ds_Ca } = transformTimetable(timetable || [], transformOpts.value);
      teacherPeriodStats.value = {
        scheduled: Number(so_tiet_da_xep) || 0,
        total: Number(tong_so_tiet) || 0,
      };
      teacherDsCa.value = ds_Ca;
      teacherUnscheduled.value = Array.isArray(ds_chua_xep) ? ds_chua_xep : [];
    } else {
      message.error("Get teacher timetable error", error.value || data.value);
      teacherDsCa.value = [];
      teacherUnscheduled.value = [];
      teacherPeriodStats.value = { scheduled: 0, total: 0 };
    }
  } catch (err) {
    message.error("Get teacher timetable error", err);
    teacherDsCa.value = [];
    teacherUnscheduled.value = [];
    teacherPeriodStats.value = { scheduled: 0, total: 0 };
  }
}

function isSelectedCell(caId, dayId, pIdx) {
  return selectedCellPos.value && selectedCellPos.value.ca === caId && selectedCellPos.value.ngay === dayId && selectedCellPos.value.pIdx === pIdx;
}

function isSameSubject(caId, dayId, pIdx) {
  if (!selectedSubjectId.value) return false;
  const cell = getCell(caId, dayId, pIdx);
  return cell?.id_mon === selectedSubjectId.value && !isSelectedCell(caId, dayId, pIdx);
}

// Teacher table helpers
function teacherIsSelectedCell(caId, dayId, pIdx) {
  return selectedCellPos.value && selectedCellPos.value.ca === caId && selectedCellPos.value.ngay === dayId && selectedCellPos.value.pIdx === pIdx;
}

function teacherIsSameSubject(caId, dayId, pIdx) {
  if (!selectedSubjectId.value) return false;
  const cell = getTeacherCell(caId, dayId, pIdx);
  // Cùng môn học và cùng lớp
  return cell?.id_mon === selectedSubjectId.value && cell?.id_lop === selectedClassId.value && !teacherIsSelectedCell(caId, dayId, pIdx);
}

function isDraggable(cell) {
  return cell?.isDrag && !cell.isRest && !cell.isLock;
}

function canReceiveDrop(cell) {
  return !!cell && cell.isDrag && !cell.isRest && !cell.isLock;
}

function teacherIsDraggable(cell) {
  return cell?.isDrag && !cell.isRest && !cell.isLock;
}

function labelCellStyle() {
  return { backgroundColor: activePalette.value?.emptyBg };
}

// Resolve background color from palette with priority:
// error > selected > drag > lock > sameSubject > empty
function resolveCellBg(caId, dayId, pIdx, cell, isTeacher = false) {
  const palette = activePalette.value || {};
  const err = !!cell?.isError;
  if (err) return palette.errorBg;
  const selected = isTeacher ? teacherIsSelectedCell(caId, dayId, pIdx) : isSelectedCell(caId, dayId, pIdx);
  if (selected) return palette.selectedBg;
  const drag = isTeacher ? teacherIsDraggable(cell) : isDraggable(cell);
  if (drag) return palette.dragBg;

  if (cell?.isLock) return palette.lockBg;

  const sameSubject = isTeacher ? teacherIsSameSubject(caId, dayId, pIdx) : isSameSubject(caId, dayId, pIdx);
  if (sameSubject) return palette.sameSubjectBg;

  return palette.emptyBg;
}

function cellStyle(caId, dayId, pIdx, cell) {
  return { backgroundColor: resolveCellBg(caId, dayId, pIdx, cell, false) };
}

function teacherCellStyle(caId, dayId, pIdx, cell) {
  return { backgroundColor: resolveCellBg(caId, dayId, pIdx, cell, true) };
}

function cellClasses(caId, dayId, pIdx, cell) {
  const drag = isDraggable(cell);
  const err = !!cell?.isError;
  const same = isSameSubject(caId, dayId, pIdx);
  const selected = isSelectedCell(caId, dayId, pIdx);
  // Áp dụng thứ tự ưu tiên: lỗi > đang chọn > kéo > khóa > cùng môn
  return {
    "cursor-move": drag,
    "bg-red-300": err,
    "bg-blue-400": !err && selected,
    "bg-[#AFFF2C]": !err && !selected && drag && !cell?.isLock && !same,
    "bg-red-50": !err && !selected && !drag && cell?.isLock && !same,
    "bg-[#20B1AA]": !err && !selected && !drag && !cell?.isLock && same,
  };
}

function teacherCellClasses(caId, dayId, pIdx, cell) {
  const drag = teacherIsDraggable(cell);
  const err = !!cell?.isError;
  const same = teacherIsSameSubject(caId, dayId, pIdx);
  const selected = teacherIsSelectedCell(caId, dayId, pIdx);
  // Áp dụng thứ tự ưu tiên: lỗi > đang chọn > kéo > khóa > cùng môn
  return {
    "cursor-move": drag,
    "bg-red-300": err,
    "bg-blue-400": !err && selected,
    "bg-[#AFFF2C]": !err && !selected && drag && !cell?.isLock && !same,
    "bg-red-50": !err && !selected && !drag && cell?.isLock && !same,
    "bg-[#20B1AA]": !err && !selected && !drag && !cell?.isLock && same,
  };
}

function onDragStart(caId, dayId, pIdx) {
  const cell = getCell(caId, dayId, pIdx);
  if (!isDraggable(cell)) return;
  dragSource.value = { caId, dayId, pIdx };
}

async function onDrop(caId, dayId, pIdx) {
  if (!dragSource.value) return;
  const srcCa = dragSource.value.caId;
  const srcDay = dragSource.value.dayId;
  const srcPIdx = dragSource.value.pIdx;
  const src = getCell(srcCa, srcDay, srcPIdx);
  const dst = getCell(caId, dayId, pIdx);
  if (!src || !dst) return;
  const srcClone = { ...src };
  const dstClone = { ...dst };
  if (!isDraggable(src) || !canReceiveDrop(dst)) return;

  const keys = Object.keys(src).filter(k => !["id_ca", "ngay", "tiet"].includes(k));
  const temp = {};
  keys.forEach(k => (temp[k] = src[k]));
  keys.forEach(k => (src[k] = dst[k]));
  keys.forEach(k => (dst[k] = temp[k]));
  dragSource.value = null;

  try {
    const body = {
      id_lop: selectedClassId.value,
      timetable: [{ ...srcClone }, { ...dstClone }],
    };
    const historyAdded = saveClassUpdatePayload(body);
    const { data, error } = await Api.update_class({ body });
    if (data.value?.status !== "success") {
      if (historyAdded) {
        if (timetableStore.lastAction?.type === "classUpdate") {
          timetableStore.popLastAction();
        }
      }
      message.error("Update timetable error", error.value || data.value);
    } else {
      try {
        const { data: listData, error: listError } = await Api.get_class({
          params: buildScheduleParams({ idLop: selectedClassId.value }),
        });
        if (listData.value?.status === "success") {
          const { ds_Ca } = transformTimetable(listData.value.data.timetable || [], transformOpts.value);
          dsCa.value = ds_Ca;
          classUnscheduled.value = Array.isArray(listData.value.data.ds_chua_xep) ? listData.value.data.ds_chua_xep : [];
          selectedSubjectId.value = null;
          selectedCellPos.value = null;
          // Refresh timetable-level unscheduled list after arranging
          await fetchAllUnscheduled();
          await fetchTeacherTimetable(srcClone.id_giao_vien);
        } else {
          message.error("Load timetable error", listError.value || listData.value);
        }
      } catch (listErr) {
        message.error("Load timetable error", listErr);
      }
    }
  } catch (err) {
    message.error("Update timetable error", err);
  }
}

function onTeacherDragStart(caId, dayId, pIdx) {
  const cell = getTeacherCell(caId, dayId, pIdx);
  if (!teacherIsDraggable(cell)) return;
  teacherDragSource.value = { caId, dayId, pIdx };
}

async function onTeacherDrop(caId, dayId, pIdx) {
  if (!teacherDragSource.value) return;
  const srcCa = teacherDragSource.value.caId;
  const srcDay = teacherDragSource.value.dayId;
  const srcPIdx = teacherDragSource.value.pIdx;
  const src = getTeacherCell(srcCa, srcDay, srcPIdx);
  const dst = getTeacherCell(caId, dayId, pIdx);
  if (!src || !dst) return;
  const srcClone = { ...src };
  const dstClone = { ...dst };

  if (!teacherIsDraggable(src) || !teacherIsDraggable(dst)) return;

  const keys = Object.keys(src).filter(k => !["id_ca", "ngay", "tiet"].includes(k));
  const temp = {};
  keys.forEach(k => (temp[k] = src[k]));
  keys.forEach(k => (src[k] = dst[k]));
  keys.forEach(k => (dst[k] = temp[k]));
  teacherDragSource.value = null;

  try {
    const body = {
      id_giao_vien: selectedTeacherId.value,
      timetable: [{ ...srcClone }, { ...dstClone }],
    };
    const { data, error } = await Api.update_teacher({ body });
    if (data.value?.status !== "success") {
      message.error("Update teacher timetable error", error.value || data.value);
    } else {
      await fetchTeacherTimetable(selectedTeacherId.value);
      // Refresh timetable-level unscheduled list after arranging
      await fetchAllUnscheduled();
      if (selectedClassId.value && scheduleId.value) {
        try {
          const { data: listData, error: listError } = await Api.get_class({
            params: buildScheduleParams({ idLop: selectedClassId.value }),
          });
          if (listData.value?.status === "success") {
            const { ds_Ca } = transformTimetable(listData.value.data.timetable || [], transformOpts.value);
            dsCa.value = ds_Ca;
            classUnscheduled.value = Array.isArray(listData.value.data.ds_chua_xep) ? listData.value.data.ds_chua_xep : [];
          } else {
            message.error("Load timetable error", listError.value || listData.value);
          }
        } catch (listErr) {
          message.error("Load timetable error", listErr);
        }
      }
    }
  } catch (err) {
    message.error("Update teacher timetable error", err);
  }
}

function onTeacherDragOver(event, caId, dayId, pIdx) {
  const cell = getTeacherCell(caId, dayId, pIdx);
  if (teacherIsDraggable(cell)) {
    event.preventDefault();
  }
}

function onDragOver(event, caId, dayId, pIdx) {
  const cell = getCell(caId, dayId, pIdx);
  if (canReceiveDrop(cell)) {
    event.preventDefault();
  }
}

function openContextMenu(event, caId, dayId, pIdx, isTeacher = false) {
  const cell = isTeacher ? getTeacherCell(caId, dayId, pIdx) : getCell(caId, dayId, pIdx);
  // Nếu vừa isRest vừa isError, vẫn cho mở menu (ưu tiên isError)
  if (cell?.isRest && !cell?.isError) {
    contextMenu.show = false;
    return;
  }
  contextMenu.show = true;
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
  contextMenu.ca = caId;
  contextMenu.ngay = dayId;
  contextMenu.pIdx = pIdx;
  contextMenu.cell = cell;
  contextMenu.isTeacher = isTeacher;
}

async function onCellClick(caId, dayId, pIdx) {
  const cell = getCell(caId, dayId, pIdx);
  emit("cell-click", { ca: caId, ngay: dayId, tiet: pIdx + 1, record: cell });
  if (cell?.id_giao_vien) {
    selectedTeacherId.value = cell.id_giao_vien;
  }
  if (cell?.id_mon) {
    selectedSubjectId.value = cell.id_mon;
    selectedCellPos.value = { ca: caId, ngay: dayId, pIdx };
  } else {
    selectedSubjectId.value = null;
    selectedCellPos.value = null;
  }
  try {
    classSuggestInProgress.value = true;
    const body = {
      id_lop: selectedClassId.value,
      timetable: [
        {
          ...cell,
          id_ca: caId,
          ngay: dayId,
          tiet: pIdx + 1,
        },
      ],
    };
    const { data, error } = await Api.find_class_position({ body });
    if (data.value?.status === "success") {
      // message.log("Find position response", data.value);
      const { timetable, ds_chua_xep } = data.value.data || {};
      if (Array.isArray(timetable)) {
        const { ds_Ca } = transformTimetable(timetable || [], transformOpts.value);
        dsCa.value = ds_Ca;
      }
      if (Array.isArray(ds_chua_xep)) {
        classUnscheduled.value = ds_chua_xep;
      }
    } else {
      message.error("Find position error", error.value || data.value);
    }
  } catch (err) {
    message.error("Find position error", err);
  }
  classSuggestInProgress.value = false;
}

async function onUnscheduledClick(lesson) {
  if (!lesson) return;
  selectedTeacherId.value = lesson.id_giao_vien || null;
  selectedSubjectId.value = lesson.id_mon || null;
  selectedCellPos.value = null;
  try {
    classSuggestInProgress.value = true;
    const body = {
      id_lop: selectedClassId.value,
      ds_chua_xep: [lesson],
    };
    const { data, error } = await Api.find_class_unscheduled_position({ body });
    if (data.value?.status === "success") {
      const { timetable, ds_chua_xep } = data.value.data || {};
      if (Array.isArray(timetable)) {
        const { ds_Ca } = transformTimetable(timetable || [], transformOpts.value);
        dsCa.value = ds_Ca;
      }
      if (Array.isArray(ds_chua_xep)) {
        classUnscheduled.value = ds_chua_xep;
      }
    } else {
      message.error("Find position error", error.value || data.value);
    }
  } catch (err) {
    message.error("Find position error", err);
  }
  classSuggestInProgress.value = false;
}

async function onTeacherUnscheduledClick(lesson) {
  if (!lesson || !selectedTeacherId.value) return;
  // Mark suggestion flow before changing reactive deps to avoid watcher overrides
  teacherSuggestInProgress.value = true;
  selectedClassId.value = lesson.id_lop || null;
  selectedSubjectId.value = lesson.id_mon || null;
  selectedCellPos.value = null;
  // lesson.id_chitiet = lesson.id || null;
  try {
    const body = {
      id_giao_vien: selectedTeacherId.value,
      ds_chua_xep: [lesson],
    };
    const { data, error } = await Api.find_teacher_unscheduled_position({ body });
    if (data.value?.status === "success") {
      const { timetable, ds_chua_xep } = data.value.data || {};
      if (Array.isArray(timetable)) {
        const { ds_Ca } = transformTimetable(timetable, transformOpts.value);
        teacherDsCa.value = ds_Ca;
      }
      if (Array.isArray(ds_chua_xep)) {
        teacherUnscheduled.value = ds_chua_xep;
      }
    } else {
      message.error("Find teacher position error", error.value || data.value);
    }
  } catch (err) {
    message.error("Find teacher position error", err);
  }
  teacherSuggestInProgress.value = false;
}

async function onTimetableUnscheduledClick(lesson) {
  if (!lesson) return;
  // Sync selections based on the clicked lesson
  // Mark suggestion flows before changing ids to avoid watcher overrides
  classSuggestInProgress.value = !!lesson.id_lop;
  teacherSuggestInProgress.value = !!lesson.id_giao_vien;
  selectedClassId.value = lesson.id_lop || null;
  selectedTeacherId.value = lesson.id_giao_vien || null;
  selectedSubjectId.value = lesson.id_mon || null;
  lesson.id_chitiet = lesson.id || null;
  selectedCellPos.value = null;

  // Load class timetable suggestions/positions
  if (lesson.id_lop) {
    try {
      classSuggestInProgress.value = true;
      const body = {
        id_lop: lesson.id_lop,
        ds_chua_xep: [lesson],
      };
      const { data, error } = await Api.find_class_unscheduled_position({ body });
      if (data.value?.status === "success") {
        const { timetable, ds_chua_xep } = data.value.data || {};
        if (Array.isArray(timetable)) {
          const { ds_Ca } = transformTimetable(timetable || [], transformOpts.value);
          dsCa.value = ds_Ca;
        }
        if (Array.isArray(ds_chua_xep)) {
          classUnscheduled.value = ds_chua_xep;
        }
      } else {
        message.error("Find class position error", error.value || data.value);
      }
    } catch (err) {
      message.error("Find class position error", err);
    }
    classSuggestInProgress.value = false;
  }

  // Load teacher timetable suggestions/positions
  if (lesson.id_giao_vien) {
    try {
      teacherSuggestInProgress.value = true;
      const body = {
        id_giao_vien: lesson.id_giao_vien,
        ds_chua_xep: [lesson],
      };
      const { data, error } = await Api.find_teacher_unscheduled_position({ body });
      if (data.value?.status === "success") {
        const { timetable, ds_chua_xep } = data.value.data || {};
        if (Array.isArray(timetable)) {
          const { ds_Ca } = transformTimetable(timetable, transformOpts.value);
          teacherDsCa.value = ds_Ca;
        }
        if (Array.isArray(ds_chua_xep)) {
          teacherUnscheduled.value = ds_chua_xep;
        }
      } else {
        message.error("Find teacher position error", error.value || data.value);
      }
    } catch (err) {
      message.error("Find teacher position error", err);
    }
    teacherSuggestInProgress.value = false;
  }
}

async function onTeacherCellClick(caId, dayId, pIdx) {
  const cell = getTeacherCell(caId, dayId, pIdx);
  if (!cell) return;
  // Prevent selection from being cleared only if classId will change
  if (cell?.id_lop && cell.id_lop !== selectedClassId.value) {
    suppressSelectionResetOnClassChange.value = true;
  }
  // Mark teacher suggestion flow early to avoid watcher overrides
  teacherSuggestInProgress.value = true;
  // Ensure watchers skip exactly one teacher fetch triggered by this click
  suppressNextTeacherTimetableFetch.value = true;
  // Ensure selected teacher matches the clicked cell to avoid early-return
  if (!selectedTeacherId.value || selectedTeacherId.value !== cell.id_giao_vien) {
    selectedTeacherId.value = cell.id_giao_vien || selectedTeacherId.value;
  }
  if (cell?.id_lop) {
    selectedClassId.value = cell.id_lop;
  }
  if (cell?.id_mon) {
    selectedSubjectId.value = cell.id_mon;
    selectedCellPos.value = { ca: caId, ngay: dayId, pIdx };
  } else {
    selectedSubjectId.value = null;
    selectedCellPos.value = null;
  }
  if (!selectedTeacherId.value) {
    teacherSuggestInProgress.value = false;
    return;
  }
  try {
    const body = {
      id_giao_vien: selectedTeacherId.value,
      timetable: [
        {
          ...cell,
          id_ca: caId,
          ngay: dayId,
          tiet: pIdx + 1,
        },
      ],
    };
    const { data, error } = await Api.find_teacher_position({ body });
    if (data.value?.status === "success") {
      const { timetable, ds_chua_xep } = data.value.data || {};
      if (Array.isArray(timetable)) {
        const { ds_Ca } = transformTimetable(timetable, transformOpts.value);
        teacherDsCa.value = ds_Ca;
      }
      if (Array.isArray(ds_chua_xep)) {
        teacherUnscheduled.value = ds_chua_xep;
      }
    } else {
      message.error("Find teacher position error", error.value || data.value);
    }
  } catch (err) {
    message.error("Find teacher position error", err);
  }
  teacherSuggestInProgress.value = false;
}

function setRest(val) {
  const cell = contextMenu.isTeacher ? getTeacherCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx) : getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
  if (!cell) return;
  cell.isRest = val;
  if (val) {
    cell.ten_mon = "";
    cell.id_mon = 0;
    if (contextMenu.isTeacher) {
      cell.ten_lop = "";
      cell.id_lop = 0;
    } else {
      cell.ten_giao_vien = "";
      cell.id_giao_vien = 0;
    }
  }
  contextMenu.show = false;
  if (!contextMenu.isTeacher) {
    // no-op: UI-only toggle; persistence handled elsewhere
  }
}

async function setLock() {
  message.info("Khóa tiết chưa hỗ trợ cho lịch ôn tập");
  contextMenu.show = false;
}

async function lockSubjectPeriods() {
  message.info("Khóa tiết môn chưa hỗ trợ cho lịch ôn tập");
  contextMenu.show = false;
}

async function unlockSubjectPeriods() {
  message.info("Khóa tiết môn chưa hỗ trợ cho lịch ôn tập");
  contextMenu.show = false;
}

async function lockTeacherPeriods() {
  message.info("Khóa tiết giáo viên chưa hỗ trợ cho lịch ôn tập");
  contextMenu.show = false;
}

async function unlockTeacherPeriods() {
  message.info("Khóa tiết giáo viên chưa hỗ trợ cho lịch ôn tập");
  contextMenu.show = false;
}

async function clearCell() {
  const cell = contextMenu.isTeacher ? getTeacherCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx) : getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
  if (!cell?.id_chitiet) return;
  const snapshot = JSON.parse(JSON.stringify(cell));
  snapshot.id_lop = selectedClassId.value ?? snapshot.id_lop;
  snapshot.ten_lop = selectedClassName.value ?? snapshot.ten_lop;
  try {
    const { data, error } = await Api.cancel_period({ params: { id: cell.id_chitiet } });
    if (data.value?.status === "success") {
      timetableStore.pushClearPeriod({ cell: snapshot });
      await fetchClassTimetable();
      if (selectedTeacherId.value && scheduleId.value) {
        await fetchTeacherTimetable(selectedTeacherId.value);
      }
      await fetchAllUnscheduled();
    } else {
      message.error("Hủy tiết thất bại", error.value || data.value);
    }
  } catch (err) {
    message.error("Hủy tiết thất bại", err);
  }
  contextMenu.show = false;
}

async function addLesson() {
  const cell = contextMenu.isTeacher ? getTeacherCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx) : getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
  if (!cell || cell.ten_mon) return;
  contextMenu.show = false;
  try {
    let body;
    if (contextMenu.isTeacher) {
      body = {
        id_giao_vien: selectedTeacherId.value,
        timetable: [
          {
            ...cell,
            id_ca: contextMenu.ca,
            ngay: contextMenu.ngay,
            tiet: contextMenu.pIdx + 1,
          },
        ],
      };
      const { data, error } = await Api.find_teacher_lesson({ body });
      if (data.value?.status === "success") {
        lessonOptions.value = Array.isArray(data.value.data) ? data.value.data : [];
      } else {
        message.error("Find lessons error", error.value || data.value);
        return;
      }
    } else {
      body = {
        id_lop: selectedClassId.value,
        timetable: [
          {
            ...cell,
            id_ca: contextMenu.ca,
            ngay: contextMenu.ngay,
            tiet: contextMenu.pIdx + 1,
          },
        ],
      };
      const { data, error } = await Api.find_class_lesson({ body });
      if (data.value?.status === "success") {
        lessonOptions.value = Array.isArray(data.value.data) ? data.value.data : [];
      } else {
        message.error("Find lessons error", error.value || data.value);
        return;
      }
    }
    if (!lessonOptions.value.length) {
      message.info("Không có tiết học phù hợp");
      return;
    }
    targetCell.value = cell;
    selectedIdx.value = 0;
    showAddModal.value = true;
  } catch (err) {
    message.error("Find lessons error", err);
  }
}

async function confirmAdd() {
  const savedCa = contextMenu.ca;
  const savedNgay = contextMenu.ngay;
  const savedPIdx = contextMenu.pIdx;
  const isTeacherContext = contextMenu.isTeacher;
  if (selectedIdx.value == null || !targetCell.value) return;
  const lesson = lessonOptions.value[selectedIdx.value];
  if (!lesson) return;
  const cell = targetCell.value;
  if (contextMenu.isTeacher) {
    cell.id_mon = lesson.id_mon;
    cell.ten_mon = lesson.ten_mon;
    cell.id_lop = lesson.id_lop;
    cell.ten_lop = lesson.ten_lop;
    cell.id_phong = lesson.id_phong;
    cell.ten_phong = lesson.ten_phong;
    cell.tiet_thu_may = lesson.tiet_thu_may;
    const resolvedTeacherId = selectedTeacherId.value ?? lesson.id_giao_vien ?? cell.id_giao_vien ?? null;
    cell.id_giao_vien = resolvedTeacherId;
    const resolvedTeacherName = lesson.ten_giao_vien || cell.ten_giao_vien || selectedTeacherName.value || "";
    if (resolvedTeacherName) {
      cell.ten_giao_vien = resolvedTeacherName;
    }
  } else {
    cell.id_mon = lesson.id_mon;
    cell.ten_mon = lesson.ten_mon;
    cell.id_giao_vien = lesson.id_giao_vien;
    cell.ten_giao_vien = lesson.ten_giao_vien;
    cell.id_phong = lesson.id_phong;
    cell.ten_phong = lesson.ten_phong;
    cell.tiet_thu_may = lesson.tiet_thu_may;
  }

  const body = {
    id: cell.id_chitiet,
    id_don_vi: cell.id_don_vi,
    id_tkb: cell.id_tkb,
    id_lich: scheduleId.value ?? cell.id_lich ?? cell.id_tkb,
    id_lop: lesson.id_lop,
    ten_lop: lesson.ten_lop,
    id_mon: cell.id_mon,
    ten_mon: cell.ten_mon,
    id_giao_vien: cell.id_giao_vien ?? (contextMenu.isTeacher ? selectedTeacherId.value ?? lesson.id_giao_vien : lesson.id_giao_vien),
    ten_giao_vien: cell.ten_giao_vien,
    id_phong: cell.id_phong,
    ten_phong: cell.ten_phong,
    tiet_thu_may: cell.tiet_thu_may,
    id_ca: contextMenu.ca,
    ngay: contextMenu.ngay,
    tiet: contextMenu.pIdx + 1,
    khoa: !!cell.isLock,
    ds_vi_tri_xep_duoc: [],
  };
  let success = false;
  try {
    const { data, error } = await Api.update_period({ body });
    if (data.value?.status === "success") {
      if (contextMenu.isTeacher) {
        await fetchTeacherTimetable(selectedTeacherId.value);
        // Refresh timetable-level unscheduled list after arranging
        await fetchAllUnscheduled();
        if (selectedClassId.value && scheduleId.value) {
          const { data: listData, error: listError } = await Api.get_class({
            params: buildScheduleParams({ idLop: selectedClassId.value }),
          });
          if (listData.value?.status === "success") {
            const { ds_Ca } = transformTimetable(listData.value.data.timetable || [], transformOpts.value);
            dsCa.value = ds_Ca;
            classUnscheduled.value = Array.isArray(listData.value.data.ds_chua_xep) ? listData.value.data.ds_chua_xep : [];
          } else {
            message.error("Load timetable error", listError.value || listData.value);
          }
        }
      } else {
        const { data: listData, error: listError } = await Api.get_class({
          params: buildScheduleParams({ idLop: selectedClassId.value }),
        });
        if (listData.value?.status === "success") {
          const { ds_Ca } = transformTimetable(listData.value.data.timetable || [], transformOpts.value);
          dsCa.value = ds_Ca;
          classUnscheduled.value = Array.isArray(listData.value.data.ds_chua_xep) ? listData.value.data.ds_chua_xep : [];
        } else {
          message.error("Load timetable error", listError.value || listData.value);
        }
        if (selectedTeacherId.value && scheduleId.value) {
          await fetchTeacherTimetable(selectedTeacherId.value);
        }
        // Refresh timetable-level unscheduled list after arranging
        await fetchAllUnscheduled();
      }
      success = true;
    } else {
      message.error("Update timetable error", error.value || data.value);
    }
  } catch (err) {
    message.error("Update timetable error", err);
  }

  if (success) {
    const cellAfter = isTeacherContext ? getTeacherCell(savedCa, savedNgay, savedPIdx) : getCell(savedCa, savedNgay, savedPIdx);
    if (cellAfter) {
      timetableStore.pushAddPeriod({ cell: JSON.parse(JSON.stringify(cellAfter)) });
    }
  }

  showAddModal.value = false;
  targetCell.value = null;
  lessonOptions.value = [];
}

function onSelectLessonRow(idx) {
  selectedIdx.value = idx;
  // Tự động lưu khi chọn 1 hàng
  confirmAdd();
}
</script>
