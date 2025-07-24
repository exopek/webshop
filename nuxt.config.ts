// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@builder.io/sdk-vue/nuxt', '@pinia/nuxt'],
  nitro: {
    static: true,
    preset: 'static'
  },
  runtimeConfig: {
    public: {
      TENANT_ID: process.env.TENANT_ID || 'default',
      BUILDER_API_KEY: process.env.BUILDER_API_KEY,
      
      // Shopify-Konfiguration
      shopify: {
        domain: process.env.SHOPIFY_DOMAIN,
        apiVersion: process.env.SHOPIFY_API_VERSION || '2023-10'
      },
      shopifyAccessToken: process.env.SHOPIFY_ACCESS_TOKEN
    },
    // Private Konfiguration (nur auf dem Server verfügbar)
    
  },
})
