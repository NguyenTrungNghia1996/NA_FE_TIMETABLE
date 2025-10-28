// import { useUserStore } from "~~/stores/userStore";
// import { useSettingStore } from "~~/stores/settingStore";
// import { useUnitStore } from "~~/stores/unitStore";
// import { useJwt } from "@vueuse/integrations/useJwt";
// import { useMenu } from "~~/composables/useMenu";
// export default defineNuxtRouteMiddleware(async to => {
//   const unitStore = useUnitStore();
//   const reqHeaders = useRequestHeaders();
//   const host = reqHeaders['host'] || '';
//   const subdomain = host.split('.')[0];
//   unitStore.setUnit(subdomain)
//   console.log(subdomain);
//   // Bỏ qua middleware nếu đang ở trang login
//   // if (to.path === "/login" || to.path.startsWith("/test/")) return;
//   if (to.path === "/login") return;
//   const userStore = useUserStore();
//   const settingStore = useSettingStore();
//   const { loadMenu } = useMenu();
//   const { loadPermissions, setPermissions } = usePermissions();
//   const token = userStore.token;
//   if (!token) return navigateTo("/login");
//   try {
//     const { payload } = useJwt(token);
//     const isTokenValid = payload.value?.exp && Date.now() / 1000 < payload.value.exp;
//     if (!isTokenValid) {
//       userStore.logout();
//       return navigateTo("/login");
//     }
//     if (settingStore.menu.length === 0) {
//       await loadMenu();
//     }
//     if (settingStore.menuPermissions.length === 0) {
//       await loadPermissions()
//       // setPermissions()
//     }
//   } catch (error) {
//     console.error("JWT validation error:", error);
//     userStore.logout();
//     return navigateTo("/login");
//   }
// });
// middleware/auth.global.js
import { useUserStore } from "~~/stores/userStore";
import { useSettingStore } from "~~/stores/settingStore";
import { useUnitStore } from "~~/stores/unitStore";
import { useJwt } from "@vueuse/integrations/useJwt";
import { useMenu } from "~~/composables/useMenu";
function getHostname() {
  const url = useRequestURL();
  const headers = useRequestHeaders() || {};
  const raw =
    headers["host"] ||
    url.host ||
    "";
  return (raw.split(",")[0] || "").trim().split(":")[0] || "";
}

export default defineNuxtRouteMiddleware(async (to) => {
  const unitStore = useUnitStore();
  const hostname = getHostname();
  const sub = hostname.split('.')[0];
  unitStore.setUnit(sub || "default");


  // 2) Bỏ qua route public
  if (to.path === "/login" || to.path.startsWith("/test/")) return;

  // 3) Auth + nạp menu/quyền
  const userStore = useUserStore();
  const settingStore = useSettingStore();
  const { loadMenu } = useMenu();
  const { loadPermissions, setPermissions } = usePermissions();

  const token = userStore.token;
  if (!token) return navigateTo("/login");

  try {
    const { payload } = useJwt(token);
    const exp = payload.value && payload.value.exp;
    const isTokenValid = typeof exp === "number" && Date.now() / 1000 < exp;
    if (!isTokenValid) {
      userStore.logout();
      return navigateTo("/login");
    }

    const tasks = [];
    if (!settingStore.menu?.length) tasks.push(loadMenu());
    if (!settingStore.menuPermissions?.length) tasks.push(loadPermissions());
    if (tasks.length) await Promise.all(tasks);

    if (typeof setPermissions === "function" && settingStore.menuPermissions?.length) {
      setPermissions(settingStore.menuPermissions);
    }
  } catch (error) {
    // console.error("JWT validation error:", error);
    userStore.logout();
    return navigateTo("/login");
  }

  // 4) Chặn truy cập nếu không có quyền với URL
  try {
    if (to.path === "/dashboard") {
      return; // bỏ qua kiểm tra quyền cho /dashboard
    }
    const menuTree = Array.isArray(settingStore.menu) ? settingStore.menu : [];
    const permissionsArr = Array.isArray(settingStore.permissions) ? settingStore.permissions : [];

    // Map { key: permissionValue }
    const permissionMap = {};
    for (const p of permissionsArr) {
      if (p && typeof p.key === "string") permissionMap[p.key] = p.permissionValue ?? 0;
    }

    // Tìm node theo path (hỗ trợ dynamic :param)
    const findMenuPathByRoute = (items, path) => {
      for (const item of items) {
        if (item?.url === path) return [item];
        if (item?.url && item.url.includes(":")) {
          const base = item.url.split(":")[0];
          if (path.startsWith(base)) return [item];
        }
        const children = Array.isArray(item?.children) ? item.children : [];
        if (children.length) {
          const found = findMenuPathByRoute(children, path);
          if (found.length) return [item, ...found];
        }
      }
      return [];
    };

    const chain = findMenuPathByRoute(menuTree, to.path);
    if (chain.length) {
      const current = chain[chain.length - 1];
      const parentKey = chain.length > 1 ? chain[chain.length - 2]?.key : "menu";
      const parentPermVal = permissionMap[parentKey] ?? 0;
      const bit = typeof current?.permissionBit === "number" ? current.permissionBit : null;

      // Nếu có permissionBit thì tính trạng thái, ngược lại cho phép truy cập
      if (bit !== null) {
        const currentPermission = (parentPermVal >> bit) & 0b11; // 0: none, 1: view, 2: edit
        // Lưu permission hiện tại vào store (phục vụ UI tắt/bật nút)
        if (typeof useSettingStore === "function") {
          try { settingStore.setCurrentPermission(currentPermission); } catch { }
        }
        if (currentPermission === 0) {
          // Không có quyền => chuyển về dashboard
          return navigateTo("/dashboard");
        }
      }
    }
  } catch (e) {
    // Trong trường hợp lỗi tính quyền, vẫn cho qua thay vì chặn nhầm
  }
});
