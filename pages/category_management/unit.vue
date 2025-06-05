<template>
  <div class="p-4 bg-white rounded shadow">
    <!-- Header với tìm kiếm và nút thêm mới -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm đơn vị..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetSearch" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto">Thêm mới</a-button>
    </div>

    <!-- Bảng dữ liệu -->
    <ClientOnly>
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: 1000 }" @change="handleTableChange" bordered size="middle">
        <template #bodyCell="{ column, record }">
          <!-- Cột thao tác -->
          <template v-if="column.key === 'action'">
            <div class="flex justify-center gap-2">
              <!-- Desktop view - full buttons -->
              <div class="hidden md:flex space-x-2">
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

              <!-- Mobile view - dropdown -->
              <div class="md:hidden">
                <a-dropdown :trigger="['click']">
                  <a-button type="text" size="small">
                    <MoreOutlined />
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="1" @click="editItem(record)">
                        <template #icon>
                          <EditOutlined />
                        </template>
                        Sửa
                      </a-menu-item>
                      <a-menu-item key="2" danger @click="deleteItem(record.id)">
                        <template #icon>
                          <DeleteOutlined />
                        </template>
                        Xóa
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <!-- Modal thêm/sửa đơn vị -->
    <a-modal v-model:visible="visible" :title="isEdit ? 'Chỉnh sửa đơn vị' : 'Thêm mới đơn vị'" @cancel="handleCancel" :width="700" :footer="null">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a-form-item label="Tên đơn vị" name="tenDonvi" :rules="[{ required: true, message: 'Vui lòng nhập tên đơn vị' }]">
            <a-input v-model:value="formState.tenDonvi" placeholder="Nhập tên đơn vị" />
          </a-form-item>

          <a-form-item label="Cấp học" name="tenCaphoc">
            <a-input v-model:value="formState.tenCaphoc" placeholder="Nhập cấp học" />
          </a-form-item>

          <a-form-item label="Địa chỉ" name="diachi" :rules="[{ required: true, message: 'Vui lòng nhập địa chỉ' }]">
            <a-input v-model:value="formState.diachi" placeholder="Nhập địa chỉ" />
          </a-form-item>

          <a-form-item label="Số điện thoại" name="sodienthoai">
            <a-input v-model:value="formState.sodienthoai" placeholder="Nhập số điện thoại" />
          </a-form-item>

          <a-form-item label="Email" name="email" :rules="[{ type: 'email', message: 'Email không hợp lệ' }]">
            <a-input v-model:value="formState.email" placeholder="Nhập email" />
          </a-form-item>

          <a-form-item label="Ca học" name="tenCahoc">
            <a-input v-model:value="formState.tenCahoc" placeholder="Nhập ca học" />
          </a-form-item>
        </div>

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
    customRender: ({ index }) => (pagination.current - 1) * pagination.pageSize + index + 1
  },
  {
    title: 'Tên đơn vị',
    dataIndex: 'tenDonvi',
    key: 'tenDonvi',
    width: 200
  },
  {
    title: 'Địa chỉ',
    dataIndex: 'diachi',
    key: 'diachi',
    ellipsis: true
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'sodienthoai',
    key: 'sodienthoai',
    width: 120
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: 150
  },
  {
    title: 'Cấp học',
    dataIndex: 'tenCaphoc',
    key: 'tenCaphoc',
    width: 100
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: 120,
    align: 'center',
    fixed: 'right'
  }
]

// State
const dataSource = ref([])
const loading = ref(false)
const searchText = ref('')
const visible = ref(false)
const confirmLoading = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const formRef = ref()

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20', '50'],
  showTotal: (total) => `Tổng ${total} bản ghi`
})

const formState = reactive({
  tenDonvi: '',
  diachi: '',
  sodienthoai: '',
  email: '',
  tenCaphoc: '',
  tenCahoc: ''
})

const rules = {
  tenDonvi: [
    { required: true, message: 'Vui lòng nhập tên đơn vị', trigger: 'blur' }
  ],
  diachi: [
    { required: true, message: 'Vui lòng nhập địa chỉ', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: 'Email không hợp lệ', trigger: 'blur' }
  ]
}

// Methods
const fetchData = async (param) => {
  try {
    loading.value = true
    const { data } = await RestApi.unit.list({ params: param })

    if (data.value?.status === 'success') {
      dataSource.value = data.value.data.items
      pagination.total = data.value.data.totalrecord
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    message.error('Lỗi khi tải danh sách đơn vị')
  } finally {
    loading.value = false
  }
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

const showModal = () => {
  isEdit.value = false
  currentId.value = null
  Object.assign(formState, {
    tenDonvi: '',
    diachi: '',
    sodienthoai: '',
    email: '',
    tenCaphoc: '',
    tenCahoc: ''
  })
  visible.value = true
}

const editItem = (record) => {
  isEdit.value = true
  currentId.value = record.id
  Object.assign(formState, {
    tenDonvi: record.tenDonvi,
    diachi: record.diachi,
    sodienthoai: record.sodienthoai,
    email: record.email,
    tenCaphoc: record.tenCaphoc,
    tenCahoc: record.tenCahoc
  })
  visible.value = true
}

const handleOk = async () => {
  try {
    await formRef.value.validate()
    confirmLoading.value = true

    const url = isEdit.value ? `/api/donvi/${currentId.value}` : '/api/donvi'
    const method = isEdit.value ? 'put' : 'post'

    const { data } = await useFetch(url, {
      method,
      body: formState
    })

    if (data.value?.status === 'success') {
      message.success(isEdit.value ? 'Cập nhật đơn vị thành công' : 'Thêm mới đơn vị thành công')
      visible.value = false
      fetchData()
    } else {
      message.error(data.value?.message || 'Có lỗi xảy ra')
    }
  } catch (error) {
    console.error('Error saving data:', error)
    message.error('Có lỗi xảy ra khi lưu dữ liệu')
  } finally {
    confirmLoading.value = false
  }
}

const handleCancel = () => {
  formRef.value?.resetFields()
  visible.value = false
}

const deleteItem = async (id) => {
  try {
    const { data,error } = await RestApi.unit.delete({ params: { id } })
    if (data.value?.status === 'success') {
      message.success(data.value?.message || 'Xóa người đơn vị thành công')
    } else {
      throw new Error(error.value?.data?.message || 'Xóa không thành công')
    }
  } catch (error) {
    message.error(error.message || error.response?.data?.message || 'Đã xảy ra lỗi khi xóa thông tin đơn vị')
  } finally {
    await fetchData({ ...param.value })
  }
}

// Lifecycle
await fetchData({ ...param.value })
</script>

<style scoped>
/* Responsive table */
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

/* Fix for sticky column */
.ant-table-cell-fix-left,
.ant-table-cell-fix-right {
  z-index: 1;
  background: white;
}

.ant-table-cell-fix-right {
  box-shadow: -5px 0 5px -5px rgba(0, 0, 0, 0.1);
}
</style>