<template>
  <div class="p-4 bg-white rounded-md shadow">
    <a-tree :tree-data="treeData" defaultExpandAll>
      <template #title="{ data }">
        <div class="flex items-center gap-2">
          <span class="flex-1">{{ data.title }}</span>
          <a-checkbox-group
            v-if="data.children && data.children.length"
            v-model="data.bits"
            class="flex gap-2"
          >
            <a-checkbox :value="1" />
            <a-checkbox :value="2" />
            <a-checkbox :value="4" />
            <a-checkbox :value="8" />
          </a-checkbox-group>
          <span v-if="data.children && data.children.length" class="ml-2">{{ bitsToMask(data.bits) }}</span>
        </div>
      </template>
    </a-tree>
    <pre class="mt-4 bg-gray-100 p-2 whitespace-pre-wrap">{{ permissionList }}</pre>
  </div>
</template>

<script setup>
const settingStore = useSettingStore();

const initialPermissions = [
  { key: "menu", permissionValue: 0 },
  { key: "menu-plvuxq63o0", permissionValue: 0 },
  { key: "menu-c8u2jgnoto", permissionValue: 0 },
];

function getPermissionValue(key) {
  const found = initialPermissions.find(p => p.key === key);
  return found ? found.permissionValue : 0;
}

function getBits(mask) {
  const bits = [];
  [1, 2, 4, 8].forEach(bit => {
    if (mask & bit) bits.push(bit);
  });
  return bits;
}

function bitsToMask(bits) {
  return bits.reduce((acc, cur) => acc | cur, 0);
}

function convert(items) {
  return items.map(item => ({
    key: item.key,
    title: item.title,
    bits: getBits(getPermissionValue(item.key)),
    children: item.children ? convert(item.children) : [],
  }));
}

const treeData = ref([
  {
    key: 'menu',
    title: 'Menu',
    bits: getBits(getPermissionValue('menu')),
    children: convert(settingStore.menuItems),
  },
]);

function buildPermissionList(nodes, list = []) {
  nodes.forEach(n => {
    if (n.children && n.children.length) {
      list.push({ key: n.key, permissionValue: bitsToMask(n.bits) });
      buildPermissionList(n.children, list);
    }
  });
  return list;
}

const permissionList = computed(() => JSON.stringify(buildPermissionList(treeData.value), null, 2));
</script>

<style scoped></style>