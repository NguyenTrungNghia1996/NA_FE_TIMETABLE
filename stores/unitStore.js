import { defineStore } from "pinia";

export const useUnitStore = defineStore("unit", {
  state: () => ({
    unit: null // Dữ liệu đơn vị: { _id, name, subdomain, active, ... }
  }),

  actions: {
    setUnit(data) {
      this.unit = data;
    },
    clearUnit() {
      this.unit = null;
    },
  },

  getters: {
    // unitId: (state) => state.unit?._id || null,
    // subdomain: (state) => state.unit?.subdomain || null,
    // isActive: (state) => state.unit?.active === true,
  },

  // Optional: persist qua reload nếu cần
  // persist: true,
});