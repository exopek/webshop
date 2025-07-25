<template>
  <div class="collection-page">
    <div v-if="isLoading" class="loading">
      Collection wird geladen...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="!collection" class="not-found">
      Collection nicht gefunden.
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
      
      <!-- Fallback: Standard Collection Page -->
      <div v-else class="collection-fallback">
        <!-- Collection Header -->
        <div class="collection-header">
          <div v-if="collection.image" class="collection-banner">
            <img :src="collection.image" :alt="collection.title" />
          </div>
          
          <div class="collection-info">
            <h1>{{ collection.title }}</h1>
            <p v-if="collection.description" class="description">
              {{ collection.description }}
            </p>
            <span class="product-count">
              {{ collection.productsCount }} Produkte
            </span>
          </div>
        </div>
        
        <!-- Products Grid -->
        <div class="products-section">
          <div v-if="isLoadingProducts" class="loading-products">
            Produkte werden geladen...
          </div>
          
          <div v-else-if="products.length === 0" class="no-products">
            Keine Produkte in dieser Collection gefunden.
          </div>
          
          <div v-else class="products-grid">
            <NuxtLink 
              v-for="product in products" 
              :key="product.id"
              :to="`/products/${product.handle}`"
              class="product-card"
            >
              <div class="product-image">
                <img 
                  v-if="product.featured_image" 
                  :src="product.featured_image" 
                  :alt="product.title"
                />
                <div v-else class="no-image">
                  {{ product.title.charAt(0) }}
                </div>
                
                <div v-if="product.on_sale" class="sale-badge">
                  Sale
                </div>
              </div>
              
              <div class="product-info">
                <h3>{{ product.title }}</h3>
                <div class="price">
                  <span 
                    v-if="product.on_sale && product.compare_at_price" 
                    class="original-price"
                  >
                    {{ formatPrice(product.compare_at_price) }}
                  </span>
                  <span class="current-price">
                    {{ formatPrice(product.price) }}
                  </span>
                </div>
                <div class="availability">
                  <span v-if="product.available" class="in-stock">
                    Verf�gbar
                  </span>
                  <span v-else class="out-of-stock">
                    Ausverkauft
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useShopifyStore } from '../../store/shopifyStore'
import { Content, fetchOneEntry } from '@builder.io/sdk-vue'
import { registeredComponents } from '../../plugins/builder-components'
import { useRuntimeConfig } from 'nuxt/app'

// Route und Store
const route = useRoute()
const shopifyStore = useShopifyStore()

// Daten
const collection = ref<any>(null)
const products = ref<any[]>([])
const builderContent = ref<any>(null)
const isLoading = ref(true)
const isLoadingProducts = ref(false)
const error = ref<string | null>(null)

// Slug aus Route
const slug = computed(() => route.params.slug as string)

// Builder.io Konfiguration
const config = useRuntimeConfig()
const apiKey = config.public.BUILDER_API_KEY as string
const model = 'collection-page'

// Builder.io Daten f�r Template
const builderData = computed(() => ({
  collection: collection.value,
  products: products.value,
  productsCount: products.value.length,
  slug: slug.value
}))

// Collection laden
async function loadCollection() {
  try {
    isLoading.value = true
    error.value = null
    
    console.log('Loading collection:', slug.value)
    collection.value = await (shopifyStore as any).fetchCollection(slug.value)
    
    if (!collection.value) {
      error.value = 'Collection nicht gefunden'
      return
    }
    
    console.log('Loaded collection:', collection.value)
  } catch (err) {
    console.error('Error loading collection:', err)
    error.value = 'Fehler beim Laden der Collection'
  } finally {
    isLoading.value = false
  }
}

// Produkte der Collection laden
async function loadCollectionProducts() {
  if (!collection.value) return
  
  try {
    isLoadingProducts.value = true
    
    console.log('Loading products for collection:', slug.value)
    products.value = await (shopifyStore as any).fetchProductsByCollection(slug.value, 24)
    
    console.log('Loaded products:', products.value)
  } catch (err) {
    console.error('Error loading collection products:', err)
  } finally {
    isLoadingProducts.value = false
  }
}

// Builder.io Content laden
async function loadBuilderContent() {
  try {
    console.log('Loading Builder.io content for collection:', slug.value)
    
    // Versuche verschiedene URL-Patterns
    let content = null
    
    // 1. Spezifische Collection URL
    try {
      content = await fetchOneEntry({
        model,
        apiKey,
        userAttributes: {
          urlPath: route.path,
        },
        options: {
          cachebust: true
        }
      })
    } catch (err) {
      console.log('Specific URL targeting failed:', err)
    }
    
    // 2. Wildcard Pattern f�r Collections
    if (!content) {
      try {
        content = await fetchOneEntry({
          model,
          apiKey,
          userAttributes: {
            urlPath: '/collections/*',
          },
          options: {
            cachebust: true
          }
        })
      } catch (err) {
        console.log('Wildcard pattern failed:', err)
      }
    }
    
    builderContent.value = content
    console.log('Builder content loaded:', content)
  } catch (err) {
    console.log('Builder.io content not found, using fallback:', err)
  }
}

// Preis formatieren
function formatPrice(price: number): string {
  if (!price) return '�0,00'
  
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

// Beim Mount laden
onMounted(async () => {
  await loadCollection()
  await Promise.all([
    loadCollectionProducts(),
    loadBuilderContent()
  ])
})

// Bei �nderung der Route neu laden
watch(
  () => route.params.slug,
  async () => {
    if (route.params.slug) {
      await loadCollection()
      await Promise.all([
        loadCollectionProducts(),
        loadBuilderContent()
      ])
    }
  }
)
</script>

<style scoped>
.collection-page {
  min-height: 100vh;
}

.loading, .error, .not-found {
  text-align: center;
  padding: 3rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin: 2rem;
}

.error {
  background-color: #fee;
  color: #c33;
}

.not-found {
  background-color: #f0f8ff;
  color: #666;
}

/* Collection Header */
.collection-header {
  margin-bottom: 3rem;
}

.collection-banner {
  height: 300px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.collection-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.collection-info {
  text-align: center;
  padding: 0 2rem;
}

.collection-info h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.collection-info .description {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.product-count {
  color: #888;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Products Section */
.products-section {
  padding: 0 2rem 2rem;
}

.loading-products, .no-products {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.product-card {
  display: block;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.product-image {
  height: 250px;
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
}

.product-image img {
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

.sale-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #e74c3c;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.product-info {
  padding: 1.5rem;
}

.product-info h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
}

.price {
  margin-bottom: 0.5rem;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  margin-right: 0.5rem;
  font-size: 0.9rem;
}

.current-price {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.availability {
  font-size: 0.85rem;
}

.in-stock {
  color: #27ae60;
  font-weight: 500;
}

.out-of-stock {
  color: #e74c3c;
  font-weight: 500;
}
</style>