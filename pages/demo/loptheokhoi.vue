<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">Demo: Class List By Grade</h1>
    <a-button type="primary" @click="drawerOpen = true">Mở demo</a-button>
    <a-drawer
      v-model:open="drawerOpen"
      title="Class List By Grade"
      :footer="null"
      height="100vh"
      placement="bottom"
      @close="closeDrawer"
    >
      <ClientOnly>
        <GradeClassList ref="listRef" />
      </ClientOnly>
    </a-drawer>
  </div>
</template>

<script setup>
const drawerOpen = ref(false)
const listRef = ref(null)

watch(drawerOpen, val => {
  if (val) {
    listRef.value?.refresh?.()
  }
})

const closeDrawer = () => {
  listRef.value?.reset?.()
}
</script>
