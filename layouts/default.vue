<template>
  <BaseLoading :loading="loading" title="Đang tải dữ liệu" description="Dữ liệu đang được xử lý..." :transparent="false" :show-logo="true" logo-class="w-20 h-20" />
  <BaseLoading :loading="settingStore.isLoading" :title="settingStore.loading.title" :description="settingStore.loading.description" :transparent="settingStore.loading.transparent" :show-logo="settingStore.loading.showLogo" logo-class="w-20 h-20" />
  <div class="w-full h-screen flex flex-col bg-gray-200 overflow-auto">
    <div class="h-15">
      <BaseHeader />
    </div>
    <div class="w-full flex-1 flex overflow-hidden min-h-[calc(100vh-60px)]">
      <BaseMenu />
      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="sticky top-0 z-10 bg-white">
          <BaseBreadcrumb />
        </div>
        <div class="p-2 flex-1 overflow-y-auto">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const settingStore = useSettingStore();
const nuxtApp = useNuxtApp();
const loading = ref(true);
nuxtApp.hook("page:start", () => {
  loading.value = true;
});
nuxtApp.hook("page:finish", () => {
  loading.value = false;
});
</script>
