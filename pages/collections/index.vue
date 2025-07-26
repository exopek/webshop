<template>
  <div class="collections-overview">
    <div v-if="isLoading" class="loading">
      Collections werden geladen...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else>
      <!-- Builder.io Content falls verf�gbar -->
      <Content 
        v-if="builderContent"
        :api-key="apiKey"
        :model="model" 
        :content="builderContent"
        :data="builderData"
        :customComponents="registeredComponents"
      />
      
      <!-- Fallback: Standard Collections Grid -->
      <div v-else class="collections-grid">
        <h1>Alle Kategorien</h1>
        <div class="grid">
          <NuxtLink 
            v-for="collection in collections" 
            :key="collection.id"
            :to="`/collections/${collection.handle}`"
            class="collection-card"
          >
            <div class="collection-image">
              <img 
                v-if="collection.image" 
                :src="collection.image" 
                :alt="collection.title"
              />
              <div v-else class="no-image">
                {{ collection.title.charAt(0) }}
              </div>
            </div>
            
            <div class="collection-info">
              <h3>{{ collection.title }}</h3>
              <p v-if="collection.description" class="description text-xl text-primary">
                {{ collection.description }}
              </p>
              <span class="product-count">
                {{ collection.productsCount }} Produkte
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useShopifyStore } from '../../store/shopifyStore'
import { Content, fetchOneEntry } from '@builder.io/sdk-vue'
import { registeredComponents } from '../../plugins/builder-components'
import { useRuntimeConfig } from 'nuxt/app'

// Store und Daten
const shopifyStore = useShopifyStore()
const collections = ref<any[]>([])
const builderContent = ref<any>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

// Builder.io Konfiguration
const config = useRuntimeConfig()
const apiKey = config.public.BUILDER_API_KEY as string
const model = 'collections-overview'

// Builder.io Daten f�r Template
const builderData = computed(() => ({
  collections: collections.value,
  collectionsCount: collections.value.length
}))

// Collections laden
async function loadCollections() {
  try {
    isLoading.value = true
    error.value = null
    
    collections.value = await (shopifyStore as any).fetchAllCollections()
    console.log('Loaded collections:', collections.value)
  } catch (err) {
    console.error('Error loading collections:', err)
    error.value = 'Fehler beim Laden der Collections'
  } finally {
    isLoading.value = false
  }
}

// Builder.io Content laden
async function loadBuilderContent() {
  try {
    console.log('Loading Builder.io content for collections overview...')
    
    const content = await fetchOneEntry({
      model,
      apiKey,
      userAttributes: {
        urlPath: '/collections',
      },
      options: {
        cachebust: true
      }
    })
    
    builderContent.value = content
    console.log('Builder content loaded:', content)
  } catch (err) {
    console.log('Builder.io content not found, using fallback:', err)
  }
}

// Beim Mount laden
onMounted(async () => {
  await Promise.all([
    loadCollections(),
    loadBuilderContent()
  ])
})
</script>

<style scoped>
.collections-overview {
  padding: 2rem;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin: 2rem 0;
}

.error {
  background-color: #fee;
  color: #c33;
}

.collections-grid h1 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  color: #333;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.collection-card {
  display: block;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.collection-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.collection-image {
  height: 200px;
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
}

.collection-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  color: #999;
  background: linear-gradient(135deg, #f5f5f5, #e5e5e5);
}

.collection-info {
  padding: 1.5rem;
}

.collection-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.description {
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-count {
  color: #888;
  font-size: 0.85rem;
  font-weight: 500;
}
</style>