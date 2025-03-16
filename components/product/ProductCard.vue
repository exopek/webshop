<template>
    <div class="product-card">
      <Content 
        v-if="builderContent" 
        :content="builderContent" 
        :data="productData" 
        :api-key="apiKey" 
        :model="model"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { Content, fetchOneEntry } from '@builder.io/sdk-vue';
  // import { useRuntimeConfig } from 'nuxt/app'

  const builderContent = ref(null);
  const loadingError = ref(false);
  
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

const productData = computed(() => {
  // Füge hier alle Daten hinzu, die in der Builder.io-Karte verwendet werden sollen
  return {
    product: props.product,
    id: props.product.id,
    title: props.product.title,
    price: props.product.price,
    comparePrice: props.product.compare_at_price,
    onSale: props.product.on_sale,
    image: props.product.featured_image,
    // Weitere Produktdaten...
  };
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
  
  // Lade Tenant-Konfiguration und Produktdaten
  onMounted(async () => {
    loadBuilderContent();
  })
  </script>
  