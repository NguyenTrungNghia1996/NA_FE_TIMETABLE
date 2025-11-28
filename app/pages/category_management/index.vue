<script setup>
// Redirect /category_management -> first accessible child (e.g., /category_management/subject)
const { visibleMenu } = useMenu();

const flattenUrls = (nodes = []) => {
  const urls = [];
  const walk = (arr) => {
    for (const n of arr || []) {
      if (n?.url) urls.push(n.url);
      if (Array.isArray(n?.children) && n.children.length) walk(n.children);
    }
  };
  walk(nodes);
  return urls;
};

const pickFirstChild = (base) => {
  const urls = flattenUrls(visibleMenu?.value || []);
  const prefix = base.endsWith('/') ? base : base + '/';
  return urls.find(u => typeof u === 'string' && u.startsWith(prefix));
};

const target = pickFirstChild('/category_management') || '/dashboard';
if (target && target !== '/category_management') {
  await navigateTo(target, { replace: true });
}
</script>

<template>
  <div />
</template>

