<template>
  <div class="p-4 space-y-8">
    {{ menuPermissions }}

    <a-card title="📤 Dữ liệu Gửi lên Server">
      <a-table :columns="serverColumns" :data-source="permissionList" size="small" bordered :pagination="false" />
      <pre>{{ permissionList }}</pre>
    </a-card>

    <a-card title="📋 Bảng Menu Phân Quyền" class="space-y-4">
      <a-table 
        :columns="menuColumns" 
        :data-source="flatMenuData" 
        size="small" 
        bordered 
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'permission' && record.permissionBit !== undefined">
            <a-radio-group 
              size="small" 
              option-type="button" 
              button-style="solid" 
              :value="getPermission(record.key, record.permissionBit)" 
              @change="e => setPermission(record.key, record.permissionBit, e.target.value)"
            >
              <a-radio :value="0">Ẩn</a-radio>
              <a-radio :value="1">Xem</a-radio>
              <a-radio :value="2">Sửa</a-radio>
            </a-radio-group>
          </template>
          <template v-else-if="column.dataIndex === 'title'">
            <div :style="{ paddingLeft: (record.level * 16) + 'px' }" class="flex items-center">
              <span v-if="record.children" class="mr-1">📁</span>
              <span v-else class="mr-1">📄</span>
              {{ record.title }}
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-card title="📋 Bảng Quyền (Xem thử)">
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

// Chuyển flat list thành nested structure với level
function buildMenuWithLevel(data, parentId = null, level = 0) {
  const result = []
  data
    .filter(item => item.parent_Id === parentId)
    .forEach(item => {
      const children = buildMenuWithLevel(data, item.id, level + 1)
      result.push({
        ...item,
        level,
        children: children.length > 0 ? children : undefined
      })
    })
  return result
}

// Sinh object permission với key là menu cha + 'menu'
function buildMenuPermissions(data) {
  const parentKeys = new Set(data.filter(d => d.parent_Id === null).map(d => d.key))
  const base = { menu: 0 }
  for (const key of parentKeys) base[key] = 0
  return base
}

const flatMenuData = ref([])
const menuPermissions = reactive({ menu: 0 })

const fetchData = async () => {
  try {
    const { data } = await RestApi.menu.list()
    if (data.value?.status === 'success') {
      flatData.value = data.value.data.items
      flatMenuData.value = buildMenuWithLevel(flatData.value)
      Object.assign(menuPermissions, buildMenuPermissions(flatData.value))
    }
  } catch (e) {
    message.error('Lỗi khi tải menu')
  }
}
await fetchData()

const menuColumns = [
  { title: 'Tên Menu', dataIndex: 'title' },
  { title: 'Key', dataIndex: 'key' },
  { title: 'Quyền', dataIndex: 'permission' },
]

const permissionOptions = [
  { label: 'Ẩn', value: 0 },
  { label: 'Xem', value: 1 },
  { label: 'Sửa', value: 2 },
]

const isTopLevel = (key) => flatMenuData.value.some(m => m.key === key)
const findParentKey = (childKey) => {
  const child = flatData.value.find(item => item.key === childKey)
  if (!child) return null
  const parent = flatData.value.find(item => item.id === child.parent_Id)
  return parent?.key
}

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

const flattenPermissions = (nodes) =>
  nodes.flatMap(n => {
    const row = []
    if (n.permissionBit !== undefined)
      row.push({ title: n.title, key: n.key, permission: getPermission(n.key, n.permissionBit) })
    if (n.children) row.push(...flattenPermissions(n.children))
    return row
  })
const flatPermissions = computed(() => flattenPermissions(flatMenuData.value))

const permissionList = computed(() =>
  Object.entries(menuPermissions).map(([key, permissionValue]) => ({
    key,
    permissionValue,
  }))
)
</script>