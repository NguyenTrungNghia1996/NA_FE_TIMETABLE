<template>
  <a-form-item :label="label" :name="name" :rules="rules">
    <a-select
      :value="modelValue"
      @update:value="val => $emit('update:modelValue', val)"
      :mode="multiple ? 'multiple' : undefined"
      show-search
      :placeholder="placeholder"
      :loading="loading"
      :disabled="disabled"
      allow-clear
      class="w-full"
      :options="options"
      @search="onSearch"
      :filter-option="false"
    />
  </a-form-item>
</template>

<script setup>
import { ref, watch } from 'vue'
import debounce from 'lodash/debounce'

const { RestApi } = useApi()

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: 'Lớp học' },
  name: { type: String, default: 'lophoc' },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Chọn lớp học' },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  /** ID khối lớp để lọc danh sách lớp */
  id_khoi: { type: [Number, String], default: null },
  /** Tự động chọn lớp đầu tiên nếu chưa chọn giá trị */
  autoSelectFirst: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const options = ref([])
const loading = ref(false)

const fetchClasses = async (search = '') => {
  loading.value = true
  try {
    const params = {
      PageIndex: 1,
      PageSize: 10,
    }
    if (search) params.search = search
    if (props.id_khoi) params.id_khoilop = props.id_khoi
    const { data } = await RestApi.class.list({ params })
    if (data.value?.data?.items) {
      options.value = data.value.data.items.map(item => ({
        label: item.ten,
        value: item.id,
      }))
      if (
        props.autoSelectFirst &&
        !search &&
        (
          props.modelValue === undefined ||
          props.modelValue === null ||
          props.modelValue === '' ||
          (Array.isArray(props.modelValue) && props.modelValue.length === 0)
        )
      ) {
        const firstOption = options.value[0]
        if (firstOption) {
          const defaultValue = props.multiple
            ? [firstOption.value]
            : firstOption.value
          emit('update:modelValue', defaultValue)
        }
      }
    }
  } catch (error) {
    console.error('❌ Lỗi fetch lớp học:', error)
  } finally {
    loading.value = false
  }
}

const debouncedFetch = debounce(val => {
  fetchClasses(val.trim())
}, 300)

const onSearch = val => {
  debouncedFetch(val)
}

watch(() => props.id_khoi, () => {
  fetchClasses()
})

await fetchClasses()
</script>
