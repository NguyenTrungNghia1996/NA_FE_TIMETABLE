<template>
  <a-form-item :label="label" :name="name" :rules="rules">
    <a-select :value="modelValue" @update:value="handleUpdateValue" v-model:searchValue="search" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :size="size" :loading="loading" :disabled="disabled" allow-clear class="w-full" :options="options" @search="onSearch" @clear="onClear" :filter-option="false" />
  </a-form-item>
</template>

<script setup>
import { ref } from "vue";
import debounce from "lodash/debounce";

const { RestApi } = useApi();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Ca học" },
  name: { type: String, default: "cahoc" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn ca học" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const loading = ref(false);
const search = ref("");

const fetchCaHocTheoDonVi = async (search = "") => {
  loading.value = true;
  try {
    const searchTerm = (search || "").trim();
    const { data, error } = await RestApi.school_shift.list_by_unit({ params: { search: searchTerm } });

    if (data.value?.status === "success") {
      options.value = data.value.data.items?.map(item => ({
        label: item.ten,
        value: item.id,
      }));

      // keep current modelValue as-is; no auto-defaulting here
      emit("update:modelValue", props.modelValue);
    } else {
      throw new Error(error.value?.data?.message);
    }
  } catch (error) {
    options.value = [];
    message.error(error?.message || error?.value?.data?.message || "Không thể tải danh sách ca học theo đơn vị");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchCaHocTheoDonVi((val || "").trim());
}, 300);

const onSearch = val => {
  search.value = val;
  debouncedFetch(val);
};

const onClear = () => {
  emit("update:modelValue", props.multiple ? [] : null);
  search.value = "";
  fetchCaHocTheoDonVi("");
};

const handleUpdateValue = val => {
  emit("update:modelValue", val);
  const isCleared = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
  if (isCleared) {
    search.value = "";
    fetchCaHocTheoDonVi("");
  } else if (search.value) {
    search.value = "";
    fetchCaHocTheoDonVi("");
  }
};

await fetchCaHocTheoDonVi();
</script>
