<template>
  <a-form-item :label="label" :name="name" :rules="rules">
    <a-select :value="modelValue" @update:value="handleUpdateValue" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :size="size" :loading="loading" :disabled="disabled" allow-clear class="w-full" :options="options" @search="onSearch" @clear="onClear" :filter-option="false" />
  </a-form-item>
</template>

<script setup>
import { ref, watch } from "vue";
import debounce from "lodash/debounce";

const { RestApi } = useApi();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Phòng học" },
  name: { type: String, default: "phonghoc" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn phòng học" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  /** ID của Loại phòng học để lọc */
  idLoaiPhonghoc: { type: [Number, String], default: null },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const loading = ref(false);

const fetchClassrooms = async (search = "") => {
  loading.value = true;
  try {
    const params = {};
    const searchTerm = (search || "").trim();
    if (searchTerm) params.search = searchTerm;
    if (props.idLoaiPhonghoc) params.idLoaiPhonghoc = props.idLoaiPhonghoc;
    const { data, error } = await RestApi.classroom.list(Object.keys(params).length ? { params } : {});
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
    message.error(error?.message || error?.value?.data?.message || "Không thể tải danh sách phòng học");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchClassrooms(val.trim());
}, 300);

const onSearch = val => {
  debouncedFetch(val);
};

const onClear = () => {
  emit("update:modelValue", props.multiple ? [] : null);
  fetchClassrooms("");
};

const handleUpdateValue = val => {
  emit("update:modelValue", val);
  const isCleared = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
  if (isCleared) fetchClassrooms("");
};

watch(
  () => props.idLoaiPhonghoc,
  () => {
    fetchClassrooms();
  },
);

await fetchClassrooms();
</script>
