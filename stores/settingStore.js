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
          id: "1",
          title: "Dashboard",
          key: "parent-6",
          url: "/dashboard",
          icon: "ant-design:project-outlined",
          children: [],
        },
        {
          id: "2",
          title: "Quản Lý Danh Mục",
          key: "parent-1",
          url: null,
          icon: "ant-design:database-twotone",
          children: [
            {
              id: "2-2",
              title: "Người Dùng",
              key: "child-2-2",
              url: "/category_management/user",
              icon: "ant-design:user-outlined",
            },
            {
              id: "2-1",
              title: "Cấp Học",
              key: "child-2-1",
              url: "/category_management/school_level",
              icon: "ant-design:unordered-list-outlined",
            },
            {
              id: "2-3",
              title: "Ca Học",
              key: "child-2-3",
              url: "/category_management/school_shift",
              icon: "ant-design:calendar-twotone",
            },
            {
              id: "2-4",
              title: "Đơn Vị",
              key: "child-2-4",
              url: "/category_management/unit",
              icon: "ant-design:deployment-unit-outlined",
            },
            {
              id: "2-5",
              title: "Điểm Trường",
              key: "child-2-5",
              url: "/category_management/school_site",
              icon: "ant-design:environment-outlined",
            },
            {
              id: "2-6",
              title: "Loại Phòng Học",
              key: "child-2-6",
              url: "/category_management/classroom_type",
              icon: "ant-design:home-outlined",
            },
          ],
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
