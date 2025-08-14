<template>
  <div class="p-4 bg-white rounded shadow min-h-full">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-6">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm thời khóa biểu..." enter-button @search="handleSearch" class="w-full md:w-1/3" />
      <a-button @click="resetSearch" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto">Thêm mới</a-button>
    </div>

    <!-- Table -->
    <ClientOnly>
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" @change="handleTableChange" bordered size="middle">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.dang_su_dung ? 'green' : 'red'">
              {{ record.dang_su_dung ? "Đang sử dụng" : "Không sử dụng" }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex justify-center gap-2">
              <a-tooltip title="Thời khóa biểu">
                <a-button type="link" size="small" @click="openInfoDrawer(record)">
                  <template #icon><CalendarOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="Tinh chỉnh">
                <a-button type="link" size="small" @click="openAdjustDrawer(record)">
                  <template #icon><SettingOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="Sửa">
                <a-button type="link" size="small" @click="editItem(record)">
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                <a-tooltip title="Xóa">
                  <a-button type="link" danger size="small">
                    <template #icon><DeleteOutlined /></template>
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <!-- Modal -->
    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa thời khóa biểu' : 'Thêm mới thời khóa biểu'" @cancel="handleCancel" :footer="null">
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tên thời khóa biểu" name="ten">
          <a-input v-model:value="formState.ten" placeholder="Nhập tên thời khóa biểu" />
        </a-form-item>
        <a-form-item label="Đang sử dụng" name="dang_su_dung">
          <a-switch v-model:checked="formState.dang_su_dung" />
        </a-form-item>
        <div class="flex justify-end gap-2 mt-6">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading">
            {{ isEdit ? "Cập nhật" : "Thêm mới" }}
          </a-button>
        </div>
      </a-form>
    </a-modal>
    <a-drawer v-model:open="drawerInfoOpen" title="Xếp thời khóa biểu" :footer="null" height="100vh" placement="bottom" @close="closeInfoDrawer">
      <ClientOnly>
        <TimetableInfo ref="infoRef" />
      </ClientOnly>
    </a-drawer>
    <a-drawer v-model:open="drawerAdjustOpen" title="Tinh chỉnh thời khóa biểu" :footer="null" height="100vh" placement="bottom">
      <ClientOnly>
        <TimetableGrid :rawTimetable="adjustRawTimetable" :rawUnscheduled="adjustRawUnscheduled" />
      </ClientOnly>
    </a-drawer>
  </div>
</template>

<script setup>
const { RestApi } = useApi();

const searchText = ref("");
const dataSource = ref([]);
const loading = ref(false);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["1", "5", "10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const columns = [
  {
    title: "STT",
    key: "stt",
    width: 70,
    align: "center",
    customRender: ({ index }) => (pagination.current - 1) * pagination.pageSize + index + 1,
  },
  {
    title: "Tên thời khóa biểu",
    dataIndex: "ten",
    key: "ten",
  },
  {
    title: "Trạng thái",
    dataIndex: "dang_su_dung",
    key: "status",
    width: 140,
    align: "center",
  },
  {
    title: "Thao tác",
    key: "action",
    width: 120,
    align: "center",
  },
];

const param = ref({ pageIndex: 1, pageSize: 10 });

const visible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const confirmLoading = ref(false);
const formState = reactive({ id: null, ten: "", dang_su_dung: true });

const rules = {
  ten: [{ required: true, message: "Vui lòng nhập tên thời khóa biểu", trigger: "blur" }],
};

const fetchData = async p => {
  try {
    loading.value = true;
    const { data } = await RestApi.timetable.list({ params: p });
    if (data.value?.status === "success") {
      dataSource.value = data.value.data.items;
      pagination.total = data.value.data.totalrecord;
    } else {
      dataSource.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    message.error("Lỗi khi tải danh sách thời khóa biểu");
  } finally {
    loading.value = false;
  }
};

const handleTableChange = async pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  param.value.pageIndex = pag.current;
  param.value.pageSize = pag.pageSize;
  await fetchData({ ...param.value });
};

const handleSearch = async () => {
  const search = searchText.value.trim();
  if (search) {
    param.value.search = search;
  } else {
    delete param.value.search;
  }
  pagination.current = 1;
  param.value.pageIndex = 1;
  await fetchData({ ...param.value });
};

const resetSearch = async () => {
  searchText.value = "";
  pagination.current = 1;
  param.value.pageIndex = 1;
  delete param.value.search;
  await fetchData({ ...param.value });
};

const showModal = () => {
  isEdit.value = false;
  Object.assign(formState, { id: null, ten: "", dang_su_dung: true });
  visible.value = true;
};

const editItem = record => {
  Object.assign(formState, {
    id: record.id,
    ten: record.ten,
    dang_su_dung: record.dang_su_dung,
  });
  isEdit.value = true;
  visible.value = true;
  formRef.value?.clearValidate();
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;

    if (isEdit.value) {
      await RestApi.timetable.update({ body: { ...formState } });
      message.success("Cập nhật thành công");
    } else {
      const { id, ...body } = formState;
      await RestApi.timetable.create({ body });
      message.success("Thêm mới thành công");
    }
  } catch (error) {
    message.error("Đã xảy ra lỗi khi lưu thông tin");
  } finally {
    visible.value = false;
    await fetchData({ ...param.value });
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  formRef.value?.resetFields();
  visible.value = false;
};

const deleteItem = async id => {
  try {
    await RestApi.timetable.delete({ params: { Id: id } });
    pagination.current = 1;
    param.value.pageIndex = 1;
    message.success("Xóa thành công");
  } catch (error) {
    message.error("Đã xảy ra lỗi khi xóa");
  } finally {
    await fetchData({ ...param.value });
  }
};

await fetchData({ ...param.value });

const drawerInfoOpen = ref(false);
const infoRef = ref(null);
const drawerAdjustOpen = ref(false);
const adjustRawTimetable = ref([]);
const adjustRawUnscheduled = ref([]);

watch(drawerInfoOpen, val => {
  if (val) {
    infoRef.value?.refresh?.();
  }
});

const closeInfoDrawer = () => {
  infoRef.value?.reset?.();
};
const openInfoDrawer = (reg) => {

  drawerInfoOpen.value = true
}
const openAdjustDrawer = async record => {
  const raw = await $fetch("/data.json");
  adjustRawTimetable.value = raw.data.timetable;
  adjustRawUnscheduled.value = raw.data.ds_chua_xep.map(
    ({ id_mon, ten_mon, id_giao_vien, ten_giao_vien, id_phong, ten_phong, tiet_thu_may }) => ({
      id_mon,
      ten_mon,
      id_giao_vien,
      ten_giao_vien,
      id_phong,
      ten_phong,
      tiet_thu_may,
    })
  );
  drawerAdjustOpen.value = true;
};
</script>

