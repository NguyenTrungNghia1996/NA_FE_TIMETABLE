<template>
  <div class="p-4 bg-white rounded shadow">
    <!-- Header với tìm kiếm và nút thêm mới -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm menu..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetSearch" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal(null)" class="w-full md:w-auto">
        Thêm mới
      </a-button>
    </div>

    <!-- Bảng dữ liệu -->
    <ClientOnly>
      {{ nestedMenuData }}
      <a-table :columns="columns" :data-source="nestedMenuData" :pagination="pagination" :loading="loading" :scroll="{ x: 1000 }" @change="handleTableChange" bordered size="middle" :expand-icon-column-index="columns.length - 1">
        <template #bodyCell="{ column, record }">
          <!-- Cột thao tác -->
          <template v-if="column.key === 'action'">
            <div class="flex justify-center gap-2">
              <a-tooltip title="Thêm menu con">
                <a-button type="link" size="small" @click="showModal(record.id)">
                  <template #icon>
                    <FolderAddOutlined />
                  </template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="Sửa">
                <a-button type="link" size="small" @click="editItem(record)">
                  <template #icon>
                    <EditOutlined />
                  </template>
                </a-button>
              </a-tooltip>
              <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                <a-tooltip title="Xóa">
                  <a-button type="link" danger size="small">
                    <template #icon>
                      <DeleteOutlined />
                    </template>
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <!-- Modal thêm/sửa menu -->
    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa menu' : currentParentId ? 'Thêm menu con' : 'Thêm menu mới'" @cancel="handleCancel" :width="700" :footer="null">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tiêu đề menu" name="title" :rules="[{ required: true, message: 'Vui lòng nhập tiêu đề menu' }]">
          <a-input v-model:value="formState.title" placeholder="Nhập tiêu đề menu" />
        </a-form-item>

        <a-form-item label="Key menu" name="key" :rules="[{ required: true, message: 'Vui lòng nhập key menu' }]">
          <a-input v-model:value="formState.key" placeholder="Nhập key menu (viết liền không dấu)" />
        </a-form-item>

        <a-form-item label="Đường dẫn" name="url">
          <a-input v-model:value="formState.url" placeholder="Nhập đường dẫn" />
        </a-form-item>

        <a-form-item label="Icon" name="icon">
          <a-input v-model:value="formState.icon" placeholder="Nhập icon (class hoặc đường dẫn)" />
        </a-form-item>

        <a-form-item label="Menu cha" name="parent_Id" v-if="!currentParentId">
          <a-tree-select v-model:value="formState.parent_Id" :tree-data="menuOptions" placeholder="Chọn menu cha (nếu có)" :field-names="{ label: 'title', value: 'id', children: 'children' }" allow-clear />
        </a-form-item>

        <div class="flex justify-end gap-2 mt-6">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading">
            {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
          </a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
const { RestApi } = useApi();
const param = ref({ PageIndex: 1, PageSize: 10, search: "" });
const columns = [
  {
    title: 'STT',
    key: 'stt',
    width: 70,
    align: 'center',
    customRender: ({ index }) => index + 1
  },
  {
    title: 'Tiêu đề',
    dataIndex: 'title',
    key: 'title',
    width: 200
  },
  {
    title: 'Key',
    dataIndex: 'key',
    key: 'key',
    width: 150
  },
  {
    title: 'Đường dẫn',
    dataIndex: 'url',
    key: 'url',
    width: 150
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: 180,
    align: 'center',
    fixed: 'right'
  }
]

const dataSource = ref([])
const nestedMenuData = ref([])
const loading = ref(false)
const searchText = ref('')
const visible = ref(false)
const confirmLoading = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const currentParentId = ref(null)
const formRef = ref()
const menuOptions = ref([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20', '50'],
  showTotal: (total) => `Tổng ${total} bản ghi`
})

const formState = reactive({
  title: '',
  key: '',
  url: '',
  icon: '',
  parent_Id: null
})

const rules = {
  title: [
    { required: true, message: 'Vui lòng nhập tiêu đề menu', trigger: 'blur' },
    { min: 2, message: 'Tiêu đề phải có ít nhất 2 ký tự', trigger: 'blur' }
  ],
  key: [
    { required: true, message: 'Vui lòng nhập key menu', trigger: 'blur' },
    { pattern: /^[a-z0-9]+$/, message: 'Key chỉ chứa chữ thường và số, viết liền', trigger: 'blur' }
  ]
}

const fetchData = async (param) => {
  try {
    loading.value = true
    const { data } = await RestApi.menu.list({ params: param })

    if (data.value?.status === 'success') {
      dataSource.value = data.value.data.items
      nestedMenuData.value = buildNestedMenu(data.value.data.items)
      pagination.total = data.value.data.totalrecord
      menuOptions.value = buildMenuOptions(data.value.data.items)
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    message.error('Lỗi khi tải danh sách menu')
  } finally {
    loading.value = false
  }
}

const buildNestedMenu = (items, parentId = null) => {
  return items
    .filter(item => item.parent_Id === parentId)
    .map(item => ({
      ...item,
      children: buildNestedMenu(items, item.id)
    }))
}

const buildMenuOptions = (items, parentId = null, level = 0) => {
  const options = []
  items
    .filter(item => item.parent_Id === parentId)
    .forEach(item => {
      const option = {
        id: item.id,
        title: `${'--'.repeat(level)} ${item.title}`,
        children: buildMenuOptions(items, item.id, level + 1)
      }
      options.push(option)
    })
  return options
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const resetSearch = () => {
  searchText.value = ''
  pagination.current = 1
  fetchData()
}

const showModal = (parentId) => {
  isEdit.value = false
  currentId.value = null
  currentParentId.value = parentId

  Object.assign(formState, {
    title: '',
    key: '',
    url: '',
    icon: '',
    parent_Id: parentId || null
  })

  visible.value = true
}

const editItem = (record) => {
  isEdit.value = true
  currentId.value = record.id
  currentParentId.value = null

  Object.assign(formState, {
    title: record.title,
    key: record.key,
    url: record.url || '',
    icon: record.icon || '',
    parent_Id: record.parent_Id
  })

  visible.value = true
}

const handleOk = async () => {
  try {
    await formRef.value.validate()
    confirmLoading.value = true

    if (isEdit.value) {
      const { data, error } = await RestApi.menu.update({ body: { ...formState } })
      if (data.value?.status === 'success') {
        message.success(data.value.message || 'Cập nhật menu thành công')
      } else {
        throw new Error(error.value?.data?.message || 'Cập nhật không thành công')
      }
    } else {
      
      if (formState) {
        delete formState.id
      }
      const { data, error } = await RestApi.menu.create({ body: { ...formState } })
      if (data.value?.status === 'success') {
        message.success(data.value.message || 'Thêm mới menu thành công')
      } else {
        throw new Error(error.value?.data?.message || 'Thêm mới không thành công')
      }
    }
  } catch (error) {
    message.error(error.message || error.response?.data?.message || 'Đã xảy ra lỗi khi lưu thông tin menu')
  } finally {
    visible.value = false
    await fetchData({ ...param.value })
    confirmLoading.value = false
  }
}

const handleCancel = () => {
  formRef.value?.resetFields()
  visible.value = false
  currentParentId.value = null
}

const deleteItem = async (id) => {
  try {
    const { data } = await useFetch(`/api/menus/${id}`, {
      method: 'delete'
    })

    if (data.value?.status === 'success') {
      message.success('Xóa menu thành công')
      fetchData()
    } else {
      message.error(data.value?.message || 'Có lỗi xảy ra')
    }
  } catch (error) {
    console.error('Error deleting data:', error)
    message.error('Có lỗi xảy ra khi xóa dữ liệu')
  }
}

onMounted(async () => {
  await fetchData({ ...param.value })
})
</script>

<style scoped>
@media (max-width: 768px) {
  .ant-table-thead>tr>th,
  .ant-table-tbody>tr>td {
    padding: 8px !important;
    font-size: 13px;
  }

  .ant-table-content {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

.ant-table-cell-fix-left,
.ant-table-cell-fix-right {
  z-index: 1;
  background: white;
}

.ant-table-cell-fix-right {
  box-shadow: -5px 0 5px -5px rgba(0, 0, 0, 0.1);
}

:deep(.ant-table-row-level-1) {
  background-color: #fafafa;
}

:deep(.ant-table-row-level-2) {
  background-color: #f5f5f5;
}
</style>
