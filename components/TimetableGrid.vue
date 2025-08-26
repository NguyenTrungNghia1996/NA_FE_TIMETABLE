<template>
  <div @click="contextMenu.show = false" class="grid grid-cols-1 gap-2">
    <div class="grid grid-cols-4 gap-2">
      <div class="col-span-3 overflow-auto">
        <div v-for="ca in dsCa" :key="ca.id">
          <div class="overflow-x-auto">
            <table class="min-w-full border-collapse select-none">
              <thead>
                <tr>
                  <th class="border select-none">Ca</th>
                  <th class="border select-none">Tiết</th>
                  <th v-for="ngay in ca.ds_Ngay" :key="ngay.id" class="border p-0.5 select-none">{{ ngay.ten }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tiet, pIdx) in ca.ds_Ngay[0].ds_Tiet" :key="pIdx">
                  <td v-if="pIdx % 5 === 0" class="border p-0.5 text-center font-medium select-none align-middle" :rowspan="5">
                    <span class="[writing-mode:vertical-rl] items-center justify-center">{{ pIdx < 5 ? "Ca sáng" : "Ca chiều" }}</span>
                  </td>
                  <td class="border p-0.5 text-center font-medium select-none">Tiết {{ (pIdx % 5) + 1 }}</td>
                  <td v-for="ngay in ca.ds_Ngay" :key="ngay.id" class="border p-0.5 text-xs align-top min-w-[100px] max-w-[100px] relative select-none" :class="cellClasses(ca.id, ngay.id, pIdx, ngay.ds_Tiet[pIdx])" :draggable="isDraggable(ngay.ds_Tiet[pIdx])" @dragstart="onDragStart(ca.id, ngay.id, pIdx)" @dragover="onDragOver($event, ca.id, ngay.id, pIdx)" @drop="onDrop(ca.id, ngay.id, pIdx)" @click="onCellClick(ca.id, ngay.id, pIdx)" @contextmenu.prevent="openContextMenu($event, ca.id, ngay.id, pIdx)">
                    <template v-if="ngay.ds_Tiet[pIdx].isRest">
                      <span class="italic text-red-500">Nghỉ</span>
                    </template>
                    <template v-else-if="ngay.ds_Tiet[pIdx].ten_mon">
                      <div class="font-medium leading-tight">{{ ngay.ds_Tiet[pIdx].ten_mon }} - {{ ngay.ds_Tiet[pIdx].ten_giao_vien }}</div>
                      <div class="text-gray-600">{{ ngay.ds_Tiet[pIdx].ten_phong }}</div>
                    </template>
                    <template v-else>
                      <span class="text-gray-400">Trống</span>
                    </template>
                    <div v-if="ngay.ds_Tiet[pIdx].isLock" class="absolute top-1 right-1 text-[10px] text-red-600">Khóa</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="teacherDsCa.length">
          <p class="font-medium leading-tight text-xl">Giáo viên</p>
          <div v-for="ca in teacherDsCa" :key="ca.id">
            <div class="overflow-x-auto">
              <table class="min-w-full border-collapse select-none">
                <thead>
                  <tr>
                    <th class="border p-0.5 select-none">Ca</th>
                    <th class="border p-0.5 select-none">Tiết</th>
                    <th v-for="ngay in ca.ds_Ngay" :key="ngay.id" class="border p-0.5 select-none">{{ ngay.ten }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(tiet, pIdx) in ca.ds_Ngay[0].ds_Tiet" :key="pIdx">
                    <td v-if="pIdx % 5 === 0" class="border p-0.5 text-center font-medium select-none align-middle" :rowspan="5">
                      <span class="[writing-mode:vertical-rl] items-center justify-center">{{ pIdx < 5 ? "Ca sáng" : "Ca chiều" }}</span>
                    </td>
                    <td class="border p-0.5 text-center font-medium select-none">Tiết {{ (pIdx % 5) + 1 }}</td>
                    <td v-for="ngay in ca.ds_Ngay" :key="ngay.id" class="border p-0.5 text-xs align-top min-w-[100px] max-w-[100px] relative select-none" :class="teacherCellClasses(ca.id, ngay.id, pIdx, ngay.ds_Tiet[pIdx])" :draggable="teacherIsDraggable(ngay.ds_Tiet[pIdx])" @dragstart="onTeacherDragStart(ca.id, ngay.id, pIdx)" @dragover="onTeacherDragOver($event, ca.id, ngay.id, pIdx)" @drop="onTeacherDrop(ca.id, ngay.id, pIdx)" @click="onTeacherCellClick(ca.id, ngay.id, pIdx)" @contextmenu.prevent="openContextMenu($event, ca.id, ngay.id, pIdx, true)">
                      <template v-if="ngay.ds_Tiet[pIdx].isRest">
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
                        <span class="text-gray-400">Trống</span>
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
        <SelectClass v-model="selectedClassId" :autoSelectFirst="true" size="small" />
        <SelectTeacher v-model="selectedTeacherId" :autoSelectFirst="true" size="small" />
        <div class="h-1/3 overflow-auto">
          <h4 class="font-semibold">Tiết chưa xếp của lớp học</h4>
          <UnscheduledTable :data="props.rawUnscheduled" class="w-full" @row-click="onUnscheduledClick" />
        </div>
        <div class="h-1/3 overflow-auto">
          <h4 class="font-semibold">Tiết chưa xếp của giáo viên</h4>
          <TeacherUnscheduledTable
            :data="teacherUnscheduled"
            class="w-full"
            @row-click="onTeacherUnscheduledClick"
          />
        </div>
        <div class="h-1/3 overflow-auto">
          <h4 class="font-semibold">Tiết chưa xếp của thời khóa biểu</h4>
          <TimetableUnscheduledTable :data="timetableUnscheduled" class="w-full" />
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div v-if="contextMenu.show" class="absolute bg-white border shadow rounded text-sm z-50" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
      <ul class="min-w-[150px] py-1 select-none">
        <template v-if="contextMenu.cell?.id_chitiet">
          <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" v-if="!contextMenu.cell?.isLock" @click="setLock(true)">Khóa</li>
          <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" v-else @click="setLock(false)">Huỷ khóa</li>
          <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" @click="clearCell">Huỷ xếp</li>
        </template>
        <template v-else>
          <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" @click="addLesson">Xếp tiết</li>
        </template>
        <template v-if="!contextMenu.isTeacher && contextMenu.cell?.id_mon">
          <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" @click="lockSubjectPeriods">Khóa tất cả tiết môn</li>
          <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" @click="unlockSubjectPeriods">Huỷ khóa tất cả tiết môn</li>
        </template>
        <template v-if="contextMenu.isTeacher && selectedTeacherId">
          <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" @click="lockTeacherPeriods">Khóa tất cả tiết giáo viên</li>
          <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" @click="unlockTeacherPeriods">Huỷ khóa tất cả tiết giáo viên</li>
        </template>
      </ul>
    </div>

    <a-modal v-model:open="showAddModal" title="Chọn tiết học" ok-text="Thêm" cancel-text="Hủy" @ok="confirmAdd" @cancel="showAddModal = false">
      <a-select v-model:value="selectedIdx" class="w-full mb-4">
        <a-select-option v-for="(lesson, idx) in lessonOptions" :key="idx" :value="idx">
          {{ lesson.ten_mon }}
          <template v-if="contextMenu.isTeacher">
            <template v-if="lesson.ten_lop"> - {{ lesson.ten_lop }} </template>
          </template>
          <template v-else> - {{ lesson.ten_giao_vien }} </template>
        </a-select-option>
      </a-select>
    </a-modal>
  </div>
</template>

<script setup>
import { transformTimetable, gridToFlat } from "@/composables/useTimetable";
const { RestApi } = useApi();

const props = defineProps({
  rawTimetable: {
    type: Array,
    required: true,
  },
  rawUnscheduled: {
    type: Array,
    required: true,
  },
  classId: {
    type: Number,
    default: null,
  },
  timetableId: {
    type: Number,
    default: null,
  },
});

const dsCa = ref([]);
const teacherDsCa = ref([]);
const teacherUnscheduled = ref([]);
const timetableUnscheduled = ref([]);
const selectedTeacherId = ref(null);
const selectedClassId = ref(props.classId);
const emit = defineEmits(["cell-click", "update:rawTimetable", "update:rawUnscheduled", "update:classId"]);
const showAddModal = ref(false);
const selectedIdx = ref(0);
const targetCell = ref(null);
const selectedSubjectId = ref(null);
const selectedCellPos = ref(null);
const lessonOptions = ref([]);

async function fetchAllUnscheduled() {
  if (props.timetableId) {
    const { data } = await RestApi.timetable.unscheduled({ params: { idtkb: props.timetableId } });
    timetableUnscheduled.value = Array.isArray(data.value.data) ? data.value.data : [];
  } else {
    timetableUnscheduled.value = [];
  }
}

watch(
  () => props.classId,
  id => {
    selectedClassId.value = id;
  },
);

watch(selectedClassId, async id => {
  emit("update:classId", id);
  if (id && selectedTeacherId.value && props.timetableId) {
    await fetchTeacherTimetable(selectedTeacherId.value);
    selectedSubjectId.value = null;
    selectedCellPos.value = null;
  }
});

watch(
  () => props.rawTimetable,
  () => {
    const { ds_Ca } = transformTimetable(props.rawTimetable, {
      daysCount: 7,
      shifts: [1],
      periodsPerShift: 10,
      dayNames: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
    });
    dsCa.value = ds_Ca;
    fetchAllUnscheduled();
  },
  { immediate: true, deep: true },
);

watch(selectedTeacherId, async id => {
  if (id && props.timetableId) {
    await fetchTeacherTimetable(id);
  } else {
    teacherDsCa.value = [];
    teacherUnscheduled.value = [];
  }
});

watch(
  () => props.timetableId,
  () => {
    fetchAllUnscheduled();
  },
  { immediate: true },
);

function updateRawTimetable(unscheduled = props.rawUnscheduled) {
  const flat = gridToFlat(dsCa.value, unscheduled);
  emit("update:rawTimetable", flat);
}

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

async function fetchTeacherTimetable(teacherId) {
  try {
    const { data, error } = await RestApi.timetable.get_teacher({
      params: { idGV: teacherId, idtkb: props.timetableId },
    });
    if (data.value?.status === "success") {
      const { timetable, ds_chua_xep } = data.value.data || {};
      const { ds_Ca } = transformTimetable(timetable || [], {
        daysCount: 7,
        shifts: [1],
        periodsPerShift: 10,
        dayNames: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
      });
      teacherDsCa.value = ds_Ca;
      teacherUnscheduled.value = Array.isArray(ds_chua_xep) ?ds_chua_xep:[];
    } else {
      message.error("Get teacher timetable error", error.value || data.value);
      teacherDsCa.value = [];
      teacherUnscheduled.value = [];
    }
  } catch (err) {
    message.error("Get teacher timetable error", err);
    teacherDsCa.value = [];
    teacherUnscheduled.value = [];
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

function isDraggable(cell) {
  return cell?.isDrag && !cell.isRest && !cell.isLock;
}

function teacherIsDraggable(cell) {
  return cell?.isDrag && !cell.isRest && !cell.isLock;
}

function cellClasses(caId, dayId, pIdx, cell) {
  const drag = isDraggable(cell);
  return {
    "cursor-move": drag,
    "bg-green-100": drag,
    "bg-red-50": cell.isLock,
    "bg-sky-200": isSameSubject(caId, dayId, pIdx),
    "bg-sky-400": isSelectedCell(caId, dayId, pIdx),
  };
}

function teacherCellClasses(caId, dayId, pIdx, cell) {
  const drag = teacherIsDraggable(cell);
  return {
    "cursor-move": drag,
    "bg-green-100": drag,
    "bg-red-50": cell.isLock,
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
  if (!isDraggable(src) || !isDraggable(dst)) return;

  const keys = Object.keys(src).filter(k => !["id_ca", "ngay", "tiet"].includes(k));
  const temp = {};
  keys.forEach(k => (temp[k] = src[k]));
  keys.forEach(k => (src[k] = dst[k]));
  keys.forEach(k => (dst[k] = temp[k]));
  dragSource.value = null;
  updateRawTimetable();

  try {
    const body = {
      id_lop: selectedClassId.value,
      timetable: [{ ...srcClone }, { ...dstClone }],
    };
    const { data, error } = await RestApi.timetable.update_class({ body });
    if (data.value?.status !== "success") {
      message.error("Update timetable error", error.value || data.value);
    } else {
      try {
        const { data: listData, error: listError } = await RestApi.timetable.get_class({
          params: { idLop: selectedClassId.value, idtkb: dstClone.id_tkb },
        });
        if (listData.value?.status === "success") {
          emit("update:rawTimetable", listData.value.data.timetable);
          emit("update:rawUnscheduled", listData.value.data.ds_chua_xep);
          selectedSubjectId.value = null;
          selectedCellPos.value = null;
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
    const { data, error } = await RestApi.timetable.update_teacher({ body });
    if (data.value?.status !== "success") {
      message.error("Update teacher timetable error", error.value || data.value);
    } else {
      await fetchTeacherTimetable(selectedTeacherId.value);
      if (selectedClassId.value && props.timetableId) {
        try {
          const { data: listData, error: listError } = await RestApi.timetable.get_class({
            params: { idLop: selectedClassId.value, idtkb: dstClone.id_tkb },
          });
          if (listData.value?.status === "success") {
            emit("update:rawTimetable", listData.value.data.timetable);
            emit("update:rawUnscheduled", listData.value.data.ds_chua_xep);
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
  if (isDraggable(cell)) {
    event.preventDefault();
  }
}

function openContextMenu(event, caId, dayId, pIdx, isTeacher = false) {
  const cell = isTeacher ? getTeacherCell(caId, dayId, pIdx) : getCell(caId, dayId, pIdx);
  if (cell?.isRest) {
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
  } else {
    selectedTeacherId.value = null;
  }
  if (cell?.id_mon) {
    selectedSubjectId.value = cell.id_mon;
    selectedCellPos.value = { ca: caId, ngay: dayId, pIdx };
  } else {
    selectedSubjectId.value = null;
    selectedCellPos.value = null;
  }
  try {
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
    const { data, error } = await RestApi.timetable.find_class_position({ body });
    if (data.value?.status === "success") {
      // message.log("Find position response", data.value);
      const { timetable, ds_chua_xep } = data.value.data || {};
      if (Array.isArray(timetable)) {
        emit("update:rawTimetable", timetable);
      }
      if (Array.isArray(ds_chua_xep)) {
        emit("update:rawUnscheduled", ds_chua_xep);
      }
    } else {
      message.error("Find position error", error.value || data.value);
    }
  } catch (err) {
    message.error("Find position error", err);
  }
}

async function onUnscheduledClick(lesson) {
  if (!lesson) return;
  selectedTeacherId.value = lesson.id_giao_vien || null;
  selectedSubjectId.value = lesson.id_mon || null;
  selectedCellPos.value = null;
  console.log(lesson);
  try {
    const body = {
      id_lop: selectedClassId.value,
      ds_chua_xep: [lesson],
    };
    const { data, error } = await RestApi.timetable.find_class_unscheduled_position({ body });
    if (data.value?.status === "success") {
      const { timetable, ds_chua_xep } = data.value.data || {};
      if (Array.isArray(timetable)) {
        emit("update:rawTimetable", timetable);
      }
      if (Array.isArray(ds_chua_xep)) {
        emit("update:rawUnscheduled", ds_chua_xep);
      }
    } else {
      message.error("Find position error", error.value || data.value);
    }
  } catch (err) {
    message.error("Find position error", err);
  }
}

async function onTeacherUnscheduledClick(lesson) {
  if (!lesson || !selectedTeacherId.value) return;
  selectedClassId.value = lesson.id_lop || null;
  selectedSubjectId.value = lesson.id_mon || null;
  selectedCellPos.value = null;
  try {
    const body = {
      id_giao_vien: selectedTeacherId.value,
      ds_chua_xep: [lesson],
    };
    const { data, error } = await RestApi.timetable.find_teacher_unscheduled_position({ body });
    if (data.value?.status === "success") {
      const { timetable, ds_chua_xep } = data.value.data || {};
      if (Array.isArray(timetable)) {
        const { ds_Ca } = transformTimetable(timetable, {
          daysCount: 7,
          shifts: [1],
          periodsPerShift: 10,
          dayNames: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
        });
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
}

async function onTeacherCellClick(caId, dayId, pIdx) {
  const cell = getTeacherCell(caId, dayId, pIdx);
  selectedClassId.value = cell.id_lop;
  if (!selectedTeacherId.value || !cell) return;
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
    const { data, error } = await RestApi.timetable.find_teacher_position({ body });
    if (data.value?.status === "success") {
      const { timetable, ds_chua_xep } = data.value.data || {};
      if (Array.isArray(timetable)) {
        const { ds_Ca } = transformTimetable(timetable, {
          daysCount: 7,
          shifts: [1],
          periodsPerShift: 10,
          dayNames: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
        });
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
    updateRawTimetable();
  }
}

async function setLock(val) {
  const cell = contextMenu.isTeacher ? getTeacherCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx) : getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
  if (!cell || !cell.id_chitiet) return;
  try {
    if (val) {
      const { data, error } = await RestApi.timetable.lock_period({ params: { Id: cell.id_chitiet } });
      if (data.value?.status === "success") {
        const { data: listData, error: listError } = await RestApi.timetable.get_class({
          params: { idLop: selectedClassId.value, idtkb: cell.id_tkb },
        });
        if (listData.value?.status === "success") {
          emit("update:rawTimetable", listData.value.data.timetable);
          emit("update:rawUnscheduled", listData.value.data.ds_chua_xep);
          selectedSubjectId.value = null;
          selectedCellPos.value = null;
        } else {
          message.error("Load timetable error", listError.value || listData.value);
        }
        if (selectedTeacherId.value && props.timetableId) {
          await fetchTeacherTimetable(selectedTeacherId.value);
        }
      }
    } else {
      const { data, error } = await RestApi.timetable.unlock_period({ params: { Id: cell.id_chitiet } });
      if (data.value?.status === "success") {
        const { data: listData, error: listError } = await RestApi.timetable.get_class({
          params: { idLop: selectedClassId.value, idtkb: cell.id_tkb },
        });
        if (listData.value?.status === "success") {
          emit("update:rawTimetable", listData.value.data.timetable);
          emit("update:rawUnscheduled", listData.value.data.ds_chua_xep);
        } else {
          message.error("Load timetable error", listError.value || listData.value);
        }
        if (selectedTeacherId.value && props.timetableId) {
          await fetchTeacherTimetable(selectedTeacherId.value);
        }
      }
    }
  } catch (err) {
    message.error("Set lock error", err);
  }
}

async function lockSubjectPeriods() {
  const cell = getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
  if (!cell?.id_chitiet) return;
  try {
    const { data, error } = await RestApi.timetable.lock_class_period({ params: { Id: cell.id_chitiet } });
    if (data.value?.status === "success") {
      const { data: listData, error: listError } = await RestApi.timetable.get_class({
        params: { idLop: selectedClassId.value, idtkb: cell.id_tkb },
      });
      if (listData.value?.status === "success") {
        emit("update:rawTimetable", listData.value.data.timetable);
        emit("update:rawUnscheduled", listData.value.data.ds_chua_xep);
      } else {
        message.error("Load timetable error", listError.value || listData.value);
      }
      if (selectedTeacherId.value && props.timetableId) {
        await fetchTeacherTimetable(selectedTeacherId.value);
      }
    } else {
      message.error("Lock subject periods error", error.value || data.value);
    }
  } catch (err) {
    message.error("Lock subject periods error", err);
  }
  contextMenu.show = false;
}

async function unlockSubjectPeriods() {
  const cell = getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
  if (!cell?.id_chitiet) return;
  try {
    const { data, error } = await RestApi.timetable.unlock_class_period({ params: { Id: cell.id_chitiet } });
    if (data.value?.status === "success") {
      const { data: listData, error: listError } = await RestApi.timetable.get_class({
        params: { idLop: selectedClassId.value, idtkb: cell.id_tkb },
      });
      if (listData.value?.status === "success") {
        emit("update:rawTimetable", listData.value.data.timetable);
        emit("update:rawUnscheduled", listData.value.data.ds_chua_xep);
      } else {
        message.error("Load timetable error", listError.value || listData.value);
      }
      if (selectedTeacherId.value && props.timetableId) {
        await fetchTeacherTimetable(selectedTeacherId.value);
      }
    } else {
      message.error("Unlock subject periods error", error.value || data.value);
    }
  } catch (err) {
    message.error("Unlock subject periods error", err);
  }
  contextMenu.show = false;
}

async function lockTeacherPeriods() {
  const cell = getTeacherCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
  if (!cell?.id_chitiet) return;
  try {
    const { data, error } = await RestApi.timetable.lock_teacher_period({ params: { Id: cell.id_chitiet } });
    if (data.value?.status === "success") {
      if (selectedClassId.value && props.timetableId) {
        const { data: listData, error: listError } = await RestApi.timetable.get_class({
          params: { idLop: selectedClassId.value, idtkb: props.timetableId },
        });
        if (listData.value?.status === "success") {
          emit("update:rawTimetable", listData.value.data.timetable);
          emit("update:rawUnscheduled", listData.value.data.ds_chua_xep);
        } else {
          message.error("Load timetable error", listError.value || listData.value);
        }
      }
      if (selectedTeacherId.value && props.timetableId) {
        await fetchTeacherTimetable(selectedTeacherId.value);
      }
    } else {
      message.error("Lock teacher periods error", error.value || data.value);
    }
  } catch (err) {
    message.error("Lock teacher periods error", err);
  }
  contextMenu.show = false;
}

async function unlockTeacherPeriods() {
  const cell = getTeacherCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
  if (!cell?.id_chitiet) return;
  try {
    const { data, error } = await RestApi.timetable.unlock_teacher_period({ params: { Id: cell.id_chitiet } });
    if (data.value?.status === "success") {
      if (selectedClassId.value && props.timetableId) {
        const { data: listData, error: listError } = await RestApi.timetable.get_class({
          params: { idLop: selectedClassId.value, idtkb: props.timetableId },
        });
        if (listData.value?.status === "success") {
          emit("update:rawTimetable", listData.value.data.timetable);
          emit("update:rawUnscheduled", listData.value.data.ds_chua_xep);
        } else {
          message.error("Load timetable error", listError.value || listData.value);
        }
      }
      if (selectedTeacherId.value && props.timetableId) {
        await fetchTeacherTimetable(selectedTeacherId.value);
      }
    } else {
      message.error("Unlock teacher periods error", error.value || data.value);
    }
  } catch (err) {
    message.error("Unlock teacher periods error", err);
  }
  contextMenu.show = false;
}

async function clearCell() {
  const cell = contextMenu.isTeacher ? getTeacherCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx) : getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
  if (!cell) return;
  try {
    const { data, error } = await RestApi.timetable.cancel_period({ params: { Id: cell.id_chitiet } });
    if (data.value?.status === "success") {
      const { data: listData, error: listError } = await RestApi.timetable.get_class({
        params: { idLop: selectedClassId.value, idtkb: cell.id_tkb },
      });
      if (listData.value?.status === "success") {
        emit("update:rawTimetable", listData.value.data.timetable);
        emit("update:rawUnscheduled", listData.value.data.ds_chua_xep);
        selectedSubjectId.value = null;
        selectedCellPos.value = null;
      } else {
        message.error("Load timetable error", listError.value || listData.value);
      }
      if (selectedTeacherId.value && props.timetableId) {
        await fetchTeacherTimetable(selectedTeacherId.value);
      }
    } else {
      message.error("Clear cell error", error.value || data.value);
    }
  } catch (err) {
    message.error("Clear cell error", err);
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
      const { data, error } = await RestApi.timetable.find_teacher_lesson({ body });
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
      const { data, error } = await RestApi.timetable.find_class_lesson({ body });
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
    id_lop: lesson.id_lop,
    ten_lop: lesson.ten_lop,
    id_mon: cell.id_mon,
    ten_mon: cell.ten_mon,
    id_giao_vien: cell.id_giao_vien,
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

  try {
    const { data, error } = await RestApi.timetable.update_period({ body });
    if (data.value?.status === "success") {
      if (contextMenu.isTeacher) {
        await fetchTeacherTimetable(selectedTeacherId.value);
        if (selectedClassId.value && props.timetableId) {
          const { data: listData, error: listError } = await RestApi.timetable.get_class({
            params: { idLop: selectedClassId.value, idtkb: cell.id_tkb },
          });
          if (listData.value?.status === "success") {
            emit("update:rawTimetable", listData.value.data.timetable);
            emit("update:rawUnscheduled", listData.value.data.ds_chua_xep);
          } else {
            message.error("Load timetable error", listError.value || listData.value);
          }
        }
      } else {
        const { data: listData, error: listError } = await RestApi.timetable.get_class({
          params: { idLop: selectedClassId.value, idtkb: cell.id_tkb },
        });
        if (listData.value?.status === "success") {
          emit("update:rawTimetable", listData.value.data.timetable);
          emit("update:rawUnscheduled", listData.value.data.ds_chua_xep);
        } else {
          message.error("Load timetable error", listError.value || listData.value);
        }
        if (selectedTeacherId.value && props.timetableId) {
          await fetchTeacherTimetable(selectedTeacherId.value);
        }
      }
    } else {
      message.error("Update timetable error", error.value || data.value);
    }
  } catch (err) {
    message.error("Update timetable error", err);
  }

  showAddModal.value = false;
  targetCell.value = null;
  lessonOptions.value = [];
}
</script>
