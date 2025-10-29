import { defineStore } from "pinia";
export const useSettingStore = defineStore(
  "setting",
  {
    state: () => ({
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
      // Global page theme removed (no page background color)
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
      // pageBackground getter removed
    },
    // persist: {
    //   paths: ['timetableTheme'],
    // },
    persist: {
      // storage: piniaPluginPersistedstate.localStorage(),
      storage: piniaPluginPersistedstate.cookies(),
    },
  },
  {
    persist: true,
  },
);
