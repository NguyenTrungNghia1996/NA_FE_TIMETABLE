<template>
  <a-popconfirm
    title="Are you sure delete this task?"
    ok-text="Yes"
    cancel-text="No"
    @confirm="confirm"
    @cancel="cancel"
  >
    <a href="#">Delete</a>
  </a-popconfirm>
</template>
<script setup>
const confirm = (e) => {
  console.log(e);
  message.success('Click on Yes');
};

const cancel = (e) => {
  console.log(e);
  message.error('Click on No');
};
</script>