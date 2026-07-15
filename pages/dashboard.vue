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
              <template v-if="canTimetable">
                <NuxtLink to="/list_management/timetable">
                  <a-button type="primary" size="large">Bắt đầu xếp TKB</a-button>
                </NuxtLink>
              </template>
              <template v-if="canAnyCategory">
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
    <!-- Modules -->
    <section class="grid md:grid-cols-2 xl:grid-cols-3 gap-2">
      <!-- Danh mục -->
      <a-card hoverable v-if="canAnyCategory">
        <div class="flex items-start gap-3">
          <Icon name="ant-design:folder-open-filled" class="text-blue-600 text-2xl mt-1" />
          <div class="flex-1">
            <h3 class="font-semibold">Danh mục dữ liệu</h3>
            <p class="text-gray-600 text-sm">Quản lý môn học, khối lớp, giáo viên, phòng học, ca/ngày/tiết...</p>
            <div class="flex flex-wrap gap-2 mt-3">
              <template v-if="canSubject"
                ><NuxtLink to="/category_management/subject"><a-button size="small">Môn học</a-button></NuxtLink></template
              >
              <template v-if="canGradeLevel"
                ><NuxtLink to="/category_management/grade_level"><a-button size="small">Khối lớp</a-button></NuxtLink></template
              >
              <template v-if="canTeacher"
                ><NuxtLink to="/category_management/teacher"><a-button size="small">Giáo viên</a-button></NuxtLink></template
              >
              <template v-if="canClass"
                ><NuxtLink to="/category_management/class"><a-button size="small">Lớp học</a-button></NuxtLink></template
              >
            </div>
          </div>
        </div>
      </a-card>

      <!-- Phân công giảng dạy -->
      <a-card hoverable v-if="canTeacherAssignment">
        <div class="flex items-start gap-3">
          <Icon name="ant-design:team-outlined" class="text-blue-600 text-2xl mt-1" />
          <div class="flex-1">
            <h3 class="font-semibold">Phân công giảng dạy</h3>
            <p class="text-gray-600 text-sm">Thiết lập giáo viên giảng dạy theo lớp/môn, số tiết, ca.</p>
            <div class="flex flex-wrap gap-2 mt-3">
              <NuxtLink to="/list_management/teacher_assignment"><a-button size="small">Phân công GV</a-button></NuxtLink>
            </div>
          </div>
        </div>
      </a-card>

      <!-- Xếp thời khóa biểu -->
      <a-card hoverable v-if="canTimetable">
        <div class="flex items-start gap-3">
          <Icon name="ant-design:calendar-filled" class="text-blue-600 text-2xl mt-1" />
          <div class="flex-1">
            <h3 class="font-semibold">Xếp thời khóa biểu</h3>
            <p class="text-gray-600 text-sm">Tối ưu xung đột, hỗ trợ ràng buộc phòng, tiết liền kề, hai ca.</p>
            <div class="flex flex-wrap gap-2 mt-3">
              <NuxtLink to="/list_management/timetable"><a-button size="small" type="primary">Danh sách TKB</a-button></NuxtLink>
            </div>
          </div>
        </div>
      </a-card>

      <!-- Báo cáo & Xuất file -->
      <a-card hoverable v-if="canTimetable">
        <div class="flex items-start gap-3">
          <Icon name="ant-design:file-done-outlined" class="text-blue-600 text-2xl mt-1" />
          <div class="flex-1">
            <h3 class="font-semibold">Báo cáo & Xuất file</h3>
            <p class="text-gray-600 text-sm">Xuất lịch theo lớp, giáo viên, phòng; ma trận toàn trường.</p>
            <div class="flex flex-wrap gap-2 mt-3">
              <NuxtLink to="/list_management/timetable"><a-button size="small">Xuất từ TKB</a-button></NuxtLink>
            </div>
          </div>
        </div>
      </a-card>

      <!-- Quản trị hệ thống -->
      <a-card hoverable v-if="canAnyAdministration">
        <div class="flex items-start gap-3">
          <Icon name="ant-design:setting-filled" class="text-blue-600 text-2xl mt-1" />
          <div class="flex-1">
            <h3 class="font-semibold">Quản trị hệ thống</h3>
            <p class="text-gray-600 text-sm">Quản lý người dùng, vai trò, phân quyền, menu và đơn vị.</p>
            <div class="flex flex-wrap gap-2 mt-3">
              <template v-if="canAdminUser"
                ><NuxtLink to="/administration/user"><a-button size="small">Người dùng</a-button></NuxtLink></template
              >
              <template v-if="canAdminPermission"
                ><NuxtLink to="/administration/permission"><a-button size="small">Phân quyền</a-button></NuxtLink></template
              >
              <template v-if="canAdminMenu"
                ><NuxtLink to="/administration/menu"><a-button size="small">Menu</a-button></NuxtLink></template
              >
              <template v-if="canAdminUnit"
                ><NuxtLink to="/administration/unit"><a-button size="small">Đơn vị</a-button></NuxtLink></template
              >
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
              <a href="https://nguyenanhtsc.com/vntimetable_web" target="_blank" rel="noopener" class="inline-block"><a-button size="small">Website</a-button></a>
              <a href="mailto:support@nguyenanhtsc.com" class="inline-block"><a-button size="small">Liên hệ hỗ trợ</a-button></a>
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
              Phiên bản: {{ buildTag || 'dev' }}
              <span v-if="buildShaShort">({{ buildShaShort }})</span>
            </li>
            <li>
              Ngày build: {{ buildDate || 'N/A' }}
            </li>
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

const allowedUrls = computed(() => {
  const urls = [];
  const walk = (nodes = []) => {
    nodes.forEach(n => {
      if (n?.url) urls.push(n.url);
      if (Array.isArray(n?.children) && n.children.length) walk(n.children);
    });
  };
  walk(visibleMenu?.value || []);
  return urls;
});

const canAccess = path => {
  const list = allowedUrls.value || [];
  return list.some(u => u === path || (typeof u === "string" && u.includes(":") && path.startsWith(u.split(":")[0])));
};

// Feature checks
const canTimetable = computed(() => canAccess("/list_management/timetable"));
const canTeacherAssignment = computed(() => canAccess("/list_management/teacher_assignment"));

// Category pages
const canSubject = computed(() => canAccess("/category_management/subject"));
const canGradeLevel = computed(() => canAccess("/category_management/grade_level"));
const canTeacher = computed(() => canAccess("/category_management/teacher"));
const canClass = computed(() => canAccess("/category_management/class"));
const canAnyCategory = computed(() => canSubject.value || canGradeLevel.value || canTeacher.value || canClass.value);

// Administration
const canAdminUser = computed(() => canAccess("/administration/user"));
const canAdminPermission = computed(() => canAccess("/administration/permission"));
const canAdminMenu = computed(() => canAccess("/administration/menu"));
const canAdminUnit = computed(() => canAccess("/administration/unit"));
const canAnyAdministration = computed(() => canAdminUser.value || canAdminPermission.value || canAdminMenu.value || canAdminUnit.value);

// Build info from runtime config (injected by Docker ENV)
const runtime = useRuntimeConfig();
const buildTag = computed(() => runtime.public.buildTag);
const buildShaShort = computed(() => (runtime.public.buildSha || '').slice(0, 7));
const buildDate = computed(() => {
  const t = runtime.public.buildTime || '';
  if (!t) return '';

  // Prefer fast path for ISO date string
  const datePart = t.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [y, m, d] = datePart.split('-');
    return `${d}/${m}/${y}`;
  }

  // Fallback parse
  const d = new Date(t);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yy = d.getUTCFullYear();
    return `${dd}/${mm}/${yy}`;
  }
  return '';
});
</script>
