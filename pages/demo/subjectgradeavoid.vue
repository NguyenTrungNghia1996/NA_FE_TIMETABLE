<template>
  <div class="max-w-5xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">Demo: GradeSubjectAvoid</h1>
    <a-button type="primary" @click="drawerOpen = true">Mở demo</a-button>
    <a-drawer
      v-model:open="drawerOpen"
      title="GradeSubjectAvoid Demo"
      :footer="null"
      height="100vh"
      placement="bottom"
      @close="closeDrawer"
    >
      <ClientOnly>
        <GradeSubjectAvoid ref="avoidRef" />
      </ClientOnly>
    </a-drawer>
  </div>
</template>

<script setup>
const drawerOpen = ref(false)
const avoidRef = ref(null)

watch(drawerOpen, val => {
  if (val) {
    avoidRef.value?.refresh?.()
  }
})

const closeDrawer = () => {
  avoidRef.value?.reset?.()
}
</script>

<style scoped></style>
