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
  label: { type: String, default: 'Tổ chuyên môn' },
  name: { type: String, default: 'tochuyenmon' },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Chọn tổ chuyên môn' },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const options = ref([])
const loading = ref(false)

const fetchExpertise = async (search = '') => {
  loading.value = true
  try {
    const { data } = await RestApi.expertise.list({ params: { search } })

    if (data.value?.data?.items) {
      options.value = data.value.data.items.map(item => ({
        label: item.ten,
        value: item.id,
      }))

      if (
        props.modelValue === null ||
        props.modelValue === undefined
      ) {
        const first = options.value[0]
        if (first) emit('update:modelValue', first.value)
      }
    }
  } catch (error) {
    console.error('❌ Lỗi fetch tổ chuyên môn:', error)
  } finally {
    loading.value = false
  }
}

const debouncedFetch = debounce((val) => {
  fetchExpertise(val.trim())
}, 300)

const onSearch = (val) => {
  debouncedFetch(val)
}

await fetchExpertise()
</script>
