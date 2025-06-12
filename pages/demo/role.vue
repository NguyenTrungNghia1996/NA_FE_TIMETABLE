<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">Demo: SelectRole (Nhóm quyền)</h1>

    <ClientOnly>
      <a-form :model="form" @finish="submit" layout="vertical">
        <SelectRole
          v-model="form.roleMultiple"
          label="Chọn nhiều nhóm quyền"
          name="roleMultiple"
          :multiple="true"
        />

        <SelectRole
          v-model="form.roleSingle"
          label="Chọn một nhóm quyền"
          name="roleSingle"
        />

        <SelectRole
          v-model="form.roleDisabled"
          label="Nhóm quyền bị khóa"
          name="roleDisabled"
          :disabled="true"
        />

        <a-button type="dashed" @click="modalOpen = true">Chọn nhóm quyền trong Modal</a-button>

        <a-button html-type="submit" type="primary" class="mt-4">Gửi</a-button>
      </a-form>

      <a-modal v-model:open="modalOpen" title="Chọn nhóm quyền" @ok="submitModal">
        <SelectRole
          v-model="modalForm.modalRole"
          label="Nhóm quyền modal"
          name="modalRole"
        />
      </a-modal>

      <!-- Debug -->
      <div class="mt-6">
        <h2 class="font-semibold">📦 Form:</h2>
        <pre class="bg-gray-100 p-4 rounded"><code>{{ form }}</code></pre>
        <h2 class="font-semibold mt-2">🧪 Modal:</h2>
        <pre class="bg-gray-100 p-4 rounded"><code>{{ modalForm }}</code></pre>
      </div>

      <!-- Props table -->
      <div class="mt-10 border-t pt-6">
        <h2 class="text-xl font-bold mb-4">📘 Hướng dẫn sử dụng & Props</h2>
        <a-table :columns="columns" :data-source="propsTable" bordered size="small" row-key="prop" />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
const form = reactive({
  roleMultiple: [],
  roleSingle: null,
  roleDisabled: 2,
})

const modalForm = reactive({
  modalRole: null,
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
  { prop: 'modelValue', type: 'Array | Number', default: '—', desc: 'Giá trị trả về là id nhóm quyền' },
  { prop: 'label', type: 'String', default: 'Nhóm quyền', desc: 'Nhãn hiển thị trên form item' },
  { prop: 'name', type: 'String', default: 'nhomquyen', desc: 'Tên field trong form' },
  { prop: 'multiple', type: 'Boolean', default: 'false', desc: 'Cho phép chọn nhiều nhóm quyền' },
  { prop: 'placeholder', type: 'String', default: 'Chọn nhóm quyền', desc: 'Hiển thị nếu chưa chọn' },
  { prop: 'rules', type: 'Array', default: '[]', desc: 'Các luật kiểm tra hợp lệ' },
  { prop: 'disabled', type: 'Boolean', default: 'false', desc: 'Không thể chọn nếu true' },
]
</script>
