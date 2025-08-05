<script setup>
const totalLessons = ref(400);
const arrangedLessons = ref(400);
const unarrangedLessons = ref(0);

const arrangeAll = () => {
  console.log("Xếp toàn trường");
};

const arrangePartial = type => {
  console.log("Xếp cục bộ:", type);
};

const cancelArrange = () => {
  console.log("Hủy kết quả xếp");
};

const props = defineProps({
  id: {
    type: [Number, String],
    // required: true
  }
})
</script>

<template>
  <div class=" min-h-screen">
    <!-- Header -->
    <div class="flex justify-end items-center mb-6">
      <!-- <h1 class="text-xl font-bold text-gray-700">THÔNG TIN THỜI KHÓA BIỂU</h1> -->
      <a-button type="primary" danger @click="cancelArrange"> Hủy kết quả xếp </a-button>
    </div>

    <!-- Info Section -->
    <div class="bg-white p-4 rounded-md shadow-lg mb-8">
      <p class="mb-2">
        <span class="font-semibold">Tên thời khóa biểu:</span>
        <span class="ml-2">Thời khóa biểu cả năm</span>
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
