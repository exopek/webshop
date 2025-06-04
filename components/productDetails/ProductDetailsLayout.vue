<template>
  <div class="product-details-layout bg-gray-50 py-8 lg:py-16">
    <div class="container mx-auto px-4 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        <!-- Produktbilder -->
        <div class="order-1 lg:order-1">
          <div class="space-y-6">
            <!-- Hauptbild -->
            <div class="relative">
              <img 
                :src="currentImage" 
                :alt="product?.title || 'Product'"
                class="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>

            <!-- Thumbnail Grid -->
            <div v-if="product?.images && product.images.length > 1" class="grid grid-cols-4 gap-2 sm:gap-4">
              <button 
                v-for="(image, index) in product.images" 
                :key="index"
                @click="currentImageIndex = index"
                :class="[
                  'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                  currentImageIndex === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <img 
                  :src="image" 
                  :alt="`${product?.title || 'Product'} view ${index + 1}`"
                  class="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Produktinformationen -->
        <div class="order-2 lg:order-2">
          <ProductDetailsInfo
            :product="product"
            :selectedOptions="internalSelectedOptions"
            :selectedVariant="selectedVariant"
            :quantity="internalQuantity"
            :isLoading="internalIsLoading"
            @selectOption="handleSelectOption"
            @incrementQuantity="handleIncrementQuantity"
            @decrementQuantity="handleDecrementQuantity"
            @addToCart="handleAddToCart"
          />
        </div>
      </div>
    </div>

    <!-- Cart Modal -->
    <Cart :isOpen="isCartOpen" @close="isCartOpen = false" />
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useShopifyCardStore } from '../../store/shopifyCardStore'
import Cart from '../global/Cart.vue'

const props = defineProps({
  product: {
    type: Object,
    default: null
  },
  selectedOptions: {
    type: Object,
    default: () => ({})
  },
  selectedVariant: {
    type: Object,
    default: null
  },
  quantity: {
    type: Number,
    default: 1
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

// Stores
const shopifyCardStore = useShopifyCardStore()

// Für Builder.io Context - falls Product nicht als Prop übergeben wird
const builderState = inject('builderState', null)
const builderContext = inject('builderContext', null)

// Product aus verschiedenen Quellen holen
const product = computed(() => {
  // Zuerst Props prüfen
  if (props.product) return props.product
  
  // Dann Builder.io State/Context prüfen
  if (builderState?.product) return builderState.product
  if (builderContext?.product) return builderContext.product
  
  // Fallback für leeres Produkt
  return null
})

// Eigene State-Verwaltung für Builder.io Kontext
const internalSelectedOptions = ref(props.selectedOptions || {})
const internalQuantity = ref(props.quantity || 1)
const internalIsLoading = ref(false)

// Cart State
const isCartOpen = ref(false)

// Computed für selectedVariant
const selectedVariant = computed(() => {
  if (!product.value || !product.value.variants) return null
  
  return product.value.variants.find((variant) => {
    return variant.selectedOptions.every((option) => {
      return internalSelectedOptions.value[option.name] === option.value
    })
  })
})

const emit = defineEmits(['selectOption', 'incrementQuantity', 'decrementQuantity', 'addToCart'])

// Event Handler mit interner State-Verwaltung
function handleSelectOption(optionName, optionValue) {
  console.log('ProductDetailsLayout: handleSelectOption', optionName, optionValue)
  internalSelectedOptions.value[optionName] = optionValue
  emit('selectOption', optionName, optionValue)
}

function handleIncrementQuantity() {
  console.log('ProductDetailsLayout: handleIncrementQuantity')
  if (selectedVariant.value && internalQuantity.value < selectedVariant.value.quantityAvailable) {
    internalQuantity.value++
  } else if (!selectedVariant.value) {
    internalQuantity.value++
  }
  emit('incrementQuantity')
}

function handleDecrementQuantity() {
  console.log('ProductDetailsLayout: handleDecrementQuantity')
  if (internalQuantity.value > 1) {
    internalQuantity.value--
  }
  emit('decrementQuantity')
}

async function handleAddToCart() {
  console.log('ProductDetailsLayout: handleAddToCart')
  
  if (!product.value) {
    console.error('Kein Produkt verfügbar')
    return
  }
  
  // Verfügbarkeit prüfen
  const isAvailable = selectedVariant.value 
    ? selectedVariant.value.availableForSale 
    : product.value.available
    
  if (!isAvailable) {
    console.error('Produkt nicht verfügbar')
    return
  }
  
  internalIsLoading.value = true
  
  try {
    // Variant ID bestimmen
    const variantId = selectedVariant.value?.id || product.value.variant_id
    
    console.log('Adding to cart:', {
      variantId,
      quantity: internalQuantity.value,
      product: product.value.title
    })
    
    // Produkt zum Warenkorb hinzufügen
    await shopifyCardStore.addToCart(variantId, internalQuantity.value)
    
    // Kurze Wartezeit für Shopify API
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Cart Daten neu laden
    try {
      await shopifyCardStore.getCartData()
      console.log('Cart refreshed after adding item')
    } catch (refreshError) {
      console.error('Error refreshing cart:', refreshError)
    }
    
    // Cart öffnen
    isCartOpen.value = true
    
    console.log('Successfully added to cart')
    
  } catch (error) {
    console.error('Error adding to cart:', error)
  } finally {
    internalIsLoading.value = false
  }
  
  emit('addToCart')
}

// Image slider logic
const currentImageIndex = ref(0)

const currentImage = computed(() => {
  if (product.value?.images && product.value.images.length > 0) {
    return product.value.images[currentImageIndex.value]
  }
  return product.value?.featured_image || 'https://placehold.co/600x800'
})
</script>