<template>
  <div class="max-w-4xl mx-auto p-6 space-y-4" style="font-family: Arial, sans-serif;">
    <a-button type="primary" @click="open = true">Mở demo tổ hợp môn</a-button>
    <a-drawer
      v-model:open="open"
      title="Tổ Hợp môn"
      width="80%"
      @close="open = false"
      :footer="null"
    >
      <SubjectCombination />
    </a-drawer>
  </div>
</template>

<script setup>
import { ref } from "vue"

const open = ref(false)
</script>

<style scoped></style>
