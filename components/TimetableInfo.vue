<script setup>
const props = defineProps({
  timetableId: {
    type: [Number, String],
    required: true,
  },
});

const { RestApi } = useApi();

const info = reactive({
  ten: "",
  tong_tat_ca_tiet: 0,
  tong_tiet_da_xep: 0,
  tong_tiet_chua_xep: 0,
});

const totalLessons = computed(() => info.tong_tat_ca_tiet);
const arrangedLessons = computed(() => info.tong_tiet_da_xep);
const unarrangedLessons = computed(() => info.tong_tiet_chua_xep);

const settingStore = useSettingStore();
const arrangeAll = async () => {
  settingStore.setLoading(true);
  try {
    const { data, status, error } = await RestApi.timetable.arrange_all({
      params: { Idtkb: props.timetableId },
    });
    if (data.value.status == "success") {
      message.success(data.value.data || "");
    }
  } catch (err) {
    console.error("Arrange all error", err);
  } finally {
    await fetchInfo();
  }
  settingStore.setLoading(false);
};

const arrangePartial = type => {
  // 'Xếp Phòng chức năng', 'Xếp GVCN', 'Xếp Môn học', 'Xếp Giáo viên', 'Xếp Nhóm', 'Xếp Lớp', 'Xếp Lớp - Môn', 'Xếp Khối - Môn', 'Xếp Phòng học'
  // console.log("Xếp cục bộ:", type);
  switch (type) {
    case "Xếp Phòng chức năng":
      console.log("Thực hiện xếp Phòng chức năng");
      break;
    case "Xếp GVCN":
      console.log("Thực hiện xếp Giáo viên chủ nhiệm");
      break;
    case "Xếp Môn học":
      console.log("Thực hiện xếp Môn học");
      break;
    case "Xếp Giáo viên":
      console.log("Thực hiện xếp Giáo viên");
      break;
    case "Xếp Nhóm":
      console.log("Thực hiện xếp Nhóm");
      break;
    case "Xếp Lớp":
      console.log("Thực hiện xếp Lớp");
      break;
    case "Xếp Lớp - Môn":
      console.log("Thực hiện xếp Lớp - Môn");
      break;
    case "Xếp Khối - Môn":
      console.log("Thực hiện xếp Khối - Môn");
      break;
    case "Xếp Phòng học":
      console.log("Thực hiện xếp Phòng học");
      break;
    default:
      console.log("Chức năng không hợp lệ");
  }
};

const cancelArrange = () => {
  console.log("Hủy kết quả xếp");
};

async function fetchInfo() {
  // if (!props.timetableId) return;
  // settingStore.setLoading(true);
  try {
    const { data } = await RestApi.timetable.detail({
      params: { Id: props.timetableId },
    });
    if (data.value?.status === "success") {
      Object.assign(info, data.value.data || {});
    } else {
      reset();
    }
  } catch (err) {
    console.error("Fetch timetable info error", err);
  }
  // settingStore.setLoading(false);
}

function reset() {
  Object.assign(info, {
    ten: "",
    tong_tat_ca_tiet: 0,
    tong_tiet_da_xep: 0,
    tong_tiet_chua_xep: 0,
  });
}

async function refresh() {
  await fetchInfo();
}

// watch(() => props.timetableId, await fetchInfo(), { immediate: true });
onMounted(fetchInfo);
watch(() => props.timetableId, fetchInfo);
defineExpose({ refresh, reset });
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <div class="flex justify-end items-center mb-6">
      <!-- <h1 class="text-xl font-bold text-gray-700">THÔNG TIN THỜI KHÓA BIỂU</h1> -->
      <a-button type="primary" danger @click="cancelArrange"> Hủy kết quả xếp </a-button>
    </div>

    <!-- Info Section -->
    <div class="bg-white p-4 rounded-md shadow-lg mb-8">
      <p class="mb-2">
        <span class="font-semibold">Tên thời khóa biểu:</span>
        <span class="ml-2">{{ info.ten }}</span>
      </p>
      <p class="mb-2">
        <span class="font-semibold">Tổng số tiết: </span>
        <span class="ml-2 text-blue-500">{{ totalLessons }} tiết</span>
      </p>
      <p class="mb-2">
        <span class="font-semibold">Tiết đã xếp: </span>
        <span class="ml-2 text-green-500">{{ arrangedLessons }} tiết</span>
      </p>
      <p>
        <span class="font-semibold">Tiết chưa xếp: </span>
        <span class="ml-2 text-red-500">{{ unarrangedLessons }} tiết</span>
      </p>
    </div>

    <!-- Action Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Xếp toàn trường -->
      <div class="bg-white p-4 rounded-md shadow-lg flex flex-col items-center">
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Xếp toàn trường <span class="text-sm text-gray-500">(Xếp tự động)</span></h2>
        <a-button type="primary" class="bg-green-500 border-green-500" @click="arrangeAll"> Xếp Thời khóa biểu </a-button>
      </div>

      <!-- Xếp cục bộ -->
      <div class="bg-white p-4 rounded-md shadow-lg col-span-2">
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Xếp cục bộ <span class="text-sm text-gray-500">(Xếp từng phần)</span></h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <a-button v-for="btn in ['Xếp Phòng chức năng', 'Xếp GVCN', 'Xếp Môn học', 'Xếp Giáo viên', 'Xếp Nhóm', 'Xếp Lớp', 'Xếp Lớp - Môn', 'Xếp Khối - Môn', 'Xếp Phòng học']" :key="btn" type="primary" class="bg-blue-500 border-blue-500" @click="arrangePartial(btn)">
            {{ btn }}
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
