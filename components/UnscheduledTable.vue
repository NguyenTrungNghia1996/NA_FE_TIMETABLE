<template>
  <ClientOnly>
    {{ data }}
    <a-table :columns="columns" :data-source="data" :pagination="false" bordered size="small" :customRow="customRow" />
  </ClientOnly>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["row-click"]);

const customRow = record => {
  return {
    onClick: () => emit("row-click", record),
  };
};

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
  // {
  //   title: "Giáo viên",
  //   dataIndex: "ten_giao_vien",
  //   key: "ten_giao_vien",
  // },
  {
    title: "Phòng",
    dataIndex: "ten_phong",
    key: "ten_phong",
  },
  // {
  //   title: "Tiết thứ",
  //   dataIndex: "tiet_thu_may",
  //   key: "tiet_thu_may",
  //   align: "center",
  //   width: 120,
  // },
];
</script>
