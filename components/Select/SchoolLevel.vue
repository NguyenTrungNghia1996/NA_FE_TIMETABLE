<!-- 
<template>
  <a-form-item
    v-if="withFormItem"
    :label="label"
    :name="name"
    :rules="rules"
  >
    <a-select
      v-model:value="modelValue"
      :placeholder="placeholder"
      :options="options"
      :loading="loading"
      :allowClear="true"
      show-search
      :filter-option="false"
      @search="handleSearch"
    />
  </a-form-item>

  <template v-else>
    <label class="block mb-1 font-medium">{{ label }}</label>
    <a-select
      v-model:value="modelValue"
      :placeholder="placeholder"
      :options="options"
      :loading="loading"
      :allowClear="true"
      show-search
      :filter-option="false"
      @search="handleSearch"
    />
  </template>
</template>

<script setup>
import { ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useFetch } from '#app'

const props = defineProps({
  label: String,
  name: String,
  modelValue: [String, Number],
  placeholder: String,
  rules: Array,
  withFormItem: {
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
    const { data } = await useFetch(`/api/Caphoc?pageIndex=1&pageSize=10&search=${search}`)
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

// Gọi API khi người dùng nhập từ khoá, debounce 500ms
const handleSearch = useDebounceFn((value) => {
  fetchOptions(value)
}, 500)

// Load dữ liệu mặc định ban đầu (tất cả hoặc search mặc định)
fetchOptions()

</script> -->
<template>
  
</template>
