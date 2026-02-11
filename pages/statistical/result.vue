<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="mb-3 w-full">
      <div class="w-full">
        <div class="w-full">
          <SelectReviewClass v-model="selectedReviewClassId" no-form-item label="" @update:modelValue="handleReviewClassChange" />
        </div>
        <!-- <a-button :loading="loading" @click="fetchData">Tải lại</a-button> -->
      </div>
    </div>

    <a-spin :spinning="loading">
      <div class="overflow-x-auto">
        <table class="result-table min-w-full border-collapse">
          <thead>
            <tr>
              <th rowspan="2" class="fixed-col w-16">STT</th>
              <th rowspan="2" class="fixed-col w-36">Mã học sinh</th>
              <th rowspan="2" class="fixed-col min-w-[150px]">Họ và tên học sinh</th>
              <th rowspan="2" class="fixed-col min-w-[140px]">Lớp ôn tập</th>
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
              <td :colspan="4 + totalScoreColumns" class="empty-cell">Không có dữ liệu</td>
            </tr>
            <tr v-for="(student, rowIndex) in students" :key="student.ma || rowIndex">
              <td class="text-center">{{ rowIndex + 1 }}</td>
              <td class="text-center">{{ student.ma || '-' }}</td>
              <td>{{ student.ten || '-' }}</td>
              <td>{{ student.lop_on || '-' }}</td>
              <td v-if="!testTypes.length"></td>

              <template v-for="type in testTypes" :key="`${student.ma || rowIndex}-${type.id}`">
                <td
                  v-for="(score, scoreIndex) in getScoresByType(student, type)"
                  :key="`${student.ma || rowIndex}-${type.id}-${scoreIndex}`"
                  class="text-center"
                >
                  {{ formatScore(score) }}
                </td>
              </template>
            </tr>
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
const selectedReviewClassId = ref(null);

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

const getRawScoreList = (student, type) => {
  const diem = student?.diem;
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

const getScoresByType = (student, type) => {
  const amount = normalizeCount(type.so_luong);
  const raw = getRawScoreList(student, type);

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
  return n.toFixed(2);
};

const fetchData = async () => {
  try {
    loading.value = true;
    settingStore.setLoading(true);

    const params = {};
    if (selectedReviewClassId.value !== null && selectedReviewClassId.value !== undefined && selectedReviewClassId.value !== "") {
      params.Id_lop_on = selectedReviewClassId.value;
    }

    const { data, error } = await RestApi.statistical.result({ params });

    if (data.value?.status !== "success") {
      throw new Error(error.value?.data?.message || data.value?.message || "Không tải được dữ liệu tổng hợp kết quả");
    }

    const items = data.value?.data?.items || {};
    testTypes.value = Array.isArray(items.loai_kiem_tra) ? items.loai_kiem_tra : [];
    students.value = Array.isArray(items.rows) ? items.rows : [];
  } catch (err) {
    testTypes.value = [];
    students.value = [];
    message.error(err.message || "Không tải được dữ liệu tổng hợp kết quả");
  } finally {
    loading.value = false;
    settingStore.setLoading(false);
  }
};

const handleReviewClassChange = async () => {
  await fetchData();
};

onMounted(fetchData);
</script>

<style scoped>
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
