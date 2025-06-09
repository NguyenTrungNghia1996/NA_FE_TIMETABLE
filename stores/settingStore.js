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
          title: "Dashboard",
          key: "dashboard",
          url: "/dashboard",
          bitIndex: 0,
          icon: "ant-design:project-outlined",
          children: [],
        },
        {
          title: "Quản Lý Danh Mục",
          key: "category_management",
          url: null,
          bitIndex: 2,
          icon: "ant-design:database-twotone",
          children: [
            {
              title: "Cấp Học",
              key: "school_level",
              bitIndex: 0,
              url: "/category_management/school_level",
              icon: "ant-design:unordered-list-outlined",
            },
            {
              title: "Ca Học",
              key: "school_shift",
              bitIndex: 2,
              url: "/category_management/school_shift",
              icon: "ant-design:calendar-twotone",
            },
            {
              title: "Điểm Trường",
              key: "school_site",
              bitIndex: 4,
              url: "/category_management/school_site",
              icon: "ant-design:environment-outlined",
            },
            {
              title: "Loại Phòng Học",
              key: "classroom_type",
              bitIndex: 6,
              url: "/category_management/classroom_type",
              icon: "ant-design:home-outlined",
            },
            {
              title: "Khối Kiến Thức",
              key: "knowledge",
              bitIndex: 8,
              url: "/category_management/knowledge",
              icon: "ant-design:database-outlined",
            },
            {
              title: "Tổ Chuyên Môn",
              key: "expertise",
              bitIndex: 10,
              url: "/category_management/expertise",
              icon: "ant-design:experiment-twotone",
            },
          ],
        },
        {
          title: "Cài đặt quản trị",
          key: "administration",
          url: null,
          bitIndex: 4,
          icon: "ant-design:setting-twotone",
          children: [
            {
              title: "Người Dùng",
              key: "user",
              bitIndex: 0,
              url: "/administration/user",
              icon: "ant-design:user-outlined",
            },
            {
              title: "Đơn Vị",
              key: "unit",
              bitIndex: 2,
              url: "/administration/unit",
              icon: "ant-design:deployment-unit-outlined",
            },
            {
              title: "Menu",
              key: "menu",
              bitIndex: 4,
              url: "/administration/menu",
              icon: "ant-design:menu-outlined",
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
