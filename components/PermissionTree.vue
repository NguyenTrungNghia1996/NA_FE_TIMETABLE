<template>
  {{permissions}}
  <a-card title="🌳 Cây Menu Phân Quyền" class="space-y-4">
    <a-tree
      :tree-data="treeData"
      :field-names="{ title: 'title', key: 'key', children: 'children' }"
      default-expand-all
    >
      <template #title="{ key, permissionBit }">
        <div class="grid grid-cols-[1fr_auto] items-center gap-2 px-2 py-1 rounded hover:bg-gray-50">
          <div>{{ findNodeTitle(key) }}</div>
          <a-select
            size="small"
            style="width: 100px"
            v-if="permissionBit !== undefined"
            :value="getPermissionValue(key, permissionBit)"
            :options="permissionOptions"
            @change="val => updatePermission(key, permissionBit, val)"
          />
        </div>
      </template>
    </a-tree>
  </a-card>
</template>

<script setup>
const props = defineProps({
  menuList: Array,
  permissions: Array
});
const emit = defineEmits(['update:permissions']);

const permissionOptions = [
  { label: 'Ẩn', value: 0 },
  { label: 'Xem', value: 1 },
  { label: 'Sửa', value: 2 }
];

const treeData = computed(() => {
  const map = {};
  const roots = [];
  props.menuList.forEach((item) => {
    const node = { ...item, children: [] };
    map[item.id] = node;
  });
  props.menuList.forEach((item) => {
    const node = map[item.id];
    if (item.parent_Id == null) {
      roots.push(node);
    } else if (map[item.parent_Id]) {
      map[item.parent_Id].children.push(node);
    }
  });
  return roots;
});

const findNodeTitle = (key) => {
  const node = props.menuList.find(i => i.key === key);
  return node?.title || key;
};

const getPermissionValue = (key, permissionBit) => {
  const parent = findParentKey(key);
  const parentPerm = props.permissions.find(p => p.key === parent);
  if (!parentPerm) return 0;
  return (parentPerm.permissionValue >> permissionBit) & 0b11;
};

const updatePermission = (key, permissionBit, val) => {
  const parent = findParentKey(key);
  let parentPerm = props.permissions.find(p => p.key === parent);
  if (!parentPerm) {
    parentPerm = { key: parent, permissionValue: 0 };
    props.permissions.push(parentPerm);
  }
  const cleared = parentPerm.permissionValue & ~(0b11 << permissionBit);
  const updated = cleared | (val << permissionBit);
  parentPerm.permissionValue = updated;
  emit('update:permissions', [...props.permissions]);
};

const findParentKey = (childKey) => {
  const child = props.menuList.find(i => i.key === childKey);
  const parent = props.menuList.find(i => i.id === child?.parent_Id);
  return parent?.key || 'menu';
};
</script>

<style scoped>
/* Optional styles */
</style>
