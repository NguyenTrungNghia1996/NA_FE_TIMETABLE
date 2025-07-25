<template>
  <div class="max-w-4xl mx-auto p-6 space-y-4" style="font-family: Arial, sans-serif;">
    <a-button type="primary" @click="open = true">Mở demo tổ hợp môn</a-button>
    <a-modal v-model:open="open" width="80%" title="Demo tổ hợp môn" :footer="null">
      <SubjectCombination />
    </a-modal>
  </div>
</template>

<script setup>
import { ref } from "vue"
import SubjectCombination from '~/components/SubjectCombination.vue'
const open = ref(false)
</script>

<style scoped></style>
