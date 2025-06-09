<template>
  <a-tree
    :treeData="filteredTreeData"
    defaultExpandAll
    :fieldNames="{ title: 'title', key: 'key', children: 'children' }"
    block-node
  >
    <template #title="{ key }">
      <div class="flex justify-between items-center w-full">
        <span>{{ getTitleByKey(key) }}</span>
        <a-select
          size="small"
          class="w-24"
          :value="getPermissionByKey(key)"
          @change="(val) => updatePermission(key, val)"
        >
          <a-select-option :value="0">Ẩn</a-select-option>
          <a-select-option :value="1">Xem</a-select-option>
          <a-select-option :value="2">Sửa</a-select-option>
        </a-select>
      </div>
    </template>
  </a-tree>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  menuTree: Array,
  permissionBits: Array
})

const emit = defineEmits(['update:permissionBits'])

// Lấy quyền từ permissionBits
const getPermissionByKey = (key) => {
  const findNode = (nodes) => {
    for (const item of nodes) {
      if (item.key === key) return props.permissionBits[item.bitIndex] ?? 0
      if (item.children) {
        const found = findNode(item.children)
        if (found !== undefined) return found
      }
    }
    return 0
  }
  return findNode(props.menuTree)
}

// Cập nhật bit tại vị trí tương ứng
const updatePermission = (key, value) => {
  const findAndUpdate = (nodes) => {
    for (const item of nodes) {
      if (item.key === key) {
        const updated = [...props.permissionBits]
        updated[item.bitIndex] = value
        emit('update:permissionBits', updated)
        break
      }
      if (item.children) findAndUpdate(item.children)
    }
  }
  findAndUpdate(props.menuTree)
}

// Lấy title từ key
const getTitleByKey = (key) => {
  const findTitle = (nodes) => {
    for (const item of nodes) {
      if (item.key === key) return item.title
      if (item.children) {
        const found = findTitle(item.children)
        if (found) return found
      }
    }
    return ''
  }
  return findTitle(props.menuTree)
}

// Lọc menu: chỉ hiển thị những node có quyền > 0
const filterTree = (nodes) => {
  return nodes
    .filter(item => props.permissionBits[item.bitIndex] > 0)
    .map(item => ({
      ...item,
      children: item.children ? filterTree(item.children) : undefined
    }))
}

const filteredTreeData = computed(() => filterTree(props.menuTree))
</script>
