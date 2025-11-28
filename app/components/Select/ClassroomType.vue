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
  label: { type: String, default: "Loại phòng học" },
  name: { type: String, default: "loaiphonghoc" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn loại phòng học" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const loading = ref(false);
const search = ref("");

const fetchClassroomTypes = async (search = "") => {
  loading.value = true;
  try {
    const searchTerm = (search || "").trim();
    const { data, error } = await RestApi.classroom_type.list({ params: { search: searchTerm } });

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
    message.error(error?.message || error?.value?.data?.message || "Không thể tải danh sách loại phòng học");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchClassroomTypes((val || "").trim());
}, 300);

const onSearch = val => {
  search.value = val;
  debouncedFetch(val);
};

const onClear = () => {
  // Reset selection and reload full list
  emit("update:modelValue", props.multiple ? [] : null);
  search.value = "";
  fetchClassroomTypes("");
};

const handleUpdateValue = val => {
  emit("update:modelValue", val);
  // If cleared via keyboard/backspace, also reload list
  const isCleared = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
  if (isCleared) {
    search.value = "";
    fetchClassroomTypes("");
  } else if (search.value) {
    search.value = "";
    fetchClassroomTypes("");
  }
};

await fetchClassroomTypes();
</script>
