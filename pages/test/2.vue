<template>
  <div class="p-4">
    <DragDropGrid :initialGrid="gridData" />
  </div>
</template>

<script setup>
import DragDropGrid from '~/components/DragDropGrid.vue'

const gridData = [
  [
    { is_drag: true, status: true, data: { id: 1 } },
    { is_drag: false, status: true, data: {} },
    { is_drag: false, status: true, data: {} },
    { is_drag: false, status: true, data: {} }
  ],
  [
    { is_drag: true, status: true, data: { id: 2 } },
    { is_drag: true, status: true, data: {} },
    { is_drag: true, status: true, data: {} }
  ],
  [
    { is_drag: true, status: true, data: { id: 3 } },
    { is_drag: true, status: true, data: {} },
    { is_drag: true, status: true, data: {} }
  ]
]
</script>
