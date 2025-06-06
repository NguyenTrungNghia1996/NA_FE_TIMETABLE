<script setup>
// Các trạng thái quyền
const PERMISSION_STATE = {
  NO_ACCESS: 0,  // 00
  VIEW: 1,       // 01
  EDIT: 2,       // 10
};

// Mask 2 bit để lấy quyền
const PERMISSION_MASK = 0b11;

// Vị trí bit (shift) cho mỗi quyền (2 bit mỗi quyền)
const PERMISSION_SHIFT = {
  ADD_QUESTION: 0,
  IMPORT_QUESTIONS: 2,
  EDIT_QUESTIONS: 4,
  GEN_TEST_FILE: 6,
  MANAGE_EXAMS: 8,
};

// Tổng quyền của user (số nguyên)
const permissionBitmask = ref(0);

// Lấy quyền của 1 quyền tại vị trí shift
function getPermission(shift) {
  return (permissionBitmask.value >> shift) & PERMISSION_MASK;
}

// Cập nhật quyền mới cho vị trí shift
function setPermission(shift, state) {
  // Xóa 2 bit cũ
  permissionBitmask.value &= ~(PERMISSION_MASK << shift);
  // Gán 2 bit mới
  permissionBitmask.value |= (state << shift);
}

// Chuyển số thành chuỗi mô tả
function stateToString(state) {
  switch (state) {
    case PERMISSION_STATE.NO_ACCESS:
      return "Không xem";
    case PERMISSION_STATE.VIEW:
      return "Chỉ xem";
    case PERMISSION_STATE.EDIT:
      return "Sửa/Xóa";
    default:
      return "Không xác định";
  }
}

// Kiểm tra user có quyền ở mức độ nào
function hasPermission(shift, minState) {
  return getPermission(shift) >= minState;
}
</script>

<template>
  <div class="p-6 max-w-lg mx-auto">
    <h2 class="text-xl font-bold mb-6">Quản lý nhiều quyền 3 trạng thái với bitmask (Nuxt 3)</h2>

    <div v-for="(shift, perm) in PERMISSION_SHIFT" :key="perm" class="mb-4">
      <label class="font-semibold">{{ perm }}</label>
      <select
        :value="getPermission(shift)"
        @change="e => setPermission(shift, Number(e.target.value))"
        class="ml-4 border rounded p-1"
      >
        <option :value="PERMISSION_STATE.NO_ACCESS">Không xem</option>
        <option :value="PERMISSION_STATE.VIEW">Chỉ xem</option>
        <option :value="PERMISSION_STATE.EDIT">Sửa/Xóa</option>
      </select>
      <p class="mt-1 text-sm text-gray-600">Trạng thái: {{ stateToString(getPermission(shift)) }}</p>
    </div>

    <hr class="my-6" />

    <p><b>Bitmask tổng quyền (thập phân):</b> {{ permissionBitmask }}</p>
    <p><b>Bitmask tổng quyền (nhị phân):</b> {{ permissionBitmask.toString(2).padStart(16, "0") }}</p>

    <hr class="my-6" />

    <h3 class="font-bold mb-2">Kiểm tra quyền ví dụ:</h3>
    <p>Quyền Sửa/Xóa câu hỏi: 
      <b>{{ hasPermission(PERMISSION_SHIFT.ADD_QUESTION, PERMISSION_STATE.EDIT) ? "Có" : "Không" }}</b>
    </p>
    <p>Quyền Xem câu hỏi: 
      <b>{{ hasPermission(PERMISSION_SHIFT.ADD_QUESTION, PERMISSION_STATE.VIEW) ? "Có" : "Không" }}</b>
    </p>
  </div>
</template>

<style scoped>
select {
  min-width: 140px;
}
</style>

