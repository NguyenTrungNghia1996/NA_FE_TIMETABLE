<template>
  <div class="p-4 bg-white rounded shadow min-h-full">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm phòng học..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetSearch" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto" :disabled="!settingStore.currentPermission">Thêm mới</a-button>
    </div>

    <!-- Bảng dữ liệu -->
    <ClientOnly>
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" @change="handleTableChange" bordered size="middle" :scroll="{ x: 1000 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'khong_kiem_tra_xung_dot'">
            {{ record.khong_kiem_tra_xung_dot ? '✔️' : '❌' }}
          </template>

          <template v-if="column.key === 'action'">
            <div class="flex justify-center gap-2">
              <div class="hidden md:flex space-x-2">
                <a-tooltip title="Tiết bận">
                  <a-button type="link" size="small" @click="editBusy(record)" :disabled="!settingStore.currentPermission">
                    <template #icon>
                      <CalendarOutlined />
                    </template>
                  </a-button>
                </a-tooltip>
                <a-tooltip title="Sửa">
                  <a-button type="link" size="small" @click="editItem(record)" :disabled="!settingStore.currentPermission">
                    <template #icon>
                      <EditOutlined />
                    </template>
                  </a-button>
                </a-tooltip>
                <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                  <a-tooltip title="Xóa">
                    <a-button type="link" danger size="small" :disabled="!settingStore.currentPermission">
                      <template #icon>
                        <DeleteOutlined />
                      </template>
                    </a-button>
                  </a-tooltip>
                </a-popconfirm>
              </div>
              <div class="md:hidden">
                <a-dropdown :trigger="['click']">
                  <a-button type="text" size="small">
                    <MoreOutlined />
                  </a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item @click="editItem(record)" :disabled="!settingStore.currentPermission">
                        <template #icon>
                          <EditOutlined />
                        </template>Sửa
                      </a-menu-item>
                      <a-menu-item danger @click="deleteItem(record.id)" :disabled="!settingStore.currentPermission">
                        <template #icon>
                          <DeleteOutlined />
                        </template>Xóa
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

    <!-- Modal thêm/sửa -->
    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa phòng học' : 'Thêm mới phòng học'" @cancel="handleCancel" :width="600" :footer="null">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tên phòng học" name="ten">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên phòng học" />
        </a-form-item>
        <a-form-item label="Sức chứa" name="suc_chua">
          <a-input-number v-model:value="formState.suc_chua" :min="1" style="width: 100%" />
        </a-form-item>
        <SelectClassroomType v-model="formState.id_Loai_phong_hoc" label="Loại phòng học" name="id_Loai_phong_hoc" placeholder="Chọn loại phòng học" :rules="rules.id_Loai_phong_hoc" />
        <SelectSchoolSite v-model="formState.id_Diem_truong" label="Điểm trường" name="id_Diem_truong" placeholder="Chọn điểm trường" :rules="rules.id_Diem_truong" />
        <a-form-item>
          <a-checkbox v-model:checked="formState.khong_kiem_tra_xung_dot">Không kiểm tra xung đột</a-checkbox>
        </a-form-item>
        <div class="flex justify-end gap-2 mt-6">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading">{{ isEdit ? 'Cập nhật' : 'Thêm mới' }}</a-button>
        </div>
      </a-form>
    </a-modal>
    <a-modal v-model:open="busy_modal" title="Chỉnh sửa tiết bận" @cancel="handleBusyCancel" :width="600" :footer="null">
      <div v-for="(block) in busy_data.ds_Ca" :key="block.id" style="margin-bottom: 2rem;">
        <Timetable :block="block" />
      </div>
      <div class="flex justify-end gap-2 mt-6">
        <a-button @click="handleBusyCancel">Hủy</a-button>
        <a-button type="primary" @click="handleBusyOk" :loading="confirmLoading">Cập Nhật</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
const settingStore = useSettingStore();
const { RestApi } = useApi();

const busy_modal = ref(false);
const busy_data = ref();

const param = ref({ PageIndex: 1, PageSize: 10, search: "" });
const searchText = ref('');
const loading = ref(false);
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const formRef = ref();

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['1', '10', '20', '50'],
  showTotal: (total) => `Tổng ${total} bản ghi`
});

const columns = [
  {
    title: 'STT',
    key: 'stt',
    width: 60,
    align: 'center',
    customRender: ({ index }) => (pagination.current - 1) * pagination.pageSize + index + 1
  },
  { title: 'Tên phòng học', dataIndex: 'ten', key: 'ten' },
  { title: 'Sức chứa', dataIndex: 'suc_chua', key: 'suc_chua', align: 'center' },
  { title: 'Loại phòng học', dataIndex: 'ten_loai_phong_hoc', key: 'ten_loai_phong_hoc' },
  { title: 'Điểm trường', dataIndex: 'ten_diem_truong', key: 'ten_diem_truong' },
  { title: 'Bỏ kiểm tra xung đột', key: 'khong_kiem_tra_xung_dot', align: 'center' },
  { title: 'Thao tác', key: 'action', width: 120, align: 'center', fixed: 'right' }
];

const dataSource = ref([]);
const formState = reactive({
  id: null,
  ten: '',
  suc_chua: 0,
  id_Loai_phong_hoc: null,
  id_Diem_truong: null,
  id_Don_vi: null,
  khong_kiem_tra_xung_dot: false
});

const rules = {
  ten: [{ required: true, message: 'Nhập tên phòng học', trigger: 'blur' }],
  suc_chua: [{ required: true, type: 'number', message: 'Nhập sức chứa', trigger: 'blur' }],
  id_Loai_phong_hoc: [{ required: true, message: 'Chọn loại phòng học', trigger: 'change' }],
  id_Diem_truong: [{ required: true, message: 'Chọn điểm trường', trigger: 'change' }]
};

const fetchData = async (param_soure) => {
  try {
    loading.value = true;
    const { data } = await RestApi.classroom.list({ params: param_soure });
    if (data.value?.status === 'success') {
      dataSource.value = data.value.data.items || [];
      pagination.total = data.value.data.totalrecord;
    } else {
      dataSource.value = []
      pagination.total = 0
    }
  } finally {
    loading.value = false;
  }
};

const handleTableChange = async (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  param.value.PageIndex = pag.current;
  param.value.PageSize = pag.pageSize;
  await fetchData({ ...param.value });
};

const handleSearch = async () => {
  param.value.search = searchText.value;
  pagination.current = 1;
  await fetchData({ ...param.value });
};

const resetSearch = async () => {
  searchText.value = '';
  pagination.current = 1;
  param.value.search = '';
  await fetchData({ ...param.value });
};

const showModal = async () => {
  isEdit.value = false;
  Object.assign(formState, {
    id: null, ten: '', suc_chua: null, id_Loai_phong_hoc: null,
    id_Diem_truong: null, id_Don_vi: null, khong_kiem_tra_xung_dot: false
  });
  visible.value = true;
};

const editItem = async (record) => {
  try {
    const { data } = await RestApi.classroom.detail({ params: { id: record.id } });
    if (data.value?.status === 'success') {
      Object.assign(formState, data.value.data);
      isEdit.value = true;
      visible.value = true;
    }
  } catch {
    message.error('Không thể tải dữ liệu phòng học');
  }
};
const editBusy = async (record) => {
  try {
    const { data } = await RestApi.classroom.get_busy({ params: { id: record.id } });
    if (data.value?.status === 'success') {
      busy_data.value = data.value.data
      busy_modal.value = true;
    }
  } catch {
    message.error('Không thể tải dữ liệu phòng học');
  }
};
const handleOk = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    if (isEdit.value) {
      const { data, error } = await RestApi.classroom.update({ body: { ...formState } })
      if (data.value?.status === 'success') {
        message.success(data.value.message || 'Cập nhật thành công')
        await fetchData({ ...param.value });
        visible.value = false
      } else {
        throw new Error(error.value?.data?.message || 'Cập nhật không thành công')
      }
    } else {
      if (formState) {
        delete formState.id
      }
      const { data, error } = await RestApi.classroom.create({ body: { ...formState } })
      if (data.value?.status === 'success') {
        message.success(data.value.message || 'Thêm mới thành công')
        await fetchData({ ...param.value });
        visible.value = false
      } else {
        throw new Error(error.value?.data?.message || 'Thêm mới không thành công')
      }
    }
  } catch (error) {
    message.error(error.message || error.response?.data?.message || 'Đã xảy ra lỗi khi lưu thông tin')
  } finally {
    confirmLoading.value = false;
  }
};
const handleBusyOk = async () => {
  try {
    confirmLoading.value = true;
    const { data, error } = await RestApi.classroom.update_busy({ body: busy_data.value });
    if (data.value?.status === 'success') {
      message.success(data.value.message || 'Cập nhật thành công')
      busy_modal.value = false
    } else {
      throw new Error(error.value?.data?.message || 'Cập nhật không thành công')
    }
  }
  catch (error) {
    message.error(error.message || error.response?.data?.message || 'Đã xảy ra lỗi khi lưu thông tin')
  } finally {
    confirmLoading.value = false;
  }
}
const handleCancel = () => {
  formRef.value?.resetFields();
  visible.value = false;
};
const handleBusyCancel = () => {
  busy_data.value = [];
  busy_modal.value = false;
}
const deleteItem = async (id) => {
  try {
    const { data } = await RestApi.classroom.delete({ params: { id } });
    if (data.value?.status === 'success') {
      message.success(data.value.message || 'Đã xoá');
      await fetchData({ ...param.value });
    }
  } catch {
    message.error('Lỗi khi xoá');
  }
};

await fetchData({ ...param.value });
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
</style>
