<template>
  <div class="p-4 space-y-8">
    {{ menuPermissions }}

    <a-card title="📤 Dữ liệu Gửi lên Server">
      <a-table :columns="serverColumns" :data-source="permissionList" size="small" bordered :pagination="false" />
      <pre>{{ permissionList }}</pre>
    </a-card>

    <a-card title="🌳 Cây Menu Phân Quyền" class="space-y-4">
      <a-tree :tree-data="menuTree" :field-names="{ title: 'title', key: 'key', children: 'children' }" default-expand-all>
        <template #title="{ key, title, permissionBit }">
          <div class="flex justify-between items-center gap-2 px-2 py-1 rounded hover:bg-gray-50">
            <div class="font-medium">{{ title }}</div>

            <a-radio-group size="small" option-type="button" button-style="solid" v-if="permissionBit !== undefined" :value="getPermission(key, permissionBit)" @click.stop @change="e => setPermission(key, permissionBit, e.target.value)">
              <a-radio :value="0">Ẩn</a-radio>
              <a-radio :value="1">Xem</a-radio>
              <a-radio :value="2">Sửa</a-radio>
            </a-radio-group>
          </div>
        </template>
      </a-tree>
    </a-card>

    <a-card title="📋 Bảng Quyền">
      <a-table :columns="columns" :data-source="flatPermissions" size="small" bordered :pagination="false">
        <template #bodyCell="{ column, record }">
          <span v-if="column.dataIndex === 'permission'">
            {{ formatPermission(record.permission) }}
          </span>
        </template>
      </a-table>
    </a-card>
  </div>
</template>


<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
const { RestApi } = useApi()

// Dữ liệu phẳng từ API
const flatData = ref([])

// Chuyển flat list thành cây
function buildMenuTree(data) {
  const map = new Map()
  const tree = []
  data.forEach(item => {
    map.set(item.id, { ...item, children: [] })
  })
  data.forEach(item => {
    if (item.parent_Id === null) {
      tree.push(map.get(item.id))
    } else {
      const parent = map.get(item.parent_Id)
      if (parent) parent.children.push(map.get(item.id))
    }
  })
  return tree
}

// Sinh object permission với key là menu cha + 'menu'
function buildMenuPermissions(data) {
  const parentKeys = new Set(data.filter(d => d.parent_Id === null).map(d => d.key))
  const base = { menu: 0 }
  for (const key of parentKeys) base[key] = 0
  return base
}

const menuTree = ref([])
const menuPermissions = reactive({ menu: 0 })

const fetchData = async () => {
  try {
    const { data } = await RestApi.menu.list()
    if (data.value?.status === 'success') {
      flatData.value = data.value.data.items
      menuTree.value = buildMenuTree(flatData.value)
      Object.assign(menuPermissions, buildMenuPermissions(flatData.value))
    }
  } catch (e) {
    message.error('Lỗi khi tải menu')
  }
}
await fetchData()

const permissionOptions = [
  { label: 'Ẩn', value: 0 },
  { label: 'Xem', value: 1 },
  { label: 'Sửa', value: 2 },
]

const isTopLevel = (key) => menuTree.value.some(m => m.key === key)
const findParentKey = (childKey) =>
  menuTree.value.find(p => p.children?.some(c => c.key === childKey))?.key

const getPermission = (key, permissionBit) => {
  const isParent = isTopLevel(key)
  const parentKey = isParent ? 'menu' : findParentKey(key)
  return ((menuPermissions[parentKey] ?? 0) >> permissionBit) & 0b11
}

const setPermission = (key, permissionBit, val) => {
  const isParent = isTopLevel(key)
  const parentKey = isParent ? 'menu' : findParentKey(key)
  const current = menuPermissions[parentKey] ?? 0
  const cleared = current & ~(0b11 << permissionBit)
  const updated = cleared | (val << permissionBit)
  menuPermissions[parentKey] = updated
}

const columns = [
  { title: 'Tên', dataIndex: 'title' },
  { title: 'Key', dataIndex: 'key' },
  { title: 'Quyền', dataIndex: 'permission' },
]

const serverColumns = [
  { title: 'Key', dataIndex: 'key' },
  { title: 'Permission Value', dataIndex: 'permissionValue' },
]

const formatPermission = (val) => val === 0 ? 'Ẩn' : val === 1 ? 'Xem' : 'Sửa'

const flatten = (nodes) =>
  nodes.flatMap(n => {
    const row = []
    if (n.permissionBit !== undefined)
      row.push({ title: n.title, key: n.key, permission: getPermission(n.key, n.permissionBit) })
    if (n.children) row.push(...flatten(n.children))
    return row
  })
const flatPermissions = computed(() => flatten(menuTree.value))

const permissionList = computed(() =>
  Object.entries(menuPermissions).map(([key, permissionValue]) => ({
    key,
    permissionValue,
  }))
)
</script>
