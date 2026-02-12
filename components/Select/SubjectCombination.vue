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
    <div v-if="inlineLabel" class="flex items-center gap-2 py-3 w-full">
      <label v-if="label" class="text-sm font-medium min-w-[50px]">{{ label }}</label>
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
        style="width: 100%"
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
        style="width: 100%"
        :options="options"
        @search="onSearch"
        @clear="onClear"
        :filter-option="false"
      />
    </template>
  </template>
</template>

<script setup>
import { ref, watch } from "vue";
import debounce from "lodash/debounce";

const { RestApi } = useApi();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Tổ hợp môn" },
  name: { type: String, default: "tohopmon" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn tổ hợp môn" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  autoSelectFirst: { type: Boolean, default: false },
  noFormItem: { type: Boolean, default: false },
  inlineLabel: { type: Boolean, default: false },
  /** Tham số bổ sung gửi kèm khi gọi API */
  extraParams: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const loading = ref(false);
const search = ref("");

const isEmptyValue = value => value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);

const fetchSubjectCombinations = async (keyword = "") => {
  loading.value = true;
  try {
    const searchTerm = (keyword || "").trim();
    const params = {
      pageIndex: 1,
      pageSize: 200,
      ...(props.extraParams || {}),
    };

    if (searchTerm) {
      params.search = searchTerm;
    }

    const { data, error } = await RestApi.subject_combination.list({ params });
    if (data.value?.status === "success") {
      const items = Array.isArray(data.value?.data?.items) ? data.value.data.items : [];
      options.value = items.map(item => ({
        label: item.ten,
        value: item.id,
      }));

      if (props.autoSelectFirst && !searchTerm && isEmptyValue(props.modelValue) && options.value.length) {
        const first = options.value[0];
        emit("update:modelValue", props.multiple ? [first.value] : first.value);
      }
    } else {
      throw new Error(error.value?.data?.message || data.value?.message || "Không thể tải danh sách tổ hợp môn");
    }
  } catch (error) {
    options.value = [];
    message.error(error?.message || "Không thể tải danh sách tổ hợp môn");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchSubjectCombinations((val || "").trim());
}, 300);

const onSearch = val => {
  search.value = val;
  debouncedFetch(val);
};

const onClear = () => {
  emit("update:modelValue", props.multiple ? [] : null);
  search.value = "";
  fetchSubjectCombinations("");
};

const handleUpdateValue = val => {
  emit("update:modelValue", val);
  if (isEmptyValue(val) || search.value) {
    search.value = "";
    fetchSubjectCombinations("");
  }
};

watch(
  () => props.extraParams,
  () => {
    search.value = "";
    fetchSubjectCombinations("");
  },
  { deep: true },
);

await fetchSubjectCombinations();
</script>
