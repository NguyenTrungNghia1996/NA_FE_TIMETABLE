<template>
  <main id="main-content" class="min-h-screen w-full" role="main">
    <!-- Hero -->
    <section class="container mx-auto px-4 py-12 md:py-16">
      <div class="grid md:grid-cols-2 gap-10 items-center">
        <div class="space-y-5">
          <div class="flex items-center gap-3">
            <NuxtImg :src="unitStore.logo" alt="VN Timetable" class="h-14 w-auto" loading="eager" />
            <span class="text-xs uppercase tracking-widest text-gray-500">Phiên bản Web</span>
          </div>
          <h1 class="text-3xl md:text-5xl font-extrabold leading-tight text-gray-900">VN Timetable — Xếp thời khóa biểu tự động, linh hoạt, chính xác</h1>
          <p class="text-gray-700 text-base md:text-lg">Nền tảng quản lý và xếp thời khóa biểu dành cho trường học. Hỗ trợ ca sáng/chiều, ràng buộc phòng học, giáo viên, lớp; tối ưu xung đột và xuất báo cáo nhanh chóng.</p>
          <div class="flex flex-wrap gap-3 pt-2">
            <NuxtLink to="/login">
              <a-button type="primary" size="large">Đăng nhập</a-button>
            </NuxtLink>
          </div>
          <div class="flex flex-wrap gap-4 pt-3 text-sm text-gray-700">
            <div class="flex items-center gap-2"><Icon name="ant-design:check-circle-filled" class="text-green-600" /> Tự động xếp lịch theo ràng buộc</div>
            <div class="flex items-center gap-2"><Icon name="ant-design:check-circle-filled" class="text-green-600" /> Quản lý giáo viên, lớp, phòng học</div>
            <div class="flex items-center gap-2"><Icon name="ant-design:check-circle-filled" class="text-green-600" /> Hỗ trợ ca sáng/chiều, hai ca</div>
          </div>
        </div>
        <div>
          <a-card class="shadow-xl [&_.ant-card-body]:text-gray-800">
            <div class="space-y-4">
              <h2 class="text-xl md:text-2xl font-bold text-gray-900">Tại sao chọn VN Timetable?</h2>
              <ul class="space-y-3 text-gray-800">
                <li class="flex gap-3">
                  <Icon name="ant-design:thunderbolt-filled" class="text-blue-600 mt-0.5" />
                  <span><b>Nhanh và chính xác:</b> Thuật toán tối ưu ràng buộc phòng, giáo viên, lớp, ca.</span>
                </li>
                <li class="flex gap-3">
                  <Icon name="ant-design:control-filled" class="text-blue-600 mt-0.5" />
                  <span><b>Linh hoạt:</b> Hỗ trợ học 1 ca, 2 ca, phòng chuyên dụng, tiết liền kề/không liền kề.</span>
                </li>
                <li class="flex gap-3">
                  <Icon name="ant-design:team-outlined" class="text-blue-600 mt-0.5" />
                  <span><b>Quản lý phân công:</b> Phân công giảng dạy, theo dõi khối lượng, xuất báo cáo.</span>
                </li>
                <li class="flex gap-3">
                  <Icon name="ant-design:cloud-upload-outlined" class="text-blue-600 mt-0.5" />
                  <span><b>Web-based:</b> Triển khai nhanh, dùng được trên mọi thiết bị.</span>
                </li>
              </ul>
              <div class="pt-2">
                <NuxtLink to="/login">
                  <a-button type="link" class="!px-0 !text-blue-700 hover:!text-blue-800 !font-semibold">
                    Đăng nhập để bắt đầu →
                  </a-button>
                </NuxtLink>
              </div>
            </div>
          </a-card>
        </div>
      </div>
    </section>

    <!-- Features -->
    <Lazy>
    <section class="container mx-auto px-4 pb-16">
      <div class="grid md:grid-cols-3 gap-6">
        <a-card :bordered="false" class="bg-white/80 shadow">
          <div class="flex items-start gap-3">
            <Icon name="ant-design:calendar-filled" class="text-blue-600 text-2xl" />
            <div>
              <h3 class="font-semibold">Xếp thời khóa biểu tự động</h3>
              <p class="text-gray-700 text-sm">Tối ưu xung đột, khớp ràng buộc và cho phép chỉnh tay linh hoạt.</p>
            </div>
          </div>
        </a-card>
        <a-card :bordered="false" class="bg-white/80 shadow">
          <div class="flex items-start gap-3">
            <Icon name="ant-design:partition-outlined" class="text-blue-600 text-2xl" />
            <div>
              <h3 class="font-semibold">Quản lý dữ liệu</h3>
              <p class="text-gray-700 text-sm">Giáo viên, lớp, môn, phòng học, ca dạy; ràng buộc giờ và địa điểm.</p>
            </div>
          </div>
        </a-card>
        <a-card :bordered="false" class="bg-white/80 shadow">
          <div class="flex items-start gap-3">
            <Icon name="ant-design:file-done-outlined" class="text-blue-600 text-2xl" />
            <div>
              <h3 class="font-semibold">Báo cáo & xuất lịch</h3>
              <p class="text-gray-700 text-sm">Xuất lịch theo lớp, giáo viên, phòng; chia sẻ nhanh trong đơn vị.</p>
            </div>
          </div>
        </a-card>
      </div>
    </section>
    </Lazy>

    <!-- Contact -->
    <Lazy>
    <section class="container mx-auto px-4 pb-16">
      <div class="mb-6">
        <h2 class="text-xl md:text-2xl font-bold text-gray-900">Liên hệ</h2>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <a-card :bordered="false" class="bg-white/80 shadow">
          <div class="flex items-start gap-3">
            <Icon name="ant-design:environment-outlined" class="text-blue-600 text-2xl mt-0.5" />
            <div>
              <h3 class="font-semibold">Địa chỉ</h3>
              <p class="text-gray-700 text-sm">{{ settingStore.info?.address || "" }}</p>
            </div>
          </div>
        </a-card>
        <a-card :bordered="false" class="bg-white/80 shadow">
          <div class="flex items-start gap-3">
            <Icon name="ant-design:phone-outlined" class="text-blue-600 text-2xl mt-0.5" />
            <div>
              <h3 class="font-semibold">Điện thoại</h3>
              <p class="text-gray-700 text-sm">{{ settingStore.info?.phone || "" }}</p>
            </div>
          </div>
        </a-card>
        <a-card :bordered="false" class="bg-white/80 shadow">
          <div class="flex items-start gap-3">
            <Icon name="ant-design:mail-outlined" class="text-blue-600 text-2xl mt-0.5" />
            <div>
              <h3 class="font-semibold">E-mail</h3>
              <p class="text-gray-700 text-sm">{{ settingStore.info?.email || "" }}</p>
            </div>
          </div>
        </a-card>
      </div>
    </section>
    </Lazy>

    <!-- CTA -->
    <Lazy>
    <section class="container mx-auto px-4 pb-20">
      <a-card class="shadow-lg">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 class="text-xl md:text-2xl font-bold">Sẵn sàng tối ưu thời khóa biểu?</h3>
            <p class="text-gray-700">Đăng nhập để bắt đầu hoặc đăng ký dùng thử ngay hôm nay.</p>
          </div>
          <div class="flex gap-3">
            <NuxtLink to="/login"><a-button type="primary">Đăng nhập</a-button></NuxtLink>
          </div>
        </div>
      </a-card>
    </section>
    </Lazy>
  </main>
</template>

<script setup>
definePageMeta({ layout: "auth", prerender: true });

const userStore = useUserStore();
const unitStore = useUnitStore();
const settingStore = useSettingStore();
// Nếu đã đăng nhập, chuyển đến dashboard
if (process.client ? !!userStore.token : Boolean(userStore.token)) {
  await navigateTo("/dashboard");
}
</script>
