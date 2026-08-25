<template>
  <div class="p-2 md:p-4 bg-white min-h-full space-y-4">
    <!-- Header -->
    <div class="border-b border-gray-100 pb-3">
      <div class="flex items-center gap-2">
        <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          <Icon name="ant-design:cloud-upload-outlined" class="text-2xl" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800 m-0">Import dữ liệu</h1>
          <p class="text-xs md:text-sm text-gray-500 m-0 mt-0.5">Tải lên tệp dữ liệu để nhập vào hệ thống theo đơn vị tương ứng</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto space-y-4">
      <!-- Upload & Form Card -->
      <a-card class="shadow-sm border border-gray-100 rounded-lg" :bordered="false">
        <template #title>
          <div class="flex items-center gap-2">
            <Icon name="ant-design:form-outlined" class="text-blue-500" />
            <span class="font-semibold text-gray-700">Thông tin tệp tải lên</span>
          </div>
        </template>

        <a-form layout="vertical" :model="formState" @finish="handleImport">
          <!-- Chọn đơn vị -->
          <SelectUnit v-model="formState.id_don_vi" name="id_don_vi" label="Đơn vị áp dụng" placeholder="Chọn đơn vị áp dụng dữ liệu" :rules="[{ required: true, message: 'Vui lòng chọn đơn vị' }]" class="mb-4" />

          <!-- Upload Box -->
          <a-form-item label="Tệp dữ liệu" required :validate-status="fileError ? 'error' : ''" :help="fileError">
            <a-upload-dragger v-if="!selectedFile" name="file" :multiple="false" :before-upload="beforeUpload" :show-upload-list="false" class="hover:border-blue-500 transition-colors bg-gray-50/50">
              <div class="p-8 text-center">
                <p class="ant-upload-drag-icon flex justify-center text-blue-500 text-4xl mb-3">
                  <Icon name="ant-design:inbox-outlined" class="text-4xl text-blue-500" />
                </p>
                <p class="text-base font-medium text-gray-700 mb-1">Nhấp hoặc kéo thả tệp vào đây để tải lên</p>
                <p class="text-xs text-gray-500">Hỗ trợ tệp định dạng Excel (.xlsx, .xls) hoặc tệp dữ liệu tương thích</p>
              </div>
            </a-upload-dragger>

            <!-- Selected File Card -->
            <div v-else class="p-4 rounded-lg border border-blue-200 bg-blue-50/40 flex items-center justify-between transition-all">
              <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-10 h-10 rounded bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                  <Icon name="ant-design:file-excel-outlined" class="text-2xl" />
                </div>
                <div class="overflow-hidden">
                  <div class="font-medium text-gray-800 truncate text-sm" :title="selectedFile.name">
                    {{ selectedFile.name }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatFileSize(selectedFile.size) }}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <a-button danger size="small" type="text" @click="handleRemoveFile" :disabled="uploading">
                  <template #icon>
                    <Icon name="ant-design:delete-outlined" class="text-base" />
                  </template>
                  Xóa
                </a-button>
              </div>
            </div>
          </a-form-item>

          <!-- Actions -->
          <div class="flex flex-wrap gap-2 justify-end pt-4 border-t border-gray-100">
            <a-button @click="handleReset" :disabled="uploading">
              <template #icon>
                <Icon name="ant-design:reload-outlined" />
              </template>
              Làm mới
            </a-button>

            <a-button type="primary" html-type="submit" :loading="uploading" :disabled="!selectedFile || !formState.id_don_vi" class="bg-blue-600 hover:bg-blue-700">
              <template #icon>
                <Icon name="ant-design:cloud-upload-outlined" />
              </template>
              {{ uploading ? "Đang xử lý..." : "Tiến hành Import" }}
            </a-button>
          </div>
        </a-form>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { notification } from "ant-design-vue";

const settingStore = useSettingStore();
const { RestApi } = useApi();

const formState = reactive({
  id_don_vi: null,
});

const selectedFile = ref(null);
const fileError = ref("");
const uploading = ref(false);

// Format file size
const formatFileSize = bytes => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Handle file selection
const beforeUpload = file => {
  const origin = file?.originFileObj || file;
  selectedFile.value = origin;
  fileError.value = "";
  return false; // Prevent automatic upload
};

// Remove selected file
const handleRemoveFile = () => {
  selectedFile.value = null;
  fileError.value = "";
};

// Reset form
const handleReset = () => {
  formState.id_don_vi = null;
  selectedFile.value = null;
  fileError.value = "";
};

// Handle Import action
const handleImport = async () => {
  if (!formState.id_don_vi) {
    notification.warning({
      message: "Chưa chọn đơn vị",
      description: "Vui lòng chọn đơn vị áp dụng trước khi import.",
    });
    return;
  }

  if (!selectedFile.value) {
    fileError.value = "Vui lòng chọn tệp để import";
    notification.warning({
      message: "Chưa chọn tệp",
      description: "Vui lòng chọn tệp dữ liệu để import.",
    });
    return;
  }

  try {
    uploading.value = true;
    settingStore.setLoading(true);

    const currentFileName = selectedFile.value.name;
    const formData = new FormData();
    formData.append("file", selectedFile.value);
    formData.append("id_don_vi", String(formState.id_don_vi));

    // Call POST /api/file/import via RestApi.file_import or RestApi.unit.import_file
    const { data, error } = await RestApi.file_import.import_file({ body: formData });

    if (error.value) {
      const errMsg = error.value?.data?.message || "Import dữ liệu không thành công";
      throw new Error(errMsg);
    }

    if (data.value?.status === "success" || data.value?.code === 200 || !data.value?.status) {
      const successMsg = data.value?.message || "Import dữ liệu thành công!";
      notification.success({
        message: "Import thành công",
        description: `${successMsg} (${currentFileName})`,
        duration: 4.5,
      });
      // Clear file after success
      selectedFile.value = null;
    } else {
      throw new Error(data.value?.message || "Import không thành công");
    }
  } catch (err) {
    const errorMsg = err.message || err.response?.data?.message || "Có lỗi xảy ra trong quá trình import";
    notification.error({
      message: "Import thất bại",
      description: errorMsg,
      duration: 5,
    });
  } finally {
    uploading.value = false;
    settingStore.setLoading(false);
  }
};
</script>

