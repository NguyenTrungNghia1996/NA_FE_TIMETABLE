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
});
