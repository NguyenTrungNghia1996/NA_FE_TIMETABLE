import { useUserStore } from "~~/stores/userStore";
import { useSettingStore } from "~~/stores/settingStore";
import { useJwt } from "@vueuse/integrations/useJwt";
import { useMenu } from "~~/composables/useMenu";
const DEFAULT_PERMISSIONS = [
  {
    key: "menu",
    permissionValue: 21
  },
  {
    key: "menu-plvuxq63o0",
    permissionValue: 0
  },
  {
    key: "menu-c8u2jgnoto",
    permissionValue: 5461
  },
  {
    key: "menu-f5fh5fri05",
    permissionValue: 85
  }
];
export default defineNuxtRouteMiddleware(async to => {
  // Bỏ qua middleware nếu đang ở trang login
  // if (to.path === "/login" || to.path.startsWith("/test/")) return;
  if (to.path === "/login") return;
  const userStore = useUserStore();
  const settingStore = useSettingStore();
  const { loadMenu } = useMenu();
  const token = userStore.token;
  if (!token) return navigateTo("/login");
  try {
    const { payload } = useJwt(token);
    const isTokenValid = payload.value?.exp && Date.now() / 1000 < payload.value.exp;
    if (!isTokenValid) {
      userStore.logout();
      return navigateTo("/login");
    }
    if (settingStore.menu.length === 0) {
      await loadMenu();
    }
    if (settingStore.menuPermissions.length === 0) {
      settingStore.setPermissions(DEFAULT_PERMISSIONS);
    }
  } catch (error) {
    console.error("JWT validation error:", error);
    userStore.logout();
    return navigateTo("/login");
  }
});
