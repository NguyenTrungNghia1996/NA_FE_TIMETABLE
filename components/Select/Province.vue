<template>
  <a-form-item :label="label" :name="name" :rules="rules">
    <a-select
      :value="modelValue"
      @update:value="val => $emit('update:modelValue', val)"
      :mode="multiple ? 'multiple' : undefined"
      show-search
      :placeholder="placeholder"
      :size="size"
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
import { ref } from 'vue'
import debounce from 'lodash/debounce'

const { RestApi } = useApi()

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: 'Tỉnh' },
  name: { type: String, default: 'id_tinh' },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Chọn tỉnh' },
  size: { type: String, default: 'middle' },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const options = ref([])
const loading = ref(false)

const fetchProvince = async (search = '') => {
  loading.value = true
  try {
    const { data } = await RestApi.province.list({ params: { search } })
    if (data.value?.data?.items) {
      options.value = data.value.data.items.map(item => ({
        label: item.ten,
        value: item.id
      }))
      if (props.modelValue === undefined || props.modelValue === null || props.modelValue === '') {
        emit('update:modelValue', props.modelValue)
      }
    } else {
      options.value = []
    }
  } catch (err) {
    console.error('❌ Lỗi fetch tỉnh:', err)
    options.value = []
  } finally {
    loading.value = false
  }
}

const debouncedFetch = debounce(val => {
  fetchProvince(val)
}, 200)

const onSearch = val => {
  debouncedFetch(val.trim())
}

await fetchProvince()
</script>
