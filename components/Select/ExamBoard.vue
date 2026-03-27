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
import { ref, watch } from "vue";
import debounce from "lodash/debounce";

const { RestApi } = useApi();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Hội đồng thi" },
  name: { type: String, default: "hoidongthi" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn hội đồng thi" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  noFormItem: { type: Boolean, default: false },
  inlineLabel: { type: Boolean, default: false },
  idNam: { type: [Number, String], default: null },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const loading = ref(false);
const search = ref("");

const hasValue = value => value !== undefined && value !== null && value !== "";
const normalizeValue = value => (value !== undefined && value !== null ? String(value) : value);

const ensureSelectedOption = async () => {
  if (props.multiple || !hasValue(props.modelValue)) return;

  const selectedValue = normalizeValue(props.modelValue);
  const hasSelectedOption = options.value.some(option => normalizeValue(option.value) === selectedValue);
  if (hasSelectedOption) return;

  try {
    const { data, error } = await RestApi.exam_board.detail({ params: { Id: props.modelValue } });
    if (data.value?.status !== "success") {
      throw new Error(error?.value?.data?.message || "Không thể tải thông tin hội đồng thi");
    }

    const selectedBoard = data.value?.data;
    if (!selectedBoard?.id) return;

    options.value = [
      {
        label: selectedBoard.ten,
        value: selectedBoard.id,
      },
      ...options.value,
    ];
  } catch (err) {
    message.error(err?.message || err?.value?.data?.message || "Không thể tải thông tin hội đồng thi");
  }
};

const fetchExamBoards = async (q = "") => {
  loading.value = true;
  try {
    const params = {};
    const searchTerm = (q || "").trim();
    if (searchTerm) params.search = searchTerm;
    if (hasValue(props.idNam)) params.idNam = props.idNam;

    const { data, error } = await RestApi.exam_board.list({ params });
    const raw = data.value?.data;
    const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];

    if (data.value?.status === "success") {
      options.value = items.map(item => ({
        label: item.ten,
        value: item.id,
      }));
      await ensureSelectedOption();
      emit("update:modelValue", props.modelValue);
    } else {
      throw new Error(error?.value?.data?.message || "Không thể tải danh sách hội đồng thi");
    }
  } catch (err) {
    options.value = [];
    message.error(err?.message || err?.value?.data?.message || "Không thể tải danh sách hội đồng thi");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchExamBoards((val || "").trim());
}, 300);

const onSearch = val => {
  search.value = val;
  debouncedFetch(val);
};

const onClear = () => {
  emit("update:modelValue", props.multiple ? [] : null);
  search.value = "";
  fetchExamBoards("");
};

const handleUpdateValue = val => {
  emit("update:modelValue", val);
  const isCleared = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
  if (isCleared) {
    search.value = "";
    fetchExamBoards("");
  } else if (search.value) {
    search.value = "";
    fetchExamBoards("");
  }
};

watch(
  () => props.idNam,
  () => {
    fetchExamBoards("");
  },
);

await fetchExamBoards();
</script>
