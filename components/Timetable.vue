<template>
  <div class="p-4" @mouseup="endDrag" @mouseleave="endDrag">
    <a-card title="Thời khóa biểu" bordered class="shadow-lg">
      <div class="overflow-auto">
        <table class="table-auto border-collapse w-full">
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
              <td
                v-for="ngay in block.ds_Ngay"
                :key="ngay.id"
                @mousedown.left.prevent="startDrag(tietIndex, ngay.id)"
                @mouseover="dragOver(tietIndex, ngay.id)"
                @contextmenu.prevent="openContextMenu($event, tietIndex, ngay.id)"
                :class="[
                  'border text-center font-bold select-none transition',
                  isSelected(tietIndex, ngay.id) ? 'ring-2 ring-blue-400' : '',
                  getCellClass(tietIndex, ngay.id)
                ]"
                style="width: 60px; height: 48px; cursor: pointer;"
              >
                {{ getDisplay(tietIndex, ngay.id) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex justify-between items-center">
        <a-button type="primary" :disabled="selected.length === 0" @click="toggleSelectedMany">
          Chuyển trạng thái {{ selected.length }} ô đã chọn
        </a-button>

        <div class="text-sm text-gray-500 italic" v-if="selected.length">
          Đang chọn:
          <span v-for="(s, idx) in selected" :key="idx">[Thứ {{ s.ngay }}, Tiết {{ s.tiet }}]</span>
        </div>
      </div>
    </a-card>

    <!-- Context menu -->
    <div
      v-if="contextMenu.visible"
      class="absolute bg-white border rounded shadow-lg z-50"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px', width: '200px' }"
      @mouseleave="contextMenu.visible = false"
    >
      <ul class="divide-y divide-gray-200">
        <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="applyToSelected(true)">
          ❌ Đặt tất cả ô đã chọn là <strong>Không được xếp</strong>
        </li>
        <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="applyToSelected(false)">
          ✅ Đặt tất cả ô đã chọn là <strong>Xếp được</strong>
        </li>
        <li class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500" @click="clearAll()">
          🧹 Xóa toàn bộ: Đặt tất cả ô là <strong>Xếp được</strong>
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
  return obj.trang_thai ? 'bg-red-100 text-red-600' : 'bg-white text-gray-700'
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

function toggleSelectedMany() {
  selected.forEach(({ tiet, ngay }) => {
    const cell = props.block.ds_Ngay[ngay - 1].ds_Tiet[tiet - 1]
    cell.trang_thai = !cell.trang_thai
  })
  selected.splice(0)
  selectedMap.clear()
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
