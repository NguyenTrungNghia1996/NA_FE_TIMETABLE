<template>
  <div>
    <div v-for="ca in dsCa" :key="ca.id" class="mb-6">
      <h3 class="font-semibold mb-2">Ca {{ ca.id }}</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse">
          <thead>
            <tr>
              <th class="border p-2">Tiết / Ngày</th>
              <th v-for="ngay in ca.ds_Ngay" :key="ngay.id" class="border p-2">{{ ngay.ten }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tiet, pIdx) in ca.ds_Ngay[0].ds_Tiet" :key="pIdx">
              <td class="border p-2 text-center font-medium">Tiết {{ pIdx + 1 }}</td>
              <td
                v-for="ngay in ca.ds_Ngay"
                :key="ngay.id"
                class="border p-2 text-xs align-top min-w-[120px]"
              >
                <template v-if="ngay.ds_Tiet[pIdx].isRest">
                  <span class="italic text-gray-500">Nghỉ</span>
                </template>
                <template v-else-if="ngay.ds_Tiet[pIdx].ten_mon">
                  <div class="font-medium leading-tight">{{ ngay.ds_Tiet[pIdx].ten_mon }}</div>
                  <div class="text-gray-600">{{ ngay.ds_Tiet[pIdx].ten_giao_vien }}</div>
                </template>
                <template v-else>
                  <span class="text-gray-400">Trống</span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  dsCa: {
    type: Array,
    required: true,
  },
});
</script>
