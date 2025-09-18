<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-1">
    <a-card title="Danh sách lớp học" class="md:col-span-1">
      <ClassList ref="classRef" @select="handleSelectClass" />
    </a-card>
    <a-card v-if="selectedClassId" :title="'Danh sách môn học lớp ' + selectedClass.ten" class="md:col-span-1"> <SubjectList ref="subjectRef" :class-id="selectedClassId" @select="handleSubjectClass" /> </a-card>
    <a-card v-if="selectedClassId && selectedSubjectId" :title="'Các tiết nghỉ của lớp ' + selectedClass.ten + ' - ' + selectedSubject.ten" class="md:col-span-2">
      <div v-if="schedule" class="space-y-4">
        <div v-for="block in schedule.ds_Ca" :key="block.id">
          <Timetable :block="block" />
        </div>
      </div>
    </a-card>
    <div v-if="selectedClassId && selectedSubjectId" class="col-span-4">
      <div class="flex justify-center gap-2 mt-2">
        <a-button type="primary" :loading="saving" @click="handleSave">Lưu</a-button>
        <a-button danger @click="reset">Hủy</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { message } from "ant-design-vue";
const { RestApi } = useApi();

const selectedClassId = ref(null);
const selectedSubjectId = ref(null);

const selectedClass = ref();
const selectedSubject = ref();

const classRef = ref(null);
const subjectRef = ref(null);

const schedule = ref();
const saving = ref(false);

const handleSelectClass = record => {
  selectedClassId.value = record.id;
  selectedClass.value = record;
};
const handleSubjectClass = record => {
  selectedSubjectId.value = record.id;
  selectedSubject.value = record;
};

watch(
  [selectedClassId, selectedSubjectId],
  async ([clsId, subId]) => {
    if (clsId && subId) {
      try {
        const { data } = await RestApi.class.get_subject_avoid({
          params: { Id_lop: clsId, Id_mon: subId },
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
  },
  { immediate: true },
);

async function handleSave() {
  if (!selectedClassId.value || !selectedSubjectId.value) return;
  try {
    saving.value = true;
    const payload = {
      id_lop: selectedClassId.value,
      id_mon: selectedSubjectId.value,
      ds_Ca: schedule.value?.ds_Ca || [],
    };
    const { data, error } = await RestApi.class.update_subject_avoid({
      body: payload,
    });
    if (data.value?.status === "success") {
      message.success(data.value.message || "Cập nhật thành công");
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Cập nhật không thành công");
    }
  } catch (err) {
    console.error("Update class subject avoid error", err);
    message.error(err.message || "Lỗi cập nhật");
  } finally {
    saving.value = false;
  }
}

const reset = () => {
  selectedClassId.value = null;
  selectedSubjectId.value = null;
  schedule.value = undefined;
  subjectRef.value?.reset?.();
};

const refresh = async () => {
  await classRef.value?.refresh?.();
  if (selectedClassId.value) {
    await subjectRef.value?.refresh?.();
  }
  if (selectedClassId.value && selectedSubjectId.value) {
    const { data } = await RestApi.class.get_subject_avoid({
      params: { Id_lop: selectedClassId.value, Id_mon: selectedSubjectId.value },
    });
    if (data.value?.status === "success") {
      schedule.value = data.value.data;
    }
  }
};

defineExpose({ reset, refresh });
</script>
