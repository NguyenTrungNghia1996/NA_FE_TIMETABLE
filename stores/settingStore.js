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
          permissionBit: 0,
          icon: "ant-design:dashboard-outlined",
          children: [],
        },
        {
          title: "Quản Lý Danh Mục",
          key: "category_management",
          url: null,
          permissionBit: 2,
          icon: "ant-design:appstore-outlined",
          children: [
            {
              title: "Cấp Học",
              key: "school_level",
              permissionBit: 0,
              url: "/category_management/school_level",
              icon: "ant-design:read-outlined",
            },
            {
              title: "Ca Học",
              key: "school_shift",
              permissionBit: 2,
              url: "/category_management/school_shift",
              icon: "ant-design:schedule-outlined",
            },
            {
              title: "Điểm Trường",
              key: "school_site",
              permissionBit: 4,
              url: "/category_management/school_site",
              icon: "ant-design:environment-outlined",
            },
            {
              title: "Loại Phòng Học",
              key: "classroom_type",
              permissionBit: 6,
              url: "/category_management/classroom_type",
              icon: "ant-design:home-outlined",
            },
            {
              title: "Khối Kiến Thức",
              key: "knowledge",
              permissionBit: 8,
              url: "/category_management/knowledge",
              icon: "ant-design:database-outlined",
            },
            {
              title: "Tổ Chuyên Môn",
              key: "expertise",
              permissionBit: 10,
              url: "/category_management/expertise",
              icon: "ant-design:team-outlined",
            },
            {
              title: "Khối lớp",
              key: "grade_level",
              permissionBit: 12,
              url: "/category_management/grade_level",
              icon: "ant-design:code-sandbox-outlined",
            },
            {
              title: "Phòng Học",
              key: "classroom",
              permissionBit: 14,
              url: "/category_management/classroom",
              icon: "ant-design:build-outlined",
            },
          ],
        },
        {
          title: "Cài đặt quản trị",
          key: "administration",
          url: null,
          permissionBit: 4,
          icon: "ant-design:setting-twotone",
          children: [
            {
              title: "Người Dùng",
              key: "user",
              permissionBit: 0,
              url: "/administration/user",
              icon: "ant-design:user-outlined",
            },
            {
              title: "Đơn Vị",
              key: "unit",
              permissionBit: 2,
              url: "/administration/unit",
              icon: "ant-design:apartment-outlined",
            },
            {
              title: "Menu",
              key: "menu",
              permissionBit: 4,
              url: "/administration/menu",
              icon: "ant-design:menu-outlined",
            },
            // permission
            {
              title: "Nhóm quyền",
              key: "permission",
              permissionBit: 4,
              url: "/administration/permission",
              icon: "ant-design:safety-outlined",
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
