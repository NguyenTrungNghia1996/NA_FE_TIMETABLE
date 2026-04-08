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
        :max-tag-count="maxTagCount"
        allow-clear
        class="w-full"
        :options="selectOptions"
        @search="onSearch"
        @clear="onClear"
        @dropdownVisibleChange="handleDropdownVisibleChange"
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
        :max-tag-count="maxTagCount"
        allow-clear
        class="flex-1"
        :options="selectOptions"
        @search="onSearch"
        @clear="onClear"
        @dropdownVisibleChange="handleDropdownVisibleChange"
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
        :max-tag-count="maxTagCount"
        allow-clear
        class="w-full"
        :options="selectOptions"
        @search="onSearch"
        @clear="onClear"
        @dropdownVisibleChange="handleDropdownVisibleChange"
        :filter-option="false"
      />
    </template>
  </template>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import debounce from "lodash/debounce";

const { RestApi } = useApi();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Môn học cha" },
  name: { type: String, default: "mon_hoc_cha" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn môn học cha" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  noFormItem: { type: Boolean, default: false },
  inlineLabel: { type: Boolean, default: false },
  idHoiDong: { type: [Number, String], default: null },
  maxCount: { type: [Number, String], default: undefined },
  maxTagCount: { type: [Number, String], default: undefined },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const loading = ref(false);
const search = ref("");
const hasFetched = ref(false);

const hasValue = value => value !== undefined && value !== null && value !== "";
const normalizeValue = value => (value !== undefined && value !== null ? String(value) : value);
const resolvedMaxCount = computed(() => {
  const parsed = Number(props.maxCount);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
});
const selectedValues = computed(() => (Array.isArray(props.modelValue) ? props.modelValue.filter(hasValue).map(normalizeValue) : []));
const selectOptions = computed(() => {
  if (!props.multiple || !resolvedMaxCount.value || selectedValues.value.length < resolvedMaxCount.value) {
    return options.value;
  }

  return options.value.map(option => ({
    ...option,
    disabled: !selectedValues.value.includes(normalizeValue(option.value)),
  }));
});

const mapOption = item => ({
  label: item?.ten || item?.ma || `Môn học cha ${item?.id}`,
  value: item?.id,
});

const ensureSelectedOptions = async () => {
  const selectedValues = Array.isArray(props.modelValue) ? props.modelValue.filter(hasValue) : hasValue(props.modelValue) ? [props.modelValue] : [];
  if (!selectedValues.length) return;

  const missingIds = selectedValues.filter(selectedValue => !options.value.some(option => normalizeValue(option.value) === normalizeValue(selectedValue)));
  if (!missingIds.length) return;

  try {
    const details = await Promise.all(
      missingIds.map(async id => {
        const { data, error } = await RestApi.exam_subject.detail({ params: { Id: id } });
        if (data.value?.status !== "success") {
          throw new Error(error?.value?.data?.message || "Không thể tải thông tin môn học cha");
        }
        return data.value?.data;
      }),
    );

    const extraOptions = details.filter(item => item?.id).map(mapOption);

    if (extraOptions.length) {
      options.value = [...extraOptions, ...options.value];
    }
  } catch (err) {
    message.error(err?.message || err?.value?.data?.message || "Không thể tải thông tin môn học cha");
  }
};

const fetchOptions = async (q = "") => {
  if (!hasValue(props.idHoiDong)) {
    options.value = [];
    hasFetched.value = false;
    return;
  }

  loading.value = true;
  try {
    const params = {};
    const searchTerm = (q || "").trim();
    if (searchTerm) params.search = searchTerm;
    if (hasValue(props.idHoiDong)) params.idHoiDong = props.idHoiDong;

    const { data, error } = await RestApi.exam_subject.list_parent({ params });
    const raw = data.value?.data;
    const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];

    if (data.value?.status === "success") {
      options.value = items.map(mapOption);
      hasFetched.value = true;
      await ensureSelectedOptions();
      emit("update:modelValue", props.modelValue);
    } else {
      throw new Error(error?.value?.data?.message || "Không thể tải danh sách môn học cha");
    }
  } catch (err) {
    options.value = [];
    message.error(err?.message || err?.value?.data?.message || "Không thể tải danh sách môn học cha");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchOptions((val || "").trim());
}, 300);

const onSearch = val => {
  search.value = val;
  if (!hasValue(props.idHoiDong)) return;
  debouncedFetch(val);
};

const onClear = () => {
  emit("update:modelValue", props.multiple ? [] : null);
  search.value = "";
  fetchOptions("");
};

const handleDropdownVisibleChange = open => {
  if (!open || !hasValue(props.idHoiDong) || hasFetched.value) return;
  fetchOptions("");
};

const handleUpdateValue = val => {
  if (props.multiple && Array.isArray(val) && resolvedMaxCount.value && val.length > resolvedMaxCount.value) {
    emit("update:modelValue", val.slice(0, resolvedMaxCount.value));
    message.warning(`Chỉ được chọn tối đa ${resolvedMaxCount.value} môn học cha`);
    return;
  }

  emit("update:modelValue", val);
  const isCleared = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
  if (isCleared) {
    search.value = "";
    fetchOptions("");
  } else if (search.value) {
    search.value = "";
    fetchOptions("");
  }
};

watch(
  () => props.idHoiDong,
  async value => {
    options.value = [];
    search.value = "";
    hasFetched.value = false;

    if (hasValue(value) && hasValue(props.modelValue)) {
      await fetchOptions("");
    }
  },
);

watch(
  () => props.modelValue,
  async value => {
    if (!hasValue(props.idHoiDong) || !hasValue(value)) return;
    await ensureSelectedOptions();
  },
);
</script>
