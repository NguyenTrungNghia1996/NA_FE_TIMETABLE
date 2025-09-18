<template>
  <div class="p-4 bg-white min-h-screen space-y-2">
    <!-- Header Section -->
    <div class="flex justify-end">
      <div class="flex space-x-3">
        <a-button type="primary" class="bg-orange-500 border-orange-500 hover:bg-orange-600" @click="handleAvoid"> Tiết tránh xếp </a-button>
        <a-button type="primary" class="bg-blue-600 border-blue-600 hover:bg-blue-700" @click="handleUpdate"> Cập nhật </a-button>
      </div>
    </div>

    <!-- Summary Card -->
    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-700 mb-3">TỔNG SỐ TIẾT HỌC</h2>
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white p-3 rounded border border-gray-200 text-center">
          <div class="text-gray-500 text-sm">Tổng số tiết/tuần</div>
          <div class="text-2xl font-bold text-blue-600">{{ summary.total }}</div>
        </div>
        <div class="bg-white p-3 rounded border border-gray-200 text-center">
          <div class="text-gray-500 text-sm">Ca sáng</div>
          <div class="text-2xl font-bold text-amber-600">{{ summary.morning }}</div>
        </div>
        <div class="bg-white p-3 rounded border border-gray-200 text-center">
          <div class="text-gray-500 text-sm">Ca chiều</div>
          <div class="text-2xl font-bold text-indigo-600">{{ summary.afternoon }}</div>
        </div>
      </div>
    </div>
    <!-- Subjects Table -->
    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-700 mb-3">DANH SÁCH MÔN HỌC</h2>
      <a-form ref="filterForm" :model="filters" layout="vertical" :rules="rules" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectGradeLevelByUnit v-model="filters.grade" name="grade" :rules="rules.grade" placeholder="Chọn khối lớp" />
        <SelectSchoolship v-model="filters.major" name="major" :rules="rules.major" placeholder="Chọn ban học" />
        <SelectSchoolShiftByUnit v-model="filters.shift" name="shift" placeholder="Chọn ca học" />
      </a-form>
      <ClientOnly>
        <a-table row-key="id" :columns="displayColumns" :data-source="subjects" bordered size="middle" :pagination="false" :scroll="{ x: 'max-content' }" class="custom-table">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'stt'">
              <span class="font-medium">{{ index + 1 }}</span>
            </template>
            <template v-if="column.key === 'weekly'">
              <span>{{ record.weekly }}</span>
            </template>
            <template v-else-if="isShiftColumn(column.key)">
              <template v-if="getShiftField(column.key) === 'period'">
                <a-input-number v-if="record.editable" v-model:value="record.shifts[getShiftId(column.key)].period" :min="0" size="small" class="w-full" />
                <span v-else>{{ record.shifts[getShiftId(column.key)]?.period ?? "-" }}</span>
              </template>
              <template v-else>
                <a-input-number v-if="record.editable" v-model:value="record.shifts[getShiftId(column.key)].group" :min="0" size="small" class="w-full" />
                <span v-else>{{ record.shifts[getShiftId(column.key)]?.group ?? "-" }}</span>
              </template>
            </template>
            <template v-if="column.key === 'action'">
              <div class="flex justify-center space-x-2">
                <a-switch v-model:checked="record.editable" size="small" @change="onEditableChange(record)" />
              </div>
            </template>
          </template>
        </a-table>
      </ClientOnly>
      <a-drawer v-model:open="drawerAvoidOpen" title="Thiết lập tiết tránh xếp của môn học theo khối" :footer="null" height="100vh" placement="bottom" @close="closeDrawerAvoid">
        <ClientOnly>
          <GradeSubjectAvoid ref="avoidRef" />
        </ClientOnly>
      </a-drawer>
    </div>
  </div>
</template>

<script setup>
const { RestApi } = useApi();
const filterForm = ref();
const filters = reactive({
  grade: undefined,
  major: undefined,
  shift: undefined,
});

const rules = {
  grade: [{ required: true, message: "Vui lòng chọn khối lớp" }],
  major: [{ required: true, message: "Vui lòng chọn ban học" }],
};

const summary = reactive({
  total: 0,
  morning: 0,
  afternoon: 0,
});

const subjects = ref([]);
const availableShifts = ref([]);

const drawerAvoidOpen = ref(false);
const avoidRef = ref(null);

const closeDrawerAvoid = () => {
  avoidRef.value?.reset?.();
};

watch(drawerAvoidOpen, val => {
  if (val) {
    avoidRef.value?.refresh?.();
  }
});

const baseColumns = [
  {
    title: "STT",
    key: "stt",
    width: 60,
    align: "center",
    fixed: "left",
  },
  {
    title: "Tên môn học",
    dataIndex: "name",
    key: "name",
    width: 150,
    fixed: "left",
  },
  {
    title: "Số tiết/tuần",
    dataIndex: "weekly",
    key: "weekly",
    align: "center",
    width: 120,
  },
];

const actionColumn = {
  title: "Thao tác",
  key: "action",
  align: "center",
  width: 120,
  fixed: "right",
};

const displayColumns = computed(() => {
  const selectedShiftId = filters.shift !== undefined && filters.shift !== null ? String(filters.shift) : undefined;
  const shiftColumnsSource = selectedShiftId
    ? availableShifts.value.filter(shift => String(shift.id) === selectedShiftId)
    : availableShifts.value;

  const shiftColumns = shiftColumnsSource.map(shift => ({
    title: shift.name || `Ca ${shift.id}`,
    key: `shift-${shift.id}`,
    children: [
      {
        title: "Số tiết",
        key: `shift-${shift.id}-period`,
        align: "center",
        width: 120,
      },
      {
        title: "Số nhóm",
        key: `shift-${shift.id}-group`,
        align: "center",
        width: 120,
      },
    ],
  }));

  return [...baseColumns, ...shiftColumns, actionColumn];
});

const isShiftColumn = key => {
  const value = key ?? "";
  return value.startsWith("shift-") && (value.endsWith("-period") || value.endsWith("-group"));
};

const getShiftField = key => {
  if ((key ?? "").endsWith("-period")) return "period";
  if ((key ?? "").endsWith("-group")) return "group";
  return undefined;
};

const getShiftId = key => {
  if (!isShiftColumn(key)) return undefined;
  const value = key ?? "";
  return value.slice(6, value.lastIndexOf("-"));
};

// Keep summary totals regardless of selected shift
watch(
  subjects,
  val => {
    val.forEach(r => {
      const total = Object.values(r.shifts || {}).reduce((sum, shift) => sum + (Number(shift.period) || 0), 0);
      r.weekly = total;
    });
    summary.morning = val.reduce((s, r) => s + (Number(r.shifts?.["1"]?.period) || 0), 0);
    summary.afternoon = val.reduce((s, r) => s + (Number(r.shifts?.["2"]?.period) || 0), 0);
    summary.total = val.reduce((s, r) => s + (Number(r.weekly) || 0), 0);
  },
  { deep: true, immediate: true },
);

const onEditableChange = record => {
  if (record.editable == false) {
    Object.values(record.shifts || {}).forEach(shift => {
      shift.period = 0;
      shift.group = 0;
    });
  }
};

const handleAvoid = () => {
  drawerAvoidOpen.value = true;
};

const handleUpdate = async () => {
  try {
    await filterForm.value.validate();
    const payload = convertToApi();
    const { data, error } = await RestApi.subject_grade_level.create({ body: payload });
    if (data.value?.status === "success") {
      message.success(data.value.message || "Cập nhật thành công");
    } else {
      throw new Error(error.value?.data?.message || "Cập nhật không thành công");
    }
  } catch (err) {
    message.error(err.message || err.response?.data?.message || "Đã xảy ra lỗi khi cập nhật");
  }
};

const convertFromApi = data => {
  const list = data.ds_Mon || data.ds_mon || [];
  const shiftMap = new Map();

  const records = list.map(mon => {
    const shifts = {};
    const shiftOrder = [];

    (mon.ds_Ca || mon.ds_ca || []).forEach(ca => {
      const shiftId = String(ca.id_ca ?? ca.id);
      shiftOrder.push(shiftId);
      shifts[shiftId] = {
        id: shiftId,
        name: ca.ten_ca || shiftMap.get(shiftId) || `Ca ${shiftId}`,
        period: Number(ca.so_tiet) || 0,
        group: Number(ca.so_nhom) || 0,
      };
      if (!shiftMap.has(shiftId)) {
        shiftMap.set(shiftId, ca.ten_ca || `Ca ${shiftId}`);
      }
    });

    return {
      id: mon.id_mon ?? mon.id,
      name: mon.ten_mon,
      weekly: Object.values(shifts).reduce((sum, shift) => sum + (Number(shift.period) || 0), 0),
      shifts,
      shiftOrder,
      editable: Boolean(mon.trang_thai),
    };
  });

  const shiftList = Array.from(shiftMap, ([id, name]) => ({ id, name }));

  records.forEach(record => {
    shiftList.forEach(({ id, name }) => {
      if (!record.shifts[id]) {
        record.shifts[id] = {
          id,
          name,
          period: 0,
          group: 0,
        };
      }
    });
    if (!record.shiftOrder.length) {
      record.shiftOrder = shiftList.map(shift => shift.id);
    } else {
      const missing = shiftList
        .map(shift => shift.id)
        .filter(id => !record.shiftOrder.includes(id));
      record.shiftOrder.push(...missing);
    }
    record.weekly = Object.values(record.shifts).reduce((sum, shift) => sum + (Number(shift.period) || 0), 0);
  });

  availableShifts.value = shiftList;

  return records;
};
const convertToApi = () => {
  return {
    id_khoi: filters.grade,
    id_ban: filters.major,
    ds_Mon: subjects.value.map(mon => ({
      id_Mon: mon.id,
      ten_mon: mon.name,
      ds_Ca: (mon.shiftOrder?.length ? mon.shiftOrder : availableShifts.value.map(shift => shift.id))
        .map(id => mon.shifts?.[id])
        .filter(Boolean)
        .map(shift => {
          const parsedId = Number(shift.id);
          return {
            id_ca: Number.isNaN(parsedId) ? shift.id : parsedId,
            ten_ca: shift.name,
            so_tiet: shift.period,
            so_nhom: shift.group,
          };
        }),
      trang_thai: mon.editable,
    })),
  };
};

const fetchSubjects = async () => {
  try {
    const { data } = await RestApi.subject_grade_level.list({
      params: { idKhoi: filters.grade, idBan: filters.major },
    });
    if (data.value?.status === "success" && data.value.data.length) {
      subjects.value = convertFromApi(data.value.data[0]);
    } else {
      subjects.value = [];
      availableShifts.value = [];
    }
  } catch (e) {
    console.error("Failed to fetch subjects", e);
  }
};

watch(availableShifts, list => {
  if (!list.some(shift => String(shift.id) === String(filters.shift))) {
    filters.shift = undefined;
  }
});

watch(
  () => [filters.grade, filters.major],
  async ([grade, major]) => {
    if (grade !== undefined && major !== undefined) {
      await fetchSubjects();
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.custom-table :deep(.ant-table-thead > tr > th) {
  background-color: #eff6ff;
  /* Tailwind's bg-blue-50 */
  font-weight: 600;
  /* Tailwind's font-semibold */
  color: #374151;
  /* Tailwind's text-gray-700 */
}

.custom-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #eff6ff;
  /* Tailwind's bg-blue-50 hex value */
}
</style>
