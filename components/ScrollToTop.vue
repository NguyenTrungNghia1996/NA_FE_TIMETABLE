<template>
  <div class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-3 items-end">
    <button v-show="zaloLink" class="group w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shadow-lg rounded-full bg-[#008fe5] text-white hover:shadow-xl transition-all duration-300" @click="openZalo" aria-label="Zalo">
      <NuxtImg class="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-lg group-hover:scale-110 transition-transform duration-200" src="https://img.icons8.com/color/48/zalo.png" alt="zalo" />
    </button>

    <button v-show="facebookLink" class="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shadow-lg rounded-full bg-[#1877f2] text-white hover:shadow-xl transition-all duration-300" @click="openFacebook" aria-label="Facebook">
      <Icon name="ant-design:facebook-filled" class="text-lg sm:text-xl text-white" />
    </button>

    <button v-show="messageLink" class="group w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shadow-lg rounded-full bg-[#1877f2] text-white hover:shadow-xl transition-all duration-300" @click="openMessage" aria-label="Messenger">
      <NuxtImg class="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-lg group-hover:scale-110 transition-transform duration-200" src="https://img.icons8.com/fluency/48/facebook-messenger--v2.png" alt="facebook-messenger--v2" />
    </button>

    <!-- <button v-show="visible" class="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shadow-lg rounded-full bg-blue-500 text-white hover:bg-blue-600 hover:shadow-xl transition-all duration-300" @click="scrollToTop" aria-label="Scroll to top">
      <Icon name="ant-design:arrow-up-outlined" class="text-lg sm:text-xl" />
    </button> -->
  </div>
</template>

<script setup>
import { useSettingStore } from "~/stores/settingStore";

const settingStore = useSettingStore();
const visible = ref(false);

const zaloLink = computed(() => {
  const rawPhone = settingStore.info.phone_number || settingStore.info.phone || settingStore.info.phone_string || "";
  const phone = String(rawPhone).replace(/[^\d]/g, "");
  return phone ? `https://zalo.me/${phone}` : "";
});

const facebookLink = computed(() => settingStore.info.facebook || "");
const messageLink = computed(() => settingStore.info.message || "");

const toggleVisibility = () => {
  const scrollY = window.scrollY || 0;
  const threshold = Math.max(200, window.innerHeight * 0.4);
  visible.value = scrollY > threshold;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const openLink = url => {
  if (!url) return;
  window.open(url, "_blank");
};

const openZalo = () => openLink(zaloLink.value);
const openFacebook = () => openLink(facebookLink.value);
const openMessage = () => openLink(messageLink.value);

onMounted(() => {
  toggleVisibility();
  window.addEventListener("scroll", toggleVisibility, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", toggleVisibility);
});
</script>
