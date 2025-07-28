<template>
  <div class="max-w-4xl mx-auto p-6 space-y-4">
    <a-button @click="drawerOpen = true">Giáo viên tránh xếp</a-button>
    <a-drawer
      v-model:open="drawerOpen"
      title="Giáo viên tránh xếp"
      :footer="null"
      height="100vh"
      placement="bottom"
    >
      <TeacherAvoid />
    </a-drawer>
  </div>
</template>

<script setup>
import TeacherAvoid from '~/components/TeacherAvoid.vue'
const drawerOpen = ref(false)
</script>

<style scoped></style>
