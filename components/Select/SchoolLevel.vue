<template>
  <a-form-item :label="label" :name="name" :rules="rules">
    <a-select :value="modelValue" @update:value="val => $emit('update:modelValue', val)" :mode="multiple ? 'multiple' : undefined" show-search :placeholder="placeholder" :size="size" :loading="loading" :disabled="disabled" allow-clear class="w-full" :options="options" @search="onSearch" :filter-option="false" />
  </a-form-item>
</template>

<script setup>
import { ref } from 'vue'
import debounce from 'lodash/debounce'

const { RestApi } = useApi()

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: 'Cấp học' },
  name: { type: String, default: 'caphoc' },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Chọn cấp học' },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const options = ref([])
const loading = ref(false)

const fetchCaphoc = async (search = '') => {
  loading.value = true
  try {
    const { data } = await RestApi.school_level.list({
      params: { search }
    })

    if (data.value?.data?.items) {
      options.value = data.value.data.items.map(item => ({
        label: item.ten,
        value: item.id
      }))

      // Nếu chưa có modelValue, gán luôn giá trị đầu tiên
      if (props.modelValue === undefined || props.modelValue === null || props.modelValue === "") {
        emit('update:modelValue', props.modelValue)
      }
    } else {
      options.value = []
    }
  } catch (error) {
    console.error('❌ Lỗi khi fetch cấp học:', error)
    options.value = []
  } finally {
    loading.value = false
  }
}

// Debounced search
const debouncedFetch = debounce((val) => {
  fetchCaphoc(val)
}, 200)

// Xử lý input trim khi người dùng tìm kiếm
const onSearch = (val) => {
  debouncedFetch(val.trim())
}

// Fetch ban đầu
await fetchCaphoc()
</script>
