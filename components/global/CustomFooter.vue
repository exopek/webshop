<template>
    <div class="custom-footer">
      <BuilderComponent 
      v-if="builderContent"
      :content="content"
      :api-key="props.apiKey"
      :model="props.model"
      :data="{ ...content.data }"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { Content, fetchOneEntry } from '@builder.io/sdk-vue';
  // import { useRuntimeConfig } from 'nuxt/app'

  const builderContent = ref(null);
  const loadingError = ref(false);

  const props = defineProps({
    apiKey: {
      type: String,
      required: true
    },
    model: {
      type: String,
      default: 'footer'
    }
  });

// Lade die Builder.io-Produktkarte
async function loadBuilderContent() {
  try {
    const response = await fetchOneEntry({
      model: 'footer',
      apiKey: 'b2253c87fe4d4111ad4211f05e4080bb',
      userAttributes: {
        isDefault: true
      },
      options: {
        cachebust: true // Verhindert Caching, wichtig für Entwicklung
      }
    });

    console.log('Builder.io Footer:', response);
    
    builderContent.value = response;
    
    // Wenn kein Content gefunden wurde, versuchen wir es mit einer Standard-Karte
    if (!builderContent.value) {
      const defaultResponse = await fetchOneEntry({
        model: 'footer',
        apiKey: 'b2253c87fe4d4111ad4211f05e4080bb',
        userAttributes: {
          isDefault: false // Ein Flag für deine Standard-Produktkarte
        }
      });
      
      builderContent.value = defaultResponse;
    }
  } catch (error) {
    console.error('Fehler beim Laden der Builder.io-Footer:', error);
    loadingError.value = true;
    emit('error', error);
  }
}
  
  // Lade Tenant-Konfiguration und Produktdaten
  onMounted(async () => {
    loadBuilderContent();
  })
  </script>
  