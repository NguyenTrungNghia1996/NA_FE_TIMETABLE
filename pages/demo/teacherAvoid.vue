<template>
  <div class="max-w-4xl mx-auto p-6 space-y-4">
    <a-button @click="drawerAvoidOpen = true">Giáo viên tránh xếp</a-button>
    <a-drawer
      v-model:open="drawerAvoidOpen"
      title="Giáo viên tránh xếp"
      :footer="null"
      height="100vh"
      placement="bottom"
      @close="closeTeacherAvoid"
    >
      <TeacherAvoid ref="avoidRef" />
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import TeacherAvoid from '~/components/TeacherAvoid.vue'
const drawerAvoidOpen = ref(false)
const avoidRef = ref(null)
const closeTeacherAvoid=()=>{
  avoidRef.value?.reset()
}

</script>

<style scoped></style>
