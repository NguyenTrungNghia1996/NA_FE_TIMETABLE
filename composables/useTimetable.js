// /composables/useTimetable.js

/**
 * Biến danh sách bản ghi flat thành cấu trúc dạng lưới có thể vẽ bảng.
 * @param {Array<Object>} records
 * @param {Object} opts
 * @param {number}   [opts.daysCount=7]            - số ngày hiển thị (1..7)
 * @param {number[]} [opts.shifts=[1,2]]           - danh sách ca
 * @param {number}   [opts.periodsPerShift=5]      - số tiết mỗi ca
 * @param {string[]} [opts.dayNames]               - nhãn ngày
 * @returns {{days:Array, unassigned:Array, index:Object}}
 */
export function transformTimetable(records = [], opts = {}) {
  const daysCount = opts.daysCount ?? 7;
  const shifts = opts.shifts ?? [1, 2];
  const periodsPerShift = opts.periodsPerShift ?? 5;
  const dayNames =
    opts.dayNames ??
    ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"]; // ngay: 1..7

  const unassigned = [];
  const valid = [];

  for (const r of records || []) {
    const invalid =
      !r ||
      r.ngay === 0 ||
      r.tiet === 0 ||
      r.id_ca === 0 ||
      r.ngay == null ||
      r.tiet == null ||
      r.id_ca == null;

    if (invalid) unassigned.push(r);
    else valid.push(r);
  }

  const keyOf = (ngay, id_ca, tiet) => `${ngay}-${id_ca}-${tiet}`;
  const index = {};
  for (const r of valid) {
    index[keyOf(r.ngay, r.id_ca, r.tiet)] = r;
  }

  const days = [];
  for (let day = 1; day <= daysCount; day++) {
    const caList = shifts.map((caId) => {
      const periods = [];
      for (let p = 1; p <= periodsPerShift; p++) {
        const k = keyOf(day, caId, p);
        const cell = index[k];

        if (cell) {
          periods.push(
            cell.isRest
              ? { tiet: p, type: "rest", isLock: !!cell.isLock, isRest: true, data: cell }
              : { tiet: p, type: "lesson", isLock: !!cell.isLock, isRest: !!cell.isRest, data: cell }
          );
        } else {
          periods.push({ tiet: p, type: "blank", isLock: false, isRest: false });
        }
      }
      return {
        id_ca: caId,
        label: caId === 1 ? "Ca sáng" : "Ca chiều",
        periods,
      };
    });

    days.push({
      day,
      label: dayNames[day - 1] ?? `Ngày ${day}`,
      ca: caList,
    });
  }

  return { days, unassigned, index };
}

/**
 * Chuyển ngược từ lưới (days -> ca -> periods) về mảng bản ghi flat.
 * Dùng khi cần gửi kết quả sau kéo-thả về backend.
 *
 * @param {Object} grid - đối tượng từ transformTimetable: { days, unassigned? }
 * @param {Object} [options]
 * @param {boolean} [options.includeRests=true]  - có đưa tiết nghỉ (isRest) vào danh sách không
 * @param {boolean} [options.includeBlanks=false]- có đưa ô trống vào danh sách không
 * @param {Array<Object>} [options.mergeUnassigned] - mảng unassigned để cộng dồn
 * @param {Object} [options.baseDefaults] - default cho ô trống/thiếu data
 * @returns {Array<Object>}
 */
export function toFlatRecordsFromGrid(grid, options = {}) {
  const includeRests = options.includeRests ?? true;
  const includeBlanks = options.includeBlanks ?? false;
  const mergeUnassigned = options.mergeUnassigned ?? [];
  const baseDefaults = {
    id_don_vi: 1,
    id_tkb: 2,
    id_mon: "0",
    ten_mon: "",
    id_giao_vien: 0,
    ten_giao_vien: "",
    id_phong: 0,
    tiet_thu_may: 0,
    isLock: false,
    isRest: false,
    isDrag: false,
    ...options.baseDefaults,
  };

  const out = [];

  for (const d of grid?.days || []) {
    const ngay = d.day;
    for (const c of d.ca || []) {
      const id_ca = c.id_ca;
      for (const p of c.periods || []) {
        const tiet = p.tiet;

        // lesson
        if (p.type === "lesson" && p.data) {
          out.push({ ...p.data, ngay, id_ca, tiet });
          continue;
        }

        // rest
        if (p.type === "rest") {
          if (!includeRests) continue;
          const rec = p.data
            ? { ...p.data, ngay, id_ca, tiet, isRest: true }
            : { ...baseDefaults, ngay, id_ca, tiet, isRest: true };
          out.push(rec);
          continue;
        }

        // blank
        if (p.type === "blank") {
          if (!includeBlanks) continue;
          out.push({ ...baseDefaults, ngay, id_ca, tiet });
        }
      }
    }
  }

  // cộng thêm các ô unassigned nếu muốn
  if (Array.isArray(mergeUnassigned) && mergeUnassigned.length) {
    out.push(...mergeUnassigned);
  }

  return out;
}

/**
 * Composable nạp & chuyển đổi thời khóa biểu (SSR-friendly).
 * @param {string|Array|Ref|ComputedRef} source - URL JSON hoặc records/phản ứng
 * @param {Object} opts - tham số cho transformTimetable
 */
export function useTimetable(source, opts = {}) {
  const days = ref([]);
  const unassigned = ref([]);
  const index = ref({});
  const pending = ref(false);
  const error = ref(null);

  const resolveVal = (v) => (typeof v === "function" ? v() : unref(v));

  async function refresh() {
    try {
      pending.value = true;
      error.value = null;

      const src = resolveVal(source);
      let records;

      if (typeof src === "string") {
        const json = await $fetch(src);
        records =
          json?.data?.timetable ??
          json?.timetable ??
          (Array.isArray(json) ? json : []);
      } else if (Array.isArray(src)) {
        records = src;
      } else if (src && Array.isArray(src.timetable)) {
        records = src.timetable;
      } else {
        records = [];
      }

      const res = transformTimetable(records, opts);
      days.value = res.days;
      unassigned.value = res.unassigned;
      index.value = res.index;
    } catch (e) {
      error.value = e;
    } finally {
      pending.value = false;
    }
  }

  return { days, unassigned, index, pending, error, refresh };
}
