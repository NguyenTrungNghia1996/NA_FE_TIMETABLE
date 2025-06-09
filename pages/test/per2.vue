<template>
  <div class="p-4 space-y-8">
    <!-- 🌳 Cây Menu Phân Quyền -->
     {{menuTree}} <br/>
     {{menuPermissions}}
    <a-card title="🌳 Cây Menu Phân Quyền" class="space-y-4">
      <a-button type="primary" @click="addTopLevel">➕ Thêm menu cha</a-button>

      <a-tree
        :tree-data="menuTree"
        :field-names="{ title: 'title', key: 'key', children: 'children' }"
        default-expand-all
      >
        <template #title="{ key, bitIndex }">
          <div
            class="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-2 py-1 rounded hover:bg-gray-50"
          >
            <div class="space-y-1 w-full">
              <a-input
                v-model:value="findNodeByKey(key).title"
                size="small"
                placeholder="Tên menu"
              />
              <div class="grid grid-cols-2 gap-2">
                <a-input
                  v-model:value="findNodeByKey(key).url"
                  size="small"
                  placeholder="URL"
                />
                <a-input
                  v-model:value="findNodeByKey(key).icon"
                  size="small"
                  placeholder="Icon"
                />
              </div>
            </div>

            <a-select
              size="small"
              style="width: 100px"
              v-if="bitIndex !== undefined"
              :value="getPermission(key, bitIndex)"
              :options="permissionOptions"
              @change="val => setPermission(key, bitIndex, val)"
            />

            <a-dropdown>
              <template #overlay>
                <a-menu>
                  <!-- ✅ CHỈ menu cha có nút thêm con -->
                  <a-menu-item v-if="isTopLevel(key)" @click="addChild(key)">➕ Thêm con</a-menu-item>
                  <a-menu-item danger @click="removeNode(key)">🗑 Xoá</a-menu-item>
                </a-menu>
              </template>
              <a-button size="small" type="text">⋮</a-button>
            </a-dropdown>
          </div>
        </template>
      </a-tree>
    </a-card>

    <!-- 📋 Quyền đã thiết lập -->
    <a-card title="📋 Bảng Quyền">
      <a-table
        :columns="columns"
        :data-source="flatPermissions"
        size="small"
        bordered
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <span v-if="column.dataIndex === 'permission'">
            {{ formatPermission(record.permission) }}
          </span>
        </template>
      </a-table>
    </a-card>

    <!-- 👁️‍🗨️ Menu hiển thị thực tế -->
    <a-card title="👁️‍🗨️ Menu Theo Quyền">
      <ul class="space-y-2">
        <li v-for="item in visibleMenu" :key="item.key">
          <strong>{{ item.title }}</strong> <small class="text-gray-500">{{ item.icon }}</small>
          <ul v-if="item.children?.length" class="ml-4 list-disc">
            <li v-for="child in item.children" :key="child.key">
              {{ child.title }} <small class="text-gray-400">{{ child.url }}</small>
            </li>
          </ul>
        </li>
      </ul>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

/** Cây menu 2 cấp */
const menuTree = reactive([
  {
    title: 'Dashboard',
    key: 'dashboard',
    bitIndex: 0,
    url: '/dashboard',
    icon: 'ant-design:dashboard-outlined',
    children: [],
  },
  {
    title: 'Danh Mục',
    key: 'category',
    bitIndex: 2,
    url: null,
    icon: 'ant-design:database-twotone',
    children: [
      { title: 'Cấp Học', key: 'school_level', bitIndex: 0, url: '/school', icon: 'icon-school' },
    ],
  },
])

/** Quyền lưu theo nhóm bit cha */
const menuPermissions = reactive({
  menu: 0,              // quyền cho dashboard, category,...
  dashboard: 0,         // quyền cho con
  category: 0,
})

/** Quyền 2-bit */
const permissionOptions = [
  { label: 'Ẩn', value: 0 },
  { label: 'Xem', value: 1 },
  { label: 'Sửa', value: 2 },
]

/** Sinh key và bitIndex tự động */
const genKey = () => 'key_' + Math.random().toString(36).slice(2, 8)
const nextAvailableBitIndex = (used = []) => {
  for (let i = 0; i < 32; i += 2) {
    if (!used.includes(i)) return i
  }
  return used.length * 2
}

/** Tìm node theo key */
const findNodeByKey = (key, list = menuTree) => {
  for (const node of list) {
    if (node.key === key) return node
    if (node.children) {
      const result = findNodeByKey(key, node.children)
      if (result) return result
    }
  }
  return null
}

/** Xác định có phải menu cha */
const isTopLevel = (key) => menuTree.some(m => m.key === key)

/** Thêm menu cha */
const addTopLevel = () => {
  const used = menuTree.map(n => n.bitIndex)
  const bitIndex = nextAvailableBitIndex(used)
  const key = genKey()
  menuTree.push({
    title: 'Menu mới',
    key,
    bitIndex,
    url: '',
    icon: '',
    children: [],
  })
  menuPermissions[key] = 0
}

/** Thêm menu con */
const addChild = (parentKey) => {
  const parent = findNodeByKey(parentKey)
  if (!parent) return
  const used = parent.children.map(c => c.bitIndex)
  const bitIndex = nextAvailableBitIndex(used)
  const key = genKey()
  parent.children.push({
    title: 'Sub mới',
    key,
    bitIndex,
    url: '',
    icon: '',
  })
  if (!menuPermissions[parentKey]) menuPermissions[parentKey] = 0
}

/** Xoá node bất kỳ */
const removeNode = (key, list = menuTree) => {
  const index = list.findIndex(n => n.key === key)
  if (index !== -1) {
    list.splice(index, 1)
    return
  }
  for (const node of list) {
    if (node.children) removeNode(key, node.children)
  }
}

/** Phân quyền cha–con */
const findParentKey = (childKey) => {
  return menuTree.find(p => p.children?.some(c => c.key === childKey))?.key
}
const getPermission = (key, bitIndex) => {
  const isParent = isTopLevel(key)
  const parentKey = isParent ? 'menu' : findParentKey(key)
  return ((menuPermissions[parentKey] ?? 0) >> bitIndex) & 0b11
}
const setPermission = (key, bitIndex, val) => {
  const isParent = isTopLevel(key)
  const parentKey = isParent ? 'menu' : findParentKey(key)
  const current = menuPermissions[parentKey] ?? 0
  const cleared = current & ~(0b11 << bitIndex)
  const updated = cleared | (val << bitIndex)
  menuPermissions[parentKey] = updated
}

/** Bảng phân quyền */
const columns = [
  { title: 'Tên', dataIndex: 'title' },
  { title: 'Key', dataIndex: 'key' },
  { title: 'Quyền', dataIndex: 'permission' },
]
const formatPermission = (val) => val === 0 ? 'Ẩn' : val === 1 ? 'Xem' : 'Sửa'
const flatten = (nodes) =>
  nodes.flatMap(n => {
    const row = []
    if (n.bitIndex !== undefined)
      row.push({ title: n.title, key: n.key, permission: getPermission(n.key, n.bitIndex) })
    if (n.children) row.push(...flatten(n.children))
    return row
  })
const flatPermissions = computed(() => flatten(menuTree))

/** Xây menu thực tế theo quyền */
const isVisible = (key, bitIndex) => getPermission(key, bitIndex) > 0
const visibleMenu = computed(() =>
  menuTree
    .map(m => {
      const children = (m.children || []).filter(c => isVisible(c.key, c.bitIndex))
      const visibleSelf = isVisible(m.key, m.bitIndex ?? 0)
      return visibleSelf || children.length > 0
        ? { ...m, children }
        : null
    })
    .filter(Boolean)
)
</script>
