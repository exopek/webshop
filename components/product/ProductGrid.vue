<template>
  <div class="product-grid" :style="gridStyle">
    <div v-if="isLoading" class="loading">Produkte werden geladen...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="products.length === 0" class="empty">
      Keine Produkte gefunden
    </div>
    <template v-else>
      <div v-for="product in products" :key="product.id" class="product-item">
        <ProductCard :product="product" :api-key="apiKey" :model="model" />
         
        <!-- Hier können Sie eine ProductCard-Komponente einfügen oder direkt das Produkt anzeigen -->
        <!-- <div class="product-card">
          <div class="product-image">
            <img
              :src="product.featured_image || '/images/placeholder.jpg'"
              :alt="product.title"
            />
          </div>
          <div class="product-info">
            <h3 class="product-title">{{ product.title }}</h3>
            <div class="product-price">
              <span :class="{ discounted: product.on_sale }">{{
                formatPrice(product.price)
              }}</span>
              <span v-if="product.on_sale" class="compare-price">{{
                formatPrice(product.compare_at_price)
              }}</span>
            </div>
          </div>
        </div> -->
      </div>
    </template>
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

const apiKey = 'b2253c87fe4d4111ad4211f05e4080bb';
const model = 'product-card';
const route = useRoute();

let content: any = null;

// Grid-Styling basierend auf Produkten pro Zeile
const gridStyle = computed(() => {
  return {
    display: "grid",
    gridTemplateColumns: `repeat(${props.productsPerRow}, 1fr)`,
    gap: "20px",
  };
});

// Lade Produkte
async function loadProducts() {
  products.value = await shopifyStore.fetchProducts(
  );
}

// Formatiere Preis
function formatPrice(price: number) {
  if (!price) return "$0.00";

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
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
