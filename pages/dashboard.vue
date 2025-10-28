<template>
  <div class="space-y-2">
    <!-- Hero / Welcome -->
    <div>
      <a-card :bordered="false" class="overflow-hidden">
        <div class="bg-gradient-to-r from-[#437ae7] to-[#3dc5b6] rounded-lg p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-3 max-w-3xl">
            <div class="text-sm opacity-90">Xin chào, {{ displayName }}</div>
            <h1 class="text-2xl md:text-3xl font-extrabold leading-tight">VN Timetable — Nền tảng quản lý và xếp thời khóa biểu</h1>
            <p class="opacity-95">Tự động xếp lịch theo ràng buộc, quản lý dữ liệu đồng bộ, tối ưu xung đột và xuất báo cáo linh hoạt cho nhà trường.</p>
            <div class="flex flex-wrap gap-2 pt-2">
              <template v-if="menuUrlSet.has('/list_management/timetable')">
                <NuxtLink to="/list_management/timetable">
                  <a-button type="primary" size="large">Bắt đầu xếp TKB</a-button>
                </NuxtLink>
              </template>
              <template v-if="['/category_management/subject', '/category_management/grade_level', '/category_management/teacher', '/category_management/class'].some(u => menuUrlSet.has(u))">
                <NuxtLink to="/category_management/subject">
                  <a-button size="large">Quản lý danh mục</a-button>
                </NuxtLink>
              </template>
            </div>
          </div>
          <img :src="unitStore.logo" alt="VN Timetable" class="h-24 md:h-28 w-auto drop-shadow-md" />
        </div>
      </a-card>
    </div>
    <!-- Modules (rendered from visibleMenu) -->
    <section class="grid md:grid-cols-2 xl:grid-cols-3 gap-2">
      <a-card v-for="node in menuCards" :key="node.key" hoverable>
        <div class="flex items-start gap-3">
          <Icon :name="node.icon || 'ant-design:menu-outlined'" class="text-blue-600 text-2xl mt-1" />
          <div class="flex-1">
            <h3 class="font-semibold">{{ node.title }}</h3>
            <div class="flex flex-wrap items-center gap-2 mt-3">
              <template v-if="node.children && node.children.length">
                <template v-for="child in node.children.slice(0, maxItemsPerCard)" :key="child.key">
                  <NuxtLink v-if="child.url" :to="child.url"
                    ><a-tag>{{ child.title }}</a-tag></NuxtLink
                  >
                </template>
                <a-dropdown v-if="node.children.length > maxItemsPerCard">
                  <a-button size="small" type="default">Xem thêm ({{ node.children.length - maxItemsPerCard }})</a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item v-for="child in node.children.slice(maxItemsPerCard)" :key="child.key">
                        <NuxtLink v-if="child.url" :to="child.url">{{ child.title }}</NuxtLink>
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </template>
              <template v-else-if="node.url">
                <NuxtLink :to="node.url"><a-button size="small" type="primary">Mở</a-button></NuxtLink>
              </template>
            </div>
          </div>
        </div>
      </a-card>

      <!-- Tài nguyên & Hỗ trợ -->
      <a-card hoverable>
        <div class="flex items-start gap-3">
          <Icon name="ant-design:book-filled" class="text-blue-600 text-2xl mt-1" />
          <div class="flex-1">
            <h3 class="font-semibold">Tài nguyên & Hỗ trợ</h3>
            <p class="text-gray-600 text-sm">Tài liệu hướng dẫn, cập nhật phiên bản và hỗ trợ kỹ thuật.</p>
            <div class="flex flex-wrap gap-2 mt-3">
              <a href="https://nguyenanh-est.com/vntimetable_web" target="_blank" rel="noopener" class="inline-block"><a-button size="small">Website</a-button></a>
              <a href="mailto:support@nguyenanh-est.com" class="inline-block"><a-button size="small">Liên hệ hỗ trợ</a-button></a>
            </div>
          </div>
        </div>
      </a-card>
    </section>

    <!-- Hướng dẫn nhanh -->
    <a-card :bordered="false">
      <div class="grid md:grid-cols-3 gap-4">
        <div>
          <h3 class="font-semibold mb-2 flex items-center gap-2"><Icon name="ant-design:number-outlined" /> Bắt đầu nhanh</h3>
          <ol class="list-decimal ml-5 text-sm text-gray-700 space-y-1">
            <li>Thiết lập danh mục cơ bản: ca/ngày/tiết, môn, lớp, phòng.</li>
            <li>Phân công giáo viên cho lớp/môn.</li>
            <li>Tạo thời khóa biểu và tiến hành xếp lịch.</li>
          </ol>
        </div>
        <div>
          <h3 class="font-semibold mb-2 flex items-center gap-2"><Icon name="ant-design:bulb-outlined" /> Mẹo sử dụng</h3>
          <ul class="list-disc ml-5 text-sm text-gray-700 space-y-1">
            <li>Dùng tính năng “tìm vị trí tiết” để xử lý xung đột nhanh.</li>
            <li>Xuất “ma trận toàn trường” để rà soát lịch tổng thể.</li>
            <li>Gán “phòng chức năng” cho các môn đặc thù.</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold mb-2 flex items-center gap-2"><Icon name="ant-design:info-circle-outlined" /> Trạng thái hệ thống</h3>
          <ul class="text-sm text-gray-700 space-y-1">
            <li>
              Phiên bản: {{ buildTag || "dev" }}
              <span v-if="buildShaShort">({{ buildShaShort }})</span>
            </li>
            <li>Ngày build: {{ buildDate || "N/A" }}</li>
            <li>Người dùng: {{ displayName }}</li>
          </ul>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
const userStore = useUserStore();
const unitStore = useUnitStore();
const displayName = computed(() => userStore?.name || userStore?.role || "Quản trị viên");

// Permission-aware quick menu
const { visibleMenu } = useMenu();

// Build a simple set of URLs from visible menu (already permission-filtered)
const menuUrlSet = computed(() => {
  const set = new Set();
  const walk = (nodes = []) => {
    nodes.forEach(n => {
      if (n?.url) set.add(n.url);
      if (Array.isArray(n?.children) && n.children.length) walk(n.children);
    });
  };
  walk(visibleMenu?.value || []);
  return set;
});

// Cards rendered from visibleMenu (skip self-link Dashboard)
const menuCards = computed(() => (visibleMenu.value || []).filter(n => n.url !== "/dashboard"));

// Build info from runtime config (injected by Docker ENV)
const runtime = useRuntimeConfig();
const buildTag = computed(() => runtime.public.buildTag);
const buildShaShort = computed(() => (runtime.public.buildSha || "").slice(0, 7));
const buildDate = computed(() => {
  const t = runtime.public.buildTime || "";
  if (!t) return "";

  // Prefer fast path for ISO date string
  const datePart = t.split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [y, m, d] = datePart.split("-");
    return `${d}/${m}/${y}`;
  }

  // Fallback parse
  const d = new Date(t);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const yy = d.getUTCFullYear();
    return `${dd}/${mm}/${yy}`;
  }
  return "";
});

// UI constants
const maxItemsPerCard = 8;
</script>
