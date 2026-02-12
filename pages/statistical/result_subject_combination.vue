<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="mb-3 w-full">
      <div class="w-full flex flex-col md:flex-row gap-2">
        <div class="w-full md:w-1/2">
          <SelectReviewSubjectCombination
            v-model="selectedSubjectCombinationId"
            no-form-item
            label=""
            placeholder="Chọn tổ hợp môn ôn"
            @update:modelValue="handleFiltersChange"
          />
        </div>
        <div class="w-full md:w-1/2 grade-filter">
          <SelectGradeLevelByUnit
            v-model="selectedGradeLevelId"
            label=""
            placeholder="Chọn khối lớp"
            @update:modelValue="handleFiltersChange"
          />
        </div>
      </div>
    </div>

    <a-spin :spinning="loading">
      <div class="overflow-x-auto">
        <table class="result-table min-w-full border-collapse">
          <thead>
            <tr>
              <th rowspan="2" class="fixed-col w-16">STT</th>
              <th rowspan="2" class="fixed-col w-36">Mã học sinh</th>
              <th rowspan="2" class="fixed-col min-w-[160px]">Họ và tên học sinh</th>
              <th rowspan="2" class="fixed-col min-w-[120px]">Môn</th>
              <th :colspan="totalScoreColumns" class="group-title">Kết quả ôn tập</th>
            </tr>
            <tr>
              <th v-if="!testTypes.length" class="test-type">-</th>
              <th v-for="type in testTypes" :key="type.id" :colspan="normalizeCount(type.so_luong)" class="test-type">
                {{ type.ten }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="!students.length">
              <td :colspan="4 + totalScoreColumns" class="empty-cell">
                {{ hasEnoughFilters ? "Không có dữ liệu" : "Vui lòng chọn tổ hợp môn ôn và khối lớp" }}
              </td>
            </tr>

            <template v-for="(student, studentIndex) in students" :key="student.ma || studentIndex">
              <tr v-for="(subjectRow, subjectIndex) in getSubjectRows(student)" :key="`${student.ma || studentIndex}-${subjectRow.ten_mon || subjectIndex}`">
                <template v-if="subjectIndex === 0">
                  <td :rowspan="getSubjectRowSpan(student)" class="text-center">{{ studentIndex + 1 }}</td>
                  <td :rowspan="getSubjectRowSpan(student)" class="text-center">{{ student.ma || "-" }}</td>
                  <td :rowspan="getSubjectRowSpan(student)">{{ student.ten || "-" }}</td>
                </template>

                <td>{{ subjectRow.ten_mon || "-" }}</td>

                <td v-if="!testTypes.length"></td>
                <template v-for="type in testTypes" :key="`${student.ma || studentIndex}-${subjectRow.ten_mon || ''}-${type.id}`">
                  <td
                    v-for="(score, scoreIndex) in getScoresByType(subjectRow, type)"
                    :key="`${student.ma || studentIndex}-${subjectRow.ten_mon || ''}-${type.id}-${scoreIndex}`"
                    class="text-center"
                  >
                    {{ formatScore(score) }}
                  </td>
                </template>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
const { RestApi } = useApi();
const settingStore = useSettingStore();

const loading = ref(false);
const testTypes = ref([]);
const students = ref([]);
const selectedSubjectCombinationId = ref(null);
const selectedGradeLevelId = ref(null);

const hasEnoughFilters = computed(
  () =>
    selectedSubjectCombinationId.value !== null &&
    selectedSubjectCombinationId.value !== undefined &&
    selectedSubjectCombinationId.value !== "" &&
    selectedGradeLevelId.value !== null &&
    selectedGradeLevelId.value !== undefined &&
    selectedGradeLevelId.value !== "",
);

const normalizeCount = value => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

const totalScoreColumns = computed(() => {
  if (!testTypes.value.length) {
    return 1;
  }
  return testTypes.value.reduce((sum, type) => sum + normalizeCount(type.so_luong), 0);
});

const getSubjectRows = student => {
  const list = student?.ds_mon;
  if (!Array.isArray(list) || !list.length) {
    return [{ ten_mon: "-", diem: {} }];
  }
  return list;
};

const getSubjectRowSpan = student => getSubjectRows(student).length;

const getRawScoreList = (subjectRow, type) => {
  const diem = subjectRow?.diem;
  if (!diem || typeof diem !== "object") {
    return [];
  }

  const directByName = diem[type.ten];
  if (Array.isArray(directByName)) {
    return directByName;
  }

  const directById = diem[String(type.id)];
  if (Array.isArray(directById)) {
    return directById;
  }

  return [];
};

const getScoresByType = (subjectRow, type) => {
  const amount = normalizeCount(type.so_luong);
  const raw = getRawScoreList(subjectRow, type);
  return Array.from({ length: amount }, (_, i) => raw[i] ?? null);
};

const formatScore = value => {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return "";
  }
  return `${n}`;
};

const resetData = () => {
  testTypes.value = [];
  students.value = [];
};

const fetchData = async () => {
  if (!hasEnoughFilters.value) {
    resetData();
    loading.value = false;
    settingStore.setLoading(false);
    return;
  }

  try {
    loading.value = true;
    settingStore.setLoading(true);

    const params = {
      Id_to_hop: selectedSubjectCombinationId.value,
      Id_khoi: selectedGradeLevelId.value,
    };

    const { data, error } = await RestApi.statistical.result_subject_combination({ params });

    if (data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || data.value?.message || "Không tải được dữ liệu tổng hợp kết quả theo tổ hợp môn");
    }

    const items = data.value?.data?.items || {};
    testTypes.value = Array.isArray(items.loai_kiem_tra) ? items.loai_kiem_tra : [];
    students.value = Array.isArray(items.rows) ? items.rows : [];
  } catch (err) {
    resetData();
    message.error(err.message || "Không tải được dữ liệu tổng hợp kết quả theo tổ hợp môn");
  } finally {
    loading.value = false;
    settingStore.setLoading(false);
  }
};

const handleFiltersChange = async () => {
  await fetchData();
};
</script>

<style scoped>
.grade-filter :deep(.ant-form-item) {
  margin-bottom: 0;
}

.result-table th,
.result-table td {
  border: 1px solid #d5dce1;
  padding: 8px;
  font-size: 14px;
}

.result-table thead th {
  background: #d7e7ef;
  color: #146c85;
  font-weight: 600;
}

.result-table .group-title,
.result-table .test-type {
  text-align: center;
}

.result-table .fixed-col {
  text-align: center;
  white-space: nowrap;
}

.result-table .empty-cell {
  text-align: center;
  color: #64748b;
}
</style>
