<!-- <script setup>
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
</style> -->
<script setup>
// Quy định quyền theo 3 trạng thái
const PERMISSION_STATE = {
  NO_ACCESS: 0,
  VIEW: 1,
  EDIT: 2,
}

// Sử dụng 2 bit cho mỗi quyền
const PERMISSION_MASK = 0b11

// Bit offset cho từng nhóm quyền
const PERMISSION_SHIFT = {
  DASHBOARD: 0,
  USER_MANAGEMENT: 2,
  QUESTIONS: 4,
  EXAMS: 6,
}

// Danh sách quyền để chỉnh sửa + hiển thị menu
const menuList = [
  { title: 'Dashboard', key: 'dashboard', shift: PERMISSION_SHIFT.DASHBOARD },
  { title: 'User Management', key: 'user_mgmt', shift: PERMISSION_SHIFT.USER_MANAGEMENT },
  { title: 'Questions', key: 'questions', shift: PERMISSION_SHIFT.QUESTIONS },
  { title: 'Exams', key: 'exams', shift: PERMISSION_SHIFT.EXAMS },
]

// Giả lập phân quyền (bitmask)
const permissionBitmask = ref(
  (PERMISSION_STATE.VIEW << PERMISSION_SHIFT.DASHBOARD) |
  (PERMISSION_STATE.EDIT << PERMISSION_SHIFT.QUESTIONS)
)

// Hàm lấy quyền từ bitmask
function getPermission(shift) {
  return (permissionBitmask.value >> shift) & PERMISSION_MASK
}

// Hàm cập nhật quyền
function updatePermission(shift, newState) {
  // Xoá quyền cũ (clear 2 bit)
  permissionBitmask.value &= ~(PERMISSION_MASK << shift)
  // Gán quyền mới
  permissionBitmask.value |= (newState << shift)
}

// Lọc menu có quyền hiển thị
const visibleMenuList = computed(() =>
  menuList.filter(menu => getPermission(menu.shift) >= PERMISSION_STATE.VIEW)
)
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto space-y-6">
    <h2 class="text-2xl font-bold">🎛️ Quản lý phân quyền</h2>

    <!-- Bảng chỉnh sửa quyền -->
    <table class="w-full text-left border rounded">
      <thead class="bg-gray-100">
        <tr>
          <th class="p-2">Tính năng</th>
          <th class="p-2 text-center">Không có</th>
          <th class="p-2 text-center">Xem</th>
          <th class="p-2 text-center">Sửa</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="menu in menuList" :key="menu.key" class="border-t">
          <td class="p-2 font-medium">{{ menu.title }}</td>
          <td class="p-2 text-center">
            <input
              type="radio"
              :name="menu.key"
              :checked="getPermission(menu.shift) === PERMISSION_STATE.NO_ACCESS"
              @change="updatePermission(menu.shift, PERMISSION_STATE.NO_ACCESS)"
            />
          </td>
          <td class="p-2 text-center">
            <input
              type="radio"
              :name="menu.key"
              :checked="getPermission(menu.shift) === PERMISSION_STATE.VIEW"
              @change="updatePermission(menu.shift, PERMISSION_STATE.VIEW)"
            />
          </td>
          <td class="p-2 text-center">
            <input
              type="radio"
              :name="menu.key"
              :checked="getPermission(menu.shift) === PERMISSION_STATE.EDIT"
              @change="updatePermission(menu.shift, PERMISSION_STATE.EDIT)"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <hr />

    <h3 class="text-xl font-semibold mt-4">📋 Menu hiển thị theo quyền</h3>

    <ul>
      <li
        v-for="menu in visibleMenuList"
        :key="menu.key"
        class="mb-3 p-3 border rounded flex justify-between items-center"
      >
        <span>{{ menu.title }}</span>

        <button
          v-if="getPermission(menu.shift) === PERMISSION_STATE.EDIT"
          class="text-sm text-blue-600 hover:underline"
          @click="alert('Edit ' + menu.title)"
        >
          Sửa
        </button>
      </li>
    </ul>

    <div class="text-sm mt-6 text-gray-500">
      <p><b>Bitmask (số thập phân):</b> {{ permissionBitmask }}</p>
      <p><b>Bitmask (nhị phân):</b> {{ permissionBitmask.toString(2).padStart(8, '0') }}</p>
    </div>
  </div>
</template>

