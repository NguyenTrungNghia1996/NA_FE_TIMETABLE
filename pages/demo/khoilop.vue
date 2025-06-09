<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">Demo: SelectGradeLevel (Khối lớp)</h1>

    <ClientOnly>
      <a-form :model="form" @finish="submit" layout="vertical">
        <SelectGradeLevel
          v-model="form.gradeMultiple"
          label="Chọn nhiều khối lớp"
          name="gradeMultiple"
          :multiple="true"
        />

        <SelectGradeLevel
          v-model="form.gradeSingle"
          label="Chọn một khối lớp"
          name="gradeSingle"
        />

        <SelectGradeLevel
          v-model="form.gradeDisabled"
          label="Khối lớp bị khóa"
          name="gradeDisabled"
          :disabled="true"
        />

        <a-button type="dashed" @click="modalOpen = true">Chọn khối lớp trong Modal</a-button>

        <a-button html-type="submit" type="primary" class="mt-4">Gửi</a-button>
      </a-form>

      <a-modal v-model:open="modalOpen" title="Chọn khối lớp" @ok="submitModal">
        <SelectGradeLevel
          v-model="modalForm.modalGrade"
          label="Khối lớp modal"
          name="modalGrade"
        />
      </a-modal>

      <!-- Debug -->
      <div class="mt-6">
        <h2 class="font-semibold">📦 Form:</h2>
        <pre class="bg-gray-100 p-4 rounded"><code>{{ form }}</code></pre>
        <h2 class="font-semibold mt-2">🧪 Modal:</h2>
        <pre class="bg-gray-100 p-4 rounded"><code>{{ modalForm }}</code></pre>
      </div>

      <!-- Bảng hướng dẫn -->
      <div class="mt-10 border-t pt-6">
        <h2 class="text-xl font-bold mb-4">📘 Hướng dẫn sử dụng & Props</h2>
        <a-table :columns="columns" :data-source="propsTable" bordered size="small" row-key="prop" />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
const form = reactive({
  gradeMultiple: [],
  gradeSingle: null,
  gradeDisabled: 1,
})

const modalForm = reactive({
  modalGrade: null,
})

const modalOpen = ref(false)

const submit = () => {
  console.log('📤 Form:', form)
}

const submitModal = () => {
  console.log('📤 Modal:', modalForm)
  modalOpen.value = false
}

const columns = [
  { title: 'Prop', dataIndex: 'prop' },
  { title: 'Kiểu', dataIndex: 'type' },
  { title: 'Mặc định', dataIndex: 'default' },
  { title: 'Mô tả', dataIndex: 'desc' },
]

const propsTable = [
  { prop: 'modelValue', type: 'Array | Number | String', default: '—', desc: 'Giá trị binding qua v-model' },
  { prop: 'label', type: 'String', default: 'Khối lớp', desc: 'Nhãn hiển thị trên form item' },
  { prop: 'name', type: 'String', default: 'khoilop', desc: 'Tên trường trong form' },
  { prop: 'multiple', type: 'Boolean', default: 'false', desc: 'Cho phép chọn nhiều giá trị hay không' },
  { prop: 'placeholder', type: 'String', default: 'Chọn khối lớp', desc: 'Placeholder hiển thị' },
  { prop: 'rules', type: 'Array', default: '[]', desc: 'Mảng rule kiểm tra hợp lệ (validate)' },
  { prop: 'disabled', type: 'Boolean', default: 'false', desc: 'Không cho người dùng tương tác nếu true' },
]
</script>
