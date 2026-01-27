import { defineStore } from "pinia";
export const useSettingStore = defineStore(
  "setting",
  {
    state: () => ({
      info: {
        phone: "0976214911",
        address: "Số 51, Ngách 562/59, Thụy Khuê, Tây Hồ, Hà Nội",
        email: "info.nguyenanhest@gmail.com",
        facebook: "",
        message: "https://www.facebook.com/messages/t/181503228370847"
      },
      loading: {
        title: "Đang xử lý",
        description: "Vui lòng chờ trong giây lát...",
        isActive: false,
        showLogo: true,
        transparent: false,
      },
      menu: [],
      permissions: [],
      current_permission: 0,
      // Timetable color settings
      timetableTheme: {
        // Set warm as default for eye comfort
        activePalette: 'default',
        palettes: {
          default: {
            errorBg: '#FCA5A5',        // tailwind red-300
            dragBg: '#AFFF2C',         // arbitrary green used previously
            lockBg: '#FEE2E2',         // tailwind red-200 (close to red-50 visual)
            sameSubjectBg: '#20B1AA',  // arbitrary teal used previously
            selectedBg: '#60A5FA',     // tailwind blue-400
            emptyBg: '#FFF9ED',        // fallback
          },
          default_old: {
            errorBg: '#FCA5A5',        // tailwind red-300
            dragBg: '#AFFF2C',         // arbitrary green used previously
            lockBg: '#FEE2E2',         // tailwind red-200 (close to red-50 visual)
            sameSubjectBg: '#20B1AA',  // arbitrary teal used previously
            selectedBg: '#60A5FA',     // tailwind blue-400
            emptyBg: '#FFFFFF',        // fallback
          },
          pastel: {
            errorBg: '#FFB3BA',
            dragBg: '#BAFFC9',
            lockBg: '#FFE0BA',
            sameSubjectBg: '#BFE6FF',
            selectedBg: '#C6C6FF',
            emptyBg: '#FFFFFF',
          },
          contrast: {
            errorBg: '#FF5C5C',
            dragBg: '#B4FF00',
            lockBg: '#FFB3B3',
            sameSubjectBg: '#00B3AD',
            selectedBg: '#1D4ED8',
            emptyBg: '#FFFFFF',
          },
          // Warm, eye-comforting palette with yellowish tones
          warm: {
            errorBg: '#F4B1B1',       // soft warm red
            dragBg: '#FFF3B0',        // soft mellow yellow
            lockBg: '#FFE3B3',        // warm light amber/peach
            sameSubjectBg: '#F8E89A', // gentle yellow highlight
            selectedBg: '#F6D365',    // warm amber highlight
            emptyBg: '#FFF9ED',       // warm off-white background
          },
        },
      },
      // Review timetable color settings (separate from main timetable)
      reviewTimetableTheme: {
        activePalette: 'default',
        palettes: {
          default: {
            errorBg: '#FCA5A5',
            dragBg: '#AFFF2C',
            lockBg: '#FEE2E2',
            sameSubjectBg: '#20B1AA',
            selectedBg: '#60A5FA',
            emptyBg: '#FFF9ED',
          },
          default_old: {
            errorBg: '#FCA5A5',
            dragBg: '#AFFF2C',
            lockBg: '#FEE2E2',
            sameSubjectBg: '#20B1AA',
            selectedBg: '#60A5FA',
            emptyBg: '#FFFFFF',
          },
          pastel: {
            errorBg: '#FFB3BA',
            dragBg: '#BAFFC9',
            lockBg: '#FFE0BA',
            sameSubjectBg: '#BFE6FF',
            selectedBg: '#C6C6FF',
            emptyBg: '#FFFFFF',
          },
          contrast: {
            errorBg: '#FF5C5C',
            dragBg: '#B4FF00',
            lockBg: '#FFB3B3',
            sameSubjectBg: '#00B3AD',
            selectedBg: '#1D4ED8',
            emptyBg: '#FFFFFF',
          },
          warm: {
            errorBg: '#F4B1B1',
            dragBg: '#FFF3B0',
            lockBg: '#FFE3B3',
            sameSubjectBg: '#F8E89A',
            selectedBg: '#F6D365',
            emptyBg: '#FFF9ED',
          },
        },
      },
      // Timetable structure settings (centralized)
      timetableConfig: {
        daysCount: 7,
        shifts: ["Ca Sáng", "Ca Chiều"],
        // Fallback periods per shift if per-shift not provided
        periodsPerShift: 5,
        // Per-shift periods aligned with `shifts` (index 0 -> shiftId 1)
        shiftPeriods: [5, 5],
        dayNames: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
      },
    }),
    actions: {
      setLoading(value) {
        this.loading.isActive = value;
      },
      setDetailLoading(value) {
        this.loading = value;
      },
      setMenu(value) {
        this.menu = value;
      },
      setPermissions(value) {
        this.permissions = value;
      },
      setCurrentPermission(value) {
        this.current_permission = value;
      },
      // Timetable theme actions
      setActiveTimetablePalette(key) {
        if (this.timetableTheme.palettes[key]) {
          this.timetableTheme.activePalette = key;
        }
      },
      setTimetablePalette(key, palette) {
        this.timetableTheme.palettes[key] = { ...palette };
      },
      updateTimetableColor(name, value) {
        const current = this.timetableTheme.palettes[this.timetableTheme.activePalette] || {};
        this.timetableTheme.palettes[this.timetableTheme.activePalette] = {
          ...current,
          [name]: value,
        };
      },
      // Review timetable theme actions
      setActiveReviewTimetablePalette(key) {
        if (this.reviewTimetableTheme.palettes[key]) {
          this.reviewTimetableTheme.activePalette = key;
        }
      },
      setReviewTimetablePalette(key, palette) {
        this.reviewTimetableTheme.palettes[key] = { ...palette };
      },
      updateReviewTimetableColor(name, value) {
        const current = this.reviewTimetableTheme.palettes[this.reviewTimetableTheme.activePalette] || {};
        this.reviewTimetableTheme.palettes[this.reviewTimetableTheme.activePalette] = {
          ...current,
          [name]: value,
        };
      },
      // Timetable config actions
      setTimetableConfig(partial) {
        this.timetableConfig = { ...this.timetableConfig, ...partial };
      },
      setTimetableDayNames(dayNames) {
        if (Array.isArray(dayNames) && dayNames.length) {
          this.timetableConfig.dayNames = [...dayNames];
        }
      },
      setTimetableShifts(shifts) {
        if (Array.isArray(shifts) && shifts.length) {
          this.timetableConfig.shifts = [...shifts];
          const def = this.timetableConfig.periodsPerShift || 5;
          const old = Array.isArray(this.timetableConfig.shiftPeriods) ? this.timetableConfig.shiftPeriods : [];
          this.timetableConfig.shiftPeriods = shifts.map((_, idx) => Number(old[idx]) > 0 ? Number(old[idx]) : def);
        }
      },
      setTimetableDaysCount(n) {
        if (typeof n === 'number' && n > 0) {
          this.timetableConfig.daysCount = n;
        }
      },
      setTimetablePeriodsPerShift(n) {
        if (typeof n === 'number' && n > 0) {
          this.timetableConfig.periodsPerShift = n;
        }
      },
      setTimetableShiftPeriods(periodsArr) {
        if (Array.isArray(periodsArr) && periodsArr.length) {
          const def = this.timetableConfig.periodsPerShift || 5;
          this.timetableConfig.shiftPeriods = periodsArr.map(v => Number(v) > 0 ? Number(v) : def);
        }
      },
      setTimetableShiftPeriodByIndex(index, n) {
        const idx = Number(index);
        if (Number.isInteger(idx) && idx >= 0 && typeof n === 'number' && n > 0) {
          const arr = Array.isArray(this.timetableConfig.shiftPeriods) ? [...this.timetableConfig.shiftPeriods] : [];
          while (arr.length <= idx) arr.push(this.timetableConfig.periodsPerShift || 5);
          arr[idx] = Number(n);
          this.timetableConfig.shiftPeriods = arr;
        }
      },
      // setPageBackground removed
    },
    getters: {
      menuItems: state => state.menu,
      menuPermissions: state => state.permissions,
      isLoading: state => state.loading.isActive,
      currentPermission: state => {
        const PERMISSION_STATE = { NO_ACCESS: 0, VIEW: 1, EDIT: 2 };
        return state.current_permission === PERMISSION_STATE.EDIT
      },
      activeTimetablePalette: state => {
        const { activePalette, palettes } = state.timetableTheme;
        return palettes[activePalette] || palettes.default;
      },
      activeReviewTimetablePalette: state => {
        const { activePalette, palettes } = state.reviewTimetableTheme;
        return palettes[activePalette] || palettes.default;
      },
      // pageBackground getter removed
    },
    // persist: {
    //   paths: ['timetableTheme'],
    // },
    // persist: {
    //   // storage: piniaPluginPersistedstate.localStorage(),
    //   storage: piniaPluginPersistedstate.cookies(),
    // },
  },
  // {
  //   persist: true,
  // },
);
