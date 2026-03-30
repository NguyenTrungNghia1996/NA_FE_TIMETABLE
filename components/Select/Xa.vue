<template>
  <template v-if="!noFormItem">
    <a-form-item :label="label" :name="name" :rules="rules">
      <a-select :value="modelValue" @update:value="handleUpdateValue" v-model:searchValue="search" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :size="size" :loading="loading" :disabled="selectDisabled" allow-clear class="w-full" :options="options" @search="onSearch" @clear="onClear" :filter-option="false" />
    </a-form-item>
  </template>
  <template v-else>
    <a-select :value="modelValue" @update:value="handleUpdateValue" v-model:searchValue="search" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :size="size" :loading="loading" :disabled="selectDisabled" allow-clear class="w-full" :options="options" @search="onSearch" @clear="onClear" :filter-option="false" />
  </template>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import debounce from "lodash/debounce";

const { RestApi } = useApi();

const props = defineProps({
  modelValue: [Array, Number, String],
  idTinh: [Number, String, null],
  label: { type: String, default: "Xã" },
  name: { type: String, default: "id_xa" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn xã" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  noFormItem: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const loading = ref(false);
const search = ref("");

const hasTinh = computed(() => props.idTinh !== undefined && props.idTinh !== null && props.idTinh !== "");
const selectDisabled = computed(() => props.disabled || !hasTinh.value);

const fetchXa = async (searchValue = "") => {
  if (!hasTinh.value) {
    options.value = [];
    return;
  }

  loading.value = true;
  try {
    const searchTerm = (searchValue || "").trim();
    const { data, error } = await RestApi.xa.list({
      params: {
        search: searchTerm,
        idTinh: props.idTinh,
      },
    });

    if (data.value?.status === "success") {
      options.value = (data.value.data.items || []).map(item => ({
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
    message.error(error?.message || error?.value?.data?.message || "Không thể tải danh sách xã");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchXa((val || "").trim());
}, 300);

const onSearch = val => {
  search.value = val;
  debouncedFetch(val);
};

const onClear = () => {
  emit("update:modelValue", props.multiple ? [] : null);
  search.value = "";
  fetchXa("");
};

const handleUpdateValue = val => {
  emit("update:modelValue", val);
  const isCleared = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
  if (isCleared) {
    search.value = "";
    fetchXa("");
  } else if (search.value) {
    search.value = "";
    fetchXa("");
  }
};

watch(
  () => props.idTinh,
  () => {
    search.value = "";
    options.value = [];
    emit("update:modelValue", props.multiple ? [] : null);
    fetchXa("");
  }
);

await fetchXa();
</script>
