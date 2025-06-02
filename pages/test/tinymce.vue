<template>
  <div>
    {{ data }}
    <TinyMCE v-model="data" class="w-full" />
  </div>
</template>
<script setup>
const data = ref("");
</script>
