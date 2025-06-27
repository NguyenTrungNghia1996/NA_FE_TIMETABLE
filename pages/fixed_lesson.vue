<template>
  <!-- <FixedLesson/> -->
  <div>
    <a-button type="primary" @click="showDrawer">Open</a-button>
    <a-drawer height="100vh" title="Cài đặt tiết cố định" placement="bottom" :open="open" @close="onClose">
      <FixedLesson/>
    </a-drawer>
  </div>
</template>

<script setup>
const open = ref(false);
const showDrawer = () => {
  open.value = true;
};
const onClose = () => {
  open.value = false;
};

</script>