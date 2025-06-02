<template>
  <div>{{ now }}</div>
</template>
<script setup>
const { $dayjs } = useNuxtApp();

const now = $dayjs("2019-01-25").format("DD/MM/YYYY");
</script>
