<template>
  <div @click="contextMenu.show = false">
    <div v-for="ca in dsCa" :key="ca.id" class="mb-6">
      <h3 class="font-semibold mb-2">Ca {{ ca.id }}</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse">
          <thead>
            <tr>
              <th class="border p-2">Tiết / Ngày</th>
              <th v-for="ngay in ca.ds_Ngay" :key="ngay.id" class="border p-2">{{ ngay.ten }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tiet, pIdx) in ca.ds_Ngay[0].ds_Tiet" :key="pIdx">
              <td class="border p-2 text-center font-medium">Tiết {{ pIdx + 1 }}</td>
              <td
                v-for="ngay in ca.ds_Ngay"
                :key="ngay.id"
                class="border p-2 text-xs align-top min-w-[120px] cursor-move relative"
                :class="{ 'bg-red-50': ngay.ds_Tiet[pIdx].isLock }"
                :draggable="!ngay.ds_Tiet[pIdx].isRest && !ngay.ds_Tiet[pIdx].isLock"
                @dragstart="onDragStart(ca.id, ngay.id, pIdx)"
                @dragover.prevent
                @drop="onDrop(ca.id, ngay.id, pIdx)"
                @click="emit('cell-click', { ca: ca.id, ngay: ngay.id, tiet: pIdx + 1, record: ngay.ds_Tiet[pIdx] })"
                @contextmenu.prevent="openContextMenu($event, ca.id, ngay.id, pIdx)"
              >
                <template v-if="ngay.ds_Tiet[pIdx].isRest">
                  <span class="italic text-gray-500">Nghỉ</span>
                </template>
                <template v-else-if="ngay.ds_Tiet[pIdx].ten_mon">
                  <div class="font-medium leading-tight">{{ ngay.ds_Tiet[pIdx].ten_mon }}</div>
                  <div class="text-gray-600">{{ ngay.ds_Tiet[pIdx].ten_giao_vien }}</div>
                </template>
                <template v-else>
                  <span class="text-gray-400">Trống</span>
                </template>
                <div v-if="ngay.ds_Tiet[pIdx].isLock" class="absolute top-1 right-1 text-[10px] text-red-600">Khóa</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Context Menu -->
    <div
      v-if="contextMenu.show"
      class="absolute bg-white border shadow rounded text-sm z-50"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
    >
      <ul class="min-w-[150px] py-1">
        <li
          class="px-3 py-1 hover:bg-gray-100 cursor-pointer"
          v-if="!contextMenu.cell?.isRest"
          @click="setRest(true)"
        >Đặt tiết nghỉ</li>
        <li
          class="px-3 py-1 hover:bg-gray-100 cursor-pointer"
          v-else
          @click="setRest(false)"
        >Xóa tiết nghỉ</li>
        <li
          class="px-3 py-1 hover:bg-gray-100 cursor-pointer"
          v-if="!contextMenu.cell?.isLock"
          @click="setLock(true)"
        >Đặt tiết khóa</li>
        <li
          class="px-3 py-1 hover:bg-gray-100 cursor-pointer"
          v-else
          @click="setLock(false)"
        >Xóa tiết khóa</li>
        <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer" @click="clearCell">Xóa tiết</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['cell-click'])

const props = defineProps({
  dsCa: {
    type: Array,
    required: true,
  },
});

const dragSource = ref(null)
const contextMenu = reactive({ show: false, x: 0, y: 0, ca: null, ngay: null, pIdx: null, cell: null })

function getCell(caId, dayId, pIdx) {
  const ca = props.dsCa.find(c => c.id === caId)
  const ngay = ca?.ds_Ngay.find(n => n.id === dayId)
  return ngay?.ds_Tiet[pIdx]
}

function onDragStart(caId, dayId, pIdx) {
  dragSource.value = { caId, dayId, pIdx }
}

function onDrop(caId, dayId, pIdx) {
  if (!dragSource.value) return
  const src = getCell(dragSource.value.caId, dragSource.value.dayId, dragSource.value.pIdx)
  const dst = getCell(caId, dayId, pIdx)
  if (!src || !dst || src.isLock || dst.isLock) return

  const keys = Object.keys(src).filter(k => !['id_ca', 'ngay', 'tiet'].includes(k))
  const temp = {}
  keys.forEach(k => (temp[k] = src[k]))
  keys.forEach(k => (src[k] = dst[k]))
  keys.forEach(k => (dst[k] = temp[k]))

  dragSource.value = null
}

function openContextMenu(event, caId, dayId, pIdx) {
  const cell = getCell(caId, dayId, pIdx)
  contextMenu.show = true
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.ca = caId
  contextMenu.ngay = dayId
  contextMenu.pIdx = pIdx
  contextMenu.cell = cell
}

function setRest(val) {
  const cell = getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx)
  if (!cell) return
  cell.isRest = val
  if (val) {
    cell.ten_mon = ''
    cell.ten_giao_vien = ''
    cell.id_mon = 0
    cell.id_giao_vien = 0
  }
  contextMenu.show = false
}

function setLock(val) {
  const cell = getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx)
  if (!cell) return
  cell.isLock = val
  contextMenu.show = false
}

function clearCell() {
  const cell = getCell(contextMenu.ca, contextMenu.ngay, contextMenu.pIdx)
  if (!cell) return
  Object.assign(cell, {
    id_chitiet: 0,
    id_don_vi: 0,
    id_tkb: 0,
    id_mon: 0,
    ten_mon: '',
    id_giao_vien: 0,
    ten_giao_vien: '',
    id_phong: 0,
    ten_phong: '',
    tiet_thu_may: 0,
    isRest: false,
    isLock: false,
  })
  contextMenu.show = false
}
</script>
