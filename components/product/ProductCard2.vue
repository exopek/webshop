<template>
    <div class="product-card-wrapper">
      <Nuxt-link :to="`/products/${base64ProductId}`" class="product-link">
        <div class="product-card">
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
    })
    </script>
  
  <style scoped>
  .product-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }
  
  .product-card-wrapper {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .product-card {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  
  .product-image-container {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 133.33%; /* Seitenverhältnis 600:800 (800/600 = 1,3333...) */
    overflow: hidden;
  }
  
  .product-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .add-to-cart-button {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 12px 0;
    background-color: rgba(76, 175, 80, 0.9);
    color: white;
    border: none;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.3s ease;
    opacity: 0;
    transform: translateY(100%);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  .product-image-container:hover .add-to-cart-button {
    opacity: 1;
    transform: translateY(0);
  }
  
  .add-to-cart-button:hover {
    background-color: rgba(69, 160, 73, 1);
  }
  
  .product-info {
    padding: 15px;
  }
  
  .product-title {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
  
  .product-price {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .discounted {
    color: #e53935;
    font-weight: 600;
  }
  
  .compare-price {
    text-decoration: line-through;
    color: #999;
    font-size: 14px;
  }
  </style>
    