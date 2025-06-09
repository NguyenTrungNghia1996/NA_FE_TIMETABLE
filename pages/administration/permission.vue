<!-- Page 2: Phân Quyền Nhóm Quyền (PermissionGroup.vue) -->
<template>
  <a-card title="🔐 Nhóm Quyền & Phân Quyền">
    <a-select v-model:value="selectedGroup" :options="groupOptions" placeholder="Chọn nhóm quyền" />

    <a-tree
      :tree-data="menuTree"
      :field-names="{ title: 'title', key: 'key', children: 'children' }"
      default-expand-all
    >
      <template #title="{ key }">
        <div class="flex justify-between items-center">
          <span>{{ findNodeByKey(key).title }}</span>
          <a-select
            size="small"
            style="width: 90px"
            :value="getPermission(key)"
            :options="permissionOptions"
            @change="val => setPermission(key, val)"
          />
        </div>
      </template>
    </a-tree>
  </a-card>
</template>

<script setup>
const { RestApi } = useApi()
const selectedGroup = ref(null)
const groupOptions = ref([ /* fetch from API */ ])
const menuTree = ref([])
const permissionMap = ref({}) // { menuKey: permissionBit }

const permissionOptions = [
  { label: 'Ẩn', value: 0 },
  { label: 'Xem', value: 1 },
  { label: 'Sửa', value: 2 },
]

const buildTree = (flatList) => {
  const map = {}
  const roots = []

  flatList.forEach(item => {
    map[item.id] = { ...item, children: [] }
  })

  flatList.forEach(item => {
    if (item.parent_Id) {
      map[item.parent_Id]?.children.push(map[item.id])
    } else {
      roots.push(map[item.id])
    }
  })

  return roots
}


const fetchMenus = async () => {
  const { data } = await RestApi.menu.list()
  menuTree.value = buildTree(data.value.data.items)
}

const findNodeByKey = (key, list = menuTree.value) => {
  for (const node of list) {
    if (node.key === key) return node
    if (node.children) {
      const found = findNodeByKey(key, node.children)
      if (found) return found
    }
  }
  return null
}

const getPermission = (key) => permissionMap.value[key] ?? 0

const setPermission = (key, val) => {
  permissionMap.value[key] = val

  const node = findNodeByKey(key)
  if (!node) return

  // 🔹 1. Nếu set 0 -> tự động set con = 0
  if (val === 0 && node.children?.length) {
    node.children.forEach(child => setPermission(child.key, 0))
  }

  // 🔹 2. Nếu là con -> kiểm tra tất cả con có bị 0 hết không, nếu đúng -> set cha = 0
  const findParentKey = (childKey, list = menuTree.value, parent = null) => {
    for (const node of list) {
      if (node.key === childKey) return parent?.key || null
      if (node.children) {
        const res = findParentKey(childKey, node.children, node)
        if (res) return res
      }
    }
    return null
  }

  const parentKey = findParentKey(key)
  const parentNode = findNodeByKey(parentKey)
  if (parentNode && parentNode.children?.length) {
    const allChildrenHidden = parentNode.children.every(child => getPermission(child.key) === 0)
    if (allChildrenHidden) {
      permissionMap.value[parentNode.key] = 0
    }
  }
}

fetchMenus()
</script>
