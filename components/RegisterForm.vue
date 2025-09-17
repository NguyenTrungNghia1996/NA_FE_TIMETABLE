<template>
  <a-form ref="formRef" :model="form" layout="vertical" :rules="rules">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <a-card title="Thông tin đơn vị" size="small">
        <a-form-item label="Tên trường" name="ten_truong">
          <a-input v-model:value="form.ten_truong" placeholder="Nhập tên trường" />
        </a-form-item>
        <SelectProvince v-model="form.id_tinh" name="id_tinh" :rules="rules.id_tinh" />
        <a-form-item label="Địa chỉ" name="dia_chi">
          <a-input v-model:value="form.dia_chi" placeholder="Nhập địa chỉ" />
        </a-form-item>
        <a-form-item label="Người liên hệ" name="nguoi_lien_he">
          <a-input v-model:value="form.nguoi_lien_he" placeholder="Nhập người liên hệ" />
        </a-form-item>
        <a-form-item label="Số điện thoại" name="so_dien_thoai">
          <a-input v-model:value="form.so_dien_thoai" placeholder="Nhập số điện thoại" />
        </a-form-item>
        <a-form-item label="Email" name="email">
          <a-input v-model:value="form.email" placeholder="Nhập email" />
        </a-form-item>
        <SelectSchoolShiftByUnit v-model="form.id_ca" name="id_ca" :rules="rules.id_ca" :multiple="true" />
        <SelectSchoolLevelByUnit v-model="form.id_cap" name="id_cap" :rules="rules.id_cap" :multiple="true" />
      </a-card>
      <a-card title="Thông tin tài khoản" size="small">
        <a-form-item label="Tên tài khoản" name="ten_tai_khoan">
          <a-input v-model:value="form.ten_tai_khoan" placeholder="Nhập tên tài khoản" />
        </a-form-item>
        <a-form-item label="Mật khẩu" name="mat_khau">
          <a-input-password v-model:value="form.mat_khau" placeholder="Nhập mật khẩu" />
        </a-form-item>
        <a-form-item label="Nhập lại mật khẩu" name="nhap_lai_mat_khau">
          <a-input-password v-model:value="form.nhap_lai_mat_khau" placeholder="Nhập lại mật khẩu" />
        </a-form-item>
        <div class="flex justify-center mb-4">
          <a-button type="primary" @click="handleSubmit" :loading="loading">Đăng ký</a-button>
        </div>
      </a-card>
    </div>
  </a-form>
</template>

<script setup>
const { RestApi } = useApi();
const formRef = ref();
const loading = ref(false);

const form = reactive({
  ten_truong: "",
  id_tinh: undefined,
  dia_chi: "",
  nguoi_lien_he: "",
  so_dien_thoai: "",
  email: "",
  ten_tai_khoan: "",
  id_ca: [],
  id_cap: [],
  mat_khau: "",
  nhap_lai_mat_khau: "",
});

const rules = {
  ten_truong: [{ required: true, message: "Vui lòng nhập tên trường" }],
  id_tinh: [{ required: true, message: "Vui lòng chọn tỉnh" }],
  dia_chi: [{ required: true, message: "Vui lòng nhập địa chỉ" }],
  nguoi_lien_he: [{ required: true, message: "Vui lòng nhập người liên hệ" }],
  so_dien_thoai: [{ required: true, message: "Vui lòng nhập số điện thoại" }],
  email: [{ type: "email", required: true, message: "Vui lòng nhập email hợp lệ" }],
  ten_tai_khoan: [{ required: true, message: "Vui lòng nhập tên tài khoản" }],
  mat_khau: [{ required: true, message: "Vui lòng nhập mật khẩu" }],
  nhap_lai_mat_khau: [
    { required: true, message: "Vui lòng nhập lại mật khẩu" },
    {
      validator: (_rule, value) => (value === form.mat_khau ? Promise.resolve() : Promise.reject("Mật khẩu không khớp")),
    },
  ],
  id_ca: [{ type: "array", required: true, message: "Vui lòng chọn ca học" }],
  id_cap: [{ type: "array", required: true, message: "Vui lòng chọn cấp học" }],
};

const emit = defineEmits(["success"]);

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
  } catch (e) {
    const first = e?.errorFields?.[0];
    const msg = first?.errors?.[0] || "Vui lòng kiểm tra lại các trường bắt buộc";
    message.error(msg);
    return;
  }
  loading.value = true;
  try {
    const payload = { ...form };
    const { data, error } = await RestApi.user.register({ body: payload });
    if (data.value?.status === "success") {
      message.success(data.value.message || "Đăng ký thành công");
      emit("success");
      formRef.value?.resetFields();
    } else {
      throw new Error(error.value?.data?.message || "Đăng ký không thành công");
    }
  } catch (err) {
    message.error(err.message || err.response?.data?.message || "Đăng ký thất bại");
  } finally {
    loading.value = false;
  }
};
</script>
