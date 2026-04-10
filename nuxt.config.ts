// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  modules: ["@nuxt/ui", "@nuxt/image"],

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  compatibilityDate: "2025-01-15",
  vite: {
    optimizeDeps: {
      force: true,
    },
  },
});
