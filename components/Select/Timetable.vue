<template>
  <template v-if="!noFormItem">
    <a-form-item :label="label" :name="name" :rules="rules" :label-col="inlineLabel ? { span: 8 } : { span: 24 }" :wrapper-col="inlineLabel ? { span: 16 } : { span: 24 }">
      <a-select
        :value="modelValue"
        @update:value="handleUpdateValue"
        v-model:searchValue="search"
        :mode="multiple ? 'multiple' : undefined"
        show-search
        :placeholder="placeholder"
        :size="size"
        :loading="loading"
        :disabled="disabled"
        allow-clear
        class="w-full"
        :options="options"
        @search="onSearch"
        @clear="onClear"
        :filter-option="false"
      />
    </a-form-item>
  </template>
  <template v-else>
    <div v-if="inlineLabel" class="flex items-center gap-2 py-3">
      <label v-if="label" class="text-sm font-medium min-w-[120px]">{{ label }}</label>
      <a-select
        :value="modelValue"
        @update:value="handleUpdateValue"
        v-model:searchValue="search"
        :mode="multiple ? 'multiple' : undefined"
        show-search
        :placeholder="placeholder"
        :size="size"
        :loading="loading"
        :disabled="disabled"
        allow-clear
        class="flex-1"
        :options="options"
        @search="onSearch"
        @clear="onClear"
        :filter-option="false"
      />
    </div>
    <template v-else>
      <label v-if="label" class="block text-sm font-medium mb-1">{{ label }}</label>
      <a-select
        :value="modelValue"
        @update:value="handleUpdateValue"
        v-model:searchValue="search"
        :mode="multiple ? 'multiple' : undefined"
        show-search
        :placeholder="placeholder"
        :size="size"
        :loading="loading"
        :disabled="disabled"
        allow-clear
        class="w-full"
        :options="options"
        @search="onSearch"
        @clear="onClear"
        :filter-option="false"
      />
    </template>
  </template>
</template>

<script setup>
import { ref } from "vue";
import debounce from "lodash/debounce";

const { RestApi } = useApi();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Thời khóa biểu" },
  name: { type: String, default: "thoikhoabieu" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn thời khóa biểu" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  // Chỉ lấy TKB đang sử dụng
  onlyActive: { type: Boolean, default: false },
  // Tự động chọn mục đầu tiên nếu chưa có giá trị
  autoSelectFirst: { type: Boolean, default: false },
  // Tùy chọn hiển thị label/select ngoài a-form-item
  noFormItem: { type: Boolean, default: false },
  inlineLabel: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const loading = ref(false);
const search = ref("");

const fetchTimetables = async (q = "") => {
  loading.value = true;
  try {
    const searchTerm = (q || "").trim();
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (props.onlyActive) params.dang_su_dung = 1;

    const { data, error } = await RestApi.timetable.list({ params });
    const raw = data.value?.data;
    const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];

    if (data.value?.status === "success") {
      options.value = items.map(item => ({
        label: item.dang_su_dung ? item.ten : `${item.ten} (không sử dụng)`,
        value: item.id,
      }));

      // Giữ nguyên giá trị hoặc auto-select nếu được yêu cầu
      if (
        props.autoSelectFirst &&
        !searchTerm &&
        (props.modelValue === undefined || props.modelValue === null || props.modelValue === "" || (Array.isArray(props.modelValue) && props.modelValue.length === 0))
      ) {
        const first = options.value[0];
        if (first) emit("update:modelValue", props.multiple ? [first.value] : first.value);
      } else {
        emit("update:modelValue", props.modelValue);
      }
    } else {
      throw new Error(error?.value?.data?.message || "Không thể tải danh sách thời khóa biểu");
    }
  } catch (err) {
    options.value = [];
    message.error(err?.message || err?.value?.data?.message || "Không thể tải danh sách thời khóa biểu");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchTimetables((val || "").trim());
}, 300);

const onSearch = val => {
  search.value = val;
  debouncedFetch(val);
};

const onClear = () => {
  emit("update:modelValue", props.multiple ? [] : null);
  search.value = "";
  fetchTimetables("");
};

const handleUpdateValue = val => {
  emit("update:modelValue", val);
  const isCleared = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
  if (isCleared) {
    search.value = "";
    fetchTimetables("");
  } else if (search.value) {
    search.value = "";
    fetchTimetables("");
  }
};

await fetchTimetables();
</script>

