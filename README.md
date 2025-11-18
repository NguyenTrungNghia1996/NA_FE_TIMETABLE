# Vn TimeTable (FE) — Quản lý Thời Khóa Biểu

Frontend quản trị thời khóa biểu xây dựng với Nuxt 3 + Vue 3, tích hợp Ant Design Vue, Tailwind CSS và Pinia. Dự án hỗ trợ hiển thị, kéo‑thả sắp xếp tiết học cho Lớp/Giáo viên, khóa/mở khóa tiết, cấu hình cấu trúc TKB (số ngày/ca/số tiết), và tuỳ biến bảng màu hiển thị.

## Tính năng chính

- Lưới thời khóa biểu tương tác cho Lớp và Giáo viên (drag & drop)
- Quản lý “tiết chưa xếp” theo TKB/Lớp/Giáo viên
- Khóa / mở khóa / hủy tiết qua menu ngữ cảnh
- Phát hiện và tô màu trạng thái: lỗi, đang chọn, có thể kéo, bị khóa, cùng môn…
- Cấu hình cấu trúc TKB: số ngày, danh sách ca, số tiết theo từng ca
- Tuỳ biến giao diện (bảng màu) theo cấu hình người dùng

## Công nghệ

- Nuxt 3, Vue 3, Vue Router
- Pinia (state management), VueUse
- Ant Design Vue, Tailwind CSS

## Yêu cầu môi trường

- Node.js 18+ (khuyến nghị 20+)
- Yarn 1.x (đã khóa bằng `yarn.lock`)

## Cài đặt

```bash
yarn install
```

## Chạy môi trường phát triển

```bash
yarn dev
# Mặc định chạy tại http://localhost:3000
```

## Build & Preview sản phẩm

```bash
# Build production
yarn build

# Chạy thử bản build
yarn preview
```

## Cấu hình môi trường (Runtime Config)

Các biến môi trường quan trọng (xem `nuxt.config.ts`):

- `NUXT_PUBLIC_BASE_URL`: URL base của API backend (mặc định: https://api.testtkb.nguyenanh-est.com)
- `NUXT_ENCRYPTION_KEY`: Khóa mã hóa cho ứng dụng (ít nhất 32 ký tự)
- `NUXT_PUBLIC_BUILD_TAG`, `NUXT_PUBLIC_BUILD_SHA`, `NUXT_PUBLIC_BUILD_TIME`: Thông tin build hiển thị trong runtime (tùy chọn)

Lưu ý về chọn endpoint động theo “đơn vị” (store):

- Dựa trên `unitStore`, ứng dụng có thể tự chọn API base theo đơn vị (`tkb`, `dungthutkb`, `testtkb`, …). Nếu không khớp, fallback về `NUXT_PUBLIC_BASE_URL`.

## Docker

Sử dụng Dockerfile đa stage:

```bash
# Build image kèm metadata build
docker build \
  -t vn_time_table:dev \
  --build-arg BUILD_TAG=$(git rev-parse --abbrev-ref HEAD) \
  --build-arg BUILD_SHA=$(git rev-parse --short HEAD) \
  --build-arg BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  .

# Chạy container
docker run --rm -p 3000:3000 \
  -e NODE_ENV=production \
  -e HOST=0.0.0.0 \
  -e PORT=3000 \
  -e NUXT_PUBLIC_BASE_URL=https://api.testtkb.nguyenanh-est.com \
  -e NUXT_ENCRYPTION_KEY=key-32-chars-123456 \
  vn_time_table:dev
```

Hoặc dùng `docker-compose.yml` với image build sẵn:

```yaml
services:
  frontend:
    image: registry.nguyenanh-est.com/nguyen_anh_est/vn_time_table:latest
    restart: unless-stopped
    environment:
      NODE_ENV: production
      HOST: 0.0.0.0
      PORT: 3000
      NUXT_PUBLIC_BASE_URL: https://api-test-tkb.nguyenanh-est.com
      NUXT_ENCRYPTION_KEY: key-32-chars-123456
    ports:
      - "3000:3000"
```

## Cấu trúc thư mục chính

- `components/` — Các thành phần UI (ví dụ `TimetableGrid.vue`)
- `pages/` — Các trang Nuxt (ví dụ `pages/timetable.vue` demo)
- `stores/` — Pinia stores (`settingStore.js`, `unitStore.js`, ...)
- `composables/` — Logic dùng lại (`useApi.js`, `useTimetable.js`, ...)
- `public/` — Tài nguyên tĩnh
- `nuxt.config.ts` — Cấu hình Nuxt & runtime config

## Thành phần chính: TimetableGrid

Thành phần hiển thị & thao tác lưới thời khóa biểu cho lớp và giáo viên.

- Props/Model:
  - `v-model:classId`: ID lớp hiện tại
  - `timetableId`: ID thời khóa biểu

Ví dụ sử dụng (xem `pages/timetable.vue`):

```vue
<template>
  <div class="p-4">
    <h2 class="text-xl font-semibold mb-2">Thời khóa biểu 11A1</h2>
    <TimetableGrid v-model:classId="demoClassId" :timetableId="demoTimetableId" />
  </div>
</template>
<script setup>
const demoClassId = ref(null)
const demoTimetableId = ref(null)
</script>
```

Lưu ý: Thành phần dựa vào API qua `useApi` và dữ liệu cấu hình từ `settingStore` để xác định cấu trúc (số ngày/ca/số tiết) và bảng màu hiển thị.

## Các Select dùng chung

Các component trong `components/Select/*` được auto-import dưới dạng PascalCase: ví dụ `components/Select/Class.vue` => `SelectClass`, `Teacher.vue` => `SelectTeacher`, `Subject.vue` => `SelectSubject`, v.v.

- Thuộc tính chung (đa số Select):
  - `v-model` / `modelValue`: giá trị đang chọn. Kiểu `Number | String | Array` (khi `multiple=true`).
  - `multiple`: bật chọn nhiều; `modelValue` sẽ là `Array`.
  - `placeholder`, `size` (`small` | `middle` | `large`), `disabled`, `rules` (khi dùng trong `a-form-item`).
  - Tìm kiếm từ xa (remote): gõ vào ô tìm kiếm sẽ gọi API với debounce ~300ms, `filter-option=false` (lọc ở server).
  - Xóa lựa chọn: nút clear trả về `null` hoặc `[]` (khi `multiple=true`).

- Một số Select có props mở rộng:
  - `SelectClass`: `id_khoi` (lọc theo khối), `autoSelectFirst`, `noFormItem`, `inlineLabel`.
  - `SelectTeacher`: `autoSelectFirst`, `noFormItem`, `inlineLabel`.
  - `SelectClassroom`: `idLoaiPhonghoc` (lọc theo loại phòng).
  - Các select khác (khối lớp, cấp học, ca học, ngày học, môn học, …) chia sẻ API và hành vi tương tự.

- Ví dụ sử dụng cơ bản:

```vue
<!-- Chọn Lớp đơn, tự chọn mục đầu tiên, hiển thị inline không bọc FormItem -->
<SelectClass
  v-model="classId"
  :autoSelectFirst="true"
  :noFormItem="true"
  :inlineLabel="true"
  size="small"
  label="Lớp"
/>

<!-- Lọc Lớp theo Khối -->
<SelectClass v-model="classId" :id_khoi="gradeId" />

<!-- Chọn Giáo viên đơn, inline label giống TimetableGrid -->
<SelectTeacher
  v-model="teacherId"
  :autoSelectFirst="true"
  :noFormItem="true"
  :inlineLabel="true"
  size="small"
  label="Giáo viên"
/>

<!-- Chọn nhiều Môn học -->
<SelectSubject v-model="subjectIds" :multiple="true" placeholder="Chọn môn" />

<!-- Chọn Phòng học theo Loại phòng -->
<SelectClassroom v-model="roomId" :idLoaiPhonghoc="roomTypeId" />

<!-- Chọn Năm học -->
<SelectYear v-model="yearId" placeholder="Chọn năm học" />
```

Ghi chú:
- Một số Select (ví dụ `SelectSubject`, `SelectClassroom`, …) luôn bọc trong `a-form-item`. Thuộc tính `noFormItem`/`inlineLabel` chỉ có ở các Select hỗ trợ (như `SelectClass`, `SelectTeacher`).
- Các Select gọi API qua `useApi` và yêu cầu cấu hình `baseURL`/đăng nhập hợp lệ; nếu 401 sẽ tự điều hướng trang đăng nhập.

### Danh sách Select & props đặc thù

- `SelectClass` (Lớp): `id_khoi`, `autoSelectFirst`, `noFormItem`, `inlineLabel`.
- `SelectTeacher` (Giáo viên): `autoSelectFirst`, `noFormItem`, `inlineLabel`.
- `SelectYear` (Năm học): không có props đặc thù ngoài nhóm chung.
- `SelectSubject` (Môn học): `extraParams` (Object) để gửi thêm query params khi gọi API.
- `SelectClassroom` (Phòng học): `idLoaiPhonghoc` để lọc theo loại phòng.
- `SelectClassroomType` (Loại phòng học): không có props đặc thù ngoài nhóm chung.
- `SelectExpertise` (Tổ chuyên môn): không có props đặc thù; nạp qua API.
- `SelectKnowledge` (Khối kiến thức): nếu chưa có `modelValue`, tự chọn mục đầu tiên.
- `SelectProvince` (Tỉnh): không có props đặc thù; label mặc định “Tỉnh”, name “id_tinh”.
- `SelectRole` (Nhóm quyền): nếu chưa có `modelValue`, tự chọn mục đầu tiên (kể cả khi `multiple` sẽ trả về mảng 1 phần tử).
- `SelectSchoolDay` (Ngày học): không gọi API; danh sách cố định Thứ 2…Chủ nhật (value 1..7), tìm kiếm cục bộ.
- `SelectSchoolLevel` (Cấp học): nạp từ API cấp học toàn hệ thống.
- `SelectSchoolLevelByUnit` (Cấp học theo đơn vị): nạp từ API theo đơn vị; giữ nguyên `modelValue` hiện tại.
- `SelectGradeLevel` (Khối lớp): nạp từ API khối lớp.
- `SelectGradeLevelByUnit` (Khối lớp theo đơn vị): nạp từ API theo đơn vị; giữ nguyên `modelValue` hiện tại.
- `SelectSchoolShift` (Ca học): nạp từ API ca học toàn hệ thống.
- `SelectSchoolShiftByUnit` (Ca học theo đơn vị): nạp từ API theo đơn vị; giữ nguyên `modelValue` hiện tại.
- `SelectSchoolPeriod` (Tiết học): không gọi API; danh sách mặc định Tiết 1..5, tìm kiếm cục bộ theo nhãn/giá trị.
- `SelectSchoolSite` (Điểm trường): nạp từ API điểm trường.
- `SelectSchoolship` (Ban học): nạp từ API ban học.
- `SelectUnit` (Đơn vị): nạp từ API đơn vị.
- `SelectUser` (Người dùng): nạp từ API người dùng.

## API & Xác thực

- Tầng gọi API được đóng gói trong `composables/useApi.js` và sử dụng token từ `userStore`.
- Base URL API lấy từ `unitStore.baseUrl` hoặc `NUXT_PUBLIC_BASE_URL`.
- Khi 401, app tự động điều hướng về trang đăng nhập.

## Scripts (package.json)

- `yarn dev` — chạy môi trường phát triển
- `yarn build` — build production
- `yarn preview` — chạy thử bản build
- `yarn generate` — xuất static (nếu cần)

## Phát triển

- Code style: Prettier (`.prettierrc.json`)
- UI: Ant Design Vue + Tailwind CSS
- Quản lý state: Pinia, có sẵn persisted state
- Khuyến nghị Node 20+ để khớp môi trường Docker

## Tài liệu tham khảo

- Nuxt 3: https://nuxt.com/docs
- Ant Design Vue: https://antdv.com/
- Tailwind CSS: https://tailwindcss.com/
