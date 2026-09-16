<template>
  <div class="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo công ty -->
      <div class="flex justify-center">
        <img :src="unitStore.logo" alt="Logo công ty" class="h-30 w-auto" />
      </div>
      <a-card class="shadow-xl">
        <h2 class="text-center text-2xl font-bold text-gray-800 mb-6">Đăng nhập hệ thống</h2>
        <a-form :model="form" layout="vertical" @finish="handleLogin" autocomplete="off">
          <a-form-item label="Tài khoản" name="username" :rules="[{ required: true, message: 'Vui lòng nhập tài khoản!' }]">
            <a-input v-model:value="form.username" placeholder="Nhập tài khoản của bạn" size="large">
              <template #prefix>
                <UserOutlined class="text-gray-400" />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item label="Mật khẩu" name="password" :rules="[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]">
            <a-input-password v-model:value="form.password" placeholder="Nhập mật khẩu" size="large">
              <template #prefix>
                <LockOutlined class="text-gray-400" />
              </template>
            </a-input-password>
          </a-form-item>
          <div class="flex justify-between mb-4">
            <a-checkbox v-model:checked="rememberMe"> Ghi nhớ đăng nhập </a-checkbox>
            <!-- <a-typography-link> Quên mật khẩu? </a-typography-link> -->
          </div>
          <a-form-item>
            <a-button type="primary" html-type="submit" size="large" block :loading="loading"> Đăng nhập </a-button>
          </a-form-item>
        </a-form>
        <div class="flex justify-end">
          <a-button type="link" @click="visible = true">Đăng ký dùng thử</a-button>
        </div>
      </a-card>
    </div>
    <a-modal v-model:open="visible" title="Đăng ký tài khoản dùng thử" @cancel="visible = false" :width="800" :footer="null">
      <RegisterForm @success="visible = false" />
    </a-modal>
  </div>
</template>

<script setup>
const settingStore = useSettingStore();
definePageMeta({ layout: "auth" });
const { RestApi } = useApi();
const userStore = useUserStore();
const unitStore = useUnitStore();
const { loadMenu } = useMenu();
const { loadPermissions } = usePermissions();

const { rememberMe, saveCredentials, getCredentials, clearCredentials } = useAuth();
const savedCredentials = getCredentials();
const form = reactive({
  username: savedCredentials?.username || "",
  password: savedCredentials?.password || "",
});
const visible = ref(false);
// const rememberMe = ref(false);
const loading = ref(false);

const getApiErrorMessage = (err, respData) => {
  // 1. Ưu tiên dữ liệu trả về từ API (từ error.value?.data, err.data, response._data hoặc respData)
  const apiPayload =
    err?.value?.data ??
    err?.data ??
    err?.response?._data ??
    err?.response?.data ??
    respData?.value ??
    respData;

  if (apiPayload) {
    if (typeof apiPayload === "string" && apiPayload.trim()) {
      return apiPayload.trim();
    }
    if (apiPayload.message) {
      if (typeof apiPayload.message === "string" && apiPayload.message.trim()) {
        return apiPayload.message.trim();
      }
      if (Array.isArray(apiPayload.message) && apiPayload.message.length) {
        return apiPayload.message.filter(Boolean).join(", ");
      }
    }
    if (typeof apiPayload.msg === "string" && apiPayload.msg.trim()) {
      return apiPayload.msg.trim();
    }
    if (typeof apiPayload.error === "string" && apiPayload.error.trim()) {
      return apiPayload.error.trim();
    }
    if (typeof apiPayload.detail === "string" && apiPayload.detail.trim()) {
      return apiPayload.detail.trim();
    }
    if (apiPayload.errors) {
      if (typeof apiPayload.errors === "string" && apiPayload.errors.trim()) {
        return apiPayload.errors.trim();
      }
      if (Array.isArray(apiPayload.errors) && apiPayload.errors.length) {
        return apiPayload.errors.filter(Boolean).join(", ");
      }
      if (typeof apiPayload.errors === "object") {
        const flatErrors = Object.values(apiPayload.errors).flat().filter(Boolean);
        if (flatErrors.length) return flatErrors.join(", ");
      }
    }
  }

  // 2. Fallback trực tiếp từ respData hoặc err
  const directMessage = respData?.value?.message || respData?.message || err?.value?.data?.message || err?.data?.message;
  if (typeof directMessage === "string" && directMessage.trim()) {
    return directMessage.trim();
  }

  // 3. Fallback từ message của err nếu không phải chuỗi kỹ thuật của ofetch
  const rawMsg = err?.message || err?.value?.message;
  if (
    typeof rawMsg === "string" &&
    rawMsg.trim() &&
    !rawMsg.includes("FetchError") &&
    !rawMsg.includes("[POST]") &&
    !rawMsg.includes("[GET]")
  ) {
    return rawMsg.trim();
  }

  return "Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin";
};

const handleLogin = async () => {
  loading.value = true;
  settingStore.setLoading(true);
  try {
    const { data, status, error } = await RestApi.user.login({ body: JSON.stringify(form) });
    const isSuccess = status.value === "success" && data.value?.status !== "error" && Boolean(data.value?.data);
    if (isSuccess) {
      if (rememberMe.value) {
        saveCredentials(form.username, form.password);
      }
      await userStore.setUser(data.value.data);
      // settingStore.setPermissions(DEFAULT_PERMISSIONS);
      await loadMenu();
      await loadPermissions();
      // setPermissions()
      message.success(data.value?.message || "Đăng nhập thành công!");
      navigateTo("/dashboard");
    } else {
      console.error("Login error:", error, data);
      const errMsg = getApiErrorMessage(error, data);
      message.error(errMsg);
    }
  } catch (error) {
    console.error("Login failed:", error);
    const errMsg = getApiErrorMessage(error, null);
    message.error(errMsg);
  } finally {
    settingStore.setLoading(false);
    loading.value = false;
  }
};

watch(rememberMe, async () => {
  if (!rememberMe.value) {
    form.username = "";
    form.password = "";
    clearCredentials();
  }
});
</script>
