<template>
  <div class="product-details-info space-y-6">
    <!-- Brand & Title -->
    <div>
      <p v-if="product?.vendor" class="text-sm text-gray-600 mb-2">{{ product.vendor }}</p>
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
        {{ product?.title || 'Product Title' }}
      </h1>
    </div>

    <!-- Price -->
    <div class="text-2xl sm:text-3xl font-bold text-gray-900">
      {{ formatPrice(selectedVariant?.price || product?.price) }}
      <span v-if="selectedVariant?.compareAtPrice" class="text-lg text-gray-500 line-through ml-2">
        {{ formatPrice(selectedVariant.compareAtPrice) }}
      </span>
    </div>

    <!-- Product Options -->
    <div v-if="product?.options?.length" class="space-y-4">
      <div v-for="option in product.options" :key="option.name" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">{{ option.name }}</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="value in option.values"
            :key="value"
            @click="selectOption(option.name, value)"
            :disabled="!isOptionValueAvailable(option.name, value)"
            :class="[
              'px-4 py-2 border rounded-lg text-sm font-medium transition-colors',
              selectedOptions[option.name] === value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
              !isOptionValueAvailable(option.name, value)
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            ]"
          >
            {{ value }}
          </button>
        </div>
      </div>
    </div>

    <!-- Quantity Selector -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">Menge</label>
      <div class="flex items-center space-x-3">
        <button
          @click="decrementQuantity"
          :disabled="quantity <= 1"
          class="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
          </svg>
        </button>
        <span class="text-lg font-medium">{{ quantity }}</span>
        <button
          @click="incrementQuantity"
          :disabled="selectedVariant && quantity >= selectedVariant.quantityAvailable"
          class="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Add to Cart Button -->
    <button
      @click="addToCart"
      :disabled="!isAvailable || isLoading"
      class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
    >
      <span v-if="isLoading">Wird hinzugefügt...</span>
      <span v-else-if="!isAvailable">Nicht verfügbar</span>
      <span v-else>In den Warenkorb</span>
    </button>

    <!-- Product Description -->
    <div v-if="product?.description" class="prose prose-sm max-w-none">
      <div v-html="product.description"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'

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

const emit = defineEmits(['selectOption', 'incrementQuantity', 'decrementQuantity', 'addToCart'])

const isAvailable = computed(() => {
  if (props.selectedVariant) {
    return props.selectedVariant.availableForSale
  }
  return product.value?.available || false
})

function selectOption(optionName, optionValue) {
  console.log('ProductDetailsInfo: selectOption called', optionName, optionValue)
  emit('selectOption', optionName, optionValue)
}

function incrementQuantity() {
  console.log('ProductDetailsInfo: incrementQuantity called')
  emit('incrementQuantity')
}

function decrementQuantity() {
  console.log('ProductDetailsInfo: decrementQuantity called')
  emit('decrementQuantity')
}

function addToCart() {
  console.log('ProductDetailsInfo: addToCart called')
  emit('addToCart')
}

function isOptionValueAvailable(optionName, optionValue) {
  if (!product.value?.variants) return false

  const testOptions = { ...props.selectedOptions }
  testOptions[optionName] = optionValue

  return product.value.variants.some((variant) => {
    const optionsMatch = variant.selectedOptions.every((option) => {
      return !testOptions[option.name] || testOptions[option.name] === option.value
    })
    return optionsMatch && variant.availableForSale
  })
}

function formatPrice(price) {
  if (!price) return "€0,00"
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price)
}
</script>