<template>
    <div class="product-detail-container">
      <div v-if="isLoading" class="loading">Produkt wird geladen...</div>
      <div v-else-if="!product" class="not-found">Produkt nicht gefunden.</div>
      <div v-else>
        <!-- Hier verwenden wir ein einziges generisches Builder.io-Template -->
        <Content
          :api-key="apiKey" 
          model="product-detail-template" 
          :options="{
            data: {
              product: product,
              selectedVariant: selectedVariant,
              selectedOptions: selectedOptions,
              quantity: quantity,
              isAvailable: isAvailable
            },
            methods: {
              selectOption,
              incrementQuantity,
              decrementQuantity,
              addToCart,
              formatPrice
            }
          }"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useShopifyStore } from '../../store/shopifyStore'
  import { useRuntimeConfig } from 'nuxt/app'
  import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue'
  
  // Route und Store
  const route = useRoute()
  const shopifyStore = useShopifyStore()
  const config = useRuntimeConfig()
  
  // Produkt-Daten und Status
  const product = ref<any>(null)
  const isLoading = ref(true)
  const quantity = ref(1)
  const selectedOptions = ref<Record<string, string>>({})
  
  // Produkt-Handle aus der Route
  const handle = computed(() => route.params.id as string)

  const apiKey = 'b2253c87fe4d4111ad4211f05e4080bb';
  
  // Ausgewählte Variante basierend auf den gewählten Optionen
  const selectedVariant = computed(() => {
    if (!product.value || !product.value.variants) return null
    
    return product.value.variants.find((variant: any) => {
      return variant.selectedOptions.every((option: any) => {
        return selectedOptions.value[option.name] === option.value
      })
    })
  })
  
  // Verfügbarkeit basierend auf der gewählten Variante
  const isAvailable = computed(() => {
    if (selectedVariant.value) {
      return selectedVariant.value.availableForSale
    }
    return product.value?.available || false
  })
  
  // Produkt laden
  async function loadProduct() {
    isLoading.value = true
    
    try {
      // Produkt aus API laden
      product.value = await shopifyStore.fetchProduct(handle.value)
      
      // Standardoptionen auswählen (erste verfügbare Option für jede Option)
      if (product.value && product.value.options) {
        product.value.options.forEach((option: any) => {
          // Erste verfügbare Option auswählen
          for (const value of option.values) {
            if (isOptionValueAvailable(option.name, value)) {
              selectedOptions.value[option.name] = value
              break
            }
          }
        })
      }
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  // Prüfen, ob eine Optionskombination verfügbar ist
  function isOptionValueAvailable(optionName: string, optionValue: string) {
    if (!product.value || !product.value.variants) return false
    
    // Aktuelle Auswahl kopieren
    const testOptions = { ...selectedOptions.value }
    testOptions[optionName] = optionValue
    
    // Prüfen, ob es eine verfügbare Variante mit dieser Optionskombination gibt
    return product.value.variants.some((variant: any) => {
      // Prüfen, ob alle Optionen übereinstimmen
      const optionsMatch = variant.selectedOptions.every((option: any) => {
        return !testOptions[option.name] || testOptions[option.name] === option.value
      })
      
      return optionsMatch && variant.availableForSale
    })
  }
  
  // Option auswählen
  function selectOption(optionName: string, optionValue: string) {
    selectedOptions.value[optionName] = optionValue
  }
  
  // Menge erhöhen
  function incrementQuantity() {
    if (selectedVariant.value && quantity.value < selectedVariant.value.quantityAvailable) {
      quantity.value++
    } else if (!selectedVariant.value) {
      quantity.value++
    }
  }
  
  // Menge verringern
  function decrementQuantity() {
    if (quantity.value > 1) {
      quantity.value--
    }
  }
  
  // In den Warenkorb legen
  function addToCart() {
    if (!isAvailable.value) return
    
    const variantId = selectedVariant.value?.id || product.value.id
    const productToAdd = {
      id: variantId,
      title: product.value.title,
      variantTitle: selectedVariant.value?.title || '',
      price: selectedVariant.value?.price || product.value.price,
      image: selectedVariant.value?.image?.url || product.value.featured_image,
      quantity: quantity.value
    }
    
    // Hier Ihre Warenkorb-Logik implementieren
    console.log('Produkt zum Warenkorb hinzugefügt:', productToAdd)
  }
  
  // Preis formatieren
  function formatPrice(price: number) {
    if (!price) return '€0,00'
    
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }
  
  // Produkt bei Seitenaufruf laden
  onMounted(() => {
    loadProduct()
  })
  
  // Bei Änderung der Route (z.B. Navigation zu einem anderen Produkt) neu laden
  watch(() => route.params.handle, () => {
    if (route.params.handle) {
      loadProduct()
      // Zurücksetzen des Zustands
      selectedOptions.value = {}
      quantity.value = 1
    }
  })
  </script>
  
  <style scoped>
  .loading, .not-found {
    padding: 3rem;
    text-align: center;
    background-color: #f5f5f5;
    border-radius: 8px;
    margin: 2rem 0;
  }
  </style>
