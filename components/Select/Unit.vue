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
import { ref } from 'vue'
import debounce from 'lodash/debounce'

const { RestApi } = useApi()

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: 'Đơn vị' },
  name: { type: String, default: 'donvi' },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Chọn đơn vị' },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const options = ref([])
const loading = ref(false)

const fetchUnits = async (search = '') => {
  loading.value = true
  try {
    const { data } = await RestApi.unit.list({ params: { search } })

    if (data.value?.data?.items) {
      options.value = data.value.data.items.map(item => ({
        label: item.tenDonvi,
        value: item.id,
      }))

      if (props.modelValue === undefined || props.modelValue === null || props.modelValue === "") {
        emit('update:modelValue', props.modelValue)
      }
    }
  } catch (error) {
    console.error('❌ Lỗi fetch đơn vị:', error)
  } finally {
    loading.value = false
  }
}

const debouncedFetch = debounce((val) => {
  fetchUnits(val.trim())
}, 300)

const onSearch = (val) => {
  debouncedFetch(val)
}

await fetchUnits()
</script>
