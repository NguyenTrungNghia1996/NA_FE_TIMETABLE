<template>
  <a-form-item :label="label" :name="name" :rules="rules">
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

<script setup>
import { ref } from "vue";
import debounce from "lodash/debounce";

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Tiết học" },
  name: { type: String, default: "tiethoc" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn tiết học" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const loading = ref(false);
const search = ref("");

const fetchPeriods = async (search = "") => {
  loading.value = true;
  try {
    const searchTerm = (search || "").trim().toLowerCase();
    const baseOptions = Array.from({ length: 5 }, (_, i) => ({
      label: `Tiết ${i + 1}`,
      value: i + 1,
    }));

    const filtered = baseOptions.filter(opt => {
      if (!searchTerm) return true;
      return (
        opt.label.toLowerCase().includes(searchTerm) ||
        String(opt.value).includes(searchTerm)
      );
    });

    options.value = filtered;

    if (props.modelValue === undefined || props.modelValue === null || props.modelValue === "") {
      emit("update:modelValue", props.modelValue);
    }
  } catch (error) {
    options.value = [];
    message.error(error?.message || error?.value?.data?.message || "Không thể tải danh sách tiết học");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchPeriods((val || "").trim());
}, 300);

const onSearch = val => {
  search.value = val;
  debouncedFetch(val);
};

const onClear = () => {
  emit("update:modelValue", props.multiple ? [] : null);
  search.value = "";
  fetchPeriods("");
};

const handleUpdateValue = val => {
  emit("update:modelValue", val);
  const isCleared = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
  if (isCleared) {
    search.value = "";
    fetchPeriods("");
  } else if (search.value) {
    search.value = "";
    fetchPeriods("");
  }
};

await fetchPeriods();
</script>
