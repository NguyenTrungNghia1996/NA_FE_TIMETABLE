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
  label: { type: String, default: 'Giáo viên' },
  name: { type: String, default: 'giaovien' },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Chọn giáo viên' },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  /** Tự động chọn giáo viên đầu tiên nếu chưa chọn giá trị */
  autoSelectFirst: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const options = ref([])
const loading = ref(false)

const fetchTeachers = async (search = '') => {
  loading.value = true
  try {
    const { data } = await RestApi.teacher.list({ params: { search } })

    if (data.value?.data?.items) {
      options.value = data.value.data.items.map(item => ({
        label: `${item.ho_va_ho_dem} ${item.ten} (${item.ma_giao_vien})`,
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
          const defaultValue = props.multiple ? [firstOption.value] : firstOption.value
          emit('update:modelValue', defaultValue)
        }
      }
    }
  } catch (error) {
    console.error('❌ Lỗi fetch giáo viên:', error)
  } finally {
    loading.value = false
  }
}

const debouncedFetch = debounce((val) => {
  fetchTeachers(val.trim())
}, 300)

const onSearch = (val) => {
  debouncedFetch(val)
}

await fetchTeachers()
</script>
