<template>
  <div class="p-4 space-y-8">
    {{ menuTree }} <br />
    {{ menuPermissions }}

    <a-card title="🌳 Cây Menu Phân Quyền" class="space-y-4">
      <a-tree :tree-data="menuTree" :field-names="{ title: 'title', key: 'key', children: 'children' }" default-expand-all>
        <template #title="{ key, permissionBit }">
          <div class="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-2 py-1 rounded hover:bg-gray-50">
            <div class="space-y-1 w-full">
              <a-input v-model:value="findNodeByKey(key).title" size="small" placeholder="Tên menu" />
              <div class="grid grid-cols-2 gap-2">
                <a-input v-model:value="findNodeByKey(key).url" size="small" placeholder="URL" />
                <a-input v-model:value="findNodeByKey(key).icon" size="small" placeholder="Icon" />
              </div>
            </div>

            <a-select size="small" style="width: 100px" v-if="permissionBit !== undefined" :value="getPermission(key, permissionBit)" :options="permissionOptions" @change="val => setPermission(key, permissionBit, val)" />
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

    <a-card title="📤 Dữ liệu Gửi lên Server">
      <a-table :columns="serverColumns" :data-source="permissionList" size="small" bordered :pagination="false" />
      <pre>{{ permissionList }}</pre>
    </a-card>

    <a-card title="👁️‍🗨️ Menu Theo Quyền">
      <ul class="space-y-2">
        <li v-for="item in visibleMenu" :key="item.key">
          <strong>{{ item.title }}</strong>
          <small class="text-gray-500">{{ item.icon }}</small>
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
const flatData = [
  {
    "stt": 1,
    "id": 12,
    "title": "Cấp Học",
    "key": "menu-b94je",
    "url": "/category_management/school_level",
    "icon": "ant-design:unordered-list-outlined",
    "parent_Id": 11,
    "permissionBit": 0
  },
  {
    "stt": 2,
    "id": 13,
    "title": "Ca Học",
    "key": "menu-wreo29gp8u",
    "url": "/category_management/school_shift",
    "icon": "ant-design:calendar-twotone",
    "parent_Id": 11,
    "permissionBit": 2
  },
  {
    "stt": 3,
    "id": 17,
    "title": "Dashboard",
    "key": "menu-plvuxq63o0",
    "url": "/dashboard",
    "icon": "ant-design:project-outlined",
    "parent_Id": null,
    "permissionBit": 0
  },
  {
    "stt": 4,
    "id": 18,
    "title": "Quản Lý Danh Mục",
    "key": "menu-c8u2jgnoto",
    "url": "/category_management",
    "icon": "ant-design:database-twotone",
    "parent_Id": null,
    "permissionBit": 2
  },
  {
    "stt": 5,
    "id": 19,
    "title": "Cấp Học",
    "key": "menu-h7u71ahi2p",
    "url": "/category_management/school_level",
    "icon": "ant-design:unordered-list-outlined",
    "parent_Id": 18,
    "permissionBit": 0
  },
  {
    "stt": 6,
    "id": 21,
    "title": "Ca Học",
    "key": "menu-t54no0smjq",
    "url": "/category_management/school_shift",
    "icon": "ant-design:calendar-twotone",
    "parent_Id": 18,
    "permissionBit": 2
  }
]
function buildMenuTree(data) {
  const map = new Map()
  const tree = []

  // Bước 1: tạo node rỗng trước
  data.forEach(item => {
    map.set(item.id, { ...item, children: [] })
  })

  // Bước 2: nối vào cha
  data.forEach(item => {
    if (item.parent_Id === null) {
      tree.push(map.get(item.id))
    } else {
      const parent = map.get(item.parent_Id)
      if (parent) {
        parent.children.push(map.get(item.id))
      }
    }
  })

  return tree
}
function buildMenuPermissions(data) {
  const parentIds = new Set(data.filter(d => d.parent_Id === null).map(d => d.key))
  const base = { menu: 0 }
  for (const key of parentIds) base[key] = 0
  return base
}
const menuTree = reactive(buildMenuTree(flatData))
const menuPermissions = reactive(buildMenuPermissions(flatData))
// const menuTree = reactive([
//   {
//     title: "Dashboard",
//     key: "dashboard",
//     url: "/dashboard",
//     permissionBit: 0,
//     icon: "ant-design:project-outlined",
//     children: [],
//   },
//   {
//     title: "Quản Lý Danh Mục",
//     key: "category_management",
//     url: null,
//     permissionBit: 2,
//     icon: "ant-design:database-twotone",
//     children: [
//       {
//         title: "Cấp Học",
//         key: "school_level",
//         permissionBit: 0,
//         url: "/category_management/school_level",
//         icon: "ant-design:unordered-list-outlined",
//       },
//       {
//         title: "Ca Học",
//         key: "school_shift",
//         permissionBit: 2,
//         url: "/category_management/school_shift",
//         icon: "ant-design:calendar-twotone",
//       },
//       {
//         title: "Điểm Trường",
//         key: "school_site",
//         permissionBit: 4,
//         url: "/category_management/school_site",
//         icon: "ant-design:environment-outlined",
//       },
//       {
//         title: "Loại Phòng Học",
//         key: "classroom_type",
//         permissionBit: 6,
//         url: "/category_management/classroom_type",
//         icon: "ant-design:home-outlined",
//       },
//       {
//         title: "Khối Kiến Thức",
//         key: "knowledge",
//         permissionBit: 8,
//         url: "/category_management/knowledge",
//         icon: "ant-design:database-outlined",
//       },
//       {
//         title: "Tổ Chuyên Môn",
//         key: "expertise",
//         permissionBit: 10,
//         url: "/category_management/expertise",
//         icon: "ant-design:experiment-twotone",
//       },
//     ],
//   },
//   {
//     title: "Cài đặt quản trị",
//     key: "administration",
//     url: null,
//     permissionBit: 4,
//     icon: "ant-design:setting-twotone",
//     children: [
//       {
//         title: "Người Dùng",
//         key: "user",
//         permissionBit: 0,
//         url: "/administration/user",
//         icon: "ant-design:user-outlined",
//       },
//       {
//         title: "Đơn Vị",
//         key: "unit",
//         permissionBit: 2,
//         url: "/administration/unit",
//         icon: "ant-design:deployment-unit-outlined",
//       },
//       {
//         title: "Menu",
//         key: "menu",
//         permissionBit: 4,
//         url: "/administration/menu",
//         icon: "ant-design:menu-outlined",
//       },
//       {
//         title: "Nhóm quyền",
//         key: "permission",
//         permissionBit: 4,
//         url: "/administration/permission",
//         icon: "ant-design:safety-outlined",
//       },
//     ],
//   },
// ])

// const menuPermissions = reactive(
//   Object.fromEntries(
//     [['menu', 0], ...menuTree.map(item => [item.key, 0])]
//   )
// )

const permissionOptions = [
  { label: 'Ẩn', value: 0 },
  { label: 'Xem', value: 1 },
  { label: 'Sửa', value: 2 },
]

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

const isTopLevel = (key) => menuTree.some(m => m.key === key)

const findParentKey = (childKey) => {
  return menuTree.find(p => p.children?.some(c => c.key === childKey))?.key
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

const flatten = (nodes) =>
  nodes.flatMap(n => {
    const row = []
    if (n.permissionBit !== undefined)
      row.push({ title: n.title, key: n.key, permission: getPermission(n.key, n.permissionBit) })
    if (n.children) row.push(...flatten(n.children))
    return row
  })
const flatPermissions = computed(() => flatten(menuTree))

const isVisible = (key, permissionBit) => getPermission(key, permissionBit) > 0

const visibleMenu = computed(() =>
  menuTree
    .map(m => {
      const children = (m.children || []).filter(c => isVisible(c.key, c.permissionBit))
      const visibleSelf = isVisible(m.key, m.permissionBit ?? 0)
      return visibleSelf || children.length > 0
        ? { ...m, children }
        : null
    })
    .filter(Boolean)
)

const permissionList = computed(() =>
  Object.entries(menuPermissions).map(([key, permissionValue]) => ({
    key,
    permissionValue,
  }))
)
</script>
