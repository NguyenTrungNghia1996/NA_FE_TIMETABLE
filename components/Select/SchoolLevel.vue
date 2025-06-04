<template>
  <a-form-item
    v-if="withFormItem"
    :label="label"
    :name="name"
    :rules="rules"
  >
    <a-select
      :value="modelValue"
      @update:value="emit('update:modelValue', $event)"
      :placeholder="placeholder"
      :options="options"
      :loading="loading"
      :allowClear="true"
      :mode="multiple ? 'multiple' : undefined"
      show-search
      :filter-option="false"
      @search="handleSearch"
    />
  </a-form-item>

  <template v-else>
    <label class="block mb-1 font-medium">{{ label }}</label>
    <a-select
      :value="modelValue"
      @update:value="emit('update:modelValue', $event)"
      :placeholder="placeholder"
      :options="options"
      :loading="loading"
      :allowClear="true"
      :mode="multiple ? 'multiple' : undefined"
      show-search
      :filter-option="false"
      @search="handleSearch"
    />
  </template>
</template>

<script setup>
const { RestApi } = useApi();
import { ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useFetch } from '#app'

const props = defineProps({
  label: String,
  name: String,
  modelValue: [String, Number, Array],
  placeholder: String,
  rules: Array,
  withFormItem: {
    type: Boolean,
    default: true
  },
  multiple: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const options = ref([])
const loading = ref(false)

const fetchOptions = async (search = '') => {
  loading.value = true
  try {
    const { data, status } = await RestApi.school_level.list({ params: { PageIndex: 1, PageSize: 10, search: search } })
    if (data.value?.data?.items) {
      options.value = data.value.data.items.map(item => ({
        label: item.ten,
        value: item.id
      }))
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu cấp học:', err)
  } finally {
    loading.value = false
  }
}

const handleSearch = useDebounceFn((value) => {
  fetchOptions(value)
}, 500)

fetchOptions()
</script>
