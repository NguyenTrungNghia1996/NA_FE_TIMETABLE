<template>
  <div @click="contextMenu.show = false">
    <div v-for="ca in dsCa" :key="ca.id" class="mb-6">
      <h3 class="font-semibold mb-2 select-none">Ca {{ ca.id }}</h3>
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
              <td
                v-for="ngay in ca.ds_Ngay"
                :key="ngay.id"
                class="border p-2 text-xs align-top min-w-[120px] relative select-none"
                :class="[
                  { 'cursor-move': ngay.ds_Tiet[pIdx].isDrag && !ngay.ds_Tiet[pIdx].isRest && !ngay.ds_Tiet[pIdx].isLock },
                  { 'bg-green-100': ngay.ds_Tiet[pIdx].isDrag && !ngay.ds_Tiet[pIdx].isRest && !ngay.ds_Tiet[pIdx].isLock },
                  { 'bg-red-50': ngay.ds_Tiet[pIdx].isLock },
                  { 'bg-sky-200': isSameSubject(ca.id, ngay.id, pIdx) },
                  { 'bg-sky-400': isSelectedCell(ca.id, ngay.id, pIdx) }
                ]"
                :draggable="ngay.ds_Tiet[pIdx].isDrag && !ngay.ds_Tiet[pIdx].isRest && !ngay.ds_Tiet[pIdx].isLock"
                @dragstart="onDragStart(ca.id, ngay.id, pIdx)"
                @dragover="onDragOver($event, ca.id, ngay.id, pIdx)"
                @drop="onDrop(ca.id, ngay.id, pIdx)"
                @click="onCellClick(ca.id, ngay.id, pIdx)"
                @contextmenu.prevent="openContextMenu($event, ca.id, ngay.id, pIdx)"
              >
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
        <a-select-option v-for="(lesson, idx) in rawUnscheduled" :key="idx" :value="idx"> {{ lesson.ten_mon }} - {{ lesson.ten_giao_vien }} </a-select-option>
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
});

const dsCa = ref([]);
const emit = defineEmits(["cell-click", "update:rawTimetable", "update:rawUnscheduled"]);
const showAddModal = ref(false);
const selectedIdx = ref(0);
const targetCell = ref(null);
const selectedSubjectId = ref(null);
const selectedCellPos = ref(null);

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
  },
  { immediate: true, deep: true },
);

function updateRawTimetable(unscheduled = props.rawUnscheduled) {
  const flat = gridToFlat(dsCa.value, unscheduled);
  emit("update:rawTimetable", flat);
}

const dragSource = ref(null);
const contextMenu = reactive({ show: false, x: 0, y: 0, ca: null, ngay: null, pIdx: null, cell: null });

function getCell(caId, dayId, pIdx) {
  const ca = dsCa.value.find(c => c.id === caId);
  const ngay = ca?.ds_Ngay.find(n => n.id === dayId);
  return ngay?.ds_Tiet[pIdx];
}

function isSelectedCell(caId, dayId, pIdx) {
  return (
    selectedCellPos.value &&
    selectedCellPos.value.ca === caId &&
    selectedCellPos.value.ngay === dayId &&
    selectedCellPos.value.pIdx === pIdx
  );
}

function isSameSubject(caId, dayId, pIdx) {
  if (!selectedSubjectId.value) return false;
  const cell = getCell(caId, dayId, pIdx);
  return cell?.id_mon === selectedSubjectId.value && !isSelectedCell(caId, dayId, pIdx);
}

function onDragStart(caId, dayId, pIdx) {
  const cell = getCell(caId, dayId, pIdx);
  if (!cell?.isDrag) return;
  dragSource.value = { caId, dayId, pIdx };
}

async function onDrop(caId, dayId, pIdx) {
  if (!dragSource.value) return;
  const src = getCell(dragSource.value.caId, dragSource.value.dayId, dragSource.value.pIdx);
  const dst = getCell(caId, dayId, pIdx);
  if (!src || !dst) return;

  console.log("Drag drop", {
    source: {
      ca: dragSource.value.caId,
      ngay: dragSource.value.dayId,
      tiet: dragSource.value.pIdx + 1,
      data: { ...src },
    },
    destination: {
      ca: caId,
      ngay: dayId,
      tiet: pIdx + 1,
      data: { ...dst },
    },
  });

  if (src.isLock || src.isRest || dst.isLock || dst.isRest || !src.isDrag || !dst.isDrag) return;

  const keys = Object.keys(src).filter(k => !["id_ca", "ngay", "tiet"].includes(k));
  const temp = {};
  keys.forEach(k => (temp[k] = src[k]));
  keys.forEach(k => (src[k] = dst[k]));
  keys.forEach(k => (dst[k] = temp[k]));
  dragSource.value = null;
  updateRawTimetable();

  try {
    const body = {
      id_lop: 2,
      timetable: gridToFlat(dsCa.value),
    };
    const { data, error } = await RestApi.timetable.update_class({ body });
    if (data.value?.status !== "success") {
      console.error("Update timetable error", error.value || data.value);
    }
  } catch (err) {
    console.error("Update timetable error", err);
  }
}

function onDragOver(event, caId, dayId, pIdx) {
  const cell = getCell(caId, dayId, pIdx);
  if (cell?.isDrag && !cell.isRest && !cell.isLock) {
    event.preventDefault();
  }
}

function openContextMenu(event, caId, dayId, pIdx) {
  const cell = getCell(caId, dayId, pIdx);
  contextMenu.show = true;
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
  contextMenu.ca = caId;
  contextMenu.ngay = dayId;
  contextMenu.pIdx = pIdx;
  contextMenu.cell = cell;
}

async function onCellClick(caId, dayId, pIdx) {
  const cell = getCell(caId, dayId, pIdx);
  console.log("Cell clicked", {
    ca: caId,
    ngay: dayId,
    tiet: pIdx + 1,
    data: { ...cell },
  });
  emit("cell-click", { ca: caId, ngay: dayId, tiet: pIdx + 1, record: cell });

  if (cell?.id_mon) {
    selectedSubjectId.value = cell.id_mon;
    selectedCellPos.value = { ca: caId, ngay: dayId, pIdx };
  } else {
    selectedSubjectId.value = null;
    selectedCellPos.value = null;
  }

  try {
    const body = {
      id_lop: 2,
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
      console.log("Find position response", data.value);
      const { timetable, ds_chua_xep } = data.value.data || {};
      if (Array.isArray(timetable)) {
        emit("update:rawTimetable", timetable);
      }
      if (Array.isArray(ds_chua_xep)) {
        emit("update:rawUnscheduled", ds_chua_xep);
      }
    } else {
      console.error("Find position error", error.value || data.value);
    }
  } catch (err) {
    console.error("Find position error", err);
  }
}

function setRest(val) {
  const cell = getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
  if (!cell) return;
  cell.isRest = val;
  if (val) {
    cell.ten_mon = "";
    cell.ten_giao_vien = "";
    cell.id_mon = 0;
    cell.id_giao_vien = 0;
  }
  console.log(val ? "Set rest period" : "Cleared rest period", {
    ca: contextMenu.ca,
    ngay: contextMenu.ngay,
    tiet: contextMenu.pIdx + 1,
    data: { ...cell },
  });
  contextMenu.show = false;
  updateRawTimetable();
}

function setLock(val) {
  const cell = getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
  if (!cell) return;
  cell.isLock = val;
  console.log(val ? "Set locked period" : "Cleared locked period", {
    ca: contextMenu.ca,
    ngay: contextMenu.ngay,
    tiet: contextMenu.pIdx + 1,
    data: { ...cell },
  });
  contextMenu.show = false;
  updateRawTimetable();
}

function clearCell() {
  const cell = getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
  if (!cell) return;
  const removed = {
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
    id_phong: 0,
    ten_phong: "",
    tiet_thu_may: 0,
    isRest: false,
    isLock: false,
  });
  let updatedUnscheduled = props.rawUnscheduled;
  if (hasData) {
    updatedUnscheduled = [...props.rawUnscheduled, { ...removed }];
    emit("update:rawUnscheduled", updatedUnscheduled);
  }
  console.log("Cleared Cell", {
    ca: contextMenu.ca,
    ngay: contextMenu.ngay,
    tiet: contextMenu.pIdx + 1,
    data: { ...cell },
  });
  contextMenu.show = false;
  updateRawTimetable(updatedUnscheduled);
}

function addLesson() {
  const cell = getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx);
  if (!cell || cell.ten_mon) return;
  targetCell.value = cell;
  selectedIdx.value = 0;
  showAddModal.value = true;
  contextMenu.show = false;
}

function confirmAdd() {
  if (selectedIdx.value == null || !targetCell.value) return;
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
  console.log("Lesson added", { cell: { ...cell }, lesson });
  updateRawTimetable(unscheduled);
}
</script>
