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
      currentPermission: 0,
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
        this.currentPermission = value;
      },
    },
    getters: {
      menuItems: state => state.menu,
      menuPermissions: state => state.permissions,
      isLoading: state => state.loading.isActive,
      currentPermission: state => state.currentPermission,
    },
    // persist: {
    //   // storage: piniaPluginPersistedstate.localStorage(),
    //   storage: piniaPluginPersistedstate.cookies(),
    // },
  },
  // {
  //   persist: true,
  // },
);
