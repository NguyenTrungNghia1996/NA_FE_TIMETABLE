<script setup>
import { ref, watch } from "vue";
import TimetableInfo from "~/components/TimetableInfo.vue";

const drawerOpen = ref(false);
const infoRef = ref(null);

watch(drawerOpen, val => {
  if (val) {
    infoRef.value?.refresh?.();
  }
});

const closeDrawer = () => {
  infoRef.value?.reset?.();
};
</script>

<template>
  <div class="max-w-5xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">Demo: TimetableInfo</h1>
    <a-button type="primary" @click="drawerOpen = true">Mở demo</a-button>
    <a-drawer
      v-model:open="drawerOpen"
      title="Xếp thời khóa biểu"
      :footer="null"
      height="100vh"
      placement="bottom"
      @close="closeDrawer"
    >
      <ClientOnly>
        <TimetableInfo ref="infoRef" />
      </ClientOnly>
    </a-drawer>
  </div>
</template>

<style scoped></style>
