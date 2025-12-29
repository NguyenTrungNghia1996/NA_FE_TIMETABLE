<template>
  <div class="p-2 md:p-4 bg-white min-h-full">
    <div class="grid grid-cols-1 gap-1">
      <a-card>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="text-lg font-semibold">Sao lưu danh mục</div>
            <p class="text-sm text-gray-600">Tải file sao lưu toàn bộ danh mục hiện có để lưu trữ hoặc chuyển sang môi trường khác.</p>
          </div>
          <a-button type="primary" :loading="downloading" @click="downloadBackup">
            <template #icon>
              <CloudDownloadOutlined />
            </template>
            Tải file sao lưu
          </a-button>
        </div>
      </a-card>

      <a-card title="Khôi phục danh mục">
        <div class="space-y-4">
          <a-alert type="warning" show-icon message="Khôi phục sẽ ghi đè danh mục hiện tại. Hãy chắc chắn bạn đã sao lưu trước khi thực hiện." />
          <a-upload :before-upload="beforeUpload" :file-list="fileList" :on-remove="handleRemove" :max-count="1" :show-upload-list="{ showRemoveIcon: true }">
            <a-button>
              <template #icon>
                <UploadOutlined />
              </template>
              Chọn file sao lưu
            </a-button>
          </a-upload>

          <div class="flex flex-wrap gap-2">
            <a-button type="primary" :disabled="!selectedFile" :loading="uploading" @click="confirmRestore">
              <template #icon>
                <InboxOutlined />
              </template>
              Khôi phục
            </a-button>
            <a-button :disabled="!fileList.length" @click="handleRemove">Xóa file</a-button>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { h } from "vue";
import { Modal } from "ant-design-vue";
import { CloudDownloadOutlined, ExclamationCircleOutlined, InboxOutlined, UploadOutlined } from "@ant-design/icons-vue";

const settingStore = useSettingStore();
const { RestApi } = useApi();

const downloading = ref(false);
const uploading = ref(false);
const selectedFile = ref(null);
const fileList = ref([]);

const beforeUpload = file => {
  const origin = file?.originFileObj || file;
  selectedFile.value = origin;
  fileList.value = [{ ...file, name: origin?.name || file.name, status: "done" }];
  return false;
};

const handleRemove = () => {
  selectedFile.value = null;
  fileList.value = [];
};

const downloadBackup = async () => {
  try {
    downloading.value = true;
    settingStore.setLoading(true);
    const { data, error } = await RestApi.request.download("/api/export/backup");
    if (error.value) {
      throw new Error(error.value?.data?.message || "Sao lưu không thành công");
    }
    const { blob: blobData, headers } = data.value || {};
    if (!blobData) {
      throw new Error("Sao lưu không thành công");
    }
    const blob = blobData instanceof Blob ? blobData : new Blob([blobData]);
    const cd = headers?.["content-disposition"] || headers?.["Content-Disposition"];
    const filename = (cd && (decodeURIComponent(/filename\*=UTF-8''([^;]+)/.exec(cd)?.[1] || "") || /filename=\"([^\"]+)\"/.exec(cd)?.[1])) || "backup.zip";
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    message.success("Đã tạo file sao lưu danh mục");
  } catch (err) {
    message.error(err.message || "Sao lưu không thành công");
  } finally {
    downloading.value = false;
    settingStore.setLoading(false);
  }
};

const performImport = async () => {
  try {
    uploading.value = true;
    settingStore.setLoading(true);
    const form = new FormData();
    form.append("file", selectedFile.value);
    const { data, error } = await RestApi.request.postForm("/api/file/backup/import", { body: form });
    if (error.value) {
      throw new Error(error.value?.data?.message || "Khôi phục không thành công");
    }
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Khôi phục danh mục thành công");
      handleRemove();
    } else {
      throw new Error(data.value?.message || "Khôi phục không thành công");
    }
  } catch (err) {
    message.error(err.message || "Khôi phục không thành công");
  } finally {
    uploading.value = false;
    settingStore.setLoading(false);
  }
};

const confirmRestore = () => {
  if (!selectedFile.value) {
    message.warning("Vui lòng chọn file sao lưu trước khi khôi phục");
    return;
  }
  Modal.confirm({
    title: "Xác nhận khôi phục",
    icon: h(ExclamationCircleOutlined),
    content: "Dữ liệu danh mục hiện tại sẽ bị ghi đè bởi file đã chọn. Bạn có chắc chắn muốn tiếp tục?",
    okText: "Khôi phục",
    okType: "danger",
    cancelText: "Hủy",
    onOk: performImport,
  });
};
</script>
