<template>
  <template v-if="!noFormItem">
    <a-form-item :label="label" :name="name" :rules="rules" :label-col="inlineLabel ? { span: 8 } : { span: 24 }" :wrapper-col="inlineLabel ? { span: 16 } : { span: 24 }">
      <a-tree-select
        :value="modelValue"
        @update:value="handleUpdateValue"
        :multiple="isMultiValue"
        :tree-checkable="checkable"
        show-search
        :placeholder="placeholder"
        :size="size"
        :loading="loading"
        :disabled="disabled"
        :max-tag-count="maxTagCount"
        allow-clear
        class="w-full"
        :tree-data="treeOptions"
        tree-data-simple-mode
        tree-default-expand-all
        @search="onSearch"
        @clear="onClear"
        :filter-tree-node="false"
      />
    </a-form-item>
  </template>
  <template v-else>
    <div v-if="inlineLabel" class="flex items-center gap-2 py-3">
      <label v-if="label" class="text-sm font-medium min-w-[120px]">{{ label }}</label>
      <a-tree-select
        :value="modelValue"
        @update:value="handleUpdateValue"
        :multiple="isMultiValue"
        :tree-checkable="checkable"
        show-search
        :placeholder="placeholder"
        :size="size"
        :loading="loading"
        :disabled="disabled"
        :max-tag-count="maxTagCount"
        allow-clear
        class="flex-1"
        :tree-data="treeOptions"
        tree-data-simple-mode
        tree-default-expand-all
        @search="onSearch"
        @clear="onClear"
        :filter-tree-node="false"
      />
    </div>
    <template v-else>
      <label v-if="label" class="block text-sm font-medium mb-1">{{ label }}</label>
      <a-tree-select
        :value="modelValue"
        @update:value="handleUpdateValue"
        :multiple="isMultiValue"
        :tree-checkable="checkable"
        show-search
        :placeholder="placeholder"
        :size="size"
        :loading="loading"
        :disabled="disabled"
        :max-tag-count="maxTagCount"
        allow-clear
        class="w-full"
        :tree-data="treeOptions"
        tree-data-simple-mode
        tree-default-expand-all
        @search="onSearch"
        @clear="onClear"
        :filter-tree-node="false"
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
  label: { type: String, default: "Môn tự chọn" },
  name: { type: String, default: "mon_tu_chon" },
  multiple: { type: Boolean, default: false },
  checkable: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn môn tự chọn" },
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

const hasValue = value => value !== undefined && value !== null && value !== "";
const normalizeValue = value => (value !== undefined && value !== null ? String(value) : value);

const resolvedMaxCount = computed(() => {
  const parsed = Number(props.maxCount);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
});

const isMultiValue = computed(() => props.multiple || props.checkable);

const selectedValues = computed(() => {
  if (!isMultiValue.value || !Array.isArray(props.modelValue)) return [];
  return props.modelValue.filter(hasValue).map(normalizeValue);
});

const treeOptions = computed(() => {
  if (!isMultiValue.value || !resolvedMaxCount.value || selectedValues.value.length < resolvedMaxCount.value) {
    return options.value;
  }

  return options.value.map(node => ({
    ...node,
    disabled: !selectedValues.value.includes(normalizeValue(node.value)),
  }));
});

const mapOption = item => ({
  id: item?.id,
  pId: item?.id_cha ?? 0,
  value: item?.id,
  title: item?.ten || item?.ma || `Môn tự chọn ${item?.id}`,
});

const normalizeTreeData = items => {
  const mappedItems = items.filter(item => item?.id).map(mapOption);
  const existingIds = new Set(mappedItems.map(item => normalizeValue(item.id)));

  return mappedItems.map(item => ({
    ...item,
    pId: item.pId && existingIds.has(normalizeValue(item.pId)) ? item.pId : 0,
  }));
};

const mergeOptions = newOptions => {
  const optionMap = new Map();

  [...newOptions, ...options.value].forEach(option => {
    if (!option?.id) return;
    optionMap.set(normalizeValue(option.id), option);
  });

  options.value = Array.from(optionMap.values());
};

const getSelectedIds = () => {
  if (Array.isArray(props.modelValue)) return props.modelValue.filter(hasValue);
  return hasValue(props.modelValue) ? [props.modelValue] : [];
};

const ensureSelectedOptions = async () => {
  const selectedIds = getSelectedIds();
  if (!selectedIds.length) return;

  const missingIds = selectedIds.filter(selectedId => !options.value.some(option => normalizeValue(option.value) === normalizeValue(selectedId)));
  if (!missingIds.length) return;

  try {
    const details = await Promise.all(
      missingIds.map(async id => {
        const { data, error } = await RestApi.exam_subject.detail({ params: { Id: id } });
        if (data.value?.status !== "success") {
          throw new Error(error?.value?.data?.message || "Không thể tải thông tin môn tự chọn");
        }
        return data.value?.data;
      }),
    );

    const extraOptions = normalizeTreeData(details);
    if (extraOptions.length) mergeOptions(extraOptions);
  } catch (err) {
    message.error(err?.message || err?.value?.data?.message || "Không thể tải thông tin môn tự chọn");
  }
};

const fetchOptions = async (q = "") => {
  if (!hasValue(props.idHoiDong)) {
    options.value = [];
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const params = {};
    const searchTerm = (q || "").trim();
    if (searchTerm) params.search = searchTerm;
    if (hasValue(props.idHoiDong)) params.idHoiDong = props.idHoiDong;

    const { data, error } = await RestApi.exam_subject.list_optional({ params });
    const raw = data.value?.data;
    const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];

    if (data.value?.status === "success") {
      options.value = normalizeTreeData(items);
      await ensureSelectedOptions();
      emit("update:modelValue", props.modelValue);
    } else {
      throw new Error(error?.value?.data?.message || "Không thể tải danh sách môn tự chọn");
    }
  } catch (err) {
    options.value = [];
    message.error(err?.message || err?.value?.data?.message || "Không thể tải danh sách môn tự chọn");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchOptions((val || "").trim());
}, 300);

const onSearch = val => {
  search.value = val;
  debouncedFetch(val);
};

const onClear = () => {
  emit("update:modelValue", isMultiValue.value ? [] : null);
  search.value = "";
  fetchOptions("");
};

const handleUpdateValue = val => {
  if (isMultiValue.value && Array.isArray(val) && resolvedMaxCount.value && val.length > resolvedMaxCount.value) {
    emit("update:modelValue", val.slice(0, resolvedMaxCount.value));
    message.warning(`Chỉ được chọn tối đa ${resolvedMaxCount.value} môn tự chọn`);
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
  idHoiDong => {
    search.value = "";

    if (!hasValue(idHoiDong)) {
      options.value = [];
      return;
    }

    fetchOptions("");
  },
);

if (hasValue(props.idHoiDong)) {
  await fetchOptions();
}
</script>
