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
      menu: [
        {
          id: 6,
          title: "Dashboard",
          key: "parent-6",
          url: "/dashboard",
          icon: "ant-design:project-outlined",
          children: [],
          stt: 4,
        },
        {
          id: 1,
          title: "System Settings",
          key: "parent-1",
          url: null,
          icon: "ant-design:setting-outlined",
          children: [
            {
              id: 2,
              title: "User Management",
              key: "child-2",
              url: "/settings/users",
              icon: "ant-design:user-outlined",
              stt: 1,
            },
          ],
          stt: 2,
        },
      ],
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
    },
    getters: {
      menuItems: state => state.menu,
      isLoading: state => state.loading.isActive,
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
