import { defineStore } from "pinia";
export const useUserStore = defineStore(
  "user",
  {
    state: () => ({
      user: {},
    }),
    actions: {
      setUser(value) {
        this.user = value;
      },
      logout() {
        this.user = {};
      },
    },
    getters: {
      token: state => {
        return state.user?.token || null;
      },
    },
    persist: {
      // storage: piniaPluginPersistedstate.localStorage(),
      storage: piniaPluginPersistedstate.cookies(),
    },
  },
  {
    persist: true,
  },
);
