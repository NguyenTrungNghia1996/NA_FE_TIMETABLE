<template>
  <div class="p-4">
    <a-button type="primary" @click="visible = true">Đăng ký dùng thử</a-button>
    <a-modal
      v-model:open="visible"
      title="Đăng ký tài khoản dùng thử"
      @cancel="visible = false"
      :width="800"
      :footer="null"
    >
      <RegisterForm @success="visible = false" />
    </a-modal>
  </div>
</template>

<script setup>
const visible = ref(false)
</script>
