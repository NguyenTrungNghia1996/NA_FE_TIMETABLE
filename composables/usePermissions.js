import { useSettingStore } from "~/stores/settingStore";
import useApi from "~/composables/useApi";

export const usePermissions = () => {
  const { RestApi } = useApi();
  const settingStore = useSettingStore();
  const DEFAULT_PERMISSIONS =
    // [
    //   {
    //     "key": "menu",
    //     "permissionValue": 42
    //   },
    //   {
    //     "key": "menu-plvuxq63o0",
    //     "permissionValue": 0
    //   },
    //   {
    //     "key": "menu-c8u2jgnoto",
    //     "permissionValue": 2796202
    //   },
    //   {
    //     "key": "menu-f5fh5fri05",
    //     "permissionValue": 170
    //   }
    // ];
    [
      {
        "key": "menu",
        "permissionValue": 11184810
      },
      {
        "key": "menu-plvuxq63o0",
        "permissionValue": 0
      },
      {
        "key": "menu-c8u2jgnoto",
        "permissionValue": 715827883
      },
      {
        "key": "menu-f5fh5fri05",
        "permissionValue": 170
      },
      {
        "key": "menu-uo6qpdsokz",
        "permissionValue": 2
      },
      {
        "key": "menu-0b2mfbuz99",
        "permissionValue": 2
      },
      {
        "key": "menu-wejufr0sjj",
        "permissionValue": 170
      },
      {
        "key": "menu-thpw1w4jwz",
        "permissionValue": 2
      },
      {
        "key": "menu-he9uf7muku",
        "permissionValue": 0
      },
      {
        "key": "menu-t46urvaqzl",
        "permissionValue": 2730
      },
      {
        "key": "menu-v3hzdg1pob",
        "permissionValue": 10
      },
      {
        "key": "menu-82y00wdbmj",
        "permissionValue": 11
      },
      {
        "key": "menu-irfvkq3395",
        "permissionValue": 43690
      }
    ];
  const loadPermissions = async () => {
    try {
      const { data: res } = await RestApi.user.permission()
      const permission = res?.value?.data?.permission
      if (permission) {
        settingStore.setPermissions(permission)
      } else {
        console.warn('Không có dữ liệu permission trả về')
      }
    } catch (error) {
      console.error('Lỗi loadPermissions:', error)
    }
  }

  const setPermissions = perms => {
    settingStore.setPermissions(perms || DEFAULT_PERMISSIONS);
    // settingStore.setPermissions(DEFAULT_PERMISSIONS);
  };

  return { loadPermissions, setPermissions };
};
