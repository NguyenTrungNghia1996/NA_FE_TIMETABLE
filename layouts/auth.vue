<template>
  <div>
    <!-- <BaseLoading :loading="loading" title="Đang tải dữ liệu" description="Dữ liệu đang được xử lý..." :transparent="false" :show-logo="true" logo-class="w-20 h-20" /> -->
    <div class="bg-[url('/background.svg')] bg-center bg-cover bg-no-repeat min-h-screen w-full relative min-w-[350px]">
      <div class="px-0 pb-6 pt-8">
        <slot />
        <div class="mx-0 mb-6 mt-12 py-0 px-4 bottom-0 text-center w-full absolute">
          <div class="text-sm text-black">Copyright &copy; {{ currentYear }} Produced by Nguyen Anh EST</div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  </div>
</template>

<script setup>
const currentYear = new Date().getFullYear();
// const nuxtApp = useNuxtApp();
// const loading = ref(true);
// nuxtApp.hook("page:start", () => {
//   loading.value = true;
// });
// nuxtApp.hook("page:finish", () => {
//   loading.value = false;
// });
</script>
