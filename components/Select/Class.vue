<template>
  <template v-if="!noFormItem">
    <a-form-item :label="label" :name="name" :rules="rules" :label-col="inlineLabel ? { span: 8 } : { span: 24 }" :wrapper-col="inlineLabel ? { span: 16 } : { span: 24 }">
      <div class="flex items-center gap-2 w-full">
        <a-select :value="modelValue" @update:value="handleUpdateValue" v-model:searchValue="search" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :size="size" :loading="loading" :disabled="disabled" allow-clear class="flex-1" :options="options" @search="onSearch" @clear="onClear" :filter-option="false" />
        <template v-if="hasNavigation">
          <a-button :size="size" :disabled="!canSelectPrev" @click.stop="selectPrevious" title="Trước">
            <Icon name="ant-design:left-outlined" />
          </a-button>
          <a-button :size="size" :disabled="!canSelectNext" @click.stop="selectNext" title="Sau">
            <Icon name="ant-design:right-outlined" />
          </a-button>
        </template>
      </div>
    </a-form-item>
  </template>
  <template v-else>
    <div v-if="inlineLabel" class="flex items-center gap-2 py-3">
      <label v-if="label" class="text-sm font-medium min-w-[50px]">{{ label }}</label>
      <div class="flex items-center gap-2 flex-1">
        <a-select :value="modelValue" @update:value="handleUpdateValue" v-model:searchValue="search" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :size="size" :loading="loading" :disabled="disabled" allow-clear class="flex-1" :options="options" @search="onSearch" @clear="onClear" :filter-option="false" />
        <template v-if="hasNavigation">
          <a-button :size="size" :disabled="!canSelectPrev" @click.stop="selectPrevious" title="Trước">
            <Icon name="ant-design:left-outlined" />
          </a-button>
          <a-button :size="size" :disabled="!canSelectNext" @click.stop="selectNext" title="Sau">
            <Icon name="ant-design:right-outlined" />
          </a-button>
        </template>
      </div>
    </div>
    <template v-else>
      <label v-if="label" class="block text-sm font-medium mb-1">{{ label }}</label>
      <div class="flex items-center gap-2">
        <a-select :value="modelValue" @update:value="handleUpdateValue" v-model:searchValue="search" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :size="size" :loading="loading" :disabled="disabled" allow-clear class="w-full" :options="options" @search="onSearch" @clear="onClear" :filter-option="false" />
        <template v-if="hasNavigation">
          <a-button :size="size" :disabled="!canSelectPrev" @click.stop="selectPrevious" title="Trước">
            <Icon name="ant-design:left-outlined" />
          </a-button>
          <a-button :size="size" :disabled="!canSelectNext" @click.stop="selectNext" title="Sau">
            <Icon name="ant-design:right-outlined" />
          </a-button>
        </template>
      </div>
    </template>
  </template>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import debounce from "lodash/debounce";

const { RestApi } = useApi();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Lớp học:" },
  name: { type: String, default: "lophoc" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn lớp học" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  /** ID khối lớp để lọc danh sách lớp */
  id_khoi: { type: [Number, String], default: null },
  /** Tự động chọn lớp đầu tiên nếu chưa chọn giá trị */
  autoSelectFirst: { type: Boolean, default: false },
  /** Hiển thị chỉ label + select, không bọc trong a-form-item */
  noFormItem: { type: Boolean, default: false },
  /** Cho phép label nằm ngang hàng với select */
  inlineLabel: { type: Boolean, default: false },
  /** Hiển thị nút chuyển sang lớp trước/sau */
  showNavigationButtons: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const loading = ref(false);
const search = ref("");
const hasNavigation = computed(() => props.showNavigationButtons && !props.multiple);
const currentIndex = computed(() => options.value.findIndex(option => option.value == props.modelValue));
const canSelectPrev = computed(() => hasNavigation.value && options.value.length > 0 && (currentIndex.value > 0 || currentIndex.value === -1));
const canSelectNext = computed(() => hasNavigation.value && options.value.length > 0 && (currentIndex.value === -1 || currentIndex.value < options.value.length - 1));

const fetchClasses = async (search = "") => {
  loading.value = true;
  try {
    const params = {};
    const searchTerm = (search || "").trim();
    if (searchTerm) params.search = searchTerm;
    if (props.id_khoi) params.id_khoilop = props.id_khoi;
    const { data, error } = await RestApi.class.list({ params });
    if (data.value?.status === "success") {
      const items = Array.isArray(data.value?.data?.items) ? data.value.data.items : [];
      options.value = items.map(item => ({
        label: item.ten,
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
    // console.error("❌ Lỗi fetch lớp học:", error);
    options.value = [];
    message.error(error?.message || error?.value?.data?.message || "Không thể tải danh sách  lớp");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchClasses((val || "").trim());
}, 300);

const onSearch = val => {
  search.value = val;
  debouncedFetch(val);
};

const onClear = () => {
  emit("update:modelValue", props.multiple ? [] : null);
  search.value = "";
  fetchClasses("");
};

const handleUpdateValue = val => {
  emit("update:modelValue", val);
  const isCleared = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);
  if (isCleared) {
    search.value = "";
    fetchClasses("");
  } else if (search.value) {
    search.value = "";
    fetchClasses("");
  }
};

const selectPrevious = () => {
  if (!canSelectPrev.value || options.value.length === 0) return;
  const idx = currentIndex.value === -1 ? options.value.length - 1 : Math.max(currentIndex.value - 1, 0);
  const target = options.value[idx];
  if (target) {
    emit("update:modelValue", target.value);
  }
};

const selectNext = () => {
  if (!canSelectNext.value || options.value.length === 0) return;
  const idx = currentIndex.value === -1 ? 0 : Math.min(currentIndex.value + 1, options.value.length - 1);
  const target = options.value[idx];
  if (target) {
    emit("update:modelValue", target.value);
  }
};

watch(
  () => props.id_khoi,
  () => {
    fetchClasses();
  },
);

await fetchClasses();
</script>
