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
  label: { type: String, default: "Khối lớp" },
  name: { type: String, default: "khoilop" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn khối lớp" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const loading = ref(false);

const fetchGradeLevelsByUnit = async (search = "") => {
  loading.value = true;
  try {
    const { data, error } = await RestApi.grade_level.list_by_unit({ params: { search } });
    console.log(data);

    const raw = data.value?.data;
    const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];

    if (Array.isArray(items)) {
      options.value = items.map(item => ({ label: item.ten, value: item.id }));
      // giữ nguyên giá trị đang chọn
      emit("update:modelValue", props.modelValue);
    } else {
      throw new Error(error?.value?.data?.message);
    }
  } catch (err) {
    options.value = [];
    message.error(err?.message || err?.value?.data?.message || "Không thể tải danh sách khối lớp theo đơn vị");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchGradeLevelsByUnit((val || "").trim());
}, 300);

const onSearch = val => {
  debouncedFetch(val);
};

await fetchGradeLevelsByUnit();
</script>
