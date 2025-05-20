<template>
  <div class="product-grid">
    <div v-if="isLoading" class="loading">Produkte werden geladen...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="products.length === 0" class="empty">
      Keine Produkte gefunden
    </div>
    <template v-else>
      <div v-for="product in products" :key="product.id" class="product-item">
        <ProductCard :product="product" :api-key="apiKey" :model="model" @openCart="openCart"/>
      </div>
    </template>
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

const apiKey = 'b2253c87fe4d4111ad4211f05e4080bb';
const model = 'product-card';
const route = useRoute();

let content: any = null;

const cartOpen = computed(() => {
  console.log("Cart Open",isCartOpen.value);
  return isCartOpen.value;
});

function openCart() {
  console.log("Open Cart", isCartOpen.value);
  isCartOpen.value = true;
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
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Standard: 2 Elemente pro Zeile für mobile Geräte */
  gap: 20px;
}

/* Tablets (ab 768px) */
@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr); /* 3 Elemente pro Zeile für Tablets */
  }
}

/* Desktop (ab 1024px) */
@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(v-bind('props.productsPerRow'), 1fr); /* Dynamische Anzahl für Desktop */
  }
}

.loading, .error, .empty {
  grid-column: 1 / -1; /* Erstreckt sich über alle Spalten */
  text-align: center;
  padding: 20px;
}

.product-item {
  width: 100%;
}
</style>