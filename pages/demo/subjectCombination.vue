<template>
  <div class="max-w-4xl mx-auto p-6 space-y-4" style="font-family: Arial, sans-serif;">
    <a-button @click="SubjectCombinationDrawer = true">Tổ hợp môn</a-button>
    <a-drawer
      v-model:open="SubjectCombinationDrawer"
      title="Tổ Hợp môn"
      @close="onCloseSubjectCombinationDrawer"
      :footer="null"
      height="100vh" 
      placement="bottom"
    >
      <SubjectCombination ref="subjectCombinationRef"/>
    </a-drawer>
  </div>
</template>

<script setup>
const subjectCombinationRef = ref()
const SubjectCombinationDrawer = ref(false)
const onCloseSubjectCombinationDrawer = () => {
  subjectCombinationRef.value?.reset()
}
</script>

<style scoped></style>
