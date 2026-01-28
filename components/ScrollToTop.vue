<template>
  <div class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-3 items-end">
    <button class="group w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shadow-lg rounded-full bg-[#16a34a] text-white hover:shadow-xl transition-all duration-300" @click="openContactModal" aria-label="Liên hệ">
      <Icon name="ant-design:phone-outlined" class="text-lg sm:text-xl text-white group-hover:scale-110 transition-transform duration-200" />
    </button>

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

  <a-modal v-model:open="contactModalOpen" title="Liên hệ" :footer="null" :width="520" @cancel="closeContactModal">
    <a-form ref="contactFormRef" :model="contactForm" layout="vertical" :rules="contactRules" :validate-trigger="['submit']">
      <a-form-item label="Họ tên" name="ho_ten">
        <a-input v-model:value="contactForm.ho_ten" placeholder="Nhập họ tên" :maxlength="200" show-count />
      </a-form-item>
      <a-form-item label="Số điện thoại" name="so_dien_thoai">
        <a-input v-model:value="contactForm.so_dien_thoai" placeholder="Nhập số điện thoại" :maxlength="20" />
      </a-form-item>
      <a-form-item label="Email" name="email">
        <a-input v-model:value="contactForm.email" placeholder="Nhập email" :maxlength="200" />
      </a-form-item>
      <a-form-item label="Địa chỉ" name="dia_chi">
        <a-input v-model:value="contactForm.dia_chi" placeholder="Nhập địa chỉ" :maxlength="200" />
      </a-form-item>
      <a-form-item label="Tên đơn vị" name="ten_don_vi">
        <a-input v-model:value="contactForm.ten_don_vi" placeholder="Nhập tên đơn vị" :maxlength="200" />
      </a-form-item>
      <a-form-item label="Ghi chú" name="ghi_chu">
        <a-textarea v-model:value="contactForm.ghi_chu" placeholder="Nhập ghi chú" :maxlength="500" show-count :auto-size="{ minRows: 3, maxRows: 5 }" />
      </a-form-item>
      <div class="flex justify-end gap-2">
        <a-button @click="closeContactModal">Hủy</a-button>
        <a-button type="primary" :loading="contactSubmitting" @click="submitContact">Gửi liên hệ</a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup>
import { useSettingStore } from "~/stores/settingStore";

const { RestApi } = useApi();

const settingStore = useSettingStore();
const visible = ref(false);
const contactModalOpen = ref(false);
const contactSubmitting = ref(false);
const contactFormRef = ref();
const contactForm = reactive({
  ho_ten: "", // bắt buộc
  so_dien_thoai: "", // bắt buộc
  email: "", // bắt buộc
  dia_chi: "",
  ten_don_vi: "",
  ghi_chu: "", // bắt buộc
});
const contactRules = {
  ho_ten: [
    { required: true, message: "Vui lòng nhập họ tên" },
    { max: 200, message: "Họ tên tối đa 200 ký tự" },
  ],
  so_dien_thoai: [
    { required: true, message: "Vui lòng nhập số điện thoại" },
    {
      validator: (_rule, value) => {
        const raw = (value || "").trim();
        if (!raw) return Promise.reject("Vui lòng nhập số điện thoại");
        const pattern = /^(0\d{9,10}|\+84\d{9,10})$/;
        return pattern.test(raw) ? Promise.resolve() : Promise.reject("Số điện thoại không hợp lệ");
      },
    },
    { max: 20, message: "Số điện thoại tối đa 20 ký tự" },
  ],
  email: [
    { required: true, message: "Vui lòng nhập email" },
    {
      validator: (_rule, value) => {
        if (!value) return Promise.resolve();
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value) ? Promise.resolve() : Promise.reject("Email không hợp lệ");
      },
    },
    { max: 200, message: "Email tối đa 200 ký tự" },
  ],
  dia_chi: [{ max: 200, message: "Địa chỉ tối đa 200 ký tự" }],
  ten_don_vi: [{ max: 200, message: "Tên đơn vị tối đa 200 ký tự" }],
  ghi_chu: [
    // { required: true, message: "Vui lòng nhập ghi chú" },
    { max: 500, message: "Ghi chú tối đa 500 ký tự" },
  ],
};

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
const openContactModal = () => {
  contactModalOpen.value = true;
};
const closeContactModal = () => {
  contactModalOpen.value = false;
  contactFormRef.value?.resetFields();
};

const submitContact = async () => {
  try {
    await contactFormRef.value?.validate();
  } catch (e) {
    const first = e?.errorFields?.[0];
    const msg = first?.errors?.[0] || "Vui lòng kiểm tra lại các trường bắt buộc";
    message.error(msg);
    return;
  }
  contactSubmitting.value = true;
  try {
    const payload = {
      ho_ten: contactForm.ho_ten.trim(),
      so_dien_thoai: contactForm.so_dien_thoai.trim(),
      email: contactForm.email?.trim(),
      dia_chi: contactForm.dia_chi?.trim(),
      ten_don_vi: contactForm.ten_don_vi?.trim(),
      ghi_chu: contactForm.ghi_chu.trim(),
    };
    const { data, error } = await RestApi.request.post("/api/lienhe", { body: payload });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Gửi liên hệ thành công");
      closeContactModal();
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Gửi liên hệ thất bại");
    }
  } catch (err) {
    message.error(err.message || err.response?.data?.message || "Gửi liên hệ thất bại");
  } finally {
    contactSubmitting.value = false;
  }
};

onMounted(() => {
  toggleVisibility();
  window.addEventListener("scroll", toggleVisibility, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", toggleVisibility);
});
</script>
