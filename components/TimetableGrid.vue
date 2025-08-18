<template>
  <div @click="contextMenu.show = false" class="grid grid-cols-1 gap-5">
    <SelectClass v-model="selectedClassId" class="mb-2" />
    <div class="grid grid-cols-4 gap-2">
      <a-tabs v-model:activeKey="activeCa" class="col-span-3">
        <a-tab-pane v-for="ca in dsCa" :key="ca.id" :tab="`Ca ${ca.id}`">
          <div class="overflow-x-auto">
            <table class="min-w-full border-collapse select-none">
              <thead>
                <tr>
                  <th class="border p-2 select-none">Tiết / Ngày</th>
                  <th v-for="ngay in ca.ds_Ngay" :key="ngay.id" class="border p-2 select-none">{{ ngay.ten }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tiet, pIdx) in ca.ds_Ngay[0].ds_Tiet" :key="pIdx">
                  <td class="border p-2 text-center font-medium select-none">Tiết {{ pIdx + 1 }}</td>
                  <td v-for="ngay in ca.ds_Ngay" :key="ngay.id" class="border p-2 text-xs align-top min-w-[120px] relative select-none" :class="cellClasses(ca.id, ngay.id, pIdx, ngay.ds_Tiet[pIdx])" :draggable="isDraggable(ngay.ds_Tiet[pIdx])" @dragstart="onDragStart(ca.id, ngay.id, pIdx)" @dragover="onDragOver($event, ca.id, ngay.id, pIdx)" @drop="onDrop(ca.id, ngay.id, pIdx)" @click="onCellClick(ca.id, ngay.id, pIdx)" @contextmenu.prevent="openContextMenu($event, ca.id, ngay.id, pIdx)">
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
        </a-tab-pane>
      </a-tabs>
      <UnscheduledTable :data="props.rawUnscheduled" class="mt-4" />
    </div>

    <SelectTeacher v-model="selectedTeacherId" />
    <div v-if="teacherDsCa.length" class="grid grid-cols-4 gap-2">
      <a-tabs v-model:activeKey="teacherActiveCa" class="col-span-3">
        <a-tab-pane v-for="ca in teacherDsCa" :key="ca.id" :tab="`Ca ${ca.id}`">
          <div class="overflow-x-auto">
            <table class="min-w-full border-collapse select-none">
              <thead>
                <tr>
                  <th class="border p-2 select-none">Tiết / Ngày</th>
                  <th v-for="ngay in ca.ds_Ngay" :key="ngay.id" class="border p-2 select-none">{{ ngay.ten }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tiet, pIdx) in ca.ds_Ngay[0].ds_Tiet" :key="pIdx">
                  <td class="border p-2 text-center font-medium select-none">Tiết {{ pIdx + 1 }}</td>
                  <td v-for="ngay in ca.ds_Ngay" :key="ngay.id" class="border p-2 text-xs align-top min-w-[120px] relative select-none" :class="teacherCellClasses(ca.id, ngay.id, pIdx, ngay.ds_Tiet[pIdx])" :draggable="teacherIsDraggable(ngay.ds_Tiet[pIdx])" @dragstart="onTeacherDragStart(ca.id, ngay.id, pIdx)" @dragover="onTeacherDragOver($event, ca.id, ngay.id, pIdx)" @drop="onTeacherDrop(ca.id, ngay.id, pIdx)" @click="onTeacherCellClick(ca.id, ngay.id, pIdx)" @contextmenu.prevent="openContextMenu($event, ca.id, ngay.id, pIdx, true)">
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
        </a-tab-pane>
      </a-tabs>
      <TeacherUnscheduledTable v-if="teacherUnscheduled.length" :data="teacherUnscheduled" class="mt-4" />
    </div>

    <!-- Context Menu -->
    <div v-if="contextMenu.show" class="absolute bg-white border shadow rounded text-sm z-50" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
      <ul class="min-w-[150px] py-1 select-none">
        <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" v-if="!contextMenu.cell?.ten_mon && !contextMenu.cell?.isRest" @click="addLesson">Thêm tiết học</li>
        <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" v-if="!contextMenu.cell?.isRest" @click="setRest(true)">Đặt tiết nghỉ</li>
        <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" v-else @click="setRest(false)">Xóa tiết nghỉ</li>
        <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" v-if="!contextMenu.cell?.isLock" @click="setLock(true)">Đặt tiết khóa</li>
        <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" v-else @click="setLock(false)">Xóa tiết khóa</li>
        <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" @click="clearCell">Xóa tiết</li>
      </ul>
    </div>

    <a-modal v-model:open="showAddModal" title="Chọn tiết học" ok-text="Thêm" cancel-text="Hủy" @ok="confirmAdd" @cancel="showAddModal = false">
      <a-select v-model:value="selectedIdx" class="w-full mb-4">
        <a-select-option
          v-for="(lesson, idx) in contextMenu.isTeacher ? teacherUnscheduled : rawUnscheduled"
          :key="idx"
          :value="idx"
        >
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
const activeCa = ref(1);
const teacherDsCa = ref([]);
const teacherActiveCa = ref(1);
const teacherUnscheduled = ref([]);
const selectedTeacherId = ref(null);
const selectedClassId = ref(props.classId);
const emit = defineEmits(["cell-click", "update:rawTimetable", "update:rawUnscheduled", "update:classId"]);
const showAddModal = ref(false);
const selectedIdx = ref(0);
const targetCell = ref(null);
const selectedSubjectId = ref(null);
const selectedCellPos = ref(null);

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
  }
});

watch(
  () => props.rawTimetable,
  () => {
    const { ds_Ca } = transformTimetable(props.rawTimetable, {
      daysCount: 7,
      shifts: [1, 2],
      periodsPerShift: 5,
      dayNames: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
    });
    dsCa.value = ds_Ca;
    activeCa.value = ds_Ca[0]?.id || 1;
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
        shifts: [1, 2],
        periodsPerShift: 5,
        dayNames: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
      });
      teacherDsCa.value = ds_Ca;
      teacherActiveCa.value = ds_Ca[0]?.id || 1;
      teacherUnscheduled.value = Array.isArray(ds_chua_xep)
        ? ds_chua_xep.map(({ id_mon, ten_mon, id_lop, ten_lop, id_phong, ten_phong, tiet_thu_may }) => ({
            id_mon,
            ten_mon,
            id_lop,
            ten_lop,
            id_phong,
            ten_phong,
            tiet_thu_may,
          }))
        : [];
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
  selectedSubjectId.value = null;
  selectedCellPos.value = null;
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

  // console.log("Drag drop", {
  //   source: {
  //     ca: dragSource.value.caId,
  //     ngay: dragSource.value.dayId,
  //     tiet: dragSource.value.pIdx + 1,
  //     data: { ...src },
  //   },
  //   destination: {
  //     ca: caId,
  //     ngay: dayId,
  //     tiet: pIdx + 1,
  //     data: { ...dst },
  //   },
  // });

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
          shifts: [1, 2],
          periodsPerShift: 5,
          dayNames: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
        });
        teacherDsCa.value = ds_Ca;
        teacherActiveCa.value = ds_Ca[0]?.id || 1;
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
  const cell = contextMenu.isTeacher
    ? getTeacherCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx)
    : getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
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
  // console.log(val ? "Set rest period" : "Cleared rest period", {
  //   ca: contextMenu.ca,
  //   ngay: contextMenu.ngay,
  //   tiet: contextMenu.pIdx + 1,
  //   data: { ...cell },
  // });
  contextMenu.show = false;
  if (!contextMenu.isTeacher) {
    updateRawTimetable();
  }
}

function setLock(val) {
  const cell = contextMenu.isTeacher
    ? getTeacherCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx)
    : getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
  if (!cell) return;
  cell.isLock = val;
  // console.log(val ? "Set locked period" : "Cleared locked period", {
  //   ca: contextMenu.ca,
  //   ngay: contextMenu.ngay,
  //   tiet: contextMenu.pIdx + 1,
  //   data: { ...cell },
  // });
  contextMenu.show = false;
  if (!contextMenu.isTeacher) {
    updateRawTimetable();
  }
}

function clearCell() {
  const cell = contextMenu.isTeacher
    ? getTeacherCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx)
    : getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
  if (!cell) return;
  const removed = contextMenu.isTeacher
    ? {
        id_mon: cell.id_mon,
        ten_mon: cell.ten_mon,
        id_lop: cell.id_lop,
        ten_lop: cell.ten_lop,
        id_phong: cell.id_phong,
        ten_phong: cell.ten_phong,
        tiet_thu_may: cell.tiet_thu_may,
      }
    : {
        id_mon: cell.id_mon,
        ten_mon: cell.ten_mon,
        id_giao_vien: cell.id_giao_vien,
        ten_giao_vien: cell.ten_giao_vien,
        id_phong: cell.id_phong,
        ten_phong: cell.ten_phong,
        tiet_thu_may: cell.tiet_thu_may,
      };
  const hasData = cell.id_chitiet || cell.id_mon || cell.ten_mon;
  Object.assign(cell, {
    id_chitiet: 0,
    id_don_vi: 0,
    id_tkb: 0,
    id_mon: 0,
    ten_mon: "",
    id_giao_vien: 0,
    ten_giao_vien: "",
    id_lop: 0,
    ten_lop: "",
    id_phong: 0,
    ten_phong: "",
    tiet_thu_may: 0,
    isRest: false,
    isLock: false,
  });
  if (hasData) {
    if (contextMenu.isTeacher) {
      teacherUnscheduled.value = [...teacherUnscheduled.value, { ...removed }];
    } else {
      const updatedUnscheduled = [...props.rawUnscheduled, { ...removed }];
      emit("update:rawUnscheduled", updatedUnscheduled);
      updateRawTimetable(updatedUnscheduled);
    }
  } else if (!contextMenu.isTeacher) {
    updateRawTimetable();
  }
  // console.log("Cleared Cell", {
  //   ca: contextMenu.ca,
  //   ngay: contextMenu.ngay,
  //   tiet: contextMenu.pIdx + 1,
  //   data: { ...cell },
  // });
  contextMenu.show = false;
}

function addLesson() {
  const cell = contextMenu.isTeacher
    ? getTeacherCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx)
    : getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
  if (!cell || cell.ten_mon) return;
  targetCell.value = cell;
  selectedIdx.value = 0;
  showAddModal.value = true;
  contextMenu.show = false;
}

function confirmAdd() {
  if (selectedIdx.value == null || !targetCell.value) return;
  if (contextMenu.isTeacher) {
    const unscheduled = [...teacherUnscheduled.value];
    const lesson = unscheduled.splice(selectedIdx.value, 1)[0];
    if (!lesson) return;
    teacherUnscheduled.value = unscheduled;
    const cell = targetCell.value;
    cell.id_mon = lesson.id_mon;
    cell.ten_mon = lesson.ten_mon;
    cell.id_lop = lesson.id_lop;
    cell.ten_lop = lesson.ten_lop;
    cell.id_phong = lesson.id_phong;
    cell.ten_phong = lesson.ten_phong;
    cell.tiet_thu_may = lesson.tiet_thu_may;
    showAddModal.value = false;
    targetCell.value = null;
    message.log("Lesson added", { cell: { ...cell }, lesson });
  } else {
    const unscheduled = [...props.rawUnscheduled];
    const lesson = unscheduled.splice(selectedIdx.value, 1)[0];
    if (!lesson) return;
    emit("update:rawUnscheduled", unscheduled);
    const cell = targetCell.value;
    cell.id_mon = lesson.id_mon;
    cell.ten_mon = lesson.ten_mon;
    cell.id_giao_vien = lesson.id_giao_vien;
    cell.ten_giao_vien = lesson.ten_giao_vien;
    cell.id_phong = lesson.id_phong;
    cell.ten_phong = lesson.ten_phong;
    cell.tiet_thu_may = lesson.tiet_thu_may;
    showAddModal.value = false;
    targetCell.value = null;
    message.log("Lesson added", { cell: { ...cell }, lesson });
    updateRawTimetable(unscheduled);
  }
}
</script>
