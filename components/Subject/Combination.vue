<template>
  <div class="p-4">
    <div class="grid grid-cols-3 gap-4">
      <div class="w-full">
        <a-form ref="formRef" layout="vertical" :model="form" :rules="rules">
          <SelectGradeLevelByUnit v-model="form.grade" class="mb-3" name="grade" :rules="rules.grade" label="Khối lớp" />
          <SelectSchoolship v-model="form.major" class="mb-3" name="major" :rules="rules.major" label="Ban học" />
          <a-form-item label="Tên tổ hợp" name="name" class="mb-3" :rules="rules.name">
            <a-input v-model:value="form.name" class="w-full" :maxlength="30" showCount />
          </a-form-item>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SelectSubject v-model="form.subject1" label="Môn 1" :rules="rules.subject1" name="subject1" />
            <SelectSubject v-model="form.subject2" label="Môn 2" :rules="rules.subject2" name="subject2" />
            <SelectSubject v-model="form.subject3" label="Môn 3" name="subject3" />
          </div>
          <div class="grid grid-cols-2">
            <a-form-item label="Số tiết 1 ca" name="maxPeriod" :rules="rules.maxPeriod">
              <a-input-number v-model:value="form.maxPeriod" class="w-full" :min="1" :max="9" :precision="0" :step="1" />
            </a-form-item>
            <a-form-item label="Số tiết 2 ca" name="period2" :rules="rules.period2">
              <a-input-number v-model:value="form.period2" class="w-full" :min="0" :max="9" :precision="0" :step="1" />
            </a-form-item>
          </div>
          <div class="flex flex-wrap gap-2 mt-4">
            <a-button type="primary" class="bg-green-500 border-green-500 hover:bg-green-600" @click="handleSave" :loading="saving">{{ isEdit ? "Cập nhật" : "Lưu" }}</a-button>
            <a-button danger @click="reset">Hủy</a-button>
          </div>
        </a-form>
      </div>
      <div class="w-full col-span-2">
        <a-table :columns="columns" :data-source="dataSource" bordered size="small" :pagination="pagination" :scroll="{ x: 'max-content' }" class="w-full" @change="handleTableChange" :loading="loading">
          <template #bodyCell="{ column, index, record }">
            <template v-if="column.key === 'stt'">
              {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
            </template>
            <template v-else-if="column.key === 'action'">
              <div class="flex justify-center space-x-2">
                <a-button type="link" size="small" @click="editItem(record)">
                  <template #icon>
                    <EditOutlined />
                  </template>
                </a-button>
                <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                  <a-button type="link" danger size="small">
                    <template #icon>
                      <DeleteOutlined />
                    </template>
                  </a-button>
                </a-popconfirm>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
const { RestApi } = useApi();

const formRef = ref();
const emit = defineEmits(["reset"]);
const form = reactive({
  id: null,
  grade: undefined,
  major: undefined,
  name: "",
  subject1: undefined,
  subject2: undefined,
  subject3: undefined,
  maxPeriod: undefined,
  period2: undefined,
});
const isEdit = ref(false);
const loading = ref(false);
const saving = ref(false);

const integerValidator = async (_rule, value) => {
  if (value === undefined || value === null || value === "") return Promise.resolve();
  return Number.isInteger(value) ? Promise.resolve() : Promise.reject("Vui lòng nhập số nguyên (không thập phân)");
};

// period2 must be >= maxPeriod
const period2GteMaxPeriodValidator = async (_rule, value) => {
  // Allow empty and let required rule handle if needed
  if (value === undefined || value === null || value === "") return Promise.resolve();
  // If maxPeriod not set yet, skip comparison (maxPeriod has its own required rule)
  if (form.maxPeriod === undefined || form.maxPeriod === null || form.maxPeriod === "" || form.maxPeriod === 0) return Promise.resolve();
  return value <= form.maxPeriod ? Promise.resolve() : Promise.reject("Số tiết 2 ca phải lớn hơn hoặc bằng số tiết 1 ca");
};

const rules = {
  name: [{ required: true, message: "Vui lòng nhập tên tổ hợp", trigger: "blur" }],
  maxPeriod: [
    { required: true, message: "Vui lòng nhập số tiết tối đa", trigger: "blur" },
    { validator: integerValidator, trigger: "blur" },
  ],
  period2: [
    { validator: integerValidator, trigger: "blur" },
    { validator: period2GteMaxPeriodValidator, trigger: "blur" },
  ],
  grade: [{ required: true, message: "Vui lòng chọn khối lớp", trigger: "blur" }],
  major: [{ required: true, message: "Vui lòng chọn ban học", trigger: "blur" }],
  subject1: [{ required: true, message: "Vui lòng chọn môn học", trigger: "blur" }],
  subject2: [{ required: true, message: "Vui lòng chọn môn học", trigger: "blur" }],
};

const columns = [
  { title: "STT", key: "stt", width: 60, align: "center" },
  { title: "Khối lớp", dataIndex: "ten_khoi", key: "ten_khoi", align: "center" },
  { title: "Ban học", dataIndex: "ten_ban", key: "ten_ban", align: "center" },
  { title: "Tên tổ hợp", dataIndex: "ten", key: "ten" },
  { title: "Môn 1", dataIndex: "ten_mon_hoc_1", key: "ten_mon_hoc_1" },
  { title: "Môn 2", dataIndex: "ten_mon_hoc_2", key: "ten_mon_hoc_2" },
  { title: "Môn 3", dataIndex: "ten_mon_hoc_3", key: "ten_mon_hoc_3" },
  { title: "Số tiết 1 ca", dataIndex: "so_tiet_toi_da_1_ca", key: "so_tiet_toi_da_1_ca", align: "center" },
  { title: "Số tiết 2 ca", dataIndex: "so_tiet_toi_da_2_ca", key: "so_tiet_toi_da_2_ca", align: "center" },
  { title: "Thao tác", key: "action", width: 100, align: "center" },
];

const dataSource = ref([]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["1", "10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const fetchData = async () => {
  try {
    loading.value = true;
    const { data: resp } = await RestApi.subject_combination.list({
      params: { pageIndex: pagination.current, pageSize: pagination.pageSize },
    });
    if (resp.value?.status === "success") {
      resp.value?.data?.items ? (dataSource.value = resp.value.data.items) : (dataSource.value = []);
      pagination.total = resp.value.data.totalrecord || 0;
    } else {
      dataSource.value = [];
      pagination.total = 0;
    }
  } catch (err) {
    console.error("fetch subject combination error:", err);
    message.error("Không thể tải dữ liệu");
  } finally {
    loading.value = false;
  }
};

const handleTableChange = async pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  await fetchData();
};

const handleSave = async () => {
  try {
    await formRef.value.validate();
    saving.value = true;
    const payload = {
      id: form.id,
      ten: form.name,
      id_mon_1: form.subject1,
      id_mon_2: form.subject2,
      id_mon_3: form.subject3 || 0,
      so_tiet_toi_da_1_ca: form.maxPeriod,
      so_tiet_toi_da_2_ca: form.period2 || 0,
      id_ban: form.major,
      id_khoi: form.grade,
    };
    let res;
    if (isEdit.value) {
      res = await RestApi.subject_combination.update({ body: payload });
    } else {
      delete payload.id;
      res = await RestApi.subject_combination.create({ body: payload });
    }
    if (res.data.value?.status === "success") {
      message.success(res.data.value?.message || "Thành công");
      await fetchData();
      reset();
    } else {
      throw new Error(res.error?.value?.data?.message || "Có lỗi xảy ra");
    }
  } catch (err) {
    message.error(err.message || "Không thể lưu thông tin");
  } finally {
    saving.value = false;
  }
};

const editItem = record => {
  isEdit.value = true;
  Object.assign(form, {
    id: record.id,
    grade: record.id_khoi,
    major: record.id_ban,
    name: record.ten,
    subject1: record.id_mon_1,
    subject2: record.id_mon_2,
    subject3: record.id_mon_3,
    maxPeriod: record.so_tiet_toi_da_1_ca,
    period2: record.so_tiet_toi_da_2_ca,
  });
};

const deleteItem = async id => {
  try {
    const { data, error } = await RestApi.subject_combination.delete({ params: { Id: id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa thành công");
      await fetchData();
    } else {
      throw new Error(error.value?.data?.message || "Xóa không thành công");
    }
  } catch (err) {
    message.error(err.message || "Không thể xóa");
  }
};

const reset = () => {
  // Reset AntD form validation state and fields
  formRef.value?.resetFields?.();
  Object.assign(form, {
    id: null,
    grade: undefined,
    major: undefined,
    name: "",
    subject1: undefined,
    subject2: undefined,
    subject3: undefined,
    maxPeriod: undefined,
    period2: undefined,
  });
  isEdit.value = false;
  emit("reset");
};
defineExpose({
  reset,
  // Expose a dedicated method to just reset validation if needed
  resetValidate: () => {
    formRef.value?.resetFields?.();
    emit("reset");
  },
});
onMounted(fetchData);
</script>

<style scoped></style>
