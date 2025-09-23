<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-1">
    <a-card title="DANH SÁCH MÔN HỌC" class="md:col-span-1">
      <div class="grid grid-cols-2 gap-2 mb-2">
        <SelectGradeLevelByUnit v-model="gradeId" />
        <SelectSchoolship v-model="shipId" />
      </div>
      <a-table
        :columns="columns"
        :data-source="subjects"
        :loading="loading"
        :pagination="false"
        size="small"
        row-key="id"
        :customRow="onRow"
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ column, index }">
          <template v-if="column.key === 'stt'">{{ index + 1 }}</template>
        </template>
      </a-table>
    </a-card>
    <a-card v-if="gradeId && shipId && selectedId" :title="'Các tiết học tránh xếp của môn: ' + grade.ten" class="md:col-span-2">
      <div v-if="schedule" class="space-y-4">
        <div v-for="block in schedule.ds_Ca" :key="block.id">
          <Timetable :block="block" />
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-2">
        <a-button type="primary" :loading="saving" @click="handleSave">Lưu</a-button>
        <a-button danger @click="reset">Hủy</a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { message } from "ant-design-vue";
const { RestApi } = useApi();

const gradeId = ref(null);
const grade = ref();
const shipId = ref(null);
const subjects = ref([]);
const loading = ref(false);
const selectedId = ref(null);
const schedule = ref();
const saving = ref(false);

const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Mã môn học", dataIndex: "ma", key: "code" },
  { title: "Tên môn học", dataIndex: "ten", key: "name" },
];

async function fetchSubjects(grade, ship) {
  if (!grade || !ship) {
    subjects.value = [];
    return;
  }
  try {
    loading.value = true;
    const { data } = await RestApi.subject.list({ params: { id_khoi: grade, id_ban: ship } });
    if (data.value?.status === "success") {
      subjects.value = data.value.data.items || [];
    } else {
      subjects.value = [];
    }
  } catch (err) {
    console.error("Fetch subjects error", err);
  } finally {
    loading.value = false;
  }
}

watch(
  [gradeId, shipId],
  ([g, b]) => {
    selectedId.value = null;
    schedule.value = undefined;
    fetchSubjects(g, b);
  },
  { immediate: true },
);

watch([gradeId, shipId, selectedId], async ([g, b, id]) => {
  if (g && b && id) {
    try {
      const { data } = await RestApi.subject_grade_level.get_avoid({
        params: { id_khoi: g, id_ban: b, id_mon: id },
      });
      if (data.value?.status === "success") {
        schedule.value = data.value.data;
      } else {
        schedule.value = undefined;
      }
    } catch (err) {
      console.error("Fetch avoid schedule error", err);
    }
  } else {
    schedule.value = undefined;
  }
});

async function handleSave() {
  if (!gradeId.value || !shipId.value || !selectedId.value) return;
  try {
    saving.value = true;
    const payload = {
      id_khoi: gradeId.value,
      id_ban: shipId.value,
      id_mon: selectedId.value,
      ds_Ca: schedule.value?.ds_Ca || [],
    };
    const { data, error } = await RestApi.subject_grade_level.update_avoid({ body: payload });
    if (data.value?.status === "success") {
      message.success(data.value.message || "Cập nhật thành công");
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Cập nhật không thành công");
    }
  } catch (err) {
    console.error("Update avoid error", err);
    message.error(err.message || "Lỗi cập nhật");
  } finally {
    saving.value = false;
  }
}

const reset = () => {
  selectedId.value = null;
  schedule.value = undefined;
};

const refresh = async () => {
  await fetchSubjects(gradeId.value, shipId.value);
  if (gradeId.value && shipId.value && selectedId.value) {
    const { data } = await RestApi.subject_grade_level.get_avoid({
      params: { id_khoi: gradeId.value, id_ban: shipId.value, id_mon: selectedId.value },
    });
    if (data.value?.status === "success") {
      schedule.value = data.value.data;
    }
  }
};

defineExpose({ reset, refresh });

const onRow = record => {
  return {
    onClick: () => {
      selectedId.value = record.id;
      grade.value = record;
    },
    style: { cursor: "pointer" },
  };
};

// Highlight active selected subject row
const rowClassName = record => (record.id === selectedId.value ? 'active-row' : '');
</script>

<style scoped>
:deep(.active-row > td) {
  background-color: #e6f7ff !important;
}
</style>
