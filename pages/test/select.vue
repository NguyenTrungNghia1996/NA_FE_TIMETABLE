<template>
  <a-form
    :model="form"
    :rules="rules"
    ref="formRef"
    layout="vertical"
  >
    <SelectSchoolLevel
      label="Cấp học"
      name="caphoc"
      v-model:modelValue="form.caphoc"
      :rules="rules.caphoc"
      placeholder="Tìm và chọn cấp học"
    />

    <a-button type="primary" @click="submit">Lưu</a-button>
  </a-form>
</template>

<script setup>
const formRef = ref()

const form = reactive({
  caphoc: undefined
})

const rules = {
  caphoc: [
    { required: true, message: 'Vui lòng chọn cấp học', trigger: 'blur' }
  ]
}

const submit = () => {
  formRef.value.validate().then(() => {
    console.log('Form hợp lệ:', form)
  }).catch(() => {
    console.log('Form không hợp lệ')
  })
}
</script>
