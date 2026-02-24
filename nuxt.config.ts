// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: process.env.NODE_ENV !== "production" },
  app: {
    head: {
      htmlAttrs: {
        lang: "vi",
      },
      titleTemplate: "%s - VnTimeTable",
      title: "Nguyên Anh EST",
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "preload",
          as: "style",
          href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
          onload: "this.onload=null;this.rel='stylesheet'",
        },
        // { rel: "icon", type: "image/x-icon", href: "/logo.png" },
      ],
    },
  },
  antd: { extractStyle: true },
  css: ["~/assets/css/tailwind.css"],
  modules: [
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "@ant-design-vue/nuxt",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@vueuse/nuxt"
  ],
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
  routeRules: {
    "/": { prerender: true },
  },
  experimental: {
    payloadExtraction: true,
  },
  nitro: {
    compressPublicAssets: true,
  },
  vite: {
    build: {
      sourcemap: false
    }
  }
});
