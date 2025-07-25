<template>
  <div class="p-4 bg-white min-h-screen space-y-2">
    <!-- Header Section -->
    <div class="flex justify-end">
      <div class="flex space-x-3">
        <a-button type="primary" class="bg-orange-500 border-orange-500 hover:bg-orange-600" @click="handleAvoid">
          Tiết tránh xếp
        </a-button>
        <a-button type="primary" class="bg-blue-600 border-blue-600 hover:bg-blue-700" @click="handleUpdate">
          Cập nhật
        </a-button>
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
      <a-form :model="filters" layout="vertical" :rules="rules" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectGradeLevel v-model="filters.grade" name="grade" :rules="rules.grade" placeholder="Chọn khối lớp" />
        <SelectSchoolship v-model="filters.major" name="major" :rules="rules.major" placeholder="Chọn ban học" />
        <SelectSchoolShift v-model="filters.shift" name="shift" :rules="rules.shift" placeholder="Chọn ca học" />
      </a-form>
      <ClientOnly>
        <a-table row-key="id" :columns="columns" :data-source="subjects" bordered size="middle" :pagination="false" :scroll="{ x: 'max-content' }" class="custom-table">
          <template #bodyCell="{ column, record, index }">
            <!-- STT Column -->
            <template v-if="column.key === 'stt'">
              <span class="font-medium">{{ index + 1 }}</span>
            </template>

            <!-- Weekly Hours Column -->
            <template v-if="column.key === 'weekly'">
              <span>{{ record.weekly }}</span>
            </template>

            <!-- Morning Period Column -->
            <template v-if="column.key === 'morningPeriod'">
              <a-input-number v-if="record.editable" v-model:value="record.morning.period" :min="0" size="small" class="w-full" />
              <span v-else>{{ record.morning.period || '-' }}</span>
            </template>

            <!-- Morning Group Column -->
            <template v-if="column.key === 'morningGroup'">
              <a-input-number v-if="record.editable" v-model:value="record.morning.group" :min="0" size="small" class="w-full" />
              <span v-else>{{ record.morning.group || '-' }}</span>
            </template>

            <!-- Afternoon Period Column -->
            <template v-if="column.key === 'afternoonPeriod'">
              <a-input-number v-if="record.editable" v-model:value="record.afternoon.period" :min="0" size="small" class="w-full" />
              <span v-else>{{ record.afternoon.period || '-' }}</span>
            </template>

            <!-- Afternoon Group Column -->
            <template v-if="column.key === 'afternoonGroup'">
              <a-input-number v-if="record.editable" v-model:value="record.afternoon.group" :min="0" size="small" class="w-full" />
              <span v-else>{{ record.afternoon.group || '-' }}</span>
            </template>

            <!-- Action Column -->
            <template v-if="column.key === 'action'">
              <div class="flex justify-center space-x-2">
                <a-switch v-model:checked="record.editable" size="small" @change="onEditableChange(record)" />
              </div>
            </template>
          </template>
        </a-table>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup>
const { RestApi } = useApi();
const filters = reactive({
  grade: undefined,
  major: undefined,
  shift: undefined
});

const rules = {
  grade: [{ required: true, message: 'Vui lòng chọn khối lớp' }],
  major: [{ required: true, message: 'Vui lòng chọn ban học' }],
  shift: [{ required: true, message: 'Vui lòng chọn ca học' }],
};

const summary = reactive({
  total: 0,
  morning: 0,
  afternoon: 0
});

const subjects = ref([]);

const columns = [
  {
    title: 'STT',
    key: 'stt',
    width: 60,
    align: 'center',
    fixed: 'left'
  },
  {
    title: 'Tên môn học',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    fixed: 'left'
  },
  {
    title: 'Số tiết/tuần',
    dataIndex: 'weekly',
    key: 'weekly',
    align: 'center',
    width: 120
  },
  {
    title: 'Ca sáng',
    children: [
      {
        title: 'Số tiết',
        key: 'morningPeriod',
        align: 'center',
        width: 120
      },
      {
        title: 'Số nhóm',
        key: 'morningGroup',
        align: 'center',
        width: 120
      }
    ]
  },
  {
    title: 'Ca chiều',
    children: [
      {
        title: 'Số tiết',
        key: 'afternoonPeriod',
        align: 'center',
        width: 120
      },
      {
        title: 'Số nhóm',
        key: 'afternoonGroup',
        align: 'center',
        width: 120
      }
    ]
  },
  {
    title: 'Thao tác',
    key: 'action',
    align: 'center',
    width: 120,
    fixed: 'right'
  }
];

// Watch for changes in subjects to update summary
watch(
  subjects,
  (val) => {
    val.forEach((r) => {
      r.weekly = (r.morning.period || 0) + (r.afternoon.period || 0);
    });
    summary.total = val.reduce((s, r) => s + ((r.morning.period || 0) + (r.afternoon.period || 0)), 0);
    summary.morning = val.reduce((s, r) => s + (r.morning.period || 0), 0);
    summary.afternoon = val.reduce((s, r) => s + (r.afternoon.period || 0), 0);
  },
  { deep: true, immediate: true }
);

const onEditableChange = (record) => {
  if (record.editable == false) {
    record.morning.period = 0;
    record.morning.group = 0;
    record.afternoon.period = 0;
    record.afternoon.group = 0;
  }
};


const handleAvoid = () => {
  // TODO: Implement avoid schedule logic
  console.log('Tiết tránh xếp clicked');
};

const handleUpdate = () => {
  // TODO: Implement update logic
  console.log('Cập nhật clicked');
};

const convertFromApi = (data) => {
  const list = data.ds_Mon || data.ds_mon || [];
  return list.map(mon => {
    const findById = (arr, id) => arr.find(c => (c.id ?? c.id_ca) === id) || {};
    return {
      id: mon.id_mon,
      name: mon.ten_mon,
      weekly: (mon.ds_Ca[0]?.so_tiet || 0) + (mon.ds_Ca[1]?.so_tiet || 0),
      morning: {
        period: findById(mon.ds_Ca, 1).so_tiet || 0,
        group: findById(mon.ds_Ca, 1).so_nhom || 0,
      },
      afternoon: {
        period: findById(mon.ds_Ca, 2).so_tiet || 0,
        group: findById(mon.ds_Ca, 2).so_nhom || 0,
      },
      editable: mon.trang_thai,
    };
  });
};
const convertToApi = () => {
  return {
    id_khoi: filters.grade,
    id_ban: filters.major,
    ds_mon: subjects.value.map(mon => ({
      id_mon: mon.id,
      ten_mon: mon.name,
      ds_Ca: [
        {
          id: 1,
          so_tiet: mon.morning.period,
          so_nhom: mon.morning.group,
        },
        {
          id: 2,
          so_tiet: mon.afternoon.period,
          so_nhom: mon.afternoon.group,
        },
      ],
      trang_thai: mon.editable,
    }))
  };
};

const fetchSubjects = async () => {
  try {
    const { data } = await RestApi.subject_grade_level.list({
      params: { idKhoi: filters.grade, idBan: filters.major }
    })
    console.log("🚀 ~ fetchSubjects ~ data:", data)
    if (data.value?.status === 'success' && data.value.data.length) {
      subjects.value = convertFromApi(data.value.data[0]);
    } else {
      subjects.value = []
    }
  } catch (e) {
    console.error('Failed to fetch subjects', e);
  }
};

watch(
  () => [filters.grade, filters.major],
  async ([grade, major]) => {
    if (grade !== undefined && major !== undefined) {
      await fetchSubjects();
    }
  },
  { immediate: true }
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