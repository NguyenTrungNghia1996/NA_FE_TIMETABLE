<template>
  <template v-if="!noFormItem">
    <a-form-item :label="label" :name="name" :rules="rules" :label-col="inlineLabel ? { span: 8 } : { span: 24 }" :wrapper-col="inlineLabel ? { span: 16 } : { span: 24 }">
      <a-select :value="modelValue" @update:value="val => $emit('update:modelValue', val)" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :size="size" :loading="loading" :disabled="disabled" allow-clear class="w-full" :options="options" @search="onSearch" :filter-option="false" />
    </a-form-item>
  </template>
  <template v-else>
    <div v-if="inlineLabel" class="flex items-center gap-2 py-3">
      <label v-if="label" class="text-sm font-medium min-w-[50px]">{{ label }}</label>
      <a-select :value="modelValue" @update:value="val => $emit('update:modelValue', val)" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :size="size" :loading="loading" :disabled="disabled" allow-clear class="flex-1" :options="options" @search="onSearch" :filter-option="false" />
    </div>
    <template v-else>
      <label v-if="label" class="block text-sm font-medium mb-1">{{ label }}</label>
      <a-select :value="modelValue" @update:value="val => $emit('update:modelValue', val)" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :size="size" :loading="loading" :disabled="disabled" allow-clear class="w-full" :options="options" @search="onSearch" :filter-option="false" />
    </template>
  </template>
</template>

<script setup>
import { ref } from "vue";
import debounce from "lodash/debounce";

const { RestApi } = useApi();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Giáo viên: " },
  name: { type: String, default: "giaovien" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn giáo viên" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  /** Tự động chọn giáo viên đầu tiên nếu chưa chọn giá trị */
  autoSelectFirst: { type: Boolean, default: false },
  /** Hiển thị chỉ label + select, không bọc trong a-form-item */
  noFormItem: { type: Boolean, default: false },
  /** Cho phép label nằm ngang hàng với select */
  inlineLabel: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const loading = ref(false);

const fetchTeachers = async (search = "") => {
  loading.value = true;
  try {
    const searchTerm = (search || "").trim();
    const { data, error } = await RestApi.teacher.list({ params: { search: searchTerm } });

    if (data.value?.data?.items) {
      options.value = data.value.data.items.map(item => ({
        label: `${item.ho_va_ho_dem} ${item.ten} (${item.ma_giao_vien})`,
        value: item.id,
      }));

      if (props.autoSelectFirst && !searchTerm && (props.modelValue === undefined || props.modelValue === null || props.modelValue === "" || (Array.isArray(props.modelValue) && props.modelValue.length === 0))) {
        const firstOption = options.value[0];
        if (firstOption) {
          const defaultValue = props.multiple ? [firstOption.value] : firstOption.value;
          emit("update:modelValue", defaultValue);
        }
      }
    } else {
      throw new Error(error.value?.data?.message);
    }
  } catch (error) {
    options.value = [];
    message.error(error?.message || error?.value?.data?.message || "Không thể tải danh sách giáo viên");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchTeachers(val.trim());
}, 300);

const onSearch = val => {
  debouncedFetch(val);
};

await fetchTeachers();
</script>
