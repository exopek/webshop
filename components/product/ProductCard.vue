<template>
  <div class="product-card-wrapper" :data-on-sale="productData.onSale" :data-available="productData.available">
    <Nuxt-link :to="`/products/${base64ProductId}`" class="product-link">
      <div class="product-card">
        <Content 
          v-if="builderContent" 
          :content="builderContent" 
          :data="productData" 
          :api-key="apiKey" 
          :model="model"
          :context="{
            addToCart,
          }"
        />
        
        <div class="product-image-container">
          <img
            :src="productData.image || 'https://placehold.co/600x800'"
            :alt="productData.title"
            class="product-image"
          />
          <!-- Button innerhalb des Containers, aber mit event.stop -->
          <button @click.stop.prevent="addToCart" class="add-to-cart-button">
            {{addToCartButtonText}}
          </button>
        </div>
        <div class="product-info">
          <h3 class="product-title">{{ productData.title }}</h3>
          <div class="product-price">
            <span :class="{ discounted: productData.onSale }">{{
              formatPrice(productData.price)
            }}</span>
            <span v-if="productData.onSale" class="compare-price">{{
              formatPrice(productData.comparePrice)
            }}</span>
          </div>
        </div>
      </div>
    </Nuxt-link>
  </div>
</template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { Content, fetchOneEntry } from '@builder.io/sdk-vue';
  import { useShopifyCardStore } from '../../store/shopifyCardStore';
  // import { useRuntimeConfig } from 'nuxt/app'

  const shopifyCardStore = useShopifyCardStore();
  const builderContent = ref(null);
  const loadingError = ref(false);
  const isLoading = ref(false);
  const route = useRoute();
  
  // Props, die über Builder.io definiert werden können
  const props = defineProps({
  // Das Produkt aus dem Grid
  product: {
    type: Object,
    required: true
  },
  // Builder.io API-Key
  apiKey: {
    type: String,
    required: true
  },
  // Builder.io Modell für die Karte
  model: {
    type: String,
    default: 'product-card'
  }
});

const emit = defineEmits(['openCart']);

const productData = computed(() => {
  // Füge hier alle Daten hinzu, die in der Builder.io-Karte verwendet werden sollen
  console.log("Props of Product",props.product);
  return {
    product: props.product,
    id: props.product.id,
    title: props.product.title,
    price: props.product.price,
    comparePrice: props.product.price,
    onSale: props.product.on_sale,
    image: props.product.featured_image,
    available: props.product.available,
    // Weitere Produktdaten...
  };
});

const addToCartButtonText = computed(() => {
  return isLoading.value ? 'Adding...' : props.product.available ? 'Add to Cart' : 'Out of Stock';
});

const base64ProductId = computed(() => {
  return btoa(props.product.id);
});

// Lade die Builder.io-Produktkarte
async function loadBuilderContent() {
  try {
    // Builder.io-Content für die Produktkarte abrufen
    // Wir verwenden product.id als Target, sodass du produktspezifische Karten erstellen kannst
    const response = await fetchOneEntry({
      model: props.model,
      apiKey: props.apiKey,
      query: {
        target: props.isDefault
      },
      userAttributes: {
        isDefault: true
      },
      options: {
        cachebust: true // Verhindert Caching, wichtig für Entwicklung
      }
    });
    
    builderContent.value = response;
    
    // Wenn kein Content gefunden wurde, versuchen wir es mit einer Standard-Karte
    if (!builderContent.value) {
      const defaultResponse = await fetchOneEntry({
        model: props.model,
        apiKey: props.apiKey,
        userAttributes: {
          isDefault: false // Ein Flag für deine Standard-Produktkarte
        }
      });
      
      builderContent.value = defaultResponse;
    }
  } catch (error) {
    console.error('Fehler beim Laden der Builder.io-Produktkarte:', error);
    loadingError.value = true;
    emit('error', error);
  }
}

async function addToCart() {
  console.log("In den Warenkorb legen");
  if (!props.product.available) return;

  console.log("Produkt zum Warenkorb hinzufügen...", props.product);
  const variantId = props.product.variant_id;

  try {
    // Produkt add to cart
    await shopifyCardStore.addToCart(variantId, 1);

    // Warenkorb öffnen
    console.log("Warenkorb öffnen");
    emit('openCart');
  
  } catch (error) {
    console.error("Error adding to  art:", error);
  } finally {
    isLoading.value = false;
  }

}

// Formatiere Preis
function formatPrice(price) {
  if (!price) return "$0.00";

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}
  
  // Lade Tenant-Konfiguration und Produktdaten
  onMounted(async () => {
    loadBuilderContent();
  })
  </script>

<style scoped>
.product-link {
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
}

.product-card-wrapper {
  position: relative;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  transition: all 0.3s ease;
}

.product-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  background: white;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.product-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f8fafc;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.add-to-cart-button {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(1rem);
  backdrop-filter: blur(10px);
}

.product-image-container:hover .add-to-cart-button {
  opacity: 1;
  transform: translateY(0);
}

.add-to-cart-button:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.add-to-cart-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.product-info {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-title {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
}

.product-price > span:first-child {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
}

.discounted {
  color: #dc2626 !important;
}

.compare-price {
  text-decoration: line-through;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Sale Badge */
.product-image-container::before {
  content: 'SALE';
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 10;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
}

.product-card-wrapper[data-on-sale="true"] .product-image-container::before {
  opacity: 1;
  transform: scale(1);
}

/* Availability indicator */
.product-card-wrapper[data-available="false"] {
  opacity: 0.7;
}

.product-card-wrapper[data-available="false"] .product-image-container::after {
  content: 'Ausverkauft';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .product-info {
    padding: 1rem;
  }
  
  .product-title {
    font-size: 0.925rem;
  }
  
  .add-to-cart-button {
    bottom: 0.75rem;
    left: 0.75rem;
    right: 0.75rem;
    padding: 0.625rem;
    font-size: 0.8rem;
  }
}
</style>
  