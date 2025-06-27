<template>
  <div>
    <div 
      v-for="(row, rowIndex) in grid" 
      :key="rowIndex" 
      class="flex space-2"
    >
      <a-card
        v-for="(cell, colIndex) in row"
        :key="colIndex"
        class="w-24 h-24 flex items-center justify-center transition duration-300"
        :class="[
          cell.is_drag ? 'cursor-move' : 'cursor-not-allowed opacity-50',
          isDragOver(rowIndex, colIndex) ? 'ring-2 ring-blue-500' : ''
        ]"
        :draggable="cell.is_drag"
        @dragstart="cell.is_drag ? onDragStart(rowIndex, colIndex) : null"
        @drop="onDrop(rowIndex, colIndex)"
        @dragover.prevent="onDragOver(rowIndex, colIndex)"
        @dragleave="onDragLeave(rowIndex, colIndex)"
      >
        <span v-if="Object.keys(cell.data).length > 0">
          {{ cell.data.id }}
        </span>
        <span v-else class="bg-red-400">3</span>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Card as ACard } from 'ant-design-vue'

const props = defineProps({
  initialGrid: {
    type: Array,
    required: true
  }
})

const grid = reactive(JSON.parse(JSON.stringify(props.initialGrid)))
const dragFrom = ref(null)
const dragOverPos = ref(null)

function onDragStart(rowIndex, colIndex) {
  dragFrom.value = { rowIndex, colIndex }
}

function onDragOver(rowIndex, colIndex) {
  dragOverPos.value = { rowIndex, colIndex }
}

function onDragLeave(rowIndex, colIndex) {
  if (
    dragOverPos.value &&
    dragOverPos.value.rowIndex === rowIndex &&
    dragOverPos.value.colIndex === colIndex
  ) {
    dragOverPos.value = null
  }
}

function isDragOver(rowIndex, colIndex) {
  return (
    dragOverPos.value &&
    dragOverPos.value.rowIndex === rowIndex &&
    dragOverPos.value.colIndex === colIndex
  )
}

function onDrop(rowIndex, colIndex) {
  if (!dragFrom.value) return

  const fromCell = grid[dragFrom.value.rowIndex][dragFrom.value.colIndex]
  const toCell = grid[rowIndex][colIndex]

  if (!toCell.is_drag) {
    console.warn('Ô đích không cho phép thả')
    dragOverPos.value = null
    return
  }

  const hasFromData = fromCell.data && Object.keys(fromCell.data).length > 0
  const hasToData = toCell.data && Object.keys(toCell.data).length > 0

  if (!hasFromData) {
    dragOverPos.value = null
    return
  }

  if (hasToData) {
    // Swap với animation
    animateSwap(fromCell, toCell)
  } else {
    // Move
    toCell.data = { ...fromCell.data }
    fromCell.data = {}
  }

  dragFrom.value = null
  dragOverPos.value = null
}

// Simple animation: đổi màu cell sau swap
function animateSwap(fromCell, toCell) {
  const originalFrom = { ...fromCell.data }
  const originalTo = { ...toCell.data }

  toCell.data = { ...originalFrom }
  fromCell.data = { ...originalTo }

  fromCell._animating = true
  toCell._animating = true

  setTimeout(() => {
    fromCell._animating = false
    toCell._animating = false
  }, 300)
}
</script>

<style scoped>
/* Animation swap: đổi màu nền trong 300ms */
:deep(.ant-card) {
  transition: background-color 0.3s ease;
}
:deep(.ant-card[data-animating="true"]) {
  background-color: #fef08a; /* yellow-200 */
}
</style>
