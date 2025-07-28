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
      <TeacherAvoid ref="avoidRef" />
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import TeacherAvoid from '~/components/TeacherAvoid.vue'
const drawerOpen = ref(false)
const avoidRef = ref(null)

watch(drawerOpen, open => {
  if (!open) {
    avoidRef.value?.reset()
  }
})
</script>

<style scoped></style>
