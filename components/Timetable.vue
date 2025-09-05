<template>
  <div class="p-4 relative" @mouseup="endDrag" @mouseleave="endDrag">
    <div class="overflow-auto shadow border border-gray-200">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50 text-center text-sm font-medium text-gray-600 tracking-wider">
            <th class="border p-3 w-12">Ca</th>
            <th class="border p-3 w-20">Tiết / Ngày</th>
            <th v-for="ngay in block.ds_Ngay" :key="ngay.id" class="border p-3 min-w-[100px]">
              {{ getDayName(ngay.id - 1) }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(tiet, tietIndex) in block.ds_Ngay[0].ds_Tiet" :key="tiet.id">
            <td v-if="tietIndex % 5 === 0" class="border p-0.5 text-center font-medium select-none align-middle" :rowspan="5">
              <span class="[writing-mode:vertical-rl] items-center justify-center">{{ props.block.id == 1 ? "Ca sáng" : "Ca chiều" }}</span>
            </td>
            <td class="border text-center text-sm font-medium bg-gray-50 p-2">
              Tiết {{ tietIndex + 1 }}
            </td>
            <td v-for="ngay in block.ds_Ngay" :key="ngay.id" @mousedown.left.prevent="startDrag(tietIndex + 1, ngay.id)" @mouseover="dragOver(tietIndex + 1, ngay.id)" @contextmenu.prevent="openContextMenu($event, tietIndex + 1, ngay.id)" :class="[
              'border text-center text-sm font-medium transition-colors duration-150',
              getCellClass(tietIndex + 1, ngay.id)
            ]" style="height: 40px;">
              <div class="w-full h-full flex items-center justify-center">
                {{ getDisplay(tietIndex + 1, ngay.id) }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Context menu -->
    <div v-if="contextMenu.visible" class="absolute bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px', width: '220px' }" @mouseleave="contextMenu.visible = false">
      <ul class="divide-y divide-gray-100">
        <li class="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-gray-700" @click="applyToSelected(true)">
          <span class="text-red-500">✖</span>
          <span class="font-medium">Không được xếp</span>
        </li>
        <li class="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-gray-700" @click="applyToSelected(false)">
          <span class="text-green-500">✓</span>
          <span class="font-medium">Xếp được</span>
        </li>
        <li class="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-red-500" @click="clearAll()">
          <span>🗑️</span>
          <span class="font-medium">Xóa toàn bộ</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const daysVi = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
function getDayName(index) {
  return daysVi[index]
}
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

  if (obj.trang_thai && isSel) return 'bg-red-100 text-red-700 ring-2 ring-blue-400'
  if (obj.trang_thai) return 'bg-red-50 text-red-600'
  if (isSel) return 'bg-blue-50 text-blue-700 ring-2 ring-blue-400'
  return 'bg-white text-gray-700 hover:bg-gray-50'
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
  const container = event.currentTarget.closest('.p-4')
  const rect = container.getBoundingClientRect()

  contextMenu.visible = true
  contextMenu.tiet = tiet
  contextMenu.ngay = ngay
  contextMenu.x = event.clientX - rect.left
  contextMenu.y = event.clientY - rect.top
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
