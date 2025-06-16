import { useSettingStore } from "~/stores/settingStore";
import useApi from "~/composables/useApi";

export const usePermissions = () => {
  const { RestApi } = useApi();
  const settingStore = useSettingStore();

  const loadPermissions = async roleIds => {
    const ids = Array.isArray(roleIds) ? roleIds : [roleIds];
    const allPerms = [];
    for (const id of ids) {
      if (!id) continue;
      try {
        const { data } = await RestApi.roles.detail({ params: { id } });
        if (data.value?.status === "success") {
          const perms = data.value.data.permission || [];
          allPerms.push(...perms);
        }
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
    settingStore.setPermissions(merged);
    return merged;
  };

  const setPermissions = perms => {
    settingStore.setPermissions(perms);
  };

  return { loadPermissions, setPermissions };
};
