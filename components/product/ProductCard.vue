<template>
    <div :class="['product-card', `product-card--${displayMode}`, `tenant-${tenantId}`]">
      <div class="product-image" :style="imageStyle">
        <img :src="product?.featured_image || placeholder" :alt="product?.title" />
        <span v-if="product?.on_sale && showComparePrice" class="sale-badge">Sale</span>
      </div>
      
      <div class="product-info">
        <h3 class="product-title">{{ product?.title || 'Product Title' }}</h3>
        
        <div v-if="showRating && product?.rating" class="product-rating">
          <span>★★★★★</span>
          <span class="rating-number">{{ product?.rating || '4.5' }}</span>
        </div>
        
        <div v-if="showPrice" class="product-price">
          <span :class="{ 'discounted': product?.on_sale && showComparePrice }">
            {{ formatPrice(product?.price) }}
          </span>
          <span v-if="product?.on_sale && showComparePrice" class="compare-price">
            {{ formatPrice(product?.compare_at_price) }}
          </span>
        </div>
        
        <button :class="['add-to-cart', `btn-${buttonStyle}`]">
          Add to Cart
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  // import { useRuntimeConfig } from 'nuxt/app'
  
  // Props, die über Builder.io definiert werden können
  const props = defineProps({
    displayMode: {
      type: String,
      default: 'standard'
    },
    showRating: {
      type: Boolean,
      default: true
    },
    showPrice: {
      type: Boolean,
      default: true
    },
    showComparePrice: {
      type: Boolean,
      default: true
    },
    buttonStyle: {
      type: String,
      default: 'primary'
    },
    imageAspectRatio: {
      type: String,
      default: '1:1'
    },
    product: {
      type: Object,
      default: null
    }
  })
  
  // Tenant-spezifische Konfiguration
  /* const config = useRuntimeConfig()
  const tenantId = ref(config.public.TENANT_ID) */
  // const tenantConfig = ref({})
  
  // Produktdaten
  // const product = ref(null)
  const placeholder = '/images/product-placeholder.jpg'
  
  // Berechne CSS für Bildaspektverhältnis
  const imageStyle = computed(() => {
    const aspectRatioMap = {
      '1:1': '100%',
      '4:3': '75%',
      '16:9': '56.25%'
    }
  
    return {
      paddingBottom: aspectRatioMap[props.imageAspectRatio] || '100%'
    }
  })
  
  // Formatiere Preis basierend auf der Währung des Mandanten
  /* function formatPrice(price) {
    if (!price) return '$0.00'
    
    const currency = tenantConfig.value?.currency || 'USD'
    const locale = tenantConfig.value?.locale || 'en-US'
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(price)
  } */
  
  // Lade Tenant-Konfiguration und Produktdaten
  onMounted(async () => {
    // Tenant-Konfiguration laden
    /* const { loadTenantConfig } = await import('~/utils/tenant-config')
    tenantConfig.value = await loadTenantConfig() */
  })
  </script>
  
  <style scoped>
  /* Basis-Styling für die Produktkarte */
  .product-card {
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  /* Unterschiedliche Display-Modi */
  .product-card--standard {
    padding: 16px;
  }
  
  .product-card--compact {
    padding: 8px;
  }
  
  .product-card--detailed {
    padding: 24px;
  }
  
  /* Schaltflächen-Stile */
  .btn-primary {
    background-color: var(--primary-color, #4a4af4);
    color: white;
  }
  
  .btn-secondary {
    background-color: transparent;
    border: 1px solid var(--primary-color, #4a4af4);
    color: var(--primary-color, #4a4af4);
  }
  
  .btn-text {
    background-color: transparent;
    color: var(--primary-color, #4a4af4);
    padding: 0;
    text-decoration: underline;
  }
  
  /* Tenant-spezifische Überschreibungen können hier hinzugefügt werden */
  .tenant-tenant1 .product-card {
    --primary-color: #FF5733;
  }
  
  .tenant-tenant2 .product-card {
    --primary-color: #33FF57;
  }
  </style>