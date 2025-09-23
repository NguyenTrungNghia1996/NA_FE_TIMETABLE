<template>
  <a-form-item :label="label" :name="name" :rules="rules">
    <a-select :value="modelValue" @update:value="handleUpdateValue" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :size="size" :loading="loading" :disabled="disabled" allow-clear class="w-full" :options="options" @search="onSearch" @clear="onClear" :filter-option="false" />
  </a-form-item>
</template>

<script setup>
import { ref } from "vue";
import debounce from "lodash/debounce";

const { RestApi } = useApi();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Ban học" },
  name: { type: String, default: "banhoc" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn ban học" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const loading = ref(false);

const fetchData = async (search = "") => {
  loading.value = true;
  try {
    const searchTerm = (search || "").trim();
    const { data, error } = await RestApi.school_ship.list({ params: { search: searchTerm } });
    if (data.value?.status === "success") {
      options.value = data.value.data.items?.map(item => ({
        label: item.ten,
        value: item.id,
      }));
      if (props.modelValue === undefined || props.modelValue === null || props.modelValue === "") {
        emit("update:modelValue", props.modelValue);
      }
    } else {
      throw new Error(error.value?.data?.message);
    }
  } catch (error) {
    options.value = [];
    message.error(error?.message || error?.value?.data?.message || "Không thể tải danh sách ban học");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchData(val.trim());
}, 300);

const onSearch = val => {
  debouncedFetch(val);
};

const onClear = () => {
  emit("update:modelValue", props.multiple ? [] : null);
  fetchData("");
};

const handleUpdateValue = val => {
  emit("update:modelValue", val);
  const isCleared = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
  if (isCleared) fetchData("");
};

await fetchData();
</script>
