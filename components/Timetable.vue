<template>
  <div class="p-4" @mouseup="endDrag" @mouseleave="endDrag">
    <div class="overflow-auto">
      <table class="table-auto border-collapse">
        <thead>
          <tr class="bg-gray-100 text-center">
            <th class="border px-3 py-2">Tiết / Ngày</th>
            <th v-for="ngay in block.ds_Ngay" :key="ngay.id" class="border px-3 py-2">
              Thứ {{ ngay.id }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tietIndex in block.ds_Ngay[0].ds_Tiet.length" :key="tietIndex">
            <td class="border px-2 py-2 text-center font-medium bg-gray-50">
              Tiết {{ tietIndex }}
            </td>
            <td v-for="ngay in block.ds_Ngay" :key="ngay.id" @mousedown.left.prevent="startDrag(tietIndex, ngay.id)" @mouseover="dragOver(tietIndex, ngay.id)" @contextmenu.prevent="openContextMenu($event, tietIndex, ngay.id)" :class="[
              'border text-center font-bold transition-colors duration-150 ease-in-out',
              // isSelected(tietIndex, ngay.id) ? '' : '',
              getCellClass(tietIndex, ngay.id)
            ]" style="width: 70px; height: 48px; cursor: pointer;">
              {{ getDisplay(tietIndex, ngay.id) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Context menu -->
    <div v-if="contextMenu.visible" class="absolute bg-white border rounded shadow-lg z-50" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px', width: '200px' }" @mouseleave="contextMenu.visible = false">
      <ul class="divide-y divide-gray-200">
        <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="applyToSelected(true)">
          ❌ <strong>Không được xếp</strong>
        </li>
        <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="applyToSelected(false)">
          ✅ <strong>Xếp được</strong>
        </li>
        <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500" @click="clearAll()">
          🧹 <strong>Xóa toàn bộ</strong>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  block: {
    type: Object,
    required: true,
  },
})

const selected = reactive([])
const selectedMap = reactive(new Set())
const isDragging = ref(false)
const dragStart = ref(null)

const contextMenu = reactive({
  visible: false,
  tiet: null,
  ngay: null,
  x: 0,
  y: 0,
})

function key(tiet, ngay) {
  return `${tiet}-${ngay}`
}

function isSelected(tiet, ngay) {
  return selectedMap.has(key(tiet, ngay))
}

function getDisplay(tiet, ngay) {
  const obj = props.block.ds_Ngay[ngay - 1].ds_Tiet[tiet - 1]
  return obj.trang_thai ? '❌' : ''
}

function getCellClass(tiet, ngay) {
  const obj = props.block.ds_Ngay[ngay - 1].ds_Tiet[tiet - 1]
  const isSel = isSelected(tiet, ngay)

  // Trường hợp vừa trạng thái true + được chọn
  if (obj.trang_thai && isSel) return 'bg-red-200 text-red-700 border-blue-400 border-2'
  
  // Trạng thái true (❌)
  if (obj.trang_thai) return 'bg-red-100 text-red-600'

  // Được chọn (nhưng chưa trạng thái)
  if (isSel) return 'bg-blue-100 text-blue-700 border-blue-400 border-2'

  // Mặc định
  return 'bg-white text-gray-700'
}

function startDrag(tiet, ngay) {
  isDragging.value = true
  dragStart.value = { tiet, ngay }
  updateRectangleSelection(tiet, ngay)
}

function dragOver(tiet, ngay) {
  if (isDragging.value) {
    updateRectangleSelection(tiet, ngay)
  }
}

function endDrag() {
  isDragging.value = false
  dragStart.value = null
}

function updateRectangleSelection(endTiet, endNgay) {
  if (!dragStart.value) return
  const { tiet: startTiet, ngay: startNgay } = dragStart.value
  const minTiet = Math.min(startTiet, endTiet)
  const maxTiet = Math.max(startTiet, endTiet)
  const minNgay = Math.min(startNgay, endNgay)
  const maxNgay = Math.max(startNgay, endNgay)
  selected.splice(0)
  selectedMap.clear()
  for (let tiet = minTiet; tiet <= maxTiet; tiet++) {
    for (let ngay = minNgay; ngay <= maxNgay; ngay++) {
      selected.push({ tiet, ngay })
      selectedMap.add(key(tiet, ngay))
    }
  }
}

function openContextMenu(event, tiet, ngay) {
  contextMenu.visible = true
  contextMenu.tiet = tiet
  contextMenu.ngay = ngay
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
}

function applyToSelected(value) {
  selected.forEach(({ tiet, ngay }) => {
    props.block.ds_Ngay[ngay - 1].ds_Tiet[tiet - 1].trang_thai = value
  })
  contextMenu.visible = false
}

function clearAll() {
  for (const ngay of props.block.ds_Ngay) {
    for (const tiet of ngay.ds_Tiet) {
      tiet.trang_thai = false
    }
  }
  contextMenu.visible = false
}
</script>
