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

const { RestApi } = useApi();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Năm học" },
  name: { type: String, default: "namhoc" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn năm học" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const loading = ref(false);
const search = ref("");

const fetchYears = async (search = "") => {
  loading.value = true;
  try {
    const searchTerm = (search || "").trim();
    const params = {};
    if (searchTerm) params.search = searchTerm;
    const { data, error } = await RestApi.year.list({ params });
    const raw = data.value?.data;
    const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];

    if (data.value?.status === "success") {
      options.value = items.map(item => ({
        label: item.ten,
        value: item.id,
      }));
      // giữ nguyên giá trị đang chọn
      emit("update:modelValue", props.modelValue);
    } else {
      throw new Error(error?.value?.data?.message || "Không thể tải danh sách năm học");
    }
  } catch (err) {
    options.value = [];
    message.error(err?.message || err?.value?.data?.message || "Không thể tải danh sách năm học");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchYears((val || "").trim());
}, 300);

const onSearch = val => {
  search.value = val;
  debouncedFetch(val);
};

const onClear = () => {
  emit("update:modelValue", props.multiple ? [] : null);
  search.value = "";
  fetchYears("");
};

const handleUpdateValue = val => {
  emit("update:modelValue", val);
  const isCleared = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
  if (isCleared) {
    search.value = "";
    fetchYears("");
  } else if (search.value) {
    search.value = "";
    fetchYears("");
  }
};

await fetchYears();
</script>

