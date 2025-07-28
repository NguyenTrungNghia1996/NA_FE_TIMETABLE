<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">Demo: TeacherAssignment (Phân công giáo viên)</h1>

    <ClientOnly>
      <a-button type="primary" @click="drawerOpen = true">Mở Drawer</a-button>
      <a-drawer
        v-model:open="drawerOpen"
        title="Phân công giáo viên"
        :footer="null"
        height="100vh"
        placement="bottom"
        @close="closeDrawer"
      >
        <TeacherAssignment />
      </a-drawer>
    </ClientOnly>
  </div>
</template>

<script setup>
const drawerOpen = ref(false)

const closeDrawer = () => {
  drawerOpen.value = false
}
</script>
