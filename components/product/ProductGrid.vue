<template>
  <div class="product-grid-container">
    <!-- Filter Komponente -->
    <ProductFilter 
      :productCount="filteredProducts.length"
      @filterChange="handleFilterChange"
    />
    
    <!-- Product Grid -->
    <div class="product-grid">
      <div v-if="isLoading" class="loading">
        <div class="loading-spinner"></div>
        <p>Produkte werden geladen...</p>
      </div>
      <div v-else-if="error" class="error">
        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p>{{ error }}</p>
      </div>
      <div v-else-if="filteredProducts.length === 0" class="empty">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <p>Keine Produkte gefunden</p>
        <button @click="clearFilters" class="clear-filters-btn">Filter zurücksetzen</button>
      </div>
      <div v-else class="products-grid">
        <div v-for="product in filteredProducts" :key="product.id" class="product-item">
          <ProductCard :product="product" @openCart="openCart"/>
        </div>
      </div>
    </div>
    
    <Cart
      :isOpen="isCartOpen"
      @close="isCartOpen = false" />
  </div>
</template>
  
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted, ref, watch } from "vue";
import { useShopifyStore } from "../../store/shopifyStore";
import { useRoute } from "vue-router";

interface ProductGridProps {
  collection: string;
  productsPerRow: number;
  maxProducts: number;
  price: number;
}

const props = defineProps<ProductGridProps>();

// Store und Refs
const shopifyStore = useShopifyStore();
const { isLoading, error } = storeToRefs(shopifyStore);
const products = ref<any[]>([]);
const isCartOpen = ref(false);
const currentFilters = ref<any>({});

const apiKey = 'b2253c87fe4d4111ad4211f05e4080bb';
const model = 'product-card';
const route = useRoute();

// Computed für gefilterte und sortierte Produkte
const filteredProducts = computed(() => {
  let filtered = [...products.value];
  
  // Filter anwenden
  if (currentFilters.value.category) {
    filtered = filtered.filter(product => 
      product.category?.toLowerCase().includes(currentFilters.value.category.toLowerCase())
    );
  }
  
  if (currentFilters.value.minPrice) {
    filtered = filtered.filter(product => product.price >= currentFilters.value.minPrice);
  }
  
  if (currentFilters.value.maxPrice) {
    filtered = filtered.filter(product => product.price <= currentFilters.value.maxPrice);
  }
  
  if (currentFilters.value.available) {
    filtered = filtered.filter(product => product.available);
  }
  
  if (currentFilters.value.onSale) {
    filtered = filtered.filter(product => product.on_sale);
  }
  
  // Sortierung anwenden
  if (currentFilters.value.sortBy) {
    switch (currentFilters.value.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'title_asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'created_desc':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'created_asc':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
    }
  }
  
  return filtered;
});

function openCart() {
  console.log("Open Cart", isCartOpen.value);
  isCartOpen.value = true;
}

function handleFilterChange(filters: any) {
  currentFilters.value = filters;
}

function clearFilters() {
  currentFilters.value = {};
}

// Lade Produkte
async function loadProducts() {
  const query = route.query;
  products.value = await shopifyStore.fetchProducts({
    category: Array.isArray(query.category) ? query.category[0] as string : (query.category ?? '') as string,
    price: Array.isArray(query.price) ? parseFloat(query.price[0] as string) : parseFloat(query.price as string || '1000'),
    available: Array.isArray(query.available) ? query.available[0] === 'true' : query.available === 'true',
  });
  console.log("Product in Grid",products.value);
}

// Lade Produkte bei Komponenten-Initialisierung
onMounted(() => {
  loadProducts();
});

// Lade Produkte neu, wenn sich die Collection ändert
watch(
  () => props.collection,
  () => {
    loadProducts();
  }
);
</script>

<style scoped>
.product-grid-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.product-grid {
  min-height: 400px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

/* Responsive Grid */
@media (max-width: 640px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
}

@media (min-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (min-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(v-bind('props.productsPerRow || 4'), 1fr);
  }
}

/* Loading State */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  color: #6b7280;
  font-size: 1rem;
}

/* Error State */
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  background-color: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.error-icon {
  width: 3rem;
  height: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.error p {
  color: #dc2626;
  font-size: 1rem;
  margin: 0;
}

/* Empty State */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty p {
  color: #6b7280;
  font-size: 1rem;
  margin: 0 0 1rem 0;
}

.clear-filters-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.clear-filters-btn:hover {
  background-color: #2563eb;
}

.product-item {
  width: 100%;
}

/* Container Padding */
@media (max-width: 640px) {
  .product-grid-container {
    padding: 0.5rem;
  }
}
</style>