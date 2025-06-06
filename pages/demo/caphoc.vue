<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">📘 Demo: SelectSchoolLevel</h1>

    <ClientOnly>
      <a-form :model="form" @finish="submit" layout="vertical">
        <!-- Bắt buộc chọn nhiều -->
        <SelectSchoolLevel
          v-model="form.requiredSelect"
          label="Bắt buộc chọn nhiều"
          name="requiredSelect"
          :rules="[
            { required: true, message: 'Vui lòng chọn ít nhất một cấp học', type: 'array' }
          ]"
          :multiple="true"
        />

        <!-- Có giá trị mặc định -->
        <SelectSchoolLevel
          v-model="form.defaultSelect"
          label="Có giá trị mặc định"
          name="defaultSelect"
          :multiple="true"
        />

        <!-- Trường bị disabled -->
        <SelectSchoolLevel
          v-model="form.disabledSelect"
          label="Không thể chọn (disabled)"
          name="disabledSelect"
          :disabled="true"
          :multiple="false"
        />

        <!-- Chọn một giá trị -->
        <SelectSchoolLevel
          v-model="form.singleSelect"
          label="Chọn một cấp học"
          name="singleSelect"
        />

        <!-- Modal trigger -->
        <a-button type="dashed" @click="showModal = true">Mở chọn trong Modal</a-button>

        <!-- Gửi form -->
        <a-button html-type="submit" type="primary" class="mt-4">Gửi</a-button>
      </a-form>

      <!-- Modal -->
      <a-modal v-model:open="showModal" title="Chọn cấp học trong Modal" @ok="submitModal">
        <SelectSchoolLevel
          v-model="modalForm.modalSelect"
          label="Chọn trong Modal"
          name="modalSelect"
        />
      </a-modal>

      <!-- Debug -->
      <div class="mt-6 space-y-2">
        <h2 class="font-semibold">📦 Form Data</h2>
        <pre class="bg-gray-100 p-4 rounded"><code>{{ form }}</code></pre>
        <h2 class="font-semibold">🧪 Modal Data</h2>
        <pre class="bg-gray-100 p-4 rounded"><code>{{ modalForm }}</code></pre>
      </div>

      <!-- Bảng hướng dẫn -->
      <div class="mt-10 border-t pt-6">
        <h2 class="text-xl font-bold mb-4">📖 Cách sử dụng & Props</h2>
        <a-table :columns="columns" :data-source="propsTable" bordered size="small" row-key="prop" />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
const form = reactive({
  requiredSelect: [],
  defaultSelect: [2, 38],
  disabledSelect: null,
  singleSelect: null,
})

const modalForm = reactive({
  modalSelect: null,
})

const showModal = ref(false)

const submit = () => {
  console.log('✅ Submitted form:', form)
}

const submitModal = () => {
  console.log('✅ Submitted modal:', modalForm)
  showModal.value = false
}

// Table hướng dẫn props
const columns = [
  { title: 'Prop', dataIndex: 'prop' },
  { title: 'Kiểu', dataIndex: 'type' },
  { title: 'Mặc định', dataIndex: 'default' },
  { title: 'Mô tả', dataIndex: 'desc' },
]

const propsTable = [
  { prop: 'modelValue', type: 'Array | Number | String', default: '—', desc: 'Giá trị binding v-model' },
  { prop: 'label', type: 'String', default: 'Cấp học', desc: 'Label hiển thị trên form item' },
  { prop: 'name', type: 'String', default: 'caphoc', desc: 'Tên field trong form' },
  { prop: 'multiple', type: 'Boolean', default: 'false', desc: 'Cho phép chọn nhiều giá trị' },
  { prop: 'placeholder', type: 'String', default: 'Chọn cấp học', desc: 'Placeholder hiển thị' },
  { prop: 'rules', type: 'Array', default: '[]', desc: 'Validation rules của trường' },
  { prop: 'disabled', type: 'Boolean', default: 'false', desc: 'Vô hiệu hoá select' },
]
</script>
