<template>
    <div class="relative w-full">
      <!-- Slider Container -->
      <div class="relative overflow-hidden rounded-lg bg-gray-100">
        <!-- Images Container -->
        <div 
          class="flex transition-transform duration-300 ease-in-out"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <div 
            v-for="(image, index) in images" 
            :key="index"
            class="w-full flex-shrink-0 relative"
          >
            <img 
              :src="image.src" 
              :alt="image.alt || `Slide ${index + 1}`"
              class="w-full h-48 sm:h-64 lg:h-80 xl:h-96 object-cover"
              :class="imageClass"
            />
            
            <!-- Optional: Image Overlay/Caption -->
            <div 
              v-if="image.caption || image.badge"
              class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4"
            >
              <div v-if="image.badge" class="mb-2">
                <span 
                  class="inline-flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                >
                  <component :is="image.badge.icon" v-if="image.badge.icon" class="w-4 h-4" />
                  {{ image.badge.text }}
                </span>
              </div>
              <p v-if="image.caption" class="text-white text-sm font-medium">
                {{ image.caption }}
              </p>
            </div>
          </div>
        </div>
  
        <!-- Navigation Arrows -->
        <button 
          v-if="showArrows && images.length > 1"
          @click="previousSlide"
          class="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg transition-all z-10"
          :disabled="currentIndex === 0 && !infinite"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
  
        <button 
          v-if="showArrows && images.length > 1"
          @click="nextSlide"
          class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg transition-all z-10"
          :disabled="currentIndex === images.length - 1 && !infinite"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
  
        <!-- Fullscreen Button -->
        <button 
          v-if="showFullscreen"
          @click="toggleFullscreen"
          class="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
          </svg>
        </button>
      </div>
  
      <!-- Dot Indicators -->
      <div 
        v-if="showDots && images.length > 1" 
        class="flex justify-center mt-4 gap-2"
      >
        <button
          v-for="(_, index) in images"
          :key="index"
          @click="goToSlide(index)"
          :class="[
            'w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200',
            currentIndex === index 
              ? 'bg-blue-500 scale-125' 
              : 'bg-gray-300 hover:bg-gray-400'
          ]"
        />
      </div>
  
      <!-- Thumbnail Navigation (Desktop only) -->
      <div 
        v-if="showThumbnails && images.length > 1"
        class="hidden sm:flex mt-4 gap-2 justify-center overflow-x-auto pb-2"
      >
        <button
          v-for="(image, index) in images"
          :key="index"
          @click="goToSlide(index)"
          :class="[
            'flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all',
            currentIndex === index 
              ? 'border-blue-500 ring-2 ring-blue-200' 
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <img 
            :src="image.thumbnail || image.src" 
            :alt="image.alt || `Thumbnail ${index + 1}`"
            class="w-full h-full object-cover"
          />
        </button>
      </div>
  
      <!-- Slide Counter -->
      <div 
        v-if="showCounter"
        class="absolute top-2 sm:top-4 left-2 sm:left-4 bg-black/60 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm font-medium z-10"
      >
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  
  // Props
  const props = defineProps({
    images: {
      type: Array,
      required: true,
      default: () => []
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    autoplayInterval: {
      type: Number,
      default: 5000
    },
    infinite: {
      type: Boolean,
      default: true
    },
    showArrows: {
      type: Boolean,
      default: true
    },
    showDots: {
      type: Boolean,
      default: true
    },
    showThumbnails: {
      type: Boolean,
      default: false
    },
    showCounter: {
      type: Boolean,
      default: false
    },
    showFullscreen: {
      type: Boolean,
      default: true
    },
    imageClass: {
      type: String,
      default: ''
    }
  })
  
  // Emits
  const emit = defineEmits(['slide-change', 'fullscreen-toggle'])
  
  // Reactive state
  const currentIndex = ref(0)
  const autoplayTimer = ref(null)
  const isFullscreen = ref(false)
  
  // Methods
  const nextSlide = () => {
    if (currentIndex.value < props.images.length - 1) {
      currentIndex.value++
    } else if (props.infinite) {
      currentIndex.value = 0
    }
    emit('slide-change', currentIndex.value)
  }
  
  const previousSlide = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
    } else if (props.infinite) {
      currentIndex.value = props.images.length - 1
    }
    emit('slide-change', currentIndex.value)
  }
  
  const goToSlide = (index) => {
    currentIndex.value = index
    emit('slide-change', currentIndex.value)
  }
  
  const startAutoplay = () => {
    if (props.autoplay && props.images.length > 1) {
      autoplayTimer.value = setInterval(() => {
        nextSlide()
      }, props.autoplayInterval)
    }
  }
  
  const stopAutoplay = () => {
    if (autoplayTimer.value) {
      clearInterval(autoplayTimer.value)
      autoplayTimer.value = null
    }
  }
  
  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value
    emit('fullscreen-toggle', isFullscreen.value)
  }
  
  // Touch/Swipe Support
  const touchStartX = ref(0)
  const touchEndX = ref(0)
  
  const handleTouchStart = (e) => {
    touchStartX.value = e.touches[0].clientX
  }
  
  const handleTouchMove = (e) => {
    touchEndX.value = e.touches[0].clientX
  }
  
  const handleTouchEnd = () => {
    const swipeThreshold = 50
    const diff = touchStartX.value - touchEndX.value
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide()
      } else {
        previousSlide()
      }
    }
  }
  
  // Keyboard Navigation
  const handleKeydown = (e) => {
    if (e.key === 'ArrowLeft') {
      previousSlide()
    } else if (e.key === 'ArrowRight') {
      nextSlide()
    } else if (e.key === 'Escape' && isFullscreen.value) {
      toggleFullscreen()
    }
  }
  
  // Lifecycle
  onMounted(() => {
    startAutoplay()
    document.addEventListener('keydown', handleKeydown)
    
    // Add touch event listeners
    const sliderElement = document.querySelector('.slider-container')
    if (sliderElement) {
      sliderElement.addEventListener('touchstart', handleTouchStart, { passive: true })
      sliderElement.addEventListener('touchmove', handleTouchMove, { passive: true })
      sliderElement.addEventListener('touchend', handleTouchEnd, { passive: true })
    }
  })
  
  onUnmounted(() => {
    stopAutoplay()
    document.removeEventListener('keydown', handleKeydown)
  })
  
  // Pause autoplay on hover (desktop)
  const pauseAutoplay = () => stopAutoplay()
  const resumeAutoplay = () => startAutoplay()
  </script>
  
  <style scoped>
  .slider-container {
    touch-action: pan-y;
  }
  </style>