<script setup>
// Redirect /list_management -> first accessible child (e.g., /list_management/timetable)
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

const target = pickFirstChild('/exam_schedule') || '/dashboard';
if (target && target !== '/exam_schedule') {
  await navigateTo(target, { replace: true });
}
</script>

<template>
  <div />
</template>