<template>
  <a-form-item :label="label" :name="name" :rules="rules">
    <a-select :value="modelValue" @update:value="val => $emit('update:modelValue', val)" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :loading="loading" :disabled="disabled" allow-clear class="w-full" :options="options" @search="onSearch" :filter-option="false" />
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
    if (search) params.search = search;
    if (props.idLoaiPhonghoc) params.idLoaiPhonghoc = props.idLoaiPhonghoc;
    const { data } = await RestApi.classroom.list(
      Object.keys(params).length ? { params } : {},
    );
    if (data.value?.data?.items) {
      options.value = data.value.data.items.map(item => ({
        label: item.ten,
        value: item.id,
      }));
      if (props.modelValue === undefined || props.modelValue === null || props.modelValue === "") {
        emit("update:modelValue", props.modelValue);
      }
    }
  } catch (error) {
    console.error("❌ Lỗi fetch phòng học:", error);
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

watch(
  () => props.idLoaiPhonghoc,
  () => {
    fetchClassrooms();
  },
);

await fetchClassrooms();
</script>
