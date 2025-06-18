import { useSettingStore } from "~/stores/settingStore";
import useApi from "~/composables/useApi";

export const usePermissions = () => {
  const { RestApi } = useApi();
  const settingStore = useSettingStore();
  const DEFAULT_PERMISSIONS =
    [
      {
        "key": "menu",
        "permissionValue": 42
      },
      {
        "key": "menu-plvuxq63o0",
        "permissionValue": 0
      },
      {
        "key": "menu-c8u2jgnoto",
        "permissionValue": 699050
      },
      {
        "key": "menu-f5fh5fri05",
        "permissionValue": 170
      }

    ];
  const loadPermissions = async roleIds => {
    const ids = Array.isArray(roleIds) ? roleIds : [roleIds];
    const allPerms = [];
    for (const id of ids) {
      if (!id) continue;
      try {
        const { data } = await RestApi.roles.detail({ params: { id: id } });
        if (data.value?.status === "success") {
          const perms = data.value.data.permission || [];
          allPerms.push(...perms);
        }
        // console.log("🚀 ~ usePermissions ~ data:", data)
      } catch (e) {
        console.error("Failed to load permissions", e);
      }
    }
    const map = new Map();
    for (const { key, permissionValue } of allPerms) {
      map.set(key, (map.get(key) || 0) | permissionValue);
    }
    const merged = Array.from(map).map(([key, permissionValue]) => ({
      key,
      permissionValue,
    }));
    // settingStore.setPermissions(merged);
    settingStore.setPermissions(DEFAULT_PERMISSIONS);
    return merged;
  };

  const setPermissions = perms => {
    // settingStore.setPermissions(perms ||DEFAULT_PERMISSIONS);
    settingStore.setPermissions(DEFAULT_PERMISSIONS);
  };

  return { loadPermissions, setPermissions };
};
