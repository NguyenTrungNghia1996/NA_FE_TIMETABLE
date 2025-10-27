<template>
  <div class="p-4 space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold">Demo Lịch Báo Giảng - Lớp {{ className }}</h2>
        <div class="text-sm text-gray-600">{{ rangeText }}</div>
      </div>
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">Chế độ xem:</span>
        <a-radio-group v-model:value="viewMode" size="small">
          <a-radio-button value="class">Theo lớp</a-radio-button>
          <a-radio-button value="subject">Theo môn</a-radio-button>
        </a-radio-group>
        <a-select
          v-if="viewMode === 'subject'"
          v-model:value="selectedSubject"
          :options="subjectOptions"
          placeholder="Chọn môn"
          size="small"
          style="min-width: 200px"
        />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">Khoảng thời gian:</span>
        <a-select v-model:value="rangeMode" size="small" style="min-width: 160px" :options="rangeModeOptions" />
        <a-date-picker
          v-if="rangeMode === 'week'"
          v-model:value="weekPicker"
          picker="week"
          size="small"
          :format="'[Tuần] WW/YYYY'"
          placeholder="Chọn tuần"
          @change="onWeekChange"
        />
        <a-range-picker v-if="rangeMode === 'custom'" size="small" format="DD/MM/YYYY" @change="onRangeChange" />
        <a-select
          v-if="rangeMode === 'month'"
          v-model:value="weekCount"
          :options="weekCountOptions"
          size="small"
          style="min-width: 140px"
        />
      </div>
    </div>
  </div>

  <a-card title="Lịch báo giảng">
    <a-table
      :columns="tableColumns"
      :data-source="tableData"
      :pagination="false"
      size="small"
      rowKey="key"
    />
  </a-card>
</div>
</template>

<script setup>
// Trang demo public: /test/bao-giang (bỏ qua middleware auth)

const className = ref("11A1");
const viewMode = ref("class"); // 'class' | 'subject'
const selectedSubject = ref("");
const rangeMode = ref("week"); // 'week' | 'month' | 'custom'
const rangeModeOptions = [
  { label: 'Tuần này', value: 'week' },
  { label: 'Tháng này', value: 'month' },
  { label: 'Khoảng tùy chọn', value: 'custom' },
];
const customRange = ref([]); // [startDate, endDate] - Date objects
const weekCount = ref('all'); // 'all' | '1'..'6'
const weekPicker = ref(); // dayjs | Date for week picker

function normalizeDate(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getMonday(d = new Date()) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // 0=Mon ... 6=Sun
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toKey(date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("-");
}

function formatDate(date) {
  try {
    return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
  } catch {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
}

function weekdayLabel(idx) {
  // idx: 0..6 (Mon..Sun)
  const labels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  return labels[idx] || "";
}

// Dữ liệu lấy từ file JSON 30 ngày (không dùng API)
const rawDataset = ref([]); // [{ date: 'YYYY-MM-DD', period, subject, lessonNo, lessonTitle }]

onMounted(async () => {
  try {
    const json = await $fetch('/bao-giang-30days.json');
    className.value = json?.className || className.value;
    rawDataset.value = Array.isArray(json?.records) ? json.records : [];
  } catch (e) {
    rawDataset.value = [];
  }
});

function getWeekDates(base = new Date()) {
  const start = getMonday(base);
  const arr = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    arr.push(normalizeDate(d));
  }
  return arr;
}

function getMonthDates(base = new Date()) {
  const dt = new Date(base);
  const y = dt.getFullYear();
  const m = dt.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const arr = [];
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day >= 1 && day <= 5) arr.push(normalizeDate(d));
  }
  return arr;
}

// Danh sách tuần (T2-T6) trong tháng của baseDate
const monthWeeks = computed(() => {
  const dt = new Date(baseDate.value);
  const y = dt.getFullYear();
  const m = dt.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const map = new Map(); // mondayKey -> { monday: Date, dates: Date[] }
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day < 1 || day > 5) continue; // only Mon-Fri
    const mon = getMonday(d);
    const key = toKey(mon);
    if (!map.has(key)) map.set(key, { monday: mon, dates: [] });
    map.get(key).dates.push(normalizeDate(d));
  }
  const weeks = Array.from(map.values()).sort((a, b) => a.monday - b.monday);
  return weeks.map((w, idx) => ({ index: idx + 1, monday: w.monday, dates: w.dates.sort((a, b) => a - b) }));
});

const weekCountOptions = computed(() => {
  const max = monthWeeks.value.length || 5;
  return [{ label: 'Tất cả tuần', value: 'all' }, ...Array.from({ length: max }, (_, i) => ({ label: `${i + 1} tuần`, value: String(i + 1) }))];
});

function getDatesBetweenWeekdays(start, end) {
  if (!start || !end) return [];
  const s = normalizeDate(start);
  const e = normalizeDate(end);
  const arr = [];
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const wd = d.getDay();
    if (wd >= 1 && wd <= 5) arr.push(new Date(d));
  }
  return arr;
}

const baseDate = ref(new Date());
const rangeDates = computed(() => {
  if (rangeMode.value === 'week') return getWeekDates(baseDate.value);
  if (rangeMode.value === 'month') {
    const weeks = monthWeeks.value;
    const picked = weekCount.value === 'all'
      ? weeks
      : weeks.slice(0, Math.min(Number(weekCount.value) || 0, weeks.length));
    return picked.flatMap(w => w.dates);
  }
  const [s, e] = customRange.value || [];
  return getDatesBetweenWeekdays(s, e);
});

function onRangeChange(val) {
  const start = val?.[0]?.toDate ? val[0].toDate() : val?.[0];
  const end = val?.[1]?.toDate ? val[1].toDate() : val?.[1];
  customRange.value = start && end ? [start, end] : [];
}

function onWeekChange(val) {
  const d = val?.toDate ? val.toDate() : val;
  if (d) baseDate.value = d;
}

// Flatten về một mảng theo khoảng ngày đã chọn dựa trên dữ liệu JSON
const flatRows = computed(() => {
  const rows = [];
  // lấy phạm vi ngày [start..end]
  const start = rangeDates.value[0];
  const end = rangeDates.value[rangeDates.value.length - 1];
  if (!start || !end) return rows;
  const startTime = start.getTime();
  const endTime = end.getTime();

  for (const rec of rawDataset.value || []) {
    const d = new Date(rec.date);
    const t = d.getTime();
    if (t < startTime || t > endTime) continue;
    const wdIdx = (d.getDay() + 6) % 7;
    rows.push({
      key: `${rec.date}-${String(rec.period).padStart(2, '0')}-${rec.subject}`,
      date: d,
      dateStr: formatDate(d),
      weekday: weekdayLabel(wdIdx),
      period: rec.period,
      subject: rec.subject,
      lessonNo: rec.lessonNo,
      lessonTitle: rec.lessonTitle,
    });
  }
  return rows;
});

// Danh sách môn cho select
// Danh sách môn từ JSON để chọn khi xem theo môn
const subjectOptions = computed(() => {
  const set = new Set(rawDataset.value.map(r => r.subject).filter(Boolean));
  return Array.from(set).map(s => ({ label: s, value: s }));
});

// Cột bảng
const tableColumns = computed(() => [
  { title: "Ngày", dataIndex: "dateStr", key: "dateStr", sorter: (a, b) => a.date - b.date },
  { title: "Thứ", dataIndex: "weekday", key: "weekday" },
  { title: "Tiết", dataIndex: "period", key: "period", width: 80, align: "center", sorter: (a, b) => a.period - b.period },
  { title: "Môn học", dataIndex: "subject", key: "subject", sorter: (a, b) => a.subject.localeCompare(b.subject) },
  { title: "Bài học", dataIndex: "lessonTitle", key: "lessonTitle" },
]);

const tableData = computed(() => {
  let rows = flatRows.value.slice().sort((a, b) => {
    const byDate = a.date - b.date;
    if (byDate) return byDate;
    return a.period - b.period;
  });
  if (viewMode.value === 'subject' && selectedSubject.value) {
    rows = rows.filter(r => r.subject === selectedSubject.value);
  }
  return rows;
});

// Tự chọn môn đầu tiên khi chuyển sang chế độ theo môn
watch([viewMode, subjectOptions], () => {
  if (viewMode.value === 'subject') {
    if (!selectedSubject.value) {
      selectedSubject.value = subjectOptions.value[0]?.value || '';
    } else if (!subjectOptions.value.find(o => o.value === selectedSubject.value)) {
      selectedSubject.value = subjectOptions.value[0]?.value || '';
    }
  }
}, { immediate: true });

const rangeText = computed(() => {
  if (rangeMode.value === 'week') {
    const dates = getWeekDates(baseDate.value);
    if (!dates.length) return 'Tuần: (trống)';
    return `Tuần: ${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`;
  }
  if (rangeMode.value === 'month') {
    const dates = rangeDates.value;
    if (!dates.length) return 'Tháng: (trống)';
    return `Tháng: ${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`;
  }
  const [s, e] = customRange.value || [];
  if (s && e) return `Khoảng: ${formatDate(s)} - ${formatDate(e)}`;
  return 'Khoảng: chưa chọn';
});

// Không xuất theo môn: chỉ hiển thị theo khoảng thời gian
</script>

<style scoped>
</style>
