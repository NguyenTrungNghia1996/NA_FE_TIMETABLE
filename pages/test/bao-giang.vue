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
        <a-range-picker size="small" format="DD/MM/YYYY" @change="onRangeChange" />
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
const customRange = ref([]); // [startDate, endDate] - Date objects

function normalizeDate(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Bỏ các tiện ích tuần/tháng

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

// Bỏ các chế độ tuần/tháng, chỉ chọn khoảng thời gian tùy chọn

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

const rangeDates = computed(() => {
  let s, e;
  if (customRange.value && customRange.value.length === 2) {
    [s, e] = customRange.value;
  } else if (rawDataset.value && rawDataset.value.length) {
    // Mặc định: hiển thị toàn bộ khoảng theo dữ liệu hiện có
    let minTime = Infinity;
    let maxTime = -Infinity;
    for (const r of rawDataset.value) {
      const t = new Date(r.date).setHours(0, 0, 0, 0);
      if (t < minTime) minTime = t;
      if (t > maxTime) maxTime = t;
    }
    if (isFinite(minTime) && isFinite(maxTime)) {
      s = new Date(minTime);
      e = new Date(maxTime);
    }
  }
  return getDatesBetweenWeekdays(s, e);
});

function onRangeChange(val) {
  const start = val?.[0]?.toDate ? val[0].toDate() : val?.[0];
  const end = val?.[1]?.toDate ? val[1].toDate() : val?.[1];
  customRange.value = start && end ? [start, end] : [];
}

// Không còn chọn tuần/tháng nên bỏ onWeekChange

// Flatten về một mảng theo khoảng ngày đã chọn dựa trên dữ liệu JSON
const flatRows = computed(() => {
  const rows = [];
  // Lấy phạm vi ngày [start..end] (mặc định toàn bộ nếu chưa chọn)
  let s, e;
  if (customRange.value && customRange.value.length === 2) {
    [s, e] = customRange.value;
  } else if (rawDataset.value && rawDataset.value.length) {
    let minTime = Infinity;
    let maxTime = -Infinity;
    for (const r of rawDataset.value) {
      const t = new Date(r.date).setHours(0, 0, 0, 0);
      if (t < minTime) minTime = t;
      if (t > maxTime) maxTime = t;
    }
    if (isFinite(minTime) && isFinite(maxTime)) {
      s = new Date(minTime);
      e = new Date(maxTime);
    }
  }
  if (!s || !e) return rows;
  const start = normalizeDate(s);
  const end = normalizeDate(e);
  // Yêu cầu: bao gồm cả những tiết của ngày phía sau
  const endPlusOne = new Date(end);
  endPlusOne.setDate(endPlusOne.getDate() + 1);
  const startTime = start.getTime();
  const endTime = endPlusOne.getTime();

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
  let s, e;
  if (customRange.value && customRange.value.length === 2) {
    [s, e] = customRange.value;
  } else if (rawDataset.value && rawDataset.value.length) {
    let minTime = Infinity;
    let maxTime = -Infinity;
    for (const r of rawDataset.value) {
      const t = new Date(r.date).setHours(0, 0, 0, 0);
      if (t < minTime) minTime = t;
      if (t > maxTime) maxTime = t;
    }
    if (isFinite(minTime) && isFinite(maxTime)) {
      s = new Date(minTime);
      e = new Date(maxTime);
    }
  }
  if (s && e) {
    const ePlus = new Date(e);
    ePlus.setDate(ePlus.getDate() + 1);
    return `Khoảng: ${formatDate(s)} - ${formatDate(e)} (bao gồm tiết ngày kế tiếp)`;
  }
  return 'Khoảng: chưa chọn';
});

// Không xuất theo môn: chỉ hiển thị theo khoảng thời gian
</script>

<style scoped>
</style>
