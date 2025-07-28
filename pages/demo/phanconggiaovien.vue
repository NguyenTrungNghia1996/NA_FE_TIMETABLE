<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">Demo: TeacherAssignment (Phân công giáo viên)</h1>

    <ClientOnly>
      <a-button type="primary" @click="drawerAssignmentOpen = true">Phân công chuyên môn</a-button>
      <a-drawer
        v-model:open="drawerAssignmentOpen"
        title="Phân công giáo viên"
        :footer="null"
        height="100vh"
        placement="bottom"
        @close="closeDrawer"
      >
        <TeacherAssignment ref="assignmentRef" />
      </a-drawer>
    </ClientOnly>
  </div>
</template>

<script setup>
const drawerAssignmentOpen = ref(false)
const assignmentRef = ref()

watch(drawerAssignmentOpen, val => {
  if (val) {
    assignmentRef.value?.refresh()
  }
})

const closeDrawer = () => {
  drawerAssignmentOpen.value = false
  assignmentRef.value?.reset()
}
</script>
