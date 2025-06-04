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
            :selectedOptions="selectedOptions"
            :selectedVariant="selectedVariant"
            :quantity="quantity"
            :isLoading="isLoading"
            @selectOption="$emit('selectOption', $event)"
            @incrementQuantity="$emit('incrementQuantity')"
            @decrementQuantity="$emit('decrementQuantity')"
            @addToCart="$emit('addToCart')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

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

defineEmits(['selectOption', 'incrementQuantity', 'decrementQuantity', 'addToCart'])

// Image slider logic
const currentImageIndex = ref(0)

const currentImage = computed(() => {
  if (product.value?.images && product.value.images.length > 0) {
    return product.value.images[currentImageIndex.value]
  }
  return product.value?.featured_image || 'https://placehold.co/600x800'
})
</script>