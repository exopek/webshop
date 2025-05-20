<template>
    <div class="relative w-full overflow-hidden">
      <!-- Loading, Error and Empty States -->
      <div v-if="isLoading" class="py-10 text-center text-gray-500">Produkte werden geladen...</div>
      <div v-else-if="error" class="py-10 text-center text-red-500">{{ error }}</div>
      <div v-else-if="products.length === 0" class="py-10 text-center text-gray-500">
        Keine Produkte gefunden
      </div>
      
      <!-- Product Slider -->
      <div v-else class="relative">
        <!-- Left Navigation Arrow -->
        <button 
          @click="slideLeft" 
          class="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-white/80 p-2 rounded-r-lg shadow-md hover:bg-white transition-all duration-200 hidden md:block"
          :disabled="atLeftEnd"
          :class="{'opacity-50 cursor-not-allowed': atLeftEnd}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <!-- Slider Container -->
        <div 
          ref="sliderContainer" 
          class="flex overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
          @scroll="handleScroll"
          style="scroll-behavior: smooth; -webkit-overflow-scrolling: touch;"
        >
          <div 
            v-for="product in products" 
            :key="product.id" 
            class="flex-none snap-start px-2"
            :class="getWidthClass()"
          >
            <ProductCard :product="product" :api-key="apiKey" :model="model" @openCart="openCart"/>
          </div>
        </div>
        
        <!-- Right Navigation Arrow -->
        <button 
          @click="slideRight" 
          class="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-white/80 p-2 rounded-l-lg shadow-md hover:bg-white transition-all duration-200 hidden md:block"
          :disabled="atRightEnd"
          :class="{'opacity-50 cursor-not-allowed': atRightEnd}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <!-- Pagination Dots -->
        <div class="flex justify-center mt-4">
          <div 
            v-for="(_, index) in Math.ceil(products.length / getVisibleItems())" 
            :key="index"
            @click="scrollToSlide(index)"
            class="w-2 h-2 mx-1 rounded-full cursor-pointer transition-all duration-200"
            :class="currentSlide === index ? 'bg-gray-800' : 'bg-gray-300'"
          ></div>
        </div>
      </div>
      
      <!-- Shopping Cart -->
      <Cart :isOpen="isCartOpen" @close="isCartOpen = false" />
    </div>
  </template>
  
  <script setup lang="ts">
  import { storeToRefs } from "pinia";
  import { computed, onMounted, ref, watch } from "vue";
  import { useShopifyStore } from "../../store/shopifyStore";
  import { useRoute } from "vue-router";
  
  interface ProductGridProps {
    collection: string;
    productsPerRow: number;
    maxProducts: number;
    price: number;
  }
  
  const props = defineProps<ProductGridProps>();
  
  // Store und Refs
  const shopifyStore = useShopifyStore();
  const { isLoading, error } = storeToRefs(shopifyStore);
  const products = ref<any[]>([]);
  const isCartOpen = ref(false);
  const sliderContainer = ref<HTMLElement | null>(null);
  const currentSlide = ref(0);
  const atLeftEnd = ref(true);
  const atRightEnd = ref(false);
  
  const apiKey = 'b2253c87fe4d4111ad4211f05e4080bb';
  const model = 'product-card';
  const route = useRoute();
  
  // Lade Produkte
  async function loadProducts() {
    const query = route.query;
    products.value = await shopifyStore.fetchProductsByCollection(
      props.collection
    );
    console.log("Product in Slider", products.value);
    
    // Reset slider position after products load
    if (sliderContainer.value) {
      sliderContainer.value.scrollLeft = 0;
      currentSlide.value = 0;
      checkSliderEnds();
    }
  }
  
  // Slide Navigation Methods
  function slideLeft() {
    if (!sliderContainer.value) return;
    const itemWidth = sliderContainer.value.clientWidth / getVisibleItems();
    sliderContainer.value.scrollLeft -= itemWidth * getVisibleItems();
  }
  
  function slideRight() {
    if (!sliderContainer.value) return;
    const itemWidth = sliderContainer.value.clientWidth / getVisibleItems();
    sliderContainer.value.scrollLeft += itemWidth * getVisibleItems();
  }
  
  function scrollToSlide(index: number) {
    if (!sliderContainer.value) return;
    const slideWidth = sliderContainer.value.clientWidth;
    sliderContainer.value.scrollLeft = index * slideWidth;
    currentSlide.value = index;
  }
  
  function handleScroll() {
    if (!sliderContainer.value) return;
    
    // Update current slide based on scroll position
    const slideWidth = sliderContainer.value.clientWidth;
    const newSlide = Math.round(sliderContainer.value.scrollLeft / slideWidth);
    currentSlide.value = newSlide;
    
    checkSliderEnds();
  }
  
  function checkSliderEnds() {
    if (!sliderContainer.value) return;
    
    // Check if at left end
    atLeftEnd.value = sliderContainer.value.scrollLeft <= 10;
    
    // Check if at right end
    const maxScrollLeft = sliderContainer.value.scrollWidth - sliderContainer.value.clientWidth;
    atRightEnd.value = sliderContainer.value.scrollLeft >= maxScrollLeft - 10;
  }
  
  // Responsive helper methods
  function getVisibleItems(): number {
    // Determine items visible based on screen size
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 1024) return 3;
    return props.productsPerRow || 4;
  }
  
  function getWidthClass(): string {
    // Return Tailwind width class based on visible items
    const visibleItems = getVisibleItems();
    switch (visibleItems) {
      case 1: return 'w-full';
      case 2: return 'w-1/2';
      case 3: return 'w-1/3';
      case 4: return 'w-1/4';
      case 5: return 'w-1/5';
      case 6: return 'w-1/6';
      default: return 'w-1/4';
    }
  }
  
  function openCart() {
    console.log("Open Cart", isCartOpen.value);
    isCartOpen.value = true;
  }
  
  // Lifecycle Hooks
  onMounted(() => {
    loadProducts();
    window.addEventListener('resize', () => {
      checkSliderEnds();
    });
  });
  
  // Watch for collection changes
  watch(
    () => props.collection,
    () => {
      loadProducts();
    }
  );
  </script>
  
  <style scoped>
  /* Hide scrollbar for Chrome, Safari and Opera */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  </style>