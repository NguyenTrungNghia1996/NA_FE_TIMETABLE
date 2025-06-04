<!-- components/FormInput.vue -->
<template>
  <!-- Nếu có dùng trong Form thì bọc bằng a-form-item -->
  <a-form-item
    v-if="withFormItem"
    :label="label"
    :name="name"
    :rules="rules"
  >
    <a-input
      v-model:value="modelValue"
      :placeholder="placeholder"
    />
  </a-form-item>
  <template v-else>
    <label class="block mb-1 font-medium">{{ label }}</label>
    <a-input
      v-model:value="modelValue"
      :placeholder="placeholder"
    />
  </template>
</template>

<script setup>
defineProps({
  label: String,
  name: String,
  modelValue: String,
  placeholder: String,
  rules: Array,
  withFormItem: {
    type: Boolean,
    default: true
  }
})

defineEmits(['update:modelValue'])
</script>
