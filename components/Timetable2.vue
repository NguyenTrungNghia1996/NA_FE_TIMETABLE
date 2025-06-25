<template>
  <div class="p-4 relative" @mouseup="endDrag" @mouseleave="endDrag">
    <div class="overflow-auto rounded-lg shadow-sm border">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
            <th class="border p-2 w-20">Tiết / Ngày</th>
            <th
              v-for="(col, dayIndex) in timeTable[0]"
              :key="dayIndex"
              class="border p-2"
            >
              <span class="inline-block min-w-[80px]">{{ getDayLabel(dayIndex) }}</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(row, tietIndex) in timeTable" :key="tietIndex">
            <td class="border text-center text-sm font-medium bg-gray-50 p-2">
              Tiết {{ tietIndex + 1 }}
            </td>
            <td
              v-for="(cell, ngayIndex) in row"
              :key="ngayIndex"
              @mousedown.left.prevent="startDrag(tietIndex, ngayIndex)"
              @mouseover="dragOver(tietIndex, ngayIndex)"
              @contextmenu.prevent="openContextMenu($event, tietIndex, ngayIndex)"
              :class="[
                'border text-center text-sm font-medium transition-colors duration-150 ease-in-out relative',
                getCellClass(tietIndex, ngayIndex)
              ]"
              style="width: 120px; height: 40px;"
            >
              <div
                :class="getCellInnerClass(tietIndex, ngayIndex)"
                class="w-full h-full flex items-center justify-center rounded-sm"
              >
                {{ getDisplay(tietIndex, ngayIndex) }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="contextMenu.visible"
      class="absolute bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px', width: '220px' }"
      @mouseleave="contextMenu.visible = false"
    >
      <ul class="divide-y divide-gray-100">
        <li 
          class="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-gray-700"
          @click="applyToSelected(false)"
        >
          <span class="text-red-500">✖</span>
          <span class="font-medium">Không được xếp</span>
        </li>
        <li 
          class="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-gray-700"
          @click="applyToSelected(true)"
        >
          <span class="text-green-500">✓</span>
          <span class="font-medium">Xếp được</span>
        </li>
        <li 
          class="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-red-500"
          @click="clearAll"
        >
          <span>🗑️</span>
          <span class="font-medium">Xóa toàn bộ</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
const { $dayjs } = useNuxtApp()
import 'dayjs/locale/vi'
$dayjs.locale('vi')

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const timeTable = reactive(props.data)

const selected = reactive([])
const selectedMap = reactive(new Set())
const isDragging = ref(false)
const dragStart = ref(null)

const contextMenu = reactive({
  visible: false,
  tiet: null,
  ngay: null,
  x: 0,
  y: 0
})

function getDayLabel(dayIndex) {
  const dayjsDay = (dayIndex + 1) % 7
  const label = $dayjs().day(dayjsDay).format('dddd')

  if (label === 'chủ nhật') {
    return 'Chủ nhật'
  }

  const map = {
    'hai': '2',
    'ba': '3',
    'tư': '4',
    'năm': '5',
    'sáu': '6',
    'bảy': '7'
  }

  const parts = label.split(' ')
  if (parts.length === 2 && map[parts[1]]) {
    return `Thứ ${map[parts[1]]}`
  }

  return label.charAt(0).toUpperCase() + label.slice(1)
}

function key(tiet, ngay) {
  return `${tiet}-${ngay}`
}

function isSelected(tiet, ngay) {
  return selectedMap.has(key(tiet, ngay))
}

function getDisplay(tiet, ngay) {
  return timeTable[tiet][ngay] === false ? '❌' : ''
}

function getCellClass(tiet, ngay) {
  const value = timeTable[tiet][ngay]
  if (value === false) {
    return 'bg-red-50 text-red-600'
  }
  return 'bg-white text-gray-700'
}

function getCellInnerClass(tiet, ngay) {
  const isSel = isSelected(tiet, ngay)
  const value = timeTable[tiet][ngay]

  let classes = ''
  if (value === false && isSel) {
    classes += 'ring-2 ring-blue-400 bg-red-100 text-red-700'
  } else if (value === false) {
    classes += 'bg-red-50 text-red-600'
  } else if (isSel) {
    classes += 'ring-2 ring-blue-400 bg-blue-50 text-blue-700'
  } else {
    classes += 'bg-white text-gray-700'
  }

  return classes
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
    timeTable[tiet][ngay] = value
  })
  contextMenu.visible = false
}

function clearAll() {
  for (let tiet = 0; tiet < timeTable.length; tiet++) {
    for (let ngay = 0; ngay < timeTable[tiet].length; ngay++) {
      timeTable[tiet][ngay] = true
    }
  }
  contextMenu.visible = false
}
</script>