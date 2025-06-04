<template>
    <section class="bg-gray-50 py-8 lg:py-16">
      <div class="container mx-auto px-4 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          <!-- Linke Seite: Produktbilder -->
          <div class="space-y-6">
            <!-- Hauptbild -->
            <div class="relative">
              <img 
                :src="currentImage" 
                :alt="product.name"
                class="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
              />
              
              <!-- E-Book Badge -->
              <div class="absolute bottom-4 left-4 bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <span class="text-sm font-medium">E-BOOK</span>
              </div>
              
              <!-- Expand Button -->
              <button class="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                </svg>
              </button>
            </div>
  
            <!-- Thumbnail Grid -->
            <div class="grid grid-cols-4 gap-2 sm:gap-4">
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
                  :alt="`${product.name} view ${index + 1}`"
                  class="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>
  
          <!-- Rechte Seite: Produktinformationen -->
          <div class="space-y-6">
            <!-- Brand & Title -->
            <div>
              <p class="text-sm text-gray-600 mb-2">{{ product.brand }}</p>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {{ product.name }}
              </h1>
            </div>
  
            <!-- Preis & Bewertung -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="text-2xl sm:text-3xl font-bold text-gray-900">
                {{ product.price }}
              </div>
              
              <div class="flex items-center gap-2">
                <!-- Sterne -->
                <div class="flex items-center">
                  <svg 
                    v-for="star in 5" 
                    :key="star"
                    :class="[
                      'w-4 h-4',
                      star <= Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                    ]"
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ product.rating }}</span>
                <span class="text-sm text-gray-500">({{ product.reviewCount }} reviews)</span>
              </div>
            </div>
  
            <!-- Features -->
            <div class="space-y-4">
              <div 
                v-for="feature in product.features" 
                :key="feature"
                class="flex items-start gap-3"
              >
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p class="text-gray-700 leading-relaxed">{{ feature }}</p>
              </div>
            </div>
  
            <!-- E-Book Info -->
            <div class="bg-blue-50 p-4 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-2">E-Book:</h3>
              <p class="text-sm text-gray-700">{{ product.ebookDescription }}</p>
            </div>
  
            <!-- Details Button -->
            <button 
              @click="toggleDetails"
              class="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span class="font-medium text-gray-900">Details</span>
              <svg 
                :class="['w-5 h-5 transition-transform', showDetails ? 'rotate-180' : '']"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
  
            <!-- Expanded Details -->
            <div v-if="showDetails" class="bg-gray-50 p-4 rounded-lg space-y-2">
              <div v-for="detail in product.details" :key="detail.label" class="flex justify-between">
                <span class="text-gray-600">{{ detail.label }}:</span>
                <span class="font-medium">{{ detail.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  // Reactive state
  const currentImageIndex = ref(0)
  const showDetails = ref(false)
  
  // Product data
  const product = ref({
    brand: 'Freeletics Essentials',
    name: 'Structured foam roller',
    price: '10.99 EUR',
    rating: 4.94,
    reviewCount: 17,
    images: [
      '/images/foam-roller-main.jpg',
      '/images/foam-roller-usage.jpg', 
      '/images/foam-roller-detail.jpg',
      '/images/foam-roller-package.jpg'
    ],
    features: [
      'Unlock 16 exercises in the Freeletics app with this foam roller for the major muscle groups like the back, calves, and legs.',
      'Intended to help increase recovery and keep you training at a high level.',
      'Made out of high-density foam with mid-level hardness (30) to allow proper use on major muscle groups while maintaining maximum durability.',
      'The soft foam and the bumps will allow for a deep massage to release tension.',
      'Lightweight enough to be taken anywhere, our foam roller will become an essential tool in your Free Athlete arsenal.'
    ],
    ebookDescription: '"Training with foam roller - Fundamentals" will be sent to you as a PDF via email immediately after you check out. This ebook is provided in the following languages: English, German, French, Spanish, Portuguese, and Italian.',
    details: [
      { label: 'Length', value: '33 cm' },
      { label: 'Diameter', value: '14 cm' },
      { label: 'Weight', value: '0.5 kg' },
      { label: 'Material', value: 'High-density foam' },
      { label: 'Hardness', value: 'Mid-level (30)' }
    ]
  })
  
  // Computed properties
  const currentImage = computed(() => product.value.images[currentImageIndex.value])
  
  // Methods
  const toggleDetails = () => {
    showDetails.value = !showDetails.value
  }
  </script>