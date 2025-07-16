<template>
  <div v-if="teacher" class="mt-10 space-y-4">
    <h2 class="text-lg font-bold">Bảng lịch giáo viên</h2>
    <div class="space-y-2">
      <h3 class="font-semibold">{{ teacher.name }}</h3>
      <div v-for="(ca, ci) in teacher.ds_Ca" :key="ci" class="space-y-1">
        <h4 class="font-medium">Ca {{ ca.id }}</h4>
        <table class="min-w-full table-fixed border border-gray-200 text-sm">
          <thead>
            <tr>
              <th class="border p-1 w-32">Tiết / Ngày</th>
              <th v-for="day in ca.ds_Ngay" :key="day.id" class="border p-1">{{ day.ten }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tiet, ti) in ca.ds_Ngay[0].ds_Tiet" :key="ti">
              <td class="border p-1 text-center w-32 h-20">Tiết {{ ti + 1 }}</td>
              <td
                v-for="(day, di) in ca.ds_Ngay"
                :key="di"
                class="border p-1 text-center w-32 h-20 overflow-hidden"
                :class="teacherCellClass(teacher.id, ci, di, ti, day.ds_Tiet[ti].className)"
                @click="teacherCellClick(ci, di, ti, day.ds_Tiet[ti].className, teacher.id)"
              >
                <span v-if="day.ds_Tiet[ti].className" class="line-clamp-2 block">
                  {{ day.ds_Tiet[ti].className }} - {{ day.ds_Tiet[ti].subject }}
                </span>
                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTimetableDnD } from '~/composables/useTimetableDnD'

const props = defineProps({
  teacher: Object
})

const { teacherCellClass, teacherCellClick } = useTimetableDnD()
</script>

<style scoped></style>
