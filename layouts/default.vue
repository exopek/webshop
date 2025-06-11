<template>
  <div>
    <!-- Builder.io Header -->
    <Content 
      :model="'header'" 
      :content="header" 
      :api-key="apiKey" 
    />
    
    <!-- Fallback Header wenn Builder.io Content nicht verfügbar -->
    <Header v-if="!header || !apiKey" />
    
    <!-- Page Content -->
    <slot />
  </div>
</template>

<script setup>
import { Content, fetchOneEntry } from '@builder.io/sdk-vue'

const config = useRuntimeConfig()
const apiKey = config.public.BUILDER_API_KEY

// Fetch header content from Builder.io
const { data: header } = await useLazyAsyncData('header', async () => {
  console.log('Fetching header from Builder.io...')
  if (!apiKey) {
    console.warn('Builder.io API key is not set in runtime config.')
    return null
  }
  try {
    return await fetchOneEntry({
      model: 'header',
      apiKey: apiKey,
      options: {
        includeRefs: true
      }
    })
  } catch (err) {
    console.error('Failed to fetch header from Builder.io:', err)
    return null
  }
})
</script>