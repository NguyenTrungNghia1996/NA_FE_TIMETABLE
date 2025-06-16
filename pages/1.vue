<template>
  <PermissionEditor v-model="serverPermissions" />
</template>

<script setup>
// 1. Dữ liệu permissions từ server (có thể không đầy đủ)
const serverPermissions = ref([
  { key: 'menu', permissionValue: 2 },
  { key: 'menu-plvuxq63o0', permissionValue: 0 },
  {
    key: "menu-c8u2jgnoto",
    permissionValue: 2
  },
  {
    key: "menu-test",
    permissionValue: 2
  },
])
</script>