<template>
  <div class="mt-4">
    <h4 class="font-semibold mb-2">Tiết chưa xếp của giáo viên</h4>
    <ClientOnly>
      <a-table :columns="columns" :data-source="data" :pagination="false" bordered size="small" />
    </ClientOnly>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

const columns = [
  {
    title: "STT",
    key: "stt",
    width: 70,
    align: "center",
    customRender: ({ index }) => index + 1,
  },
  {
    title: "Môn học",
    dataIndex: "ten_mon",
    key: "ten_mon",
  },
  {
    title: "Lớp",
    dataIndex: "ten_lop",
    key: "ten_lop",
  },
  {
    title: "Phòng",
    dataIndex: "ten_phong",
    key: "ten_phong",
  },
  {
    title: "Tiết thứ",
    dataIndex: "tiet_thu_may",
    key: "tiet_thu_may",
    align: "center",
    width: 120,
  },
];
</script>
