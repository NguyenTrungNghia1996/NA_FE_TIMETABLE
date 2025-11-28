// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      titleTemplate: "%s - VnTimeTable",
      title: "Nguyên Anh EST",
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
        },
        // { rel: "icon", type: "image/x-icon", href: "/logo.png" },
      ],
    },
  },
  modules: [
    '@nuxt/icon',
    '@ant-design-vue/nuxt',
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate",
    "@vueuse/nuxt",
    "@nuxt/image"
  ],
  antd: { extractStyle: true },
  css: ["~/assets/css/tailwind.css"],
  runtimeConfig: {
    encryptionKey: process.env.NUXT_ENCRYPTION_KEY || "default-strong-key-32-chars-123456",
    public: {
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || "https://api.testtkb.nguyenanh-est.com",
      // Docker build/version info (injected via ENV or build args)
      buildTag: process.env.NUXT_PUBLIC_BUILD_TAG || "dev",
      buildSha: process.env.NUXT_PUBLIC_BUILD_SHA || "",
      buildTime: process.env.NUXT_PUBLIC_BUILD_TIME || "",
    },
    // https://api.testtkb.nguyenanh-est.com //https://api.dungthutkb.nguyenanh-est.com
  },
  vite: {
    build: {
      sourcemap: false
    }
  }
})