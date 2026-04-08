<template>
  <a-drawer
    :open="open"
    title="Bốc thăm lịch coi thi"
    :footer="null"
    height="100vh"
    placement="bottom"
    :destroyOnClose="true"
    @close="handleClose"
  >
    <ExamScheduleAssignmentBoard
      :title="drawerTitle"
      :subtitle="drawerSubtitle"
      :loading="loading"
      :buildings="buildings"
      :waiting-list="waitingList"
      :unassigned-list="unassignedList"
      :show-reset-actions="true"
      :disable-reset-actions="!settingStore.currentPermission || loading || cancellingAll"
      :resetting-supervisor-id="cancellingSupervisorId"
      :resetting-room-id="cancellingRoomId"
      :show-draw-action="true"
      :disable-draw-actions="!settingStore.currentPermission || loading || cancellingAll || !!drawingTeacherId"
      :drawing-teacher-id="drawingTeacherId"
      @reset-supervisor="handleCancelSupervisor"
      @reset-room="handleCancelRoom"
      @draw-unassigned="openDrawModal"
    >
      <template #header-actions>
        <a-popconfirm
          title="Hủy toàn bộ kết quả bốc thăm của lịch này?"
          ok-text="Đồng ý"
          cancel-text="Hủy"
          @confirm="handleCancelAll"
        >
          <a-button danger :loading="cancellingAll" :disabled="!scheduleId || !settingStore.currentPermission || loading">
            <!-- <template #icon>
              <Icon name="ant-design:delete-outlined" size="16" />
            </template> -->
            Hủy kết quả
          </a-button>
        </a-popconfirm>

        <a-button @click="reloadData" :loading="loading" :disabled="!scheduleId">
          <!-- <template #icon>
            <Icon name="ant-design:reload-outlined" size="16" />
          </template> -->
          Tải lại
        </a-button>
      </template>
    </ExamScheduleAssignmentBoard>

    <a-modal
      v-model:open="drawModal.open"
      title="Bốc thăm vị trí coi thi"
      :footer="null"
      :width="520"
      @cancel="closeDrawModal"
    >
      <div class="space-y-5 py-4 text-center">
        <div class="text-base text-slate-700">
          Người dùng nhấn nút "Bốc" hoặc nhấn dấu cách để thực hiện bốc thăm
        </div>
        <div class="text-lg font-medium text-slate-800">
          Đang bốc thăm cho giám thị: {{ drawModal.teacher?.name || "--" }}
        </div>
        <div class="flex justify-center gap-3">
          <a-button
            class="!bg-[#2498d4] !border-[#2498d4] !text-white hover:!bg-[#1d7fb3] hover:!border-[#1d7fb3]"
            :loading="drawingTeacherId === drawModal.teacher?.id"
            @click="confirmDraw"
          >
            Bốc
          </a-button>
          <a-button
            danger
            @click="closeDrawModal"
          >
            Hủy
          </a-button>
        </div>
      </div>
    </a-modal>

    <a-modal
      v-model:open="drawResult.open"
      title="Kết quả bốc thăm"
      :footer="null"
      :width="520"
      @cancel="closeDrawResult"
    >
      <div class="space-y-4 py-6 text-center">
        <div class="text-lg font-medium text-slate-800">
          Kết quả bốc thăm của giám thị: {{ drawResult.teacherName || "--" }}
        </div>
        <div class="space-y-1 text-xl text-slate-700">
          <div v-if="drawResult.roomLabel">{{ drawResult.roomLabel }}</div>
          <div v-if="drawResult.locationLabel">{{ drawResult.locationLabel }}</div>
          <div v-if="drawResult.positionLabel">{{ drawResult.positionLabel }}</div>
          <div v-if="!drawResult.roomLabel && !drawResult.locationLabel && !drawResult.positionLabel && drawResult.message">
            {{ drawResult.message }}
          </div>
        </div>
        <div class="flex justify-center">
          <a-button danger @click="closeDrawResult">
            Đóng
          </a-button>
        </div>
      </div>
    </a-modal>
  </a-drawer>
</template>

<script setup>
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  scheduleId: {
    type: [Number, String],
    default: null,
  },
  scheduleMeta: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:open", "close"]);

const { RestApi } = useApi();
const settingStore = useSettingStore();

const loading = ref(false);
const assignmentData = ref(null);
const waitingList = ref([]);
const unassignedList = ref([]);
const cancellingAll = ref(false);
const cancellingSupervisorId = ref(null);
const cancellingRoomId = ref(null);
const drawingTeacherId = ref(null);
const drawModal = reactive({
  open: false,
  teacher: null,
});
const drawResult = reactive({
  open: false,
  teacherName: "",
  roomLabel: "",
  locationLabel: "",
  positionLabel: "",
  message: "",
});

const drawerTitle = computed(() => {
  const subject = props.scheduleMeta?.ten_mon || (props.scheduleMeta?.bai_thi_tu_chon ? "Tự chọn" : "");
  const date = assignmentData.value?.ngay_thi || "";
  const titleParts = ["Chi tiết lịch coi thi"];

  if (subject) titleParts.push(`- ${subject}`);
  if (date) titleParts.push(`- Ngày ${date}`);

  return titleParts.join(" ");
});

const drawerSubtitle = computed(() => {
  const parts = [];

  if (assignmentData.value?.diem_thi) parts.push(`Điểm thi: ${assignmentData.value.diem_thi}`);
  if (props.scheduleMeta?.ten_hoi_dong) parts.push(`Hội đồng thi: ${props.scheduleMeta.ten_hoi_dong}`);
  if (props.scheduleMeta?.ten_nam) parts.push(`Năm học: ${props.scheduleMeta.ten_nam}`);

  return parts.join(" | ");
});

const buildings = computed(() => {
  return (assignmentData.value?.du_lieu_phan_bo || []).map((building, buildingIndex) => ({
    id: `toa-${building.toa || buildingIndex}`,
    name: `Tòa ${building.toa || buildingIndex + 1}`,
    floors: (building.cac_tang || []).map((floor, floorIndex) => ({
      id: `toa-${building.toa || buildingIndex}-tang-${floorIndex}`,
      name: floor.tang || `Tầng ${floorIndex + 1}`,
      supervisorGroups: (floor.nhom_giam_sat || []).map((group, groupIndex) => ({
        id: `gst-${group.id_gst || groupIndex}`,
        name: group.ten_gst || "Chưa phân công GST",
        supervisorId: group.id_gst || null,
        rooms: (group.cac_phong_phu_trach || []).map((room, roomIndex) => ({
          id: room.id_phong || `room-${roomIndex}`,
          roomId: room.id_phong || null,
          name: room.so_phong ? `Phòng ${room.so_phong}` : `Phòng ${roomIndex + 1}`,
          invigilators: [
            { role: "GT 1", name: room.giam_thi_1 || "Chưa gán" },
            { role: "GT 2", name: room.giam_thi_2 || "Chưa gán" },
          ],
        })),
      })),
    })),
  }));
});

watch(
  () => [props.open, props.scheduleId],
  async ([isOpen, id], previous = []) => {
    const [previousOpen, previousId] = previous;
    if (!isOpen || !id) return;
    if (isOpen === previousOpen && id === previousId && assignmentData.value) return;
    await fetchData();
  },
  { immediate: true },
);

watch(
  () => drawModal.open,
  isOpen => {
    if (!import.meta.client) return;
    if (isOpen) {
      window.addEventListener("keydown", handleDrawKeydown);
      return;
    }
    window.removeEventListener("keydown", handleDrawKeydown);
  },
);

onBeforeUnmount(() => {
  if (!import.meta.client) return;
  window.removeEventListener("keydown", handleDrawKeydown);
});

async function reloadData() {
  if (!props.scheduleId) return;
  await fetchData();
}

function openDrawModal(teacher) {
  if (!teacher?.id) return;
  drawModal.teacher = teacher;
  drawModal.open = true;
}

function closeDrawModal() {
  drawModal.open = false;
  drawModal.teacher = null;
}

function closeDrawResult() {
  drawResult.open = false;
  drawResult.teacherName = "";
  drawResult.roomLabel = "";
  drawResult.locationLabel = "";
  drawResult.positionLabel = "";
  drawResult.message = "";
}

function handleDrawKeydown(event) {
  if (!drawModal.open || drawingTeacherId.value) return;
  if (event.code !== "Space") return;
  event.preventDefault();
  confirmDraw();
}

async function confirmDraw() {
  if (!props.scheduleId || !drawModal.teacher?.id) return;

  try {
    drawingTeacherId.value = drawModal.teacher.id;
    const { data, error } = await RestApi.exam_schedule.assignment_draw({
      params: { idLich: props.scheduleId, idGiamThi: drawModal.teacher.id },
    });

    if (data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || "Bốc thăm không thành công");
    }

    const result = resolveDrawResult(data.value?.data);
    drawResult.teacherName = drawModal.teacher.name || result.teacherName || "--";
    drawResult.roomLabel = result.roomLabel;
    drawResult.locationLabel = result.locationLabel;
    drawResult.positionLabel = result.positionLabel;
    drawResult.message = data.value?.message || "";

    closeDrawModal();
    drawResult.open = true;
    message.success(data.value?.message || "Bốc thăm thành công");
    await fetchData();
  } catch (error) {
    message.error(error?.message || "Bốc thăm không thành công");
  } finally {
    drawingTeacherId.value = null;
  }
}

async function handleCancelAll() {
  if (!props.scheduleId) return;

  try {
    cancellingAll.value = true;
    const { data, error } = await RestApi.exam_schedule.cancel_assignment_result({
      params: { idLich: props.scheduleId },
    });

    if (data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || "Hủy kết quả không thành công");
    }

    message.success(data.value?.message || "Hủy kết quả thành công");
    await fetchData();
  } catch (error) {
    message.error(error?.message || "Hủy kết quả không thành công");
  } finally {
    cancellingAll.value = false;
  }
}

async function handleCancelSupervisor(group) {
  if (!props.scheduleId || !group?.supervisorId) return;

  try {
    cancellingSupervisorId.value = group.supervisorId;
    const { data, error } = await RestApi.exam_schedule.cancel_assignment_supervisor({
      params: { idLich: props.scheduleId, idGiamSat: group.supervisorId },
    });

    if (data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || "Hủy kết quả giám sát không thành công");
    }

    message.success(data.value?.message || "Hủy kết quả giám sát thành công");
    await fetchData();
  } catch (error) {
    message.error(error?.message || "Hủy kết quả giám sát không thành công");
  } finally {
    cancellingSupervisorId.value = null;
  }
}

async function handleCancelRoom(room) {
  if (!props.scheduleId || !room?.roomId) return;

  try {
    cancellingRoomId.value = room.roomId;
    const { data, error } = await RestApi.exam_schedule.cancel_assignment_room({
      params: { idLich: props.scheduleId, idPhong: room.roomId },
    });

    if (data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || "Hủy kết quả phòng không thành công");
    }

    message.success(data.value?.message || "Hủy kết quả phòng thành công");
    await fetchData();
  } catch (error) {
    message.error(error?.message || "Hủy kết quả phòng không thành công");
  } finally {
    cancellingRoomId.value = null;
  }
}

async function fetchData() {
  if (!props.scheduleId) return;

  try {
    loading.value = true;

    const [detailResponse, waitingResponse, unassignedResponse] = await Promise.all([
      RestApi.exam_schedule.assignment_detail({ params: { idLich: props.scheduleId } }),
      RestApi.exam_schedule.assignment_waiting_room({ params: { idLich: props.scheduleId } }),
      RestApi.exam_schedule.assignment_unassigned({ params: { idLich: props.scheduleId } }),
    ]);

    const detailData = detailResponse.data.value;
    const detailError = detailResponse.error.value;
    if (detailData?.status !== "success") {
      throw new Error(detailError?.data?.message || "Không tải được dữ liệu bốc thăm");
    }

    const waitingData = waitingResponse.data.value;
    const waitingError = waitingResponse.error.value;
    if (waitingData?.status !== "success") {
      throw new Error(waitingError?.data?.message || "Không tải được dữ liệu phòng chờ");
    }

    const unassignedData = unassignedResponse.data.value;
    const unassignedError = unassignedResponse.error.value;
    if (unassignedData?.status !== "success") {
      throw new Error(unassignedError?.data?.message || "Không tải được dữ liệu giám thị chưa xếp");
    }

    assignmentData.value = detailData?.data?.data || null;
    waitingList.value = mapTeacherList(waitingData?.data?.data || []);
    unassignedList.value = mapTeacherList(unassignedData?.data?.data || []);
  } catch (error) {
    assignmentData.value = null;
    waitingList.value = [];
    unassignedList.value = [];
    message.error(error?.message || "Không tải được dữ liệu bốc thăm");
  } finally {
    loading.value = false;
  }
}

function mapTeacherList(items) {
  return (items || []).map((teacher, index) => ({
    order: index + 1,
    id: teacher.id,
    code: teacher.ma || "",
    name: teacher.ho_va_ten || "--",
  }));
}

function resolveDrawResult(payload) {
  const candidate = payload?.data || payload || {};
  const room = candidate.phong || candidate.so_phong || candidate.ten_phong || candidate.room || candidate.room_name;
  const toa = candidate.toa || candidate.ten_toa || candidate.building;
  const tang = candidate.tang || candidate.ten_tang || candidate.floor;
  const position = candidate.vi_tri || candidate.vitri || candidate.position || candidate.ten_vi_tri;
  const teacherName = candidate.ho_va_ten || candidate.ten_giam_thi || candidate.giam_thi || candidate.teacher_name || "";

  const locationParts = [];
  if (toa) locationParts.push(`Tòa ${toa}`.replace("Tòa Tòa", "Tòa "));
  if (tang) locationParts.push(tang.toString().includes("Tầng") ? tang : `Tầng ${tang}`);

  return {
    teacherName,
    roomLabel: room ? `Phòng ${room}`.replace("Phòng Phòng", "Phòng ") : "",
    locationLabel: locationParts.join(" - "),
    positionLabel: position ? `Vị trí: ${position}` : "",
  };
}

function handleClose() {
  closeDrawModal();
  closeDrawResult();
  emit("update:open", false);
  emit("close");
}
</script>
