<template>
  <a-form-item :label="label" :name="name" :rules="rules">
    <a-select :value="modelValue" @update:value="val => $emit('update:modelValue', val)" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :size="size" :loading="loading" :disabled="disabled" allow-clear class="w-full" :options="options" @search="onSearch" :filter-option="false" />
  </a-form-item>
</template>

<script setup>
import { ref } from "vue";
import debounce from "lodash/debounce";

const { RestApi } = useApi();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Khối kiến thức" },
  name: { type: String, default: "khoikienthuc" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn khối kiến thức" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const loading = ref(false);

const fetchKnowledge = async (search = "") => {
  loading.value = true;
  try {
    const searchTerm = (search || "").trim();
    const { data, error } = await RestApi.knowledge.list({ params: { search: searchTerm } });

    if (data.value?.data?.items) {
      options.value = data.value.data.items.map(item => ({
        label: item.ten,
        value: item.id,
      }));

      if (props.modelValue === null || props.modelValue === undefined) {
        const first = options.value[0];
        if (first) emit("update:modelValue", first.value);
      }
    } else {
      throw new Error(error.value?.data?.message);
    }
  } catch (error) {
    options.value = [];
    message.error(error?.message || error?.value?.data?.message || "Không thể tải danh sách khối kiến thức");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchKnowledge(val.trim());
}, 300);

const onSearch = val => {
  debouncedFetch(val);
};

await fetchKnowledge();
</script>
