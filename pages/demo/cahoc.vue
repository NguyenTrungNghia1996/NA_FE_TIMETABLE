<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">Demo: SelectSchoolShift (Ca học)</h1>

    <ClientOnly>
      <a-form :model="form" @finish="submit" layout="vertical">
        <!-- Multiple -->
        <SelectSchoolShift
          v-model="form.caMultiple"
          label="Chọn nhiều ca học"
          name="caMultiple"
          :multiple="true"
        />

        <!-- Single -->
        <SelectSchoolShift
          v-model="form.caSingle"
          label="Chọn một ca học"
          name="caSingle"
        />

        <!-- Disabled -->
        <SelectSchoolShift
          v-model="form.caDisabled"
          label="Ca học bị khóa"
          name="caDisabled"
          :disabled="true"
        />

        <!-- Modal trigger -->
        <a-button type="dashed" @click="modalOpen = true">Chọn ca học trong Modal</a-button>

        <a-button html-type="submit" type="primary" class="mt-4">Gửi</a-button>
      </a-form>

      <!-- Modal -->
      <a-modal v-model:open="modalOpen" title="Chọn ca học" @ok="submitModal">
        <SelectSchoolShift
          v-model="modalForm.modalShift"
          label="Ca học modal"
          name="modalShift"
        />
      </a-modal>

      <!-- Debug output -->
      <div class="mt-6">
        <h2 class="font-semibold">📦 Form:</h2>
        <pre class="bg-gray-100 p-4 rounded"><code>{{ form }}</code></pre>
        <h2 class="font-semibold mt-2">🧪 Modal:</h2>
        <pre class="bg-gray-100 p-4 rounded"><code>{{ modalForm }}</code></pre>
      </div>

      <!-- Bảng hướng dẫn props -->
      <div class="mt-10 border-t pt-6">
        <h2 class="text-xl font-bold mb-4">📘 Hướng dẫn sử dụng & Props</h2>
        <a-table :columns="columns" :data-source="propsTable" bordered size="small" row-key="prop" />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
const form = reactive({
  caMultiple: [2,5],
  caSingle: null,
  caDisabled: 2,
})

const modalForm = reactive({
  modalShift: null,
})

const modalOpen = ref(false)

const submit = () => {
  console.log('📤 Submit form:', form)
}

const submitModal = () => {
  console.log('📤 Submit modal:', modalForm)
  modalOpen.value = false
}

// Props table
const columns = [
  { title: 'Prop', dataIndex: 'prop' },
  { title: 'Kiểu', dataIndex: 'type' },
  { title: 'Mặc định', dataIndex: 'default' },
  { title: 'Mô tả', dataIndex: 'desc' },
]

const propsTable = [
  { prop: 'modelValue', type: 'Array | Number | String', default: '—', desc: 'Giá trị binding qua v-model' },
  { prop: 'label', type: 'String', default: 'Ca học', desc: 'Nhãn hiển thị trên form item' },
  { prop: 'name', type: 'String', default: 'cahoc', desc: 'Tên trường trong form' },
  { prop: 'multiple', type: 'Boolean', default: 'false', desc: 'Cho phép chọn nhiều giá trị hay không' },
  { prop: 'placeholder', type: 'String', default: 'Chọn ca học', desc: 'Placeholder hiển thị khi chưa chọn' },
  { prop: 'rules', type: 'Array', default: '[]', desc: 'Mảng rule kiểm tra hợp lệ (validate)' },
  { prop: 'disabled', type: 'Boolean', default: 'false', desc: 'Không cho người dùng tương tác nếu true' },
]
</script>

