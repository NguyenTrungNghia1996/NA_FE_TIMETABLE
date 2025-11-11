<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="text-lg font-semibold mb-4">THÔNG TIN ĐƠN VỊ</div>

    <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules" class="max-w-full">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <a-form-item label="Tên đơn vị" name="tenDonvi">
            <a-input v-model:value="formState.tenDonvi" placeholder="Nhập tên đơn vị" allow-clear />
          </a-form-item>

          <a-form-item label="Địa chỉ" name="diachi">
            <a-input v-model:value="formState.diachi" placeholder="Nhập địa chỉ" allow-clear />
          </a-form-item>

          <a-form-item label="Số điện thoại" name="sodienthoai">
            <a-input v-model:value="formState.sodienthoai" placeholder="Nhập số điện thoại" allow-clear />
          </a-form-item>

          <a-form-item label="Email" name="email">
            <a-input v-model:value="formState.email" placeholder="Nhập email" allow-clear />
          </a-form-item>

          <SelectSchoolLevel v-model="formState.idCap" name="idCap" :rules="rules.idCap" :multiple="true" />
        </div>
        <div>
          <a-form-item label="Số ngày học trong tuần" name="so_ngay">
            <a-input-number v-model:value="formState.so_ngay" :min="1" :max="7" :precision="0" class="!w-full" />
          </a-form-item>
          <a-form-item label="Ngày học" name="days_view">
            <div class="flex flex-wrap gap-2">
              <a-tag v-for="d in dayOptions" :key="d.value" :color="activeDays.includes(d.value) ? 'blue' : ''">
                {{ d.label }}
              </a-tag>
            </div>
          </a-form-item>

          <SelectSchoolShift v-model="formState.shiftIds" name="shiftIds" :multiple="true" placeholder="Chọn ca học" :rules="rules.shiftIds" />
          <a-form-item label="Ca học và số tiết" name="list_ca">
            <div class="space-y-4">
              <div v-for="shift in formState.list_ca" :key="shift.id_ca_hoc" class="border rounded p-3">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                  <div class="font-medium">{{ shift.ten_ca }}</div>
                  <div class="md:col-span-2 flex items-center gap-2">
                    <span class="text-gray-600 w-20">Số tiết:</span>
                    <a-input-number v-model:value="shift.so_tiet" :min="0" :max="maxPeriods" :precision="0" class="!w-full" />
                  </div>
                </div>
                <div class="mt-3">
                  <div class="flex flex-wrap gap-2">
                    <a-tag v-for="p in getPeriodOptions(maxPeriods)" :key="`${shift.id_ca_hoc}-${p.value}`" :color="p.value <= Number(shift.so_tiet || 0) ? 'blue' : ''">
                      {{ p.label }}
                    </a-tag>
                  </div>
                </div>
              </div>
            </div>
          </a-form-item>
        </div>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <a-button @click="reload" :loading="loading">Tải lại</a-button>
        <a-button type="primary" @click="save" :loading="saving" :disabled="!settingStore.currentPermission">Lưu</a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup>
const { RestApi } = useApi();
const settingStore = useSettingStore();

const formRef = ref();
const loading = ref(false);
const saving = ref(false);

const dayOptions = [
  { label: "Thứ 2", value: 1 },
  { label: "Thứ 3", value: 2 },
  { label: "Thứ 4", value: 3 },
  { label: "Thứ 5", value: 4 },
  { label: "Thứ 6", value: 5 },
  { label: "Thứ 7", value: 6 },
  { label: "Chủ nhật", value: 7 },
];

const formState = reactive({
  tenDonvi: "",
  diachi: "",

  sodienthoai: "",
  email: "",
  idCap: [],
  list_ca: [],
  so_ngay: 7,
  shiftIds: [],
});

const shiftOptions = ref([]); // { label, value }

// Derived days from so_ngay
const activeDays = computed(() => {
  const n = Math.max(1, Math.min(7, Number(formState.so_ngay) || 0));
  return Array.from({ length: n }, (_, i) => i + 1);
});

const rules = reactive({
  tenDonvi: [{ required: true, message: "Vui lòng nhập tên đơn vị", trigger: "blur" }],
  diachi: [{ required: true, message: "Vui lòng nhập địa chỉ", trigger: "blur" }],
  sodienthoai: [{ required: true, message: "Vui lòng nhập số điện thoại", trigger: "blur" }],
  email: [
    { required: true, message: "Vui lòng nhập email", trigger: "blur" },
    { type: "email", message: "Email không hợp lệ", trigger: ["blur", "change"] },
  ],
  idCap: [{ required: true, type: "array", message: "Vui lòng chọn cấp học", trigger: "change" }],
  so_ngay: [{ required: true, message: "Vui lòng nhập số ngày học", trigger: "change" }],
  shiftIds: [
    {
      required: true,
      type: "array",
      message: "Vui lòng chọn ca học",
      trigger: "change",
    },
  ],
});

const getPeriodOptions = n => {
  const total = Number(n) || 0;
  return Array.from({ length: total }, (_, i) => ({ label: `Tiết ${i + 1}`, value: i + 1 }));
};
const maxPeriods = computed(() => {
  const base = Number(settingStore.timetableConfig?.periodsPerShift) || 5;
  const arr = (formState.list_ca || []).map(x => Number(x.so_tiet) || 0);
  const dyn = arr.length ? Math.max(...arr, base) : base;
  return Math.max(1, dyn);
});

// Đồng bộ list_ca dựa theo ca được chọn
const ensureListCaFromShiftIds = () => {
  const idsArr = Array.isArray(formState.shiftIds) ? formState.shiftIds : [];
  const idSet = new Set(idsArr);
  // Loại bỏ ca không còn chọn
  formState.list_ca = (formState.list_ca || []).filter(x => idSet.has(x.id_ca_hoc));
  // Thêm ca mới
  idsArr.forEach(id => {
    if (!formState.list_ca.find(x => x.id_ca_hoc === id)) {
      const opt = (shiftOptions.value || []).find(o => o.value === id);
      formState.list_ca.push({ id_ca_hoc: id, ten_ca: opt?.label || `Ca ${id}`, so_tiet: Number(settingStore.timetableConfig?.periodsPerShift) || 5 });
    }
  });
};

watch(() => formState.shiftIds, ensureListCaFromShiftIds, { deep: true });

// No toggle helpers for cấp học when using Select

const applyToSettingStore = () => {
  try {
    const shifts = Array.isArray(formState.list_ca) ? formState.list_ca : [];
    const shiftNames = shifts.map(s => s.ten_ca);
    const shiftPeriods = shifts.map(s => Number(s.so_tiet) || 0);
    if (shiftNames.length) settingStore.setTimetableShifts(shiftNames);
    if (shiftPeriods.length) settingStore.setTimetableShiftPeriods(shiftPeriods);
    if (formState.so_ngay) settingStore.setTimetableDaysCount(Number(formState.so_ngay));
  } catch {}
};

const mapRespToForm = payload => {
  const d = payload || {};
  formState.tenDonvi = d.tenDonvi || "";
  formState.diachi = d.diachi || "";

  formState.sodienthoai = d.sodienthoai || "";
  formState.email = d.email || "";
  formState.idCap = Array.isArray(d.idCap) ? [...d.idCap] : [];
  formState.list_ca = Array.isArray(d.list_ca)
    ? d.list_ca.map(x => ({
        id_ca_hoc: x.id_ca_hoc,
        ten_ca: x.ten_ca,
        so_tiet: Number(x.so_tiet) || 0,
      }))
    : [];
  formState.so_ngay = Number(d.so_ngay) || 7;

  // UI-only sync handled by computed activeDays
  applyToSettingStore();
  // sync shiftIds from list_ca
  formState.shiftIds = (formState.list_ca || []).map(x => x.id_ca_hoc);
};

// Cấp học dùng SelectSchoolLevel, không cần tự nạp options

const fetchInfo = async () => {
  try {
    loading.value = true;
    const { data, error } = await RestApi.unit_info.get();
    if (data.value?.status === "success") {
      mapRespToForm(data.value.data || {});
    } else {
      throw new Error(error.value?.data?.message || "Không thể tải thông tin đơn vị");
    }
  } catch (err) {
    message.error(err?.message || "Không thể tải thông tin đơn vị");
  } finally {
    loading.value = false;
  }
};

const fetchShiftOptions = async () => {
  try {
    const { data, error } = await RestApi.school_shift.list({ params: {} });
    if (data.value?.status === "success") {
      shiftOptions.value = (data.value.data.items || []).map(i => ({ label: i.ten, value: i.id }));
    } else {
      throw new Error(error.value?.data?.message || "Không thể tải ca học");
    }
  } catch (e) {
    message.error(e?.message || "Không thể tải ca học");
  }
};

const buildPayload = () => {
  return {
    tenDonvi: formState.tenDonvi,
    diachi: formState.diachi,

    sodienthoai: formState.sodienthoai,
    email: formState.email,
    idCap: Array.isArray(formState.idCap) ? formState.idCap : formState.idCap ? [formState.idCap] : [],
    list_ca: (formState.list_ca || []).map(x => ({
      id_ca_hoc: x.id_ca_hoc,
      ten_ca: x.ten_ca,
      so_tiet: Number(x.so_tiet) || 0,
    })),
    so_ngay: Number(formState.so_ngay) || 0,
  };
};

const save = async () => {
  try {
    await formRef.value?.validate();
    // Basic check for shifts periods
    const invalidShift = (formState.list_ca || []).find(x => !Number(x.so_tiet) || Number(x.so_tiet) <= 0);
    if (invalidShift) {
      message.error(`Vui lòng nhập số tiết hợp lệ cho ${invalidShift.ten_ca}`);
      return;
    }

    saving.value = true;
    const payload = buildPayload();
    const { data, error } = await RestApi.unit_info.update({ body: payload });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Lưu thông tin thành công");
      applyToSettingStore();
    } else {
      throw new Error(error.value?.data?.message || "Lưu không thành công");
    }
  } catch (err) {
    message.error(err?.message || "Lưu không thành công");
  } finally {
    saving.value = false;
  }
};

const reload = async () => {
  await fetchInfo();
};

await Promise.all([fetchShiftOptions(), fetchInfo()]);
</script>
