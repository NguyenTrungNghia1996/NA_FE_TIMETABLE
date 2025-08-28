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
  label: { type: String, default: 'Ca học' },
  name: { type: String, default: 'cahoc' },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Chọn ca học' },
  size: { type: String, default: 'middle' },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const options = ref([])
const loading = ref(false)

const fetchCaHocTheoDonVi = async (search = '') => {
  loading.value = true
  try {
    const { data } = await RestApi.school_shift.list_by_unit({ params: { search } })

    if (data.value?.data?.items) {
      options.value = data.value.data.items.map(item => ({
        label: item.ten,
        value: item.id,
      }))

      // keep current modelValue as-is; no auto-defaulting here
      emit('update:modelValue', props.modelValue)
    }
  } catch (err) {
    console.error('❌ Lỗi fetch ca học theo đơn vị:', err)
  } finally {
    loading.value = false
  }
}

const debouncedFetch = debounce((val) => {
  fetchCaHocTheoDonVi(val.trim())
}, 300)

const onSearch = (val) => {
  debouncedFetch(val)
}

await fetchCaHocTheoDonVi()
</script>

