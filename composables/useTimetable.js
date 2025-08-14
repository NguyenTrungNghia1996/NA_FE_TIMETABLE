// /composables/useTimetable.js

/**
 * Biến danh sách bản ghi flat thành cấu trúc \"ds_Ca -> ds_Ngay -> ds_Tiet\".
 * @param {Array<Object>} records
 * @param {Object} opts
 * @param {number}   [opts.daysCount=7]            - số ngày hiển thị (1..7)
 * @param {number[]} [opts.shifts=[1,2]]           - danh sách ca
 * @param {number}   [opts.periodsPerShift=5]      - số tiết mỗi ca
 * @param {string[]} [opts.dayNames]               - nhãn ngày
 * @returns {{ds_Ca:Array, unassigned:Array, index:Object}}
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

  const ds_Ca = [];
  for (const caId of shifts) {
    const ds_Ngay = [];
    for (let day = 1; day <= daysCount; day++) {
      const ds_Tiet = [];
      for (let p = 1; p <= periodsPerShift; p++) {
        const k = keyOf(day, caId, p);
        const cell = index[k];
        if (cell) {
          ds_Tiet.push({ ...cell });
        } else {
          ds_Tiet.push({
            id_chitiet: 0,
            id_don_vi: 0,
            id_tkb: 0,
            id_mon: 0,
            ten_mon: "",
            id_giao_vien: 0,
            ten_giao_vien: "",
            id_phong: 0,
            ten_phong: "",
            tiet_thu_may: 0,
            id_ca: caId,
            ngay: day,
            tiet: p,
            isDrag: false,
            isLock: false,
            isRest: false,
          });
        }
      }
      ds_Ngay.push({
        id: day,
        ten: dayNames[day - 1] ?? `Ngày ${day}`,
        ds_Tiet,
      });
    }
    ds_Ca.push({ id: caId, ds_Ngay });
  }

  return { ds_Ca, unassigned, index };
}

/**
 * Chuyển ngược từ cấu trúc ds_Ca -> ds_Ngay -> ds_Tiet về mảng bản ghi flat.
 *
 * @param {Object} grid - đối tượng từ transformTimetable: { ds_Ca, unassigned? }
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

  for (const ca of grid?.ds_Ca || []) {
    const id_ca = ca.id;
    for (const ngayObj of ca.ds_Ngay || []) {
      const ngay = ngayObj.id;
      for (const tietObj of ngayObj.ds_Tiet || []) {
        const rec = { ...baseDefaults, ...tietObj, id_ca, ngay, tiet: tietObj.tiet };

        const isBlank =
          !rec.isRest &&
          !rec.id_chitiet &&
          !rec.id_mon &&
          !rec.ten_mon;

        if (rec.isRest) {
          if (!includeRests) continue;
          out.push({ ...rec, isRest: true });
          continue;
        }

        if (isBlank) {
          if (!includeBlanks) continue;
          out.push(rec);
          continue;
        }

        out.push(rec);
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
  const ds_Ca = ref([]);
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
      ds_Ca.value = res.ds_Ca;
      unassigned.value = res.unassigned;
      index.value = res.index;
    } catch (e) {
      error.value = e;
    } finally {
      pending.value = false;
    }
  }

  return { ds_Ca, unassigned, index, pending, error, refresh };
}
